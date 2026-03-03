"use client";

import { useSearchParams } from "next/navigation";
import { useMemo } from "react";
import { useAuth } from "@clerk/nextjs";
import { DEMO_USER_ID } from "@/lib/demo/constants";

const DEMO_COOKIE = "vectormail_demo";

function getDemoCookie(): string | null {
  if (typeof document === "undefined") return null;
  const match = document.cookie.match(new RegExp(`(?:^|; )${DEMO_COOKIE}=([^;]*)`));
  return match ? decodeURIComponent(match[1]!) : null;
}

export function useDemoMode(): boolean {
  const searchParams = useSearchParams();
  const { userId } = useAuth();
  return useMemo(() => {
    if (userId && userId !== DEMO_USER_ID) return false;
    if (searchParams.get("demo") === "1") return true;
    return getDemoCookie() === "1";
  }, [searchParams, userId]);
}
