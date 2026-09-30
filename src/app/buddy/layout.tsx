import "@/styles/buddy-home.css";

import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";

import { ErrorBoundary } from "@/components/global/ErrorBoundary";
import { hasConnectedAccount } from "@/lib/connected-account";
export const dynamic = "force-dynamic";

export default async function BuddyLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { userId } = await auth();
  if (!userId) redirect("/");
  if (!(await hasConnectedAccount(userId))) redirect("/mail");

  return <ErrorBoundary>{children}</ErrorBoundary>;
}
