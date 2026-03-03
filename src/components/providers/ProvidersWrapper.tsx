"use client";

import { AppProviders } from "./AppProviders";

export function ProvidersWrapper({
  children,
}: {
  children: React.ReactNode;
}) {
  return <AppProviders>{children}</AppProviders>;
}
