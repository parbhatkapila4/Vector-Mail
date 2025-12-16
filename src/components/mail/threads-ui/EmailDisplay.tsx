"use client";
import Avatar from "react-avatar";
import { Letter } from "react-letter";
import type { RouterOutputs } from "@/trpc/react";
import React from "react";
import useThreads from "@/hooks/use-threads";
import { cn } from "@/lib/utils";
import { formatDistanceToNow } from "date-fns";
import { api } from "@/trpc/react";
import { sanitizeEmailHtml } from "@/lib/validation";

type Props = {
  email: RouterOutputs["account"]["getThreads"]["threads"][0]["emails"][0];
};

const EmailDisplay = ({ email }: Props) => {
  const { account, accountId } = useThreads();
  const letterRef = React.useRef<HTMLDivElement>(null);
  const [emailBody, setEmailBody] = React.useState<string | null>(
    email.body || null,
  );
  const [isLoadingBody, setIsLoadingBody] = React.useState(false);

  const needsFullBody = !emailBody || emailBody.length < 100;

  const { data: fullBodyData, isLoading: isLoadingQuery, isError } =
    api.account.getEmailBody.useQuery(
      {
        accountId: accountId ?? "",
        emailId: email.id,
      },
      {
        enabled: !!accountId && !!email.id && needsFullBody,
      },
    );

  React.useEffect(() => {
    if (fullBodyData?.body && !emailBody) {
      setEmailBody(fullBodyData.body);
      setIsLoadingBody(false);
    }
  }, [fullBodyData, emailBody]);

  React.useEffect(() => {
    if (isLoadingQuery && needsFullBody) {
      setIsLoadingBody(true);
    }
  }, [isLoadingQuery, needsFullBody]);

  React.useEffect(() => {
    if (isError) {
      setIsLoadingBody(false);
    }
  }, [isError]);

  React.useEffect(() => {
    if (letterRef.current) {
      const gmailQuote = letterRef.current.querySelector(
        'div[class*="_gmail_quote"]',
      );
      if (gmailQuote) {
        gmailQuote.innerHTML = "";
      }
    }
  }, [emailBody]);

  const isMe = account?.emailAddress === email.from.address;
  const displayBody = emailBody || email.bodySnippet || "";
  const showLoading = isLoadingBody && !emailBody;

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
      {showLoading ? (
        <div className="flex min-h-[500px] items-center justify-center rounded-md bg-white">
          <div className="text-sm text-muted-foreground">
            Loading email content...
          </div>
        </div>
      ) : (
        <Letter
          className="min-h-[500px] overflow-y-auto rounded-md bg-white text-black"
          html={sanitizeEmailHtml(displayBody)}
        />
      )}
    </div>
  );
};

export default EmailDisplay;
