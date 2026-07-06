import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { Providers } from "./providers";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Keel — Prime brokerage for the AI agent economy",
  description:
    "AI agents are starting to run real businesses. Keel is the bank, risk desk, and safety net behind them — a fully simulated, explainable demo.",
  metadataBase: new URL("https://keel-alpha.vercel.app"),
  openGraph: {
    title: "Keel — the bank, risk desk, and safety net behind AI agents",
    description:
      "Watch a fleet of AI-run businesses get financed, supervised, and stress-tested — every decision explained in plain English. Simulated data only.",
    url: "/",
    siteName: "Keel",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Keel — the bank, risk desk, and safety net behind AI agents",
    description:
      "A fully simulated, explainable demo of prime brokerage for the AI agent economy.",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="min-h-full">
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
