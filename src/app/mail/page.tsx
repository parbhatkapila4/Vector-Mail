"use client";

import React, { Suspense } from "react";
import { Mail } from "@/components/mail/Mail";
import { useIsMobile } from "@/hooks/use-mobile";
import MailLoading from "./loading";

function MailPageContent() {
  const isMobile = useIsMobile();

  return (
    <div className="relative min-h-dvh h-dvh w-full overflow-hidden bg-white dark:bg-[#09090b]">
      <Mail
        defaultLayout={isMobile ? [0, 100, 0] : [20, 42, 58]}
        defaultCollapsed={false}
        navCollapsedSize={4}
      />
    </div>
  );
}

export default function MailPage() {
  return (
    <Suspense fallback={<MailLoading />}>
      <MailPageContent />
    </Suspense>
  );
}
