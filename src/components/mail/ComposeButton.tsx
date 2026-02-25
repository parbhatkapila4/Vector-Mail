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
import { openGmailCompose } from "@/lib/gmail-compose";
import type { OpenGmailComposeOptions } from "@/lib/gmail-compose";
import { usePendingSend } from "@/contexts/PendingSendContext";
import { GmailRedirectDialog } from "@/components/mail/GmailRedirectDialog";

type OptionType = {
  label: string | React.ReactNode;
  value: string;
};

const ComposeButton = () => {
  const [open, setOpen] = React.useState(false);
  const [gmailRedirectOpen, setGmailRedirectOpen] = React.useState(false);
  const gmailRedirectPayloadRef = React.useRef<OpenGmailComposeOptions | null>(null);
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
    { accountId: hasValidAccount && accountId ? accountId : "placeholder" },
    {
      enabled: hasValidAccount && !!accountId && accountId.length > 0,
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
  const { scheduleSend, isPending: isPendingSend } = usePendingSend();

  const handleSend = async (value: string) => {
    if (!account) return;
    const toStr = toValues.map((t) => t.value).join(", ");
    const ccStr = ccValues.map((c) => c.value).join(", ");
    gmailRedirectPayloadRef.current = {
      to: toStr,
      cc: ccStr,
      subject,
      body: value,
    };
    setGmailRedirectOpen(true);

    // Backend send logic kept for re-enable; not executed while gmail.send is disabled
    // const payload = {
    //   accountId,
    //   threadId: undefined as string | undefined,
    //   body: value,
    //   subject,
    //   from: { name: account.name ?? "Me", address: account.emailAddress ?? "me@example.com" },
    //   to: toValues.map((t) => ({ name: t.value, address: t.value })),
    //   cc: ccValues.map((c) => ({ name: c.value, address: c.value })),
    //   replyTo: { name: account.name ?? "Me", address: account.emailAddress ?? "me@example.com" },
    //   inReplyTo: undefined as string | undefined,
    // };
    // scheduleSend(async () => {
    //   try {
    //     await sendEmail.mutateAsync(payload);
    //     toast.success("Email sent");
    //   } catch (error) {
    //     const message = error instanceof Error ? error.message : "Failed to send";
    //     toast.error(message);
    //   }
    // });
  };

  const handleGmailRedirectOpen = () => {
    const payload = gmailRedirectPayloadRef.current;
    if (payload) {
      openGmailCompose(payload);
      toast.info(
        "Sending via Gmail compose (sending inside VectorMail will be enabled soon)",
      );
    }
    setOpen(false);
    setGmailRedirectOpen(false);
  };

  return (
    <Drawer open={open} onOpenChange={setOpen}>
      <DrawerTrigger asChild>
        <Button className="bg-gradient-to-r from-purple-600 via-purple-400 to-yellow-400 text-white transition-all hover:shadow-lg hover:shadow-purple-500/50">
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
            isSending={sendEmail.isPending || isPendingSend}
            defaultToolbarExpand
          />
        </div>
      </DrawerContent>
      <GmailRedirectDialog
        open={gmailRedirectOpen}
        onOpenChange={setGmailRedirectOpen}
        onOpenGmail={handleGmailRedirectOpen}
      />
    </Drawer>
  );
};

export default ComposeButton;
