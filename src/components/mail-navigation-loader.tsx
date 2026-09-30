"use client";

import {
  createContext,
  useCallback,
  useContext,
  useTransition,
} from "react";
import { usePathname, useRouter } from "next/navigation";
import { MailShellSkeleton } from "@/components/mail/MailShellSkeleton";

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
  const [isNavigating, startTransition] = useTransition();

  const navigateToMail = useCallback(() => {
    if (isNavigating) return;
    if (pathname?.startsWith("/mail")) {
      router.push("/mail");
      return;
    }

    startTransition(() => {
      router.push("/mail");
    });
  }, [router, isNavigating, pathname]);

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
      className="fixed inset-0 z-[9999]"
      role="status"
      aria-live="polite"
      aria-label="Loading your inbox"
    >
      <MailShellSkeleton />
    </div>
  );
}
