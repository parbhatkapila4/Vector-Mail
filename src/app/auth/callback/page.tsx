"use client";

import { useAuth, useSignIn } from "@clerk/nextjs";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { Suspense, useEffect, useRef, useState } from "react";

function AuthCallbackContent() {
  const { isLoaded, signIn, setActive } = useSignIn();
  const { isSignedIn, getToken } = useAuth();
  const router = useRouter();
  const searchParams = useSearchParams();
  const [status, setStatus] = useState<"loading" | "done" | "error">("loading");
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const redeemedRef = useRef(false);

  useEffect(() => {
    if (!isLoaded || !signIn || !setActive) return;

    const ticket = searchParams.get("ticket");
    const accountId = searchParams.get("accountId");
    if (!ticket) {
      setStatus("error");
      setErrorMessage("Missing sign-in link. Please try signing in again.");
      return;
    }

    const ticketVal = ticket;
    const accountIdParam = accountId?.trim() ? accountId.trim() : "";
    const signInFn = signIn;
    const setActiveFn = setActive;
    let cancelled = false;

    async function redeemTicket(val: string) {
      try {
        const res = await signInFn.create({
          strategy: "ticket",
          ticket: val,
        });

        if (cancelled) return;

        if (res.status === "complete" && res.createdSessionId) {
          if (!cancelled) setStatus("done");
          await setActiveFn({
            session: res.createdSessionId,
          });
          if (!cancelled && typeof window !== "undefined") {
            const isHttpLocalhost =
              typeof window !== "undefined" &&
              window.location.protocol === "http:" &&
              (window.location.hostname === "localhost" || window.location.hostname === "127.0.0.1");
            const redirectTo = accountIdParam
              ? `/mail?accountId=${encodeURIComponent(accountIdParam)}`
              : "/mail";
            if (isHttpLocalhost) {
              let token: string | null = null;
              for (let i = 0; i < 3 && !token; i++) {
                await new Promise((r) => setTimeout(r, 200 + i * 300));
                if (cancelled) return;
                token = (await getToken?.({ skipCache: true })) ?? null;
              }
              if (token) {
                window.location.replace(
                  `/api/auth/dev-session?token=${encodeURIComponent(token)}&redirectTo=${encodeURIComponent(redirectTo)}`,
                );
                return;
              }
            }
            window.location.replace(redirectTo);
          }
        } else {
          setStatus("error");
          setErrorMessage("Sign-in could not be completed. Please try again.");
        }
      } catch (err) {
        if (!cancelled) {
          setStatus("error");
          setErrorMessage(err instanceof Error ? err.message : "Something went wrong. Please try signing in again.");
        }
      }
    }

    if (isSignedIn) {
      if (typeof window !== "undefined") {
        window.location.replace("/mail");
      } else {
        router.replace("/mail");
      }
      return;
    }

    if (!isSignedIn && !redeemedRef.current) {
      redeemedRef.current = true;
      void redeemTicket(ticketVal);
    }

    return () => {
      cancelled = true;
    };
  }, [isLoaded, signIn, setActive, isSignedIn, searchParams, router, getToken]);

  if (status === "error") {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center gap-4 bg-[#0a0a0a] text-white">
        <p className="text-center text-zinc-400">{errorMessage}</p>
        <Link
          href="/sign-in"
          className="rounded-lg bg-gradient-to-r from-yellow-500 to-yellow-600 px-4 py-2 text-sm font-medium text-white hover:opacity-90"
        >
          Back to sign in
        </Link>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen flex-col items-center justify-center gap-4 bg-[#0a0a0a] text-white">
      <div className="h-8 w-8 animate-spin rounded-full border-2 border-yellow-500 border-t-transparent" />
      <p className="text-sm text-zinc-400">Signing you in…</p>
    </div>
  );
}

export default function AuthCallbackPage() {
  return (
    <Suspense
      fallback={
        <div className="flex min-h-screen flex-col items-center justify-center gap-4 bg-[#0a0a0a] text-white">
          <div className="h-8 w-8 animate-spin rounded-full border-2 border-yellow-500 border-t-transparent" />
          <p className="text-sm text-zinc-400">Signing you in…</p>
        </div>
      }
    >
      <AuthCallbackContent />
    </Suspense>
  );
}
