"use client";

import { useSignIn } from "@clerk/nextjs";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";

export default function AuthCallbackPage() {
  const { isLoaded, signIn, setActive } = useSignIn();
  const router = useRouter();
  const searchParams = useSearchParams();
  const [status, setStatus] = useState<"loading" | "done" | "error">("loading");
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  useEffect(() => {
    if (!isLoaded || !signIn || !setActive) return;

    const ticket = searchParams.get("ticket");
    if (!ticket) {
      setStatus("error");
      setErrorMessage("Missing sign-in link. Please try signing in again.");
      return;
    }

    const signInFn = signIn;
    const setActiveFn = setActive;
    let cancelled = false;

    async function redeemTicket(ticketVal: string) {
      try {
        const res = await signInFn.create({
          strategy: "ticket",
          ticket: ticketVal,
        });

        if (cancelled) return;

        if (res.status === "complete" && res.createdSessionId) {
          await setActiveFn({
            session: res.createdSessionId,
          });
          if (!cancelled) {
            setStatus("done");
            router.replace("/mail");
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

    void redeemTicket(ticket);
    return () => {
      cancelled = true;
    };
  }, [isLoaded, signIn, setActive, searchParams, router]);

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
