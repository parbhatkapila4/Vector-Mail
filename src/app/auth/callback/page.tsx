"use client";

import { useAuth, useClerk, useSignIn } from "@clerk/nextjs";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useEffect, useRef, useState } from "react";

export default function AuthCallbackPage() {
  const { isLoaded, signIn, setActive } = useSignIn();
  const { isSignedIn, getToken } = useAuth();
  const { signOut } = useClerk();
  const router = useRouter();
  const searchParams = useSearchParams();
  const [status, setStatus] = useState<"loading" | "done" | "error">("loading");
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const redeemedRef = useRef(false);

  useEffect(() => {
    if (!isLoaded || !signIn || !setActive) return;

    const ticket = searchParams.get("ticket");
    if (!ticket) {
      setStatus("error");
      setErrorMessage("Missing sign-in link. Please try signing in again.");
      return;
    }

    const ticketVal = ticket;
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
            if (isHttpLocalhost) {
              let token: string | null = null;
              for (let i = 0; i < 3 && !token; i++) {
                await new Promise((r) => setTimeout(r, 200 + i * 300));
                if (cancelled) return;
                token = (await getToken?.({ skipCache: true })) ?? null;
              }
              if (token) {
                window.location.replace(`/api/auth/dev-session?token=${encodeURIComponent(token)}`);
                return;
              }
            }
            window.location.replace("/mail");
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

    if (isSignedIn && signOut) {
      void signOut({ redirectUrl: undefined }).catch(() => { });
      return;
    }

    if (!isSignedIn && !redeemedRef.current) {
      redeemedRef.current = true;
      void redeemTicket(ticketVal);
    }

    return () => {
      cancelled = true;
    };
  }, [isLoaded, signIn, setActive, isSignedIn, signOut, searchParams, router, getToken]);

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
