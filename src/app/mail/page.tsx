"use client";

import dynamic from "next/dynamic";
import React from "react";
import { UserButton } from "@clerk/nextjs";
import ComposeEmailGmail from "@/components/mail/ComposeEmailGmail";
import { useIsMobile } from "@/hooks/use-mobile";
import { cn } from "@/lib/utils";

const Mail = dynamic(
  () => import("@/components/mail/Mail").then((mod) => ({ default: mod.Mail })),
  { ssr: false },
);

function MailPage() {
  const isMobile = useIsMobile();

  return (
    <div className="relative h-screen w-full bg-[#0A0A0A] text-white">
      {isMobile && (
        <div className="fixed bottom-4 left-4 z-50 flex items-center gap-3 rounded-xl border border-white/[0.08] bg-[#0A0A0A]/90 p-3 shadow-xl backdrop-blur-xl">
          <UserButton />
          <div className="h-6 w-px bg-white/[0.06]" />
          <ComposeEmailGmail />
        </div>
      )}

      <Mail
        defaultLayout={isMobile ? [0, 100, 0] : [20, 32, 48]}
        defaultCollapsed={false}
        navCollapsedSize={4}
      />
    </div>
  );
}

export default MailPage;
