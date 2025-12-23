"use client";
import Avatar from "react-avatar";
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
  const getInitialBody = (): string | null => {
    if ("body" in email && email.body) {
      return email.body;
    }
    return null;
  };
  const [emailBody, setEmailBody] = React.useState<string | null>(
    getInitialBody(),
  );
  const [isLoadingBody, setIsLoadingBody] = React.useState(false);

  const isPlainTextStored = emailBody && !/<[^>]+>/g.test(emailBody);
  const needsFullBody =
    !emailBody || emailBody.length < 100 || isPlainTextStored;

  const {
    data: fullBodyData,
    isLoading: isLoadingQuery,
    isError,
  } = api.account.getEmailBody.useQuery(
    {
      accountId: accountId ?? "",
      emailId: email.id,
    },
    {
      enabled: Boolean(
        accountId &&
        accountId.length > 0 &&
        email.id &&
        email.id.length > 0 &&
        needsFullBody,
      ),
      refetchOnWindowFocus: false,
      refetchOnMount: false,
    },
  );

  React.useEffect(() => {
    if (fullBodyData?.body) {
      const newBodyIsHtml = /<[^>]+>/g.test(fullBodyData.body);
      const currentIsPlainText = emailBody && !/<[^>]+>/g.test(emailBody);

      if (!emailBody || currentIsPlainText || newBodyIsHtml) {
        setEmailBody(fullBodyData.body);
        setIsLoadingBody(false);
      }
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

      const emailContainer = letterRef.current.querySelector(
        ".email-body-wrapper",
      );
      if (emailContainer) {
        const links = emailContainer.querySelectorAll("a");
        links.forEach((link) => {
          if (!link.getAttribute("target")) {
            link.setAttribute("target", "_blank");
          }
          if (!link.getAttribute("rel")) {
            link.setAttribute("rel", "noopener noreferrer");
          }
        });

        const images = emailContainer.querySelectorAll("img");
        images.forEach((img) => {
          const hasExplicitWidth =
            img.hasAttribute("width") ||
            (img.getAttribute("style") || "").includes("width");
          if (!hasExplicitWidth) {
            const currentStyle = img.getAttribute("style") || "";
            if (!currentStyle.includes("max-width")) {
              img.style.maxWidth = "100%";
              img.style.height = "auto";
            }
          }

          if (img.hasAttribute("src")) {
            const src = img.getAttribute("src");
            if (src?.startsWith("//")) {
              img.setAttribute("src", `https:${src}`);
            }
          }
        });
      }
    }
  }, [emailBody]);

  const isMe = account?.emailAddress === email.from.address;
  const rawBody = emailBody || email.bodySnippet || "";

  const isPlainText = rawBody && !/<[^>]+>/g.test(rawBody);
  const displayBody = isPlainText
    ? rawBody
        .replace(/\n/g, "<br>")
        .replace(
          /(https?:\/\/[^\s]+)/g,
          '<a href="$1" target="_blank" rel="noopener noreferrer">$1</a>',
        )
    : rawBody;

  const showLoading = isLoadingBody && !emailBody;

  return (
    <div
      className={cn(
        "min-h-[600px] cursor-pointer rounded-md border p-4 transition-all hover:translate-x-2",
        {
          "border-l-4 border-l-gray-900": isMe,
        },
      )}
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
        <div
          className="min-h-[500px] overflow-y-auto rounded-md bg-white"
          ref={letterRef}
        >
          <div
            className="email-body-wrapper"
            style={{
              padding: "16px",
              wordWrap: "break-word",
              overflowWrap: "break-word",
            }}
            dangerouslySetInnerHTML={{
              __html: sanitizeEmailHtml(displayBody),
            }}
          />
          <style
            dangerouslySetInnerHTML={{
              __html: `
                /* Gmail-like email rendering - preserve original email styles */
                .email-body-wrapper {
                  box-sizing: border-box;
                  color: #000000;
                }
                
                /* Ensure readable default text color but preserve email's explicit styles */
                .email-body-wrapper > * {
                  color: inherit;
                }
                
                /* Only force dark text if element doesn't have explicit color styling */
                .email-body-wrapper p:not([style*="color"]):not([class*="color"]),
                .email-body-wrapper div:not([style*="color"]):not([class*="color"]),
                .email-body-wrapper span:not([style*="color"]):not([class*="color"]),
                .email-body-wrapper li:not([style*="color"]):not([class*="color"]),
                .email-body-wrapper td:not([style*="color"]):not([class*="color"]),
                .email-body-wrapper th:not([style*="color"]):not([class*="color"]),
                .email-body-wrapper h1:not([style*="color"]):not([class*="color"]),
                .email-body-wrapper h2:not([style*="color"]):not([class*="color"]),
                .email-body-wrapper h3:not([style*="color"]):not([class*="color"]),
                .email-body-wrapper h4:not([style*="color"]):not([class*="color"]),
                .email-body-wrapper h5:not([style*="color"]):not([class*="color"]),
                .email-body-wrapper h6:not([style*="color"]):not([class*="color"]) {
                  color: #000000;
                }
                
                /* Make images responsive but preserve original styling */
                .email-body-wrapper img:not([width]):not([style*="width"]):not([style*="max-width"]) {
                  max-width: 100% !important;
                  height: auto !important;
                  display: block;
                }
                
                /* Ensure links are clickable */
                .email-body-wrapper a {
                  cursor: pointer;
                }
                
                /* Preserve original link colors if specified, otherwise use blue */
                .email-body-wrapper a:not([style*="color"]):not([class*="color"]) {
                  color: #1a73e8 !important;
                  text-decoration: underline;
                }
                
                /* Preserve email's original table formatting */
                .email-body-wrapper table {
                  border-collapse: collapse;
                  width: 100%;
                }
                
                /* Preserve email spacing and layout */
                .email-body-wrapper * {
                  box-sizing: border-box;
                }
              `,
            }}
          />
        </div>
      )}
    </div>
  );
};

export default EmailDisplay;
