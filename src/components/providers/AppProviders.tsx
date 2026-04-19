"use client";

import React, { useState, useEffect } from "react";
import { ClerkProvider } from "@clerk/nextjs";
import { ThemeProvider } from "@/provider/ThemeProvider";
import { TRPCReactProvider } from "@/trpc/react";
import { Toaster } from "@/components/ui/sonner";
import { KeyboardShortcuts } from "@/components/global/KeyboardShortcuts";
import { PendingSendProvider } from "@/contexts/PendingSendContext";
import { MailNavigationProvider } from "@/components/mail-navigation-loader";

function ClientOnlyKeyboardShortcuts() {
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);
  if (!mounted) return null;
  return <KeyboardShortcuts />;
}

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
            <MailNavigationProvider>
              <ClientOnlyKeyboardShortcuts />
              {children}
            </MailNavigationProvider>
          </PendingSendProvider>
        </TRPCReactProvider>
        <Toaster />
      </ThemeProvider>
    </ClerkProvider>
  );
}

export default AppProviders;
