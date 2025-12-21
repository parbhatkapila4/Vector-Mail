"use client";
import React from "react";
import { Nav } from "./Nav";
import { Bot, Inbox, Send } from "lucide-react";
import { useLocalStorage } from "usehooks-ts";
import { api } from "@/trpc/react";
type Props = { isCollapsed: boolean };

const SideBar = ({ isCollapsed }: Props) => {
  const [tab] = useLocalStorage("vector-mail", "inbox");
  const { data: accounts, isLoading: accountsLoading } =
    api.account.getAccounts.useQuery();

  const firstAccountId = accounts && accounts.length > 0 ? accounts[0]!.id : "";

  const { data: myAccount, isLoading: myAccountLoading } =
    api.account.getMyAccount.useQuery(
      { accountId: firstAccountId },
      {
        enabled: !!firstAccountId && !accountsLoading,
        refetchOnWindowFocus: false,
        refetchOnMount: false,
        retry: false,
      },
    );

  const accountId = myAccount?.id ?? "";
  const currentTab = tab ?? "inbox";
  const hasValidAccount =
    !accountsLoading &&
    !myAccountLoading &&
    !!accountId &&
    accountId.length > 0;
  const isEnabled = hasValidAccount && !!currentTab;

  console.log("[Inbox] accountId used:", accountId);

  const { data: inboxThreads } = api.account.getNumThreads.useQuery(
    {
      accountId: isEnabled ? accountId : "",
      tab: "inbox",
    },
    {
      enabled: isEnabled,
      refetchOnWindowFocus: false,
      refetchOnMount: false,
      retry: false,
    },
  );

  const { data: sentThreads } = api.account.getNumThreads.useQuery(
    {
      accountId: isEnabled ? accountId : "",
      tab: "sent",
    },
    {
      enabled: isEnabled,
      refetchOnWindowFocus: false,
      refetchOnMount: false,
      retry: false,
    },
  );

  return (
    <>
      <Nav
        isCollapsed={isCollapsed}
        links={[
          {
            title: "Inbox",
            label: inboxThreads?.toString() || "0",
            icon: Inbox,
            variant: currentTab === "inbox" ? "default" : "ghost",
          },
          {
            title: "Sent",
            label: sentThreads?.toString() || "0",
            icon: Send,
            variant: currentTab === "sent" ? "default" : "ghost",
          },
          {
            title: "AI Buddy",
            icon: Bot,
            variant: "ghost",
          },
        ]}
      />
    </>
  );
};

export default SideBar;
