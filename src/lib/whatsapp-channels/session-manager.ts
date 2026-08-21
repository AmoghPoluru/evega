/**
 * Baileys (unofficial WhatsApp Web) session manager for WhatsApp Channels.
 *
 * IMPORTANT — read before deploying:
 * - This is an UNOFFICIAL WhatsApp Web session (multi-device link), NOT the
 *   official Cloud API. It is a separate engine from `src/lib/whatsapp.ts` and
 *   must never import from it.
 * - Using it carries WhatsApp ToS / account-ban risk, and the vendor's phone
 *   must stay linked (scan the QR from WhatsApp → Linked devices).
 * - It CANNOT run on Vercel serverless: Baileys holds a long-lived WebSocket
 *   and writes auth state to disk, both of which die with the function
 *   invocation. Run it in a persistent Node process (`npm run dev`, a VPS, a
 *   container, Railway/Render/Fly, etc.). The module-level `Map` below is the
 *   natural seam for extracting a standalone service.
 */
import path from "node:path";
import { rm } from "node:fs/promises";

import makeWASocket, {
  DisconnectReason,
  fetchLatestBaileysVersion,
  // Aliased: it is not a React hook, and the `use*` name trips react-hooks lint.
  useMultiFileAuthState as loadMultiFileAuthState,
  type WASocket,
} from "@whiskeysockets/baileys";
import QRCode from "qrcode";

export type SessionStatus = {
  connected: boolean;
  /** QR code as a `data:image/png;base64,…` URL, or null when none is pending. */
  qr: string | null;
};

export type Session = {
  sock: WASocket;
  connected: boolean;
  qr: string | null;
  /** Resolvers waiting for the first QR / open connection. */
  waiters: Array<() => void>;
};

type SessionsGlobal = typeof globalThis & {
  __whatsappChannelSessions?: Map<string, Session>;
};

/** Survive Next.js HMR / duplicate module instances in dev. */
function getSessions(): Map<string, Session> {
  const g = globalThis as SessionsGlobal;
  if (!g.__whatsappChannelSessions) {
    g.__whatsappChannelSessions = new Map();
  }
  return g.__whatsappChannelSessions;
}

const SESSIONS_ROOT = process.env.WHATSAPP_CHANNELS_SESSION_DIR || "./sessions";

/** Milliseconds `startSession` waits for a QR (or an already-open socket). */
const QR_WAIT_MS = 25_000;

/** Session directories are named after the vendor id, so keep it path-safe. */
function sessionDir(vendorId: string): string {
  if (!/^[A-Za-z0-9_-]+$/.test(vendorId)) {
    throw new Error("Invalid vendor id for WhatsApp channel session");
  }
  return path.join(SESSIONS_ROOT, vendorId);
}

function notifyWaiters(session: Session) {
  const waiters = session.waiters.splice(0, session.waiters.length);
  for (const resolve of waiters) resolve();
}

function disconnectStatusCode(lastDisconnect: unknown): number | undefined {
  if (!lastDisconnect || typeof lastDisconnect !== "object") return undefined;
  const error = (lastDisconnect as { error?: unknown }).error;
  if (!error || typeof error !== "object") return undefined;
  const output = (error as { output?: { statusCode?: number } }).output;
  return output?.statusCode;
}

