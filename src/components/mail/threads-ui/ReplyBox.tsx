"use client";
import React from "react";
import useThreads from "@/hooks/use-threads";
import { api, type RouterOutputs } from "@/trpc/react";
import { toast } from "sonner";
import EmailEditor from "../editor/EmailEditor";
import { useLocalStorage } from "usehooks-ts";
import { Button } from "@/components/ui/button";
import { ChevronDown, ChevronUp } from "lucide-react";

type Thread = RouterOutputs["account"]["getThreads"]["threads"][0];

type OptionType = {
  label: string | React.ReactNode;
  value: string;
};

const ReplyBox = () => {
  const { threadId, threads: rawThreads, account } = useThreads();
  const [accountId] = useLocalStorage("accountId", "");
  const threads = rawThreads as Thread[] | undefined;

  const thread = threads?.find((t) => t.id === threadId);
  const { data: foundThread } = api.account.getThreadById.useQuery(
    {
      threadId: threadId ?? "",
    },
    {
      enabled: !!!thread && !!threadId && threadId.length > 0,
      refetchOnWindowFocus: false,
      refetchOnMount: false,
    },
  );

  const currentThread = (thread ?? foundThread) as Thread | undefined;
  const lastEmail = currentThread?.emails?.[currentThread.emails.length - 1];

  const [subject, setSubject] = React.useState("");
  const [toValues, setToValues] = React.useState<OptionType[]>([]);
  const [ccValues, setCcValues] = React.useState<OptionType[]>([]);
  const [isCollapsed, setIsCollapsed] = React.useState(true);

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

  if (!currentThread && threadId) {
    return (
      <div className="flex h-[300px] items-center justify-center">
        <div className="text-muted-foreground">Loading reply box...</div>
      </div>
    );
  }

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

    const getInReplyTo = (): string | undefined => {
      if ("internetMessageId" in lastEmail && lastEmail.internetMessageId) {
        return lastEmail.internetMessageId;
      }
      return undefined;
    };

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
        inReplyTo: getInReplyTo(),
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
    <div className="sticky bottom-0 z-50 flex flex-col border-t bg-background shadow-lg">
      {/* Collapse/Expand Header - Always Visible */}
      <div className="flex items-center justify-between border-b bg-background px-4 py-2.5">
        <div className="flex items-center gap-2">
          <span className="text-sm font-medium text-muted-foreground">
            Reply
          </span>
          {toValues.length > 0 && (
            <span className="text-sm text-muted-foreground">
              to {toValues[0]?.value || "..."}
            </span>
          )}
        </div>
        <Button
          variant="ghost"
          size="sm"
          onClick={() => setIsCollapsed(!isCollapsed)}
          className="h-8 w-8 p-0"
          aria-label={isCollapsed ? "Expand reply box" : "Collapse reply box"}
        >
          {isCollapsed ? (
            <ChevronUp className="h-4 w-4" />
          ) : (
            <ChevronDown className="h-4 w-4" />
          )}
        </Button>
      </div>

      {!isCollapsed && (
        <div className="max-h-[60vh] overflow-hidden">
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
        </div>
      )}
    </div>
  );
};

export default ReplyBox;
