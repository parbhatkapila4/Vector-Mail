import "@/styles/buddy-home.css";

import { ErrorBoundary } from "@/components/global/ErrorBoundary";

export default function BuddyLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <ErrorBoundary>{children}</ErrorBoundary>;
}
