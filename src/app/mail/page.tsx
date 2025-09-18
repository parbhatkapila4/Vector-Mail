"use client";

import dynamic from "next/dynamic";
import React from "react";
import { ModeToggle } from "@/components/global/ThemeToggle";
import { UserButton } from "@clerk/nextjs";
import ComposeButton from "@/components/mail/ComposeButton";
import { useIsMobile } from "@/hooks/use-mobile";
import { cn } from "@/lib/utils";

const Mail = dynamic(
  () => import("@/components/mail/Mail").then((mod) => ({ default: mod.Mail })),
  { ssr: false },
);

function page() {
  const isMobile = useIsMobile();

  return (
    <div className="h-screen w-full relative">
      <div className={cn(
        "flex items-center gap-2 z-50",
        isMobile 
          ? "fixed top-4 right-4 bg-background/80 backdrop-blur-sm border rounded-lg p-2 shadow-lg" 
          : "absolute bottom-4 left-4"
      )}>
        <UserButton />
        {!isMobile && <ComposeButton/>}
      </div>
      <Mail
        defaultLayout={isMobile ? [0, 100, 0] : [20, 32, 48]}
        defaultCollapsed={isMobile ? true : false}
        navCollapsedSize={4}
      />
      {isMobile && (
        <div className="fixed bottom-4 right-4 z-50">
          <ComposeButton/>
        </div>
      )}
    </div>
  );
}

export default page;