async function bindSocket(vendorId: string, session: Session): Promise<void> {
  const { state, saveCreds } = await loadMultiFileAuthState(sessionDir(vendorId));
  const { version } = await fetchLatestBaileysVersion();

  const sock = makeWASocket({
    auth: state,
    version,
    printQRInTerminal: false,
    syncFullHistory: false,
  });

  session.sock = sock;
  session.connected = false;

  sock.ev.on("creds.update", saveCreds);

  sock.ev.on("connection.update", (update) => {
    const { connection, qr, lastDisconnect } = update;

    if (qr) {
      void QRCode.toDataURL(qr)
        .then((dataUrl) => {
          // Ignore stale QR events from a replaced socket.
          if (getSessions().get(vendorId)?.sock !== sock) return;
          session.qr = dataUrl;
          console.log(`[whatsapp-channels] QR ready for vendor ${vendorId}`);
          notifyWaiters(session);
        })
        .catch((error: unknown) => {
          console.error("[whatsapp-channels] failed to render QR:", error);
        });
    }

    if (connection === "open") {
      if (getSessions().get(vendorId)?.sock !== sock) return;
      session.connected = true;
      session.qr = null;
      console.log(`[whatsapp-channels] connected for vendor ${vendorId}`);
      notifyWaiters(session);
      return;
    }

    if (connection === "close") {
      if (getSessions().get(vendorId)?.sock !== sock) return;

      session.connected = false;
      const statusCode = disconnectStatusCode(lastDisconnect);
      const loggedOut = statusCode === DisconnectReason.loggedOut;

      console.warn(
        `[whatsapp-channels] connection closed for vendor ${vendorId}`,
        { statusCode, loggedOut },
      );

      if (loggedOut) {
        getSessions().delete(vendorId);
        notifyWaiters(session);
        console.warn(
          `[whatsapp-channels] vendor ${vendorId} logged out on the phone`,
        );
        return;
      }

      // Baileys commonly closes with 515 (restart required) right after the
      // first QR / pairing handshake. Reconnect with the same auth state
      // instead of dropping the session (which made the QR "never work").
      void bindSocket(vendorId, session).catch((error: unknown) => {
        console.error(
          `[whatsapp-channels] reconnect failed for vendor ${vendorId}:`,
          error,
        );
        getSessions().delete(vendorId);
        notifyWaiters(session);
      });
    }
  });
}

async function createSession(vendorId: string): Promise<Session> {
  // Placeholder sock; replaced immediately in bindSocket.
  const session: Session = {
    sock: null as unknown as WASocket,
    connected: false,
    qr: null,
    waiters: [],
  };
  getSessions().set(vendorId, session);
  await bindSocket(vendorId, session);
  return session;
}

async function endSocket(session: Session | undefined): Promise<void> {
  if (!session?.sock) return;
  try {
    session.sock.end(undefined);
  } catch {
    // ignore
  }
}

/**
 * Returns the vendor's live socket, creating and linking one if needed.
 * Resolves once a QR is available or the socket is already authenticated.
 */
export async function getOrCreateSession(
  vendorId: string,
  opts?: { refresh?: boolean },
): Promise<Session> {
  const sessions = getSessions();

  if (opts?.refresh) {
    const previous = sessions.get(vendorId);
    sessions.delete(vendorId);
    await endSocket(previous);
  }

  let session = sessions.get(vendorId);
  if (!session) {
    session = await createSession(vendorId);
  }

  if (session.connected || session.qr) return session;

  await new Promise<void>((resolve) => {
    const timer = setTimeout(resolve, QR_WAIT_MS);
    const done = () => {
      clearTimeout(timer);
      resolve();
    };
    session!.waiters.push(done);
    // Race: QR / open may have landed between the check above and push.
    if (session!.connected || session!.qr) done();
  });

  return session;
}

/** Socket for an already-linked vendor; throws when the phone is not linked. */
export async function requireConnectedSession(vendorId: string): Promise<WASocket> {
  const session = getSessions().get(vendorId);
  if (!session?.connected) {
    throw new Error(
      "WhatsApp channel session is not connected. Scan the QR code from WhatsApp → Linked devices first.",
    );
  }
  return session.sock;
}

export function getSessionStatus(vendorId: string): SessionStatus {
  const session = getSessions().get(vendorId);
  if (!session) return { connected: false, qr: null };
  return { connected: session.connected, qr: session.qr };
}

/** Logs the vendor out of WhatsApp and deletes the on-disk auth state. */
export async function logoutSession(vendorId: string): Promise<void> {
  const sessions = getSessions();
  const session = sessions.get(vendorId);
  sessions.delete(vendorId);

  if (session) {
    try {
      await session.sock.logout();
    } catch (error) {
      console.error("[whatsapp-channels] logout failed:", error);
    }
  }

  await rm(sessionDir(vendorId), { recursive: true, force: true });
}
