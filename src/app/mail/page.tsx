"use client";

import dynamic from "next/dynamic";
import React from "react";
import { useIsMobile } from "@/hooks/use-mobile";

const Mail = dynamic(() => import("@/components/mail/Mail"), {
  ssr: false,
  loading: () => (
    <div className="flex h-screen w-full items-center justify-center bg-[#f6f8fc] dark:bg-[#202124]">
      <div className="h-8 w-8 animate-spin rounded-full border-2 border-[#dadce0] border-t-[#1a73e8] dark:border-[#3c4043] dark:border-t-[#8ab4f8]" />
    </div>
  ),
});

function MailPage() {
  const isMobile = useIsMobile();

  return (
    <div className="relative h-screen w-full bg-[#f6f8fc] dark:bg-[#202124]">
      <Mail
        defaultLayout={isMobile ? [0, 100, 0] : [20, 32, 48]}
        defaultCollapsed={false}
        navCollapsedSize={4}
      />
    </div>
  );
}

export default MailPage;
