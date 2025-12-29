"use client";

import dynamic from "next/dynamic";
import React from "react";
import { UserButton } from "@clerk/nextjs";
import ComposeEmailGmail from "@/components/mail/ComposeEmailGmail";
import { useIsMobile } from "@/hooks/use-mobile";

const Mail = dynamic(
  () => import("@/components/mail/Mail").then((mod) => ({ default: mod.Mail })),
  { ssr: false },
);

function MailPage() {
  const isMobile = useIsMobile();

  return (
    <div className="relative h-screen w-full bg-gradient-to-br from-neutral-50 via-white to-neutral-50 dark:from-neutral-950 dark:via-black dark:to-neutral-950">
      {isMobile && (
        <div className="fixed bottom-6 right-6 z-50 flex items-center gap-3 rounded-2xl border border-neutral-200/50 bg-white/90 p-3.5 shadow-2xl shadow-black/10 backdrop-blur-xl dark:border-neutral-800/50 dark:bg-black/90 dark:shadow-black/50">
          <UserButton />
          <div className="h-6 w-px bg-neutral-200 dark:bg-neutral-800" />
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
