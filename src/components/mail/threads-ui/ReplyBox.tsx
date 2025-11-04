"use client";
import React from "react";
import useThreads from "@/hooks/use-threads";
import { api } from "@/trpc/react";
import { toast } from "sonner";
import EmailEditor from "../editor/EmailEditor";
import { useLocalStorage } from "usehooks-ts";

const ReplyBox = () => {
  const { threadId, threads, account } = useThreads();
  const [accountId] = useLocalStorage("accountId", "");

  const thread = threads?.find((t) => t.id === threadId);
  const { data: foundThread } = api.account.getThreadById.useQuery(
    {
      accountId: accountId,
      threadId: threadId ?? "",
    },
    { enabled: !!!thread && !!threadId && !!accountId },
  );

  const currentThread = thread ?? foundThread;
  const lastEmail = currentThread?.emails?.[currentThread.emails.length - 1];

  const [subject, setSubject] = React.useState("");
  const [toValues, setToValues] = React.useState<
    { label: string; value: string }[]
  >([]);
  const [ccValues, setCcValues] = React.useState<
    { label: string; value: string }[]
  >([]);

  const sendEmail = api.account.sendEmail.useMutation();

  React.useEffect(() => {
    if (!lastEmail || !threadId) return;

    const newSubject = lastEmail.subject.startsWith("Re:")
      ? lastEmail.subject
      : `Re: ${lastEmail.subject}`;
    setSubject(newSubject);
    setToValues([
      {
        label: lastEmail.from.address ?? lastEmail.from.name,
        value: lastEmail.from.address,
      },
    ]);
    setCcValues([]);
  }, [lastEmail, threadId]);

  // Show loading state
  if (!currentThread && threadId) {
    return (
      <div className="flex h-[300px] items-center justify-center">
        <div className="text-muted-foreground">Loading reply box...</div>
      </div>
    );
  }

  // Show message if no thread selected
  if (!currentThread || !lastEmail) {
    return (
      <div className="flex h-[300px] items-center justify-center">
        <div className="text-center text-muted-foreground">
          <div className="mb-2">No reply details available</div>
          <div className="text-sm">Select a thread to reply to</div>
        </div>
      </div>
    );
  }

  const handleSend = async (value: string) => {
    if (!lastEmail || !account) return;
    sendEmail.mutate(
      {
        accountId,
        threadId: threadId ?? undefined,
        body: value,
        subject,
        from: {
          name: account.name ?? "Me",
          address: account.emailAddress ?? "me@example.com",
        },
        to: [
          {
            name: lastEmail.from.name ?? lastEmail.from.address,
            address: lastEmail.from.address,
          },
        ],
        cc: [],
        replyTo: {
          name: account.name ?? "Me",
          address: account.emailAddress ?? "me@example.com",
        },
        inReplyTo: lastEmail.internetMessageId,
      },
      {
        onSuccess: () => {
          toast.success("Email sent");
        },
        onError: (error) => {
          console.log(error);
          toast.error(error.message);
        },
      },
    );
  };

  return (
    <EmailEditor
      toValues={toValues || []}
      ccValues={ccValues}
      onToChange={(values) => {
        setToValues(values);
      }}
      onCcChange={(values) => {
        setCcValues(values || []);
      }}
      subject={subject}
      setSubject={setSubject}
      to={toValues.map((to) => to.value).filter(Boolean)}
      handleSend={handleSend}
      isSending={sendEmail.isPending}
    />
  );
};

export default ReplyBox;
