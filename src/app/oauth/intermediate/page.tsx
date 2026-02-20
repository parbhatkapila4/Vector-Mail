"use client";

import { useSearchParams } from "next/navigation";
import { useEffect, useRef } from "react";

const AURINKO_CALLBACK_BASE = "https://api.aurinko.io/v1/auth/callback";

export default function OAuthIntermediatePage() {
  const searchParams = useSearchParams();
  const hasRedirected = useRef(false);

  useEffect(() => {
    if (hasRedirected.current) return;
    hasRedirected.current = true;

    const queryString = searchParams.toString();
    const redirectUrl = queryString
      ? `${AURINKO_CALLBACK_BASE}?${queryString}`
      : AURINKO_CALLBACK_BASE;

    window.location.replace(redirectUrl);
  }, [searchParams]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <p className="text-gray-600 text-lg">Redirecting...</p>
    </div>
  );
}
