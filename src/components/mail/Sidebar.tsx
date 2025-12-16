"use client";
import React from "react";
import { Nav } from "./Nav";

import { File, Inbox, Send } from "lucide-react";
import { useLocalStorage } from "usehooks-ts";
import { api } from "@/trpc/react";
type Props = { isCollapsed: boolean };

const SideBar = ({ isCollapsed }: Props) => {
  const [tab] = useLocalStorage("vector-mail", "inbox");
  const [accountId] = useLocalStorage("accountId", "");

  const currentTab = tab ?? "inbox";

  const { data: inboxThreads } = api.account.getNumThreads.useQuery(
    {
      accountId,
      tab: "inbox",
    },
    { enabled: !!accountId && !!currentTab },
  );

  const { data: draftsThreads } = api.account.getNumThreads.useQuery(
    {
      accountId,
      tab: "drafts",
    },
    { enabled: !!accountId && !!currentTab },
  );

  const { data: sentThreads } = api.account.getNumThreads.useQuery(
    {
      accountId,
      tab: "sent",
    },
    { enabled: !!accountId && !!currentTab },
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
            title: "Drafts",
            label: draftsThreads?.toString() || "0",
            icon: File,
            variant: currentTab === "drafts" ? "default" : "ghost",
          },
          {
            title: "Sent",
            label: sentThreads?.toString() || "0",
            icon: Send,
            variant: currentTab === "sent" ? "default" : "ghost",
          },
        ]}
      />
    </>
  );
};

export default SideBar;
