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
 *   reason this file is the natural seam for extracting a standalone service:
 *   swap these functions for HTTP calls to that service and nothing else in the
 *   app changes.
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

/** vendorId -> live Baileys socket. Process-local; lost on restart. */
const sessions = new Map<string, Session>();

const SESSIONS_ROOT = process.env.WHATSAPP_CHANNELS_SESSION_DIR || "./sessions";

/** Milliseconds `startSession` waits for a QR (or an already-open socket). */
const QR_WAIT_MS = 20_000;

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

async function createSession(vendorId: string): Promise<Session> {
  const { state, saveCreds } = await loadMultiFileAuthState(sessionDir(vendorId));
  const { version } = await fetchLatestBaileysVersion();

  const sock = makeWASocket({
    auth: state,
    version,
    // QR is surfaced through the API as a data URL instead of the terminal.
    printQRInTerminal: false,
    syncFullHistory: false,
  });

  const session: Session = { sock, connected: false, qr: null, waiters: [] };
  sessions.set(vendorId, session);

  sock.ev.on("creds.update", saveCreds);

  sock.ev.on("connection.update", (update) => {
    const { connection, qr, lastDisconnect } = update;

    if (qr) {
      void QRCode.toDataURL(qr)
        .then((dataUrl) => {
          session.qr = dataUrl;
          notifyWaiters(session);
        })
        .catch((error: unknown) => {
          console.error("[whatsapp-channels] failed to render QR:", error);
        });
    }

    if (connection === "open") {
      session.connected = true;
      session.qr = null;
      notifyWaiters(session);
    }

    if (connection === "close") {
      session.connected = false;
      const statusCode = (lastDisconnect?.error as { output?: { statusCode?: number } })
        ?.output?.statusCode;
      // Drop the socket so the next call builds a fresh one. On a logout the
      // stored creds are dead too and the vendor has to re-scan.
      sessions.delete(vendorId);
      notifyWaiters(session);
      if (statusCode === DisconnectReason.loggedOut) {
        console.warn(`[whatsapp-channels] vendor ${vendorId} logged out on the phone`);
      }
    }
  });

  return session;
}

/**
 * Returns the vendor's live socket, creating and linking one if needed.
 * Resolves once a QR is available or the socket is already authenticated.
 */
export async function getOrCreateSession(vendorId: string): Promise<Session> {
  const existing = sessions.get(vendorId);
  if (existing) return existing;

  const session = await createSession(vendorId);
  if (session.connected || session.qr) return session;

  await new Promise<void>((resolve) => {
    const timer = setTimeout(resolve, QR_WAIT_MS);
    session.waiters.push(() => {
      clearTimeout(timer);
      resolve();
    });
  });

  return session;
}

/** Socket for an already-linked vendor; throws when the phone is not linked. */
export async function requireConnectedSession(vendorId: string): Promise<WASocket> {
  const session = sessions.get(vendorId);
  if (!session?.connected) {
    throw new Error(
      "WhatsApp channel session is not connected. Scan the QR code from WhatsApp → Linked devices first."
    );
  }
  return session.sock;
}

export function getSessionStatus(vendorId: string): SessionStatus {
  const session = sessions.get(vendorId);
  if (!session) return { connected: false, qr: null };
  return { connected: session.connected, qr: session.qr };
}

/** Logs the vendor out of WhatsApp and deletes the on-disk auth state. */
export async function logoutSession(vendorId: string): Promise<void> {
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
