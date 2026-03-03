"use client";

import React from "react";
import dynamic from "next/dynamic";
import { useIsMobile } from "@/hooks/use-mobile";

const Mail = dynamic(() => import("@/components/mail/Mail"), {
  ssr: false,
  loading: () => (
    <div className="relative flex min-h-dvh h-dvh w-full items-center justify-center bg-white dark:bg-[#09090b]">
      <div className="h-8 w-8 animate-spin rounded-full border-2 border-[#e5e7eb] border-t-[#3b82f6] dark:border-[#1a1a23] dark:border-t-[#60a5fa]" />
    </div>
  ),
});

function MailPage() {
  const isMobile = useIsMobile();

  return (
    <div className="relative min-h-dvh h-dvh w-full overflow-hidden bg-white dark:bg-[#09090b]">
      <Mail
        defaultLayout={isMobile ? [0, 100, 0] : [20, 32, 48]}
        defaultCollapsed={false}
        navCollapsedSize={4}
      />
    </div>
  );
}

export default MailPage;
