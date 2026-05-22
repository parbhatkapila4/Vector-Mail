import "server-only";

import { ClerkProvider } from "@clerk/nextjs";

import { AppProviders } from "./AppProviders";
export async function ProvidersWrapper({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <ClerkProvider
      dynamic
      appearance={{
        layout: { unsafe_disableDevelopmentModeWarnings: true },
        elements: { footer: "hidden" },
      }}
    >
      <AppProviders>{children}</AppProviders>
    </ClerkProvider>
  );
}
