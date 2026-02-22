import "@/styles/globals.css";
import "@/lib/suppress-console-errors";

import { type Metadata } from "next";
import { Geist } from "next/font/google";

import { ProvidersWrapper } from "@/components/providers/ProvidersWrapper";

export const metadata: Metadata = {
  title: "VectorMail AI - Smart Email Management",
  icons: {
    icon: "/VectorMail-New.png",
    apple: "/VectorMail-New.png",
  },
  description:
    "Transform your email experience with AI-powered insights, smart organization, and intelligent responses. Get AI-powered email composition, smart search, and intelligent email management.",
  keywords: [
    "email",
    "AI",
    "artificial intelligence",
    "email management",
    "smart email",
    "email automation",
    "productivity",
    "email client",
  ],
  authors: [{ name: "VectorMail AI" }],
  creator: "VectorMail AI",
  publisher: "VectorMail AI",
  verification: {
    google: "nmkq5i-5uWS3ush6WO4uP6t6DitTVQSvNDaFFGoI3f0",
  },
};

export const viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
};

const geist = Geist({
  subsets: ["latin"],
  variable: "--font-geist-sans",
});

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en" className={geist.variable} suppressHydrationWarning>
      <body suppressHydrationWarning>
        <ProvidersWrapper>{children}</ProvidersWrapper>
      </body>
    </html>
  );
}
