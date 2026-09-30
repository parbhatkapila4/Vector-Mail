"use client";

import { useAuth, useSignIn } from "@clerk/nextjs";
import { useRouter, useSearchParams } from "next/navigation";
import { Suspense, useEffect, useRef, useState } from "react";
import {
  AuthHandoffFailure,
  AuthHandoffLoading,
  useHandoffTimeout,
  type HandoffFailure,
} from "../AuthHandoff";

const MISSING_TICKET: HandoffFailure = {
  heading: "That sign-in link is incomplete",
  body: "It's missing the one-time code that signs you in. Start again from the home page.",
};

const TIMED_OUT: HandoffFailure = {
  heading: "Signing in is taking too long",
  body: "We couldn't confirm your sign-in, so we stopped waiting. Start again from the home page.",
};

const rejected = (detail?: string): HandoffFailure => ({
  heading: "We couldn't finish signing you in",
  body: "Google approved you, but the one-time sign-in link didn't go through. These links expire quickly and only work once, so start again from the home page.",
  detail,
});

function AuthCallbackContent() {
  const { isLoaded, signIn, setActive } = useSignIn();
  const { isSignedIn, getToken } = useAuth();
  const router = useRouter();
  const searchParams = useSearchParams();
  const [status, setStatus] = useState<"loading" | "redirecting">("loading");
  const [failure, setFailure] = useState<HandoffFailure | null>(null);
  const redeemedRef = useRef(false);
  const timedOut = useHandoffTimeout(status === "loading" && !failure);

  useEffect(() => {
    if (!isLoaded || !signIn || !setActive) return;

    const ticket = searchParams.get("ticket");
    const accountId = searchParams.get("accountId");
    if (!ticket) {
      setFailure(MISSING_TICKET);
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
                setStatus("redirecting");
                window.location.replace(
                  `/api/auth/dev-session?token=${encodeURIComponent(token)}&redirectTo=${encodeURIComponent(redirectTo)}`,
                );
                return;
              }
            }
            setStatus("redirecting");
            window.location.replace(redirectTo);
          }
        } else {
          setFailure(rejected());
        }
      } catch (err) {
        if (!cancelled) {
          setFailure(rejected(err instanceof Error ? err.message : undefined));
        }
      }
    }

    if (isSignedIn) {
      setStatus("redirecting");
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

  if (status === "redirecting") {
    return <AuthHandoffLoading status="Taking you to your inbox…" />;
  }
  if (failure) return <AuthHandoffFailure {...failure} />;
  if (timedOut) return <AuthHandoffFailure {...TIMED_OUT} />;

  return <AuthHandoffLoading status="Signing you in…" />;
}

export default function AuthCallbackPage() {
  return (
    <Suspense fallback={<AuthHandoffLoading status="Signing you in…" />}>
      <AuthCallbackContent />
    </Suspense>
  );
}
