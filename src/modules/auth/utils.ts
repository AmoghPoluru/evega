import { cookies as getCookies } from "next/headers";

interface Props {
  prefix: string;
  value: string;
}

/**
 * Cookie domain for Payload auth (shared by www + apex).
 * Set NEXT_PUBLIC_ROOT_DOMAIN=zvastra.com in Vercel, or rely on NEXT_PUBLIC_APP_URL.
 */
export function getAuthCookieDomain(): string | undefined {
  if (process.env.NODE_ENV === "development") {
    return undefined;
  }

  const fromRoot = process.env.NEXT_PUBLIC_ROOT_DOMAIN?.trim();
  const hostname = fromRoot
    ? fromRoot.replace(/^https?:\/\//, "").split("/")[0].replace(/^\.+/, "")
    : process.env.NEXT_PUBLIC_APP_URL
      ? new URL(process.env.NEXT_PUBLIC_APP_URL).hostname
      : null;

  if (!hostname || hostname === "localhost") {
    return undefined;
  }

  const parts = hostname.split(".").filter(Boolean);
  if (parts.length >= 2) {
    return `.${parts.slice(-2).join(".")}`;
  }

  return hostname;
}

function getProductionCookieOptions(): {
  sameSite: "lax";
  secure: true;
  domain?: string;
} {
  const domain = getAuthCookieDomain();
  return {
    sameSite: "lax",
    secure: true,
    ...(domain ? { domain } : {}),
  };
}

export const generateAuthCookie = async ({
  prefix,
  value,
}: Props) => {
  const cookies = await getCookies();

  cookies.set({
    name: `${prefix}-token`,
    value,
    httpOnly: true,
    path: "/",
    ...(process.env.NODE_ENV !== "development"
      ? getProductionCookieOptions()
      : {}),
  });
};

export const clearAuthCookie = async ({
  prefix,
}: {
  prefix: string;
}) => {
  const cookies = await getCookies();

  cookies.delete({
    name: `${prefix}-token`,
    path: "/",
    ...(process.env.NODE_ENV !== "development"
      ? getProductionCookieOptions()
      : {}),
  });
};
