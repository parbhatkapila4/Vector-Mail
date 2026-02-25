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

interface AccountSwitcherProps {
  isCollapsed: boolean;
}

export function AccountSwitcher({ isCollapsed }: AccountSwitcherProps) {
  const { data: accounts } = api.account.getAccounts.useQuery();
  const [accountId, setAccountId] = useLocalStorage("accountId", "");

  React.useEffect(() => {
    if (accounts && accounts.length > 0) {
      const isCurrentAccountValid =
        accountId &&
        accounts.some((acc: { id: string }) => acc.id === accountId);
      if (!isCurrentAccountValid) setAccountId(accounts[0]!.id);
    } else if (accounts && accounts.length === 0) {
      toast("Connect your Google account to continue", {
        action: {
          label: "Connect Google",
          onClick: () => {
            window.location.href = "/api/auth/google";
          },
        },
      });
    }
  }, [accounts, accountId, setAccountId]);

  if (!accounts) return null;
  if (accounts.length === 0) return null;

  const currentAccount = accounts.find(
    (account: { id: string; emailAddress: string }) => account.id === accountId,
  );

  return (
    <Select defaultValue={accountId} onValueChange={setAccountId}>
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
              "flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-zinc-700 to-zinc-800 text-xs font-semibold text-white ring-1 ring-white/[0.08]",
            )}
          >
            {currentAccount?.emailAddress[0]?.toUpperCase()}
          </div>
        </SelectValue>
      </SelectTrigger>
      <SelectContent className="rounded-xl border-white/[0.06] bg-[#141414] p-1 shadow-2xl shadow-black/50">
        {accounts.map((account: { id: string; emailAddress: string }) => (
          <SelectItem
            key={account.id}
            value={account.id}
            className="cursor-pointer rounded-lg text-white focus:bg-white/[0.06] focus:text-white"
          >
            <div className="flex items-center gap-3 py-0.5">
              <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br from-yellow-500 to-yellow-600 text-xs font-semibold text-white">
                {account.emailAddress[0]?.toUpperCase()}
              </span>
              <span className="text-sm">{account.emailAddress}</span>
            </div>
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}
