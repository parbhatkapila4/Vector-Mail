"use client";

import dynamic from "next/dynamic";
import React from "react";
import { useIsMobile } from "@/hooks/use-mobile";

const Mail = dynamic(
  () => import("@/components/mail/Mail").then((mod) => ({ default: mod.Mail })),
  { ssr: false },
);

function MailPage() {
  const isMobile = useIsMobile();

  return (
    <div className="relative h-screen w-full bg-gradient-to-br from-neutral-50 via-white to-neutral-50 dark:from-neutral-950 dark:via-black dark:to-neutral-950">
      <Mail
        defaultLayout={isMobile ? [0, 100, 0] : [20, 32, 48]}
        defaultCollapsed={false}
        navCollapsedSize={4}
      />
    </div>
  );
}

export default MailPage;
