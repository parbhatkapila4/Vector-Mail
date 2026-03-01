"use client";

import { useAuth } from "@clerk/nextjs";
import { useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";

export default function SetSessionPage() {
  const { getToken, isLoaded } = useAuth();
  const router = useRouter();
  const [status, setStatus] = useState<"loading" | "done" | "error">("loading");
  const doneRef = useRef(false);

  useEffect(() => {
    if (!isLoaded || doneRef.current) return;

    async function setSessionAndRedirect() {
      try {
        const token = await getToken?.({ skipCache: true });
        if (!token) {
          router.replace("/mail");
          return;
        }
        const isHttpLocalhost =
          typeof window !== "undefined" &&
          window.location.protocol === "http:" &&
          (window.location.hostname === "localhost" || window.location.hostname === "127.0.0.1");
        if (isHttpLocalhost) {
          doneRef.current = true;
          setStatus("done");
          window.location.replace(`/api/auth/dev-session?token=${encodeURIComponent(token)}`);
          return;
        }
        router.replace("/mail");
      } catch {
        router.replace("/mail");
      } finally {
        doneRef.current = true;
      }
    }

    setSessionAndRedirect();
  }, [isLoaded, getToken, router]);

  return (
    <div className="flex min-h-screen flex-col items-center justify-center gap-4 bg-[#0a0a0a]">
      <div className="h-8 w-8 animate-spin rounded-full border-2 border-[#1a73e8] border-t-transparent" />
      <p className="text-sm text-zinc-400">Taking you to your inbox…</p>
    </div>
  );
}
