import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Separator } from "@/components/ui/separator";
import { api, type RouterOutputs } from "@/trpc/react";
import { format } from "date-fns";
import EmailDisplay from "./EmailDisplay";
import useThreads from "@/hooks/use-threads";
import { useAtom } from "jotai";
import { isSearchingAtom } from "../search/SearchBar";
import ReplyBox from "./ReplyBox";

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

  const { data: foundThread } = api.account.getThreadById.useQuery(
    {
      threadId: threadId ?? "",
    },
    { 
      enabled: !!!_thread && !!threadId && threadId.length > 0,
      refetchOnWindowFocus: false,
      refetchOnMount: false,
    },
  );
  const thread = (_thread ?? foundThread) as Thread | undefined;

  return (
    <div className="flex h-full flex-col">
      <div className="flex items-center p-2"></div>
      {isSearching ? (
        <></>
      ) : (
        <>
          {thread ? (
            <div className="flex flex-1 flex-col overflow-scroll">
              <div className="flex items-start px-4 pb-4">
                <div className="flex items-start gap-4 text-sm">
                  <Avatar>
                    <AvatarImage alt={"lol"} />
                    <AvatarFallback>
                      {thread?.emails[0]?.from?.name
                        ?.split(" ")
                        .map((chunk: string) => chunk[0])
                        .join("")}
                    </AvatarFallback>
                  </Avatar>
                  <div className="grid gap-1">
                    <div className="font-semibold">
                      {thread.emails[0]?.from?.name}
                    </div>
                    <div className="line-clamp-1 text-xs">
                      {thread.emails[0]?.subject}
                    </div>
                    <div className="line-clamp-1 text-xs">
                      <span className="font-medium">Reply-To:</span>{" "}
                      {thread.emails[0]?.from?.address}
                    </div>
                  </div>
                </div>
                {thread.emails[0]?.sentAt && (
                  <div className="ml-auto text-xs text-muted-foreground">
                    {format(new Date(thread.emails[0].sentAt), "PPpp")}
                  </div>
                )}
              </div>
              <Separator />
              <div className="flex max-h-[calc(100vh-100px)] flex-col overflow-scroll">
                <div className="flex flex-col gap-4 p-6">
                  {thread.emails.map((email: Email) => {
                    return <EmailDisplay key={email.id} email={email} />;
                  })}
                </div>
              </div>
              <div className="flex-1"></div>
              <Separator className="mt-auto" />
              <div className="h-[300px]">
                <ReplyBox />
              </div>
            </div>
          ) : (
            <>
              <div className="p-8 text-center text-muted-foreground">
                No message selected {threadId}
              </div>
            </>
          )}
        </>
      )}
    </div>
  );
}
