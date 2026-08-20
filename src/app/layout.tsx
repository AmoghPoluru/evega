/// <reference types="next" />
import type { Metadata } from "next";
import { DM_Sans } from "next/font/google";
import "./globals.css";
import { Toaster } from "@/components/ui/sonner";
import { SessionProvider } from "@/components/providers/session-provider";
import { ErrorBoundary } from "@/components/error-boundary";

const dmSans = DM_Sans({
  variable: "--font-dm-sans",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: {
    default: "Zvastra",
    template: "%s · Zvastra",
  },
  description: "Ethnic fusion, jewellery, and home — South Asian boutique marketplace",
  applicationName: "Zvastra",
  icons: {
    icon: [
      { url: "/icon.svg", type: "image/svg+xml" },
      { url: "/icon.png?v=zvastra-z", type: "image/png", sizes: "192x192" },
      { url: "/favicon.ico?v=zvastra-z", sizes: "any" },
    ],
    apple: [{ url: "/apple-icon.png?v=zvastra-z", sizes: "180x180" }],
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${dmSans.className} antialiased`}
      >
        <ErrorBoundary>
          <SessionProvider>
            {children}
          </SessionProvider>
        </ErrorBoundary>
        <Toaster />
      </body>
    </html>
  );
}
