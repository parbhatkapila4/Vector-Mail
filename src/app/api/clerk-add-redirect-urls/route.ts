import { NextResponse } from "next/server";
export async function GET() {
  const secretKey = process.env.CLERK_SECRET_KEY;
  const baseUrl = process.env.NEXT_PUBLIC_URL || "http://localhost:3000";

  if (!secretKey) {
    return NextResponse.json({ error: "CLERK_SECRET_KEY not set" }, { status: 500 });
  }

  const base = baseUrl.replace(/\/$/, "");
  const urls = [`${base}/sign-in/sso-callback`, `${base}/auth/set-session`, `${base}/mail`];
  const results: { url: string; ok: boolean; status?: number; text?: string }[] = [];

  for (const url of urls) {
    try {
      const res = await fetch("https://api.clerk.com/v1/redirect_urls", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${secretKey}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ url }),
      });
      const text = await res.text();
      results.push({
        url,
        ok: res.ok,
        status: res.status,
        text: res.ok ? "added" : text.slice(0, 200),
      });
    } catch (e) {
      results.push({ url, ok: false, text: e instanceof Error ? e.message : String(e) });
    }
  }

  return NextResponse.json({ message: "Done. Try Sign in with Google again.", results });
}
