// import EmailEditor from "./email-editor";
import {
  Archive,
  ArchiveX,
  Clock,
  Forward,
  MoreVertical,
  Reply,
  ReplyAll,
  Trash2,
} from "lucide-react";

import {
  DropdownMenuContent,
  DropdownMenuItem,
} from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import {
  DropdownMenu,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Label } from "@/components/ui/label";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Separator } from "@/components/ui/separator";

import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { api, type RouterOutputs } from "@/trpc/react";
import { addDays, addHours, format, nextSaturday } from "date-fns";
import EmailDisplay from "./EmailDisplay";
import useThreads from "@/hooks/use-threads";
import { useAtom } from "jotai";
import { isSearchingAtom, searchValueAtom } from "../search/SearchBar";
// import SearchDisplay from "../search/SearchDisplay";
import { useLocalStorage } from "usehooks-ts";
import ReplyBox from "./ReplyBox";
// import ReplyBox from "./reply-box";

interface ThreadDisplayProps {
  threadId?: string | null;
}

export function ThreadDisplay({ threadId: propThreadId }: ThreadDisplayProps) {
  const { threads, isFetching, threadId: hookThreadId } = useThreads();
  const threadId = propThreadId ?? hookThreadId;
  const today = new Date();
  const _thread = threads?.find((t) => t.id === threadId);
  const [isSearching, setIsSearching] = useAtom(isSearchingAtom);

  const { data: foundThread } = api.account.getThreadById.useQuery(
    {
      threadId: threadId ?? "",
    },
    { enabled: !!!_thread && !!threadId },
  );
  const thread = _thread ?? foundThread;

  return (
    <div className="flex h-full flex-col">
      <div className="flex items-center p-2"></div>
      {isSearching ? (
        <></>
      ) : (
        // <SearchDisplay />
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
                  {thread.emails.map((email: any) => {
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
