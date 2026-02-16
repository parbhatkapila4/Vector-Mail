"use client";

import React from "react";
import { ClerkProvider } from "@clerk/nextjs";
import { ThemeProvider } from "@/provider/ThemeProvider";
import { TRPCReactProvider } from "@/trpc/react";
import { Toaster } from "@/components/ui/sonner";
import { KeyboardShortcuts } from "@/components/global/KeyboardShortcuts";
import { PendingSendProvider } from "@/contexts/PendingSendContext";

export function AppProviders({ children }: { children: React.ReactNode }) {
  return (
    <ClerkProvider
      appearance={{
        layout: { unsafe_disableDevelopmentModeWarnings: true },
        elements: { footer: "hidden" },
      }}
    >
      <ThemeProvider
        attribute="class"
        defaultTheme="dark"
        forcedTheme="dark"
        enableSystem={false}
        disableTransitionOnChange
      >
        <TRPCReactProvider>
          <PendingSendProvider>
            <KeyboardShortcuts />
            {children}
          </PendingSendProvider>
        </TRPCReactProvider>
        <Toaster />
      </ThemeProvider>
    </ClerkProvider>
  );
}

export default AppProviders;
