"use client";

import React, { Suspense } from "react";
import { Loader2 } from "lucide-react";
import { Mail } from "@/components/mail/Mail";
import { useIsMobile } from "@/hooks/use-mobile";

function MailPageContent() {
  const isMobile = useIsMobile();

  return (
    <div className="relative min-h-dvh h-dvh w-full overflow-hidden bg-white dark:bg-[#09090b]">
      <Mail
        defaultLayout={isMobile ? [0, 100, 0] : [20, 52, 48]}
        defaultCollapsed={false}
        navCollapsedSize={4}
      />
    </div>
  );
}

export default function MailPage() {
  return (
    <Suspense
      fallback={
        <div className="relative flex min-h-dvh h-dvh w-full items-center justify-center overflow-hidden bg-white dark:bg-[#09090b]">
          <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
        </div>
      }
    >
      <MailPageContent />
    </Suspense>
  );
}
