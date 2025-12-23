import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { api, type RouterOutputs } from "@/trpc/react";
import { format } from "date-fns";
import EmailDisplay from "./EmailDisplay";
import useThreads from "@/hooks/use-threads";
import { useAtom } from "jotai";
import { isSearchingAtom } from "../search/SearchBar";
import ReplyBox from "./ReplyBox";
import { Mail, Forward } from "lucide-react";
import { cn } from "@/lib/utils";
import { useState } from "react";
import { ForwardEmailDialog } from "./ForwardEmailDialog";

type Email = RouterOutputs["account"]["getThreads"]["threads"][0]["emails"][0];
type Thread = RouterOutputs["account"]["getThreads"]["threads"][0];

interface ThreadDisplayProps {
  threadId?: string | null;
}

export function ThreadDisplay({ threadId: propThreadId }: ThreadDisplayProps) {
  const { threads: rawThreads, threadId: hookThreadId } = useThreads();
  const threadId = propThreadId ?? hookThreadId;
  const threads = rawThreads as Thread[] | undefined;
  const _thread = threads?.find((t: Thread) => t.id === threadId);
  const [isSearching] = useAtom(isSearchingAtom);
  const [forwardDialogOpen, setForwardDialogOpen] = useState(false);

  const { data: foundThread } = api.account.getThreadById.useQuery(
    { threadId: threadId ?? "" },
    {
      enabled: !!!_thread && !!threadId && threadId.length > 0,
      refetchOnWindowFocus: false,
      refetchOnMount: false,
    },
  );
  const thread = (_thread ?? foundThread) as Thread | undefined;

  if (isSearching) return null;

  if (!thread) {
    return (
      <div className="flex h-full flex-col items-center justify-center bg-[#0A0A0A] p-8">
        <div className="relative mb-8">
          {/* Decorative rings */}
          <div className="absolute inset-0 animate-pulse rounded-full bg-gradient-to-br from-amber-500/10 to-orange-500/5 blur-2xl" />
          <div className="relative flex h-24 w-24 items-center justify-center rounded-3xl bg-gradient-to-br from-zinc-800/80 to-zinc-900/80 ring-1 ring-white/[0.06]">
            <Mail className="h-10 w-10 text-zinc-600" />
          </div>
        </div>
        <h3 className="mb-2 text-lg font-medium text-zinc-400">
          Select an email
        </h3>
        <p className="max-w-xs text-center text-sm text-zinc-600">
          Choose a conversation from the list to view its contents
        </p>
      </div>
    );
  }

  const firstEmail = thread.emails[0];
  const senderName = firstEmail?.from?.name ?? "Unknown";
  const senderEmail = firstEmail?.from?.address ?? "";
  const originalSubject = firstEmail?.subject || "(No subject)";
  const originalBody = firstEmail?.body || firstEmail?.bodySnippet || "";
  const originalFrom = `${senderName} <${senderEmail}>`;
  const originalDate = firstEmail?.sentAt
    ? format(new Date(firstEmail.sentAt), "MMM d, yyyy 'at' h:mm a")
    : "";

  const getPlainTextBody = (htmlBody: string) => {
    if (!htmlBody) return "";

    const tempDiv = document.createElement("div");
    tempDiv.innerHTML = htmlBody;
    return tempDiv.textContent || tempDiv.innerText || "";
  };

  const plainTextBody = getPlainTextBody(originalBody);

  return (
    <>
      <ForwardEmailDialog
        open={forwardDialogOpen}
        onOpenChange={setForwardDialogOpen}
        originalSubject={originalSubject}
        originalBody={plainTextBody}
        originalFrom={originalFrom}
        originalDate={originalDate}
      />
      <div className="flex h-full flex-col bg-[#0A0A0A]">
        <div className="border-b border-white/[0.04] bg-[#0A0A0A]">
          <div className="flex items-center justify-end px-6 py-3">
            <button
              onClick={() => setForwardDialogOpen(true)}
              className="flex h-8 items-center gap-2 rounded-lg bg-white/[0.04] px-3 text-xs font-medium text-zinc-400 transition-all hover:bg-white/[0.06] hover:text-white"
            >
              <Forward className="h-3.5 w-3.5" />
              Forward
            </button>
          </div>

          <div className="px-6 pb-4">
            <h1 className="mb-4 text-xl font-semibold text-white">
              {firstEmail?.subject || "(No subject)"}
            </h1>

            <div className="flex items-center gap-4">
              <Avatar className="h-11 w-11 ring-2 ring-white/[0.06]">
                <AvatarImage alt={senderName} />
                <AvatarFallback className="bg-gradient-to-br from-amber-500 to-orange-600 text-sm font-semibold text-white">
                  {senderName
                    .split(" ")
                    .map((n: string) => n[0])
                    .join("")
                    .slice(0, 2)}
                </AvatarFallback>
              </Avatar>

              <div className="flex-1">
                <div className="flex items-center gap-2">
                  <span className="font-medium text-white">{senderName}</span>
                  <span className="text-sm text-zinc-500">
                    &lt;{senderEmail}&gt;
                  </span>
                </div>
                <div className="flex items-center gap-2 text-sm text-zinc-500">
                  <span>to me</span>
                  {firstEmail?.sentAt && (
                    <>
                      <span>•</span>
                      <span>
                        {format(
                          new Date(firstEmail.sentAt),
                          "MMM d, yyyy 'at' h:mm a",
                        )}
                      </span>
                    </>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="flex-1 overflow-y-auto [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
          <div className="p-6">
            {thread.emails.length > 1 && (
              <div className="mb-4 flex items-center gap-2">
                <div className="h-px flex-1 bg-white/[0.04]" />
                <span className="text-xs font-medium text-zinc-600">
                  {thread.emails.length} messages in thread
                </span>
                <div className="h-px flex-1 bg-white/[0.04]" />
              </div>
            )}

            <div className="space-y-6">
              {thread.emails.map((email: Email, index: number) => (
                <div
                  key={email.id}
                  className={cn(
                    index > 0 && "border-t border-white/[0.04] pt-6",
                  )}
                >
                  {index > 0 && (
                    <div className="mb-4 flex items-center gap-3">
                      <Avatar className="h-8 w-8">
                        <AvatarFallback className="bg-zinc-800 text-xs font-medium text-zinc-400">
                          {(email.from?.name ?? "U")
                            .split(" ")
                            .map((n: string) => n[0])
                            .join("")
                            .slice(0, 2)}
                        </AvatarFallback>
                      </Avatar>
                      <div className="flex-1">
                        <span className="text-sm font-medium text-zinc-300">
                          {email.from?.name ?? "Unknown"}
                        </span>
                        {email.sentAt && (
                          <span className="ml-2 text-xs text-zinc-600">
                            {format(
                              new Date(email.sentAt),
                              "MMM d 'at' h:mm a",
                            )}
                          </span>
                        )}
                      </div>
                    </div>
                  )}
                  <EmailDisplay email={email} />
                </div>
              ))}
            </div>
          </div>
        </div>

        <ReplyBox />
      </div>
    </>
  );
}
