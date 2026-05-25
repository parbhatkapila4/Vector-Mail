import "@/styles/globals.css";
import "@/styles/design-tokens.css";
import "@/styles/hero-reactive-background.css";

import { type Metadata } from "next";
import Script from "next/script";
import localFont from "next/font/local";

import { ProvidersWrapper } from "@/components/providers/ProvidersWrapper";
import { PwaRegister } from "@/components/PwaRegister";

export const metadata: Metadata = {
  title: "VectorMail",
  icons: {
    icon: "/VectorMail-New.png",
    apple: "/VectorMail-New.png",
  },
  description:
    "An intelligence layer for the Gmail account you already use. Semantic search, daily briefs, and replies trained on your voice.",
  keywords: [
    "email client",
    "Gmail",
    "semantic search",
    "pgvector",
    "inbox zero",
    "email productivity",
  ],
  authors: [{ name: "VectorMail" }],
  creator: "VectorMail",
  publisher: "VectorMail",
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

const inter = localFont({
  src: [{ path: "./fonts/inter.woff2", weight: "100 900", style: "normal" }],
  variable: "--font-geist-sans",
  display: "swap",
});

const oswald = localFont({
  src: [
    { path: "./fonts/oswald-400.woff2", weight: "400", style: "normal" },
    { path: "./fonts/oswald-500.woff2", weight: "500", style: "normal" },
    { path: "./fonts/oswald-600.woff2", weight: "600", style: "normal" },
    { path: "./fonts/oswald-700.woff2", weight: "700", style: "normal" },
  ],
  variable: "--font-oswald",
  display: "swap",
});

const newsreader = localFont({
  src: [
    { path: "./fonts/newsreader-300.woff2", weight: "300", style: "normal" },
    { path: "./fonts/newsreader-400.woff2", weight: "400", style: "normal" },
    { path: "./fonts/newsreader-500.woff2", weight: "500", style: "normal" },
    { path: "./fonts/newsreader-600.woff2", weight: "600", style: "normal" },
    { path: "./fonts/newsreader-300-italic.woff2", weight: "300", style: "italic" },
    { path: "./fonts/newsreader-400-italic.woff2", weight: "400", style: "italic" },
    { path: "./fonts/newsreader-500-italic.woff2", weight: "500", style: "italic" },
    { path: "./fonts/newsreader-600-italic.woff2", weight: "600", style: "italic" },
  ],
  variable: "--font-newsreader",
  display: "swap",
});

const jetbrainsMono = localFont({
  src: [
    { path: "./fonts/jetbrains-mono-400.woff2", weight: "400", style: "normal" },
    { path: "./fonts/jetbrains-mono-500.woff2", weight: "500", style: "normal" },
    { path: "./fonts/jetbrains-mono-600.woff2", weight: "600", style: "normal" },
  ],
  variable: "--font-jetbrains-mono",
  display: "swap",
});

const fraunces = localFont({
  src: [
    { path: "./fonts/fraunces-300.woff2", weight: "300", style: "normal" },
    { path: "./fonts/fraunces-400.woff2", weight: "400", style: "normal" },
    { path: "./fonts/fraunces-500.woff2", weight: "500", style: "normal" },
    { path: "./fonts/fraunces-300-italic.woff2", weight: "300", style: "italic" },
    { path: "./fonts/fraunces-400-italic.woff2", weight: "400", style: "italic" },
    { path: "./fonts/fraunces-500-italic.woff2", weight: "500", style: "italic" },
  ],
  variable: "--font-fraunces",
  display: "swap",
});

export default async function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en" className={`${inter.variable} ${oswald.variable} ${newsreader.variable} ${jetbrainsMono.variable} ${fraunces.variable}`} suppressHydrationWarning>
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
