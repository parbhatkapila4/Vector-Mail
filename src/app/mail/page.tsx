"use client";

import dynamic from "next/dynamic";
import React from "react";
import { UserButton } from "@clerk/nextjs";
import ComposeEmailGmail from "@/components/mail/ComposeEmailGmail";
import { useIsMobile } from "@/hooks/use-mobile";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";
import { useRouter } from "next/navigation";

const Mail = dynamic(
  () => import("@/components/mail/Mail").then((mod) => ({ default: mod.Mail })),
  { ssr: false },
);

function MailPage() {
  const isMobile = useIsMobile();
  const router = useRouter();

  const handleBackToHome = () => {
    router.push("/");
  };

  return (
    <div className="relative h-screen w-full">
      <div
        className={cn(
          "z-50",
          isMobile ? "fixed right-4 top-10" : "fixed right-4 top-10",
        )}
      >
        <Button
          variant="ghost"
          size="icon"
          onClick={handleBackToHome}
          className="h-9 w-9 rounded-lg border border-purple-500/30 bg-white/5 text-white shadow-lg backdrop-blur-sm transition-all hover:border-purple-500/50 hover:bg-gradient-to-r hover:from-purple-600/20 hover:via-purple-400/20 hover:to-amber-400/20"
          aria-label="Back to Home"
        >
          <ArrowLeft className="h-4 w-4" />
        </Button>
      </div>

      {isMobile && (
        <div className="fixed bottom-4 left-4 z-50 flex items-center gap-2 rounded-lg border bg-background/80 p-2 shadow-lg backdrop-blur-sm">
          <UserButton />
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
