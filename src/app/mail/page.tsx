"use client";

import React from "react";
import { useIsMobile } from "@/hooks/use-mobile";
import { Mail } from "@/components/mail/Mail";

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
