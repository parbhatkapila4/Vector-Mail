"use client";

import * as React from "react";
import { cn } from "@/lib/utils";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { api } from "@/trpc/react";
import { useLocalStorage } from "usehooks-ts";
import { toast } from "sonner";
import { Inbox } from "lucide-react";
import { DEMO_ACCOUNT_ID, DEMO_EMAIL, DEMO_DISPLAY_NAME } from "@/lib/demo/constants";

export const UNIFIED_INBOX_ACCOUNT_ID = "unified";

interface AccountSwitcherProps {
  isCollapsed: boolean;
}

export function AccountSwitcher({ isCollapsed }: AccountSwitcherProps) {
  const { data: accounts } = api.account.getAccounts.useQuery();
  const [accountId, setAccountId] = useLocalStorage("accountId", "");

  React.useEffect(() => {
    if (accounts && accounts.length > 0) {
      const isUnified = accountId === UNIFIED_INBOX_ACCOUNT_ID;
      const isCurrentAccountValid =
        isUnified || (accountId && accounts.some((acc: { id: string }) => acc.id === accountId));
      if (!isCurrentAccountValid) setAccountId(accounts[0]!.id);
    } else if (accounts && accounts.length === 0) {
      toast("Connect your Google account to continue", {
        action: {
          label: "Connect Google",
          onClick: () => {
            window.location.href = "/api/connect/google";
          },
        },
      });
    }
  }, [accounts, accountId, setAccountId]);

  if (!accounts) return null;
  if (accounts.length === 0) return null;

  const isUnified = accountId === UNIFIED_INBOX_ACCOUNT_ID;
  const currentAccount = accounts.find(
    (account: { id: string; emailAddress: string; name?: string }) => account.id === accountId,
  );
  const isDemoAccount = currentAccount?.id === DEMO_ACCOUNT_ID;

  return (
    <Select value={accountId || accounts[0]?.id} onValueChange={setAccountId}>
      <SelectTrigger
        className={cn(
          "border-0 bg-transparent p-0 text-white hover:bg-transparent focus:ring-0 [&>svg]:hidden",
          isCollapsed
            ? "h-10 w-10 justify-center"
            : "h-auto justify-start gap-0",
        )}
        aria-label="Select account"
      >
        <SelectValue>
          <div
            className={cn(
              "flex h-9 w-9 items-center justify-center rounded-xl text-xs font-semibold text-white ring-1 ring-white/[0.08]",
              isDemoAccount
                ? "bg-gradient-to-br from-amber-500 to-amber-600"
                : "bg-gradient-to-br from-zinc-700 to-zinc-800",
            )}
          >
            {isUnified ? (
              <Inbox className="h-4 w-4" />
            ) : isDemoAccount ? (
              "D"
            ) : (
              currentAccount?.emailAddress[0]?.toUpperCase()
            )}
          </div>
        </SelectValue>
      </SelectTrigger>
      <SelectContent className="rounded-xl border-white/[0.06] bg-[#141414] p-1 shadow-2xl shadow-black/50">
        <SelectItem
          value={UNIFIED_INBOX_ACCOUNT_ID}
          className="cursor-pointer rounded-lg text-white focus:bg-white/[0.06] focus:text-white"
        >
          <div className="flex items-center gap-3 py-0.5">
            <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br from-zinc-600 to-zinc-700 text-white">
              <Inbox className="h-4 w-4" />
            </span>
            <span className="text-sm">All accounts</span>
          </div>
        </SelectItem>
        {accounts.map((account: { id: string; emailAddress: string; name?: string }) => {
          const isDemo = account.id === DEMO_ACCOUNT_ID;
          return (
            <SelectItem
              key={account.id}
              value={account.id}
              className="cursor-pointer rounded-lg text-white focus:bg-white/[0.06] focus:text-white"
            >
              <div className="flex items-center gap-3 py-0.5">
                <span className={cn(
                  "flex h-8 w-8 items-center justify-center rounded-lg text-xs font-semibold text-white",
                  isDemo ? "bg-gradient-to-br from-amber-500 to-amber-600" : "bg-gradient-to-br from-yellow-500 to-yellow-600",
                )}>
                  {isDemo ? "D" : account.emailAddress[0]?.toUpperCase()}
                </span>
                <div className="flex flex-col items-start">
                  <span className="text-sm">{isDemo ? DEMO_DISPLAY_NAME : account.emailAddress}</span>
                  {isDemo && <span className="text-[11px] text-gray-500">{DEMO_EMAIL}</span>}
                </div>
              </div>
            </SelectItem>
          );
        })}
      </SelectContent>
    </Select>
  );
}
