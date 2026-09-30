"use client";

import { useAuth } from "@clerk/nextjs";
import { useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import {
  AuthHandoffFailure,
  AuthHandoffLoading,
  useHandoffTimeout,
} from "../AuthHandoff";

export default function SetSessionPage() {
  const { getToken, isLoaded } = useAuth();
  const router = useRouter();
  const [status, setStatus] = useState<"loading" | "done">("loading");
  const doneRef = useRef(false);
  const timedOut = useHandoffTimeout(status === "loading");

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
        setStatus("done");
      }
    }

    setSessionAndRedirect();
  }, [isLoaded, getToken, router]);

  if (timedOut) {
    return (
      <AuthHandoffFailure
        heading="Opening your inbox is taking too long"
        body="We couldn't confirm your session, so we stopped waiting. Start again from the home page."
      />
    );
  }

  return <AuthHandoffLoading status="Taking you to your inbox…" />;
}
