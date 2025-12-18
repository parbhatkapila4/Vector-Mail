"use client";
import { Button } from "@/components/ui/button";
import {
  Drawer,
  DrawerContent,
  DrawerHeader,
  DrawerTitle,
  DrawerTrigger,
} from "@/components/ui/drawer";
import { Pencil } from "lucide-react";

import React from "react";
import EmailEditor from "./editor/EmailEditor";
import { api } from "@/trpc/react";
import { useLocalStorage } from "usehooks-ts";
import { toast } from "sonner";

type OptionType = {
  label: string | React.ReactNode;
  value: string;
};

const ComposeButton = () => {
  const [open, setOpen] = React.useState(false);
  const [accountId] = useLocalStorage("accountId", "");
  const [toValues, setToValues] = React.useState<OptionType[]>([]);
  const [ccValues, setCcValues] = React.useState<OptionType[]>([]);
  const [subject, setSubject] = React.useState<string>("");
  const { data: accounts, isLoading: accountsLoading } =
    api.account.getAccounts.useQuery();
  const hasValidAccount =
    !accountsLoading &&
    !!accountId &&
    accountId.length > 0 &&
    accounts?.some((acc) => acc.id === accountId);

  const { data: account } = api.account.getMyAccount.useQuery(
    { accountId: hasValidAccount ? accountId : "" },
    {
      enabled: hasValidAccount,
      refetchOnWindowFocus: false,
      refetchOnMount: false,
      retry: false,
    },
  );

  React.useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (
        event.key === "c" &&
        (event.ctrlKey || event.metaKey) &&
        !["INPUT", "TEXTAREA", "SELECT"].includes(
          document.activeElement?.tagName || "",
        )
      ) {
        event.preventDefault();
        setOpen((prev) => !prev);
      }
    };

    window.addEventListener("keydown", handleKeyDown);

    return () => {
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, []);

  const sendEmail = api.account.sendEmail.useMutation();

  const handleSend = async (value: string) => {
    console.log(account);
    console.log({ value });
    if (!account) return;
    sendEmail.mutate(
      {
        accountId,
        threadId: undefined,
        body: value,
        subject,
        from: {
          name: account?.name ?? "Me",
          address: account?.emailAddress ?? "me@example.com",
        },
        to: toValues.map((to) => ({ name: to.value, address: to.value })),
        cc: ccValues.map((cc) => ({ name: cc.value, address: cc.value })),
        replyTo: {
          name: account?.name ?? "Me",
          address: account?.emailAddress ?? "me@example.com",
        },
        inReplyTo: undefined,
      },
      {
        onSuccess: () => {
          toast.success("Email sent");
          setOpen(false);
        },
        onError: (error) => {
          console.log(error);
          toast.error(error.message);
        },
      },
    );
  };

  return (
    <Drawer open={open} onOpenChange={setOpen}>
      <DrawerTrigger asChild>
        <Button className="bg-gradient-to-r from-purple-600 via-purple-400 to-amber-400 text-white transition-all hover:shadow-lg hover:shadow-purple-500/50">
          <Pencil className="mr-1 size-4" />
          Compose
        </Button>
      </DrawerTrigger>
      <DrawerContent className="h-[90vh]">
        <DrawerHeader className="pb-2">
          <DrawerTitle>Compose Email</DrawerTitle>
        </DrawerHeader>
        <div className="flex-1 overflow-hidden">
          <EmailEditor
            toValues={toValues}
            ccValues={ccValues}
            onToChange={(values) => {
              setToValues(values);
            }}
            onCcChange={(values) => {
              setCcValues(values);
            }}
            subject={subject}
            setSubject={setSubject}
            to={toValues.map((to) => to.value)}
            handleSend={handleSend}
            isSending={sendEmail.isPending}
            defaultToolbarExpand
          />
        </div>
      </DrawerContent>
    </Drawer>
  );
};

export default ComposeButton;
