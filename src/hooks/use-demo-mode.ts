"use client";

import { useSearchParams } from "next/navigation";
import { useMemo } from "react";

const DEMO_COOKIE = "vectormail_demo";

function getDemoCookie(): string | null {
  if (typeof document === "undefined") return null;
  const match = document.cookie.match(new RegExp(`(?:^|; )${DEMO_COOKIE}=([^;]*)`));
  return match ? decodeURIComponent(match[1]!) : null;
}

/**
 * Client-side demo mode: true when query demo=1 or cookie vectormail_demo=1.
 */
export function useDemoMode(): boolean {
  const searchParams = useSearchParams();
  return useMemo(() => {
    if (searchParams.get("demo") === "1") return true;
    return getDemoCookie() === "1";
  }, [searchParams]);
}
