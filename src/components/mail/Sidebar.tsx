"use client";
import React from "react";
import { Nav } from "./Nav";
import { Bot, Bell, Clock, Inbox, Send, CalendarClock } from "lucide-react";
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
      { accountId: firstAccountId || "placeholder" },
      {
        enabled:
          !!firstAccountId && firstAccountId.length > 0 && !accountsLoading,
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
      accountId: accountId || "placeholder",
      tab: "inbox",
    },
    {
      enabled: isEnabled && !!accountId && accountId.length > 0,
      refetchOnWindowFocus: false,
      refetchOnMount: false,
      retry: false,
    },
  );

  const { data: sentThreads } = api.account.getNumThreads.useQuery(
    {
      accountId: accountId || "placeholder",
      tab: "sent",
    },
    {
      enabled: isEnabled && !!accountId && accountId.length > 0,
      refetchOnWindowFocus: false,
      refetchOnMount: false,
      retry: false,
    },
  );

  const { data: snoozedThreads } = api.account.getNumThreads.useQuery(
    {
      accountId: accountId || "placeholder",
      tab: "snoozed",
    },
    {
      enabled: isEnabled && !!accountId && accountId.length > 0,
      refetchOnWindowFocus: false,
      refetchOnMount: false,
      retry: false,
    },
  );

  const { data: reminderThreads } = api.account.getNumThreads.useQuery(
    {
      accountId: accountId || "placeholder",
      tab: "reminders",
    },
    {
      enabled: isEnabled && !!accountId && accountId.length > 0,
      refetchOnWindowFocus: false,
      refetchOnMount: false,
      retry: false,
    },
  );

  const { data: scheduledSends } = api.account.getScheduledSends.useQuery(
    { accountId: accountId || "placeholder" },
    {
      enabled: isEnabled && !!accountId && accountId.length > 0,
      refetchOnWindowFocus: false,
      refetchOnMount: false,
    },
  );
  const scheduledCount = scheduledSends?.length ?? 0;

  return (
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
          title: "Snoozed",
          label: snoozedThreads?.toString() || "0",
          icon: Clock,
          variant: currentTab === "snoozed" ? "default" : "ghost",
        },
        {
          title: "Reminders",
          label: reminderThreads?.toString() || "0",
          icon: Bell,
          variant: currentTab === "reminders" ? "default" : "ghost",
        },
        {
          title: "Scheduled",
          label: scheduledCount > 0 ? scheduledCount.toString() : "0",
          icon: CalendarClock,
          variant: currentTab === "scheduled" ? "default" : "ghost",
        },
        {
          title: "AI Buddy",
          icon: Bot,
          variant: "ghost",
        },
      ]}
    />
  );
};

export default SideBar;
