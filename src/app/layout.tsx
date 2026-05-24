import "@/styles/globals.css";
import "@/styles/design-tokens.css";
import "@/styles/hero-reactive-background.css";

import { type Metadata } from "next";
import Script from "next/script";
import { Inter, Oswald, Newsreader, JetBrains_Mono, Fraunces } from "next/font/google";

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

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-geist-sans",
});

const oswald = Oswald({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  variable: "--font-oswald",
});

const newsreader = Newsreader({
  subsets: ["latin"],
  weight: ["300", "400", "500", "600"],
  style: ["normal", "italic"],
  variable: "--font-newsreader",
  display: "swap",
  adjustFontFallback: false,
});

const jetbrainsMono = JetBrains_Mono({
  subsets: ["latin"],
  weight: ["400", "500", "600"],
  variable: "--font-jetbrains-mono",
  display: "swap",
});
const fraunces = Fraunces({
  subsets: ["latin"],
  weight: ["300", "400", "500"],
  style: ["normal", "italic"],
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
