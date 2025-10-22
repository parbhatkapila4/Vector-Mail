"use client";

import dynamic from "next/dynamic";
import React from "react";
import { ModeToggle } from "@/components/global/ThemeToggle";
import { UserButton } from "@clerk/nextjs";
import ComposeButton from "@/components/mail/ComposeButton";
import { useIsMobile } from "@/hooks/use-mobile";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";
import { useRouter } from "next/navigation";

const Mail = dynamic(
  () => import("@/components/mail/Mail").then((mod) => ({ default: mod.Mail })),
  { ssr: false },
);

function page() {
  const isMobile = useIsMobile();
  const router = useRouter();

  const handleBackToHome = () => {
    router.push('/');
  };

  return (
    <div className="h-screen w-full relative">
      {/* Back to Home Button - Top Right */}
      <div className={cn(
        "z-50",
        isMobile 
          ? "fixed top-4 right-4" 
          : "absolute top-4 right-4"
      )}>
        <Button
          variant="ghost"
          size="sm"
          onClick={handleBackToHome}
          className="bg-background/80 backdrop-blur-sm border rounded-lg p-2 shadow-lg hover:bg-muted"
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to Home
        </Button>
      </div>

      {/* User Controls - Bottom Left */}
      <div className={cn(
        "flex items-center gap-2 z-50",
        isMobile 
          ? "fixed bottom-4 left-4 bg-background/80 backdrop-blur-sm border rounded-lg p-2 shadow-lg" 
          : "absolute bottom-4 left-4 bg-background/80 backdrop-blur-sm border rounded-lg p-2 shadow-lg"
      )}>
        <UserButton />
        <ComposeButton/>
      </div>

      <Mail
        defaultLayout={isMobile ? [0, 100, 0] : [20, 32, 48]}
        defaultCollapsed={false}
        navCollapsedSize={4}
      />
    </div>
  );
}

export default page;
