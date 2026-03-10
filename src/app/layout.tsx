import "@/styles/globals.css";
import "@/lib/suppress-console-errors";

import { type Metadata } from "next";
import Script from "next/script";
import { Inter, Oswald } from "next/font/google";

import { ProvidersWrapper } from "@/components/providers/ProvidersWrapper";
import { PwaRegister } from "@/components/PwaRegister";

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
  manifest: "/manifest.json",
};


export const viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  themeColor: "#1a73e8",
  viewportFit: "cover" as const,
};

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-geist-sans",
});

const oswald = Oswald({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  variable: "--font-oswald",
});

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en" className={`${inter.variable} ${oswald.variable}`} suppressHydrationWarning>
      <body suppressHydrationWarning>
        <Script
          id="chunk-load-recovery"
          strategy="beforeInteractive"
          dangerouslySetInnerHTML={{
            __html: `
(function(){
  var key = 'vm_chunk_reload';
  if (sessionStorage.getItem(key)) { sessionStorage.removeItem(key); return; }
  function isChunkErr(e) {
    if (!e) return false;
    var r = e.reason || e;
    var msg = (r.message || e.message) || '';
    var name = (r.name || e.name) || '';
    return name === 'ChunkLoadError' || /Loading chunk .* failed/.test(msg);
  }
  window.addEventListener('unhandledrejection', function(ev) {
    if (isChunkErr(ev.reason)) { sessionStorage.setItem(key, '1'); window.location.reload(); }
  });
  window.addEventListener('error', function(ev) {
    if (isChunkErr(ev)) { sessionStorage.setItem(key, '1'); window.location.reload(); }
  });
})();
            `.trim(),
          }}
        />
        <PwaRegister />
        <ProvidersWrapper>{children}</ProvidersWrapper>
      </body>
    </html>
  );
}
