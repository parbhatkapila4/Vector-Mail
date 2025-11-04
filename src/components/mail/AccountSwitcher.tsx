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
import { api, type RouterOutputs } from "@/trpc/react";
import { useLocalStorage } from "usehooks-ts";
import { Plus } from "lucide-react";
import { getAurinkoAuthUrl } from "@/lib/aurinko";
import { toast } from "sonner";

interface AccountSwitcherProps {
  isCollapsed: boolean;
}

export function AccountSwitcher({ isCollapsed }: AccountSwitcherProps) {
  const { data: accounts } = api.account.getAccounts.useQuery();
  const [accountId, setAccountId] = useLocalStorage("accountId", "");

  React.useEffect(() => {
    if (accounts && accounts.length > 0) {
      // Check if the current accountId is valid
      const isCurrentAccountValid =
        accountId && accounts.some((acc: { id: string }) => acc.id === accountId);

      // If no accountId or current accountId is invalid, set to first account
      if (!isCurrentAccountValid) {
        setAccountId(accounts[0]!.id);
      }
    } else if (accounts && accounts.length === 0) {
      toast("Link an account to continue", {
        action: {
          label: "Add account",
          onClick: async () => {
            try {
              const url = await getAurinkoAuthUrl("Google");
              window.location.href = url;
            } catch (error) {
              toast.error((error as Error).message);
            }
          },
        },
      });
    }
  }, [accounts]);

  if (!accounts) return <></>;

  if (accounts.length === 0) {
    return (
      <div className="flex w-full items-center gap-2">
        <div className="flex w-full flex-1 items-center gap-2 px-3 py-2 text-sm text-gray-500 dark:text-gray-400">
          No accounts connected
        </div>
      </div>
    );
  }

  return (
    <div className="flex w-full items-center gap-2">
      <Select defaultValue={accountId} onValueChange={setAccountId}>
        <SelectTrigger
          className={cn(
            "flex w-full flex-1 items-center gap-2 [&>span]:line-clamp-1 [&>span]:flex [&>span]:w-full [&>span]:items-center [&>span]:gap-1 [&>span]:truncate [&_svg]:h-4 [&_svg]:w-4 [&_svg]:shrink-0",
            isCollapsed &&
              "flex h-9 w-9 shrink-0 items-center justify-center p-0 [&>span]:w-auto [&>svg]:hidden",
          )}
          aria-label="Select account"
        >
          <SelectValue placeholder="Select an account">
            <span className={cn({ hidden: !isCollapsed })}>
              {
                accounts.find((account: { id: string; emailAddress: string }) => account.id === accountId)
                  ?.emailAddress[0]
              }
            </span>
            <span className={cn("ml-2", isCollapsed && "hidden")}>
              {
                accounts.find((account: { id: string; emailAddress: string }) => account.id === accountId)
                  ?.emailAddress
              }
            </span>
          </SelectValue>
        </SelectTrigger>
        <SelectContent>
          {accounts.map((account: { id: string; emailAddress: string }) => (
            <SelectItem key={account.id} value={account.id}>
              <div className="flex items-center gap-3 [&_svg]:h-4 [&_svg]:w-4 [&_svg]:shrink-0 [&_svg]:text-foreground">
                {/* {account.icon} */}
                {account.emailAddress}
              </div>
            </SelectItem>
          ))}
          <div
            onClick={async (e) => {
              try {
                const url = await getAurinkoAuthUrl("Google");
                window.location.href = url;
              } catch (error) {
                toast.error((error as Error).message);
              }
            }}
            className="relative flex w-full cursor-pointer items-center rounded-sm py-1.5 pl-2 pr-8 text-sm outline-none hover:bg-gradient-to-r hover:from-purple-600/20 hover:via-purple-400/20 hover:to-amber-400/20 focus:bg-accent focus:text-accent-foreground data-[disabled]:pointer-events-none data-[disabled]:opacity-50"
          >
            <Plus className="mr-1 size-4 text-purple-400" />
            Add account
          </div>
        </SelectContent>
      </Select>
    </div>
  );
}
