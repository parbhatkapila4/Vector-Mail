"use client";
import Avatar from "react-avatar";
import { Letter } from "react-letter";
import { api, type RouterOutputs } from "@/trpc/react";
import React from "react";
import { useLocalStorage } from "usehooks-ts";
import useThreads from "@/hooks/use-threads";
import { cn } from "@/lib/utils";
import { formatDistanceToNow } from "date-fns";

type Props = {
  email: RouterOutputs["account"]["getThreads"][0]["emails"][0];
};

const EmailDisplay = ({ email }: Props) => {
  const { account } = useThreads();
  const letterRef = React.useRef<HTMLDivElement>(null);

  React.useEffect(() => {
    if (letterRef.current) {
      const gmailQuote = letterRef.current.querySelector(
        'div[class*="_gmail_quote"]',
      );
      if (gmailQuote) {
        gmailQuote.innerHTML = "";
      }
    }
  }, [email]);

  const isMe = account?.emailAddress === email.from.address;

  return (
    <div
      className={cn(
        "min-h-[600px] cursor-pointer rounded-md border p-4 transition-all hover:translate-x-2",
        {
          "border-l-4 border-l-gray-900": isMe,
        },
      )}
      ref={letterRef}
    >
      <div className="flex items-center justify-between gap-2">
        <div className="flex items-center gap-2">
          {!isMe && (
            <Avatar
              name={email.from.name ?? email.from.address}
              email={email.from.address}
              size="35"
              textSizeRatio={2}
              round={true}
            />
          )}
          <span className="font-medium">
            {isMe ? "Me" : email.from.address}
          </span>
        </div>
        <p className="text-xs text-muted-foreground">
          {formatDistanceToNow(email.sentAt ?? new Date(), {
            addSuffix: true,
          })}
        </p>
      </div>
      <div className="h-4"></div>
      <Letter
        className="min-h-[500px] overflow-y-auto rounded-md bg-white text-black"
        html={email?.body ?? ""}
      />
    </div>
  );
};

export default EmailDisplay;
