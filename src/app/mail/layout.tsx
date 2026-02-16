import { ErrorBoundary } from "@/components/global/ErrorBoundary";

export default function MailLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <ErrorBoundary>{children}</ErrorBoundary>;
}
