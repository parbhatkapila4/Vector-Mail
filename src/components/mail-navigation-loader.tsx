"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useRef,
  useState,
  useTransition,
} from "react";
import { usePathname, useRouter } from "next/navigation";

type MailNavContextType = {
  navigateToMail: () => void;
  isNavigating: boolean;
};

const MailNavContext = createContext<MailNavContextType>({
  navigateToMail: () => { },
  isNavigating: false,
});

export function useMailNavigation() {
  return useContext(MailNavContext);
}

export function MailNavigationProvider({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();
  const [isNavigating, setIsNavigating] = useState(false);
  const [, startTransition] = useTransition();
  const safetyTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const clearSafetyTimer = useCallback(() => {
    if (safetyTimerRef.current) {
      clearTimeout(safetyTimerRef.current);
      safetyTimerRef.current = null;
    }
  }, []);

  useEffect(() => {
    if (!isNavigating) return;
    if (pathname?.startsWith("/mail")) {
      setIsNavigating(false);
      clearSafetyTimer();
    }
  }, [pathname, isNavigating, clearSafetyTimer]);

  useEffect(() => {
    return () => clearSafetyTimer();
  }, [clearSafetyTimer]);

  const navigateToMail = useCallback(() => {
    if (isNavigating) return;
    if (pathname?.startsWith("/mail")) {
      router.push("/mail");
      return;
    }

    setIsNavigating(true);
    startTransition(() => {
      router.push("/mail");
    });

    clearSafetyTimer();
    safetyTimerRef.current = setTimeout(() => {
      setIsNavigating(false);
    }, 15000);
  }, [router, isNavigating, pathname, clearSafetyTimer]);

  return (
    <MailNavContext.Provider value={{ navigateToMail, isNavigating }}>
      {children}
      {isNavigating && <MailNavigationOverlay />}
    </MailNavContext.Provider>
  );
}

function MailNavigationOverlay() {
  return (
    <div
      className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/30 backdrop-blur-xl"
      role="status"
      aria-live="polite"
      aria-label="Loading"
    >
      <div className="flex items-center gap-3 rounded-full border border-white/10 bg-black/40 px-4 py-2 shadow-[0_8px_32px_rgba(0,0,0,0.35)] backdrop-blur-md">
        <span
          className="h-3.5 w-3.5 animate-spin rounded-full border-[1.5px] border-white/15 border-t-white/80"
          aria-hidden="true"
        />
        <span className="text-[12.5px] font-medium tracking-tight text-white/80">
          Loading
        </span>
      </div>
    </div>
  );
}
