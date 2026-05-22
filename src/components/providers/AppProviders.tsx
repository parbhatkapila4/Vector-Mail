"use client";

import React, { useState, useEffect } from "react";
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
    <ThemeProvider
      attribute="data-theme"
      defaultTheme="light"
      forcedTheme="light"
      storageKey="vm-theme"
      enableSystem={false}
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
  );
}

export default AppProviders;
