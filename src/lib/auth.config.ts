import type { NextAuthConfig } from "next-auth";
import Google from "next-auth/providers/google";

// Only include providers if credentials are available
const providers = [];

if (process.env.GOOGLE_CLIENT_ID && process.env.GOOGLE_CLIENT_SECRET) {
  providers.push(
    Google({
      clientId: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
    })
  );
}

export const authConfig = {
  providers: providers.length > 0 ? providers : [],
  trustHost: true,
  pages: {
    signIn: "/sign-in",
    error: "/sign-in",
  },
  secret: process.env.NEXTAUTH_SECRET,
} satisfies NextAuthConfig;
