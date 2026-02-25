"use client";
import type { RouterOutputs } from "@/trpc/react";
import React from "react";
import useThreads from "@/hooks/use-threads";
import { cn } from "@/lib/utils";
import { api } from "@/trpc/react";
import { sanitizeEmailHtml } from "@/lib/validation";

type Props = {
  email: RouterOutputs["account"]["getThreads"]["threads"][0]["emails"][0];
};

const EmailDisplay = ({ email }: Props) => {
  const { account, accountId } = useThreads();
  const letterRef = React.useRef<HTMLDivElement>(null);
  const timeoutRef = React.useRef<NodeJS.Timeout | null>(null);

  const isMe = account?.emailAddress === email.from.address;
  const { data: openData } = api.account.getEmailOpenByMessageId.useQuery(
    {
      messageId: email.id,
      accountId: accountId ?? "",
    },
    {
      enabled: Boolean(isMe && email.id && accountId && accountId.length > 0),
      refetchOnWindowFocus: false,
    },
  );

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
  const [loadError, setLoadError] = React.useState(false);

  const isPlainTextStored = emailBody && !/<[^>]+>/g.test(emailBody);
  const hasUnresolvedCid = emailBody && /cid:/i.test(emailBody);
  const looksLikeStrippedMetadata =
    emailBody && /\[image:\s*[^\]]*\]/i.test(emailBody);
  const needsFullBody =
    !emailBody ||
    emailBody.length < 100 ||
    isPlainTextStored ||
    !!hasUnresolvedCid ||
    !!looksLikeStrippedMetadata;

  const {
    data: fullBodyData,
    isLoading: isLoadingQuery,
    isError,
    isFetching,
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
      retry: 2,
      retryDelay: 1000,
    },
  );

  React.useEffect(() => {
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, []);

  React.useEffect(() => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
      timeoutRef.current = null;
    }

    const queryEnabled = Boolean(
      accountId &&
      accountId.length > 0 &&
      email.id &&
      email.id.length > 0 &&
      needsFullBody,
    );

    if (isLoadingQuery && queryEnabled) {
      setIsLoadingBody(true);
      setLoadError(false);

      timeoutRef.current = setTimeout(() => {
        console.warn("Email body loading timeout for email:", email.id);
        setIsLoadingBody(false);
        setLoadError(true);
      }, 10000);
    } else if (!isLoadingQuery && !isFetching) {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
        timeoutRef.current = null;
      }

      if (isError) {
        setIsLoadingBody(false);
        setLoadError(true);
      } else if (fullBodyData !== undefined) {
        setIsLoadingBody(false);
        setLoadError(false);
      }
    }

    if (!queryEnabled) {
      setIsLoadingBody(false);
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
        timeoutRef.current = null;
      }
    }
  }, [
    isLoadingQuery,
    isFetching,
    isError,
    fullBodyData,
    needsFullBody,
    accountId,
    email.id,
  ]);

  React.useEffect(() => {
    if (fullBodyData?.body) {
      const newBodyIsHtml = /<[^>]+>/g.test(fullBodyData.body);
      const currentIsPlainText = emailBody && !/<[^>]+>/g.test(emailBody);

      if (!emailBody || currentIsPlainText || newBodyIsHtml) {
        setEmailBody(fullBodyData.body);
        setIsLoadingBody(false);
        setLoadError(false);
      }
    } else if (fullBodyData !== undefined && !fullBodyData?.body) {
      setIsLoadingBody(false);
      setLoadError(false);
    }
  }, [fullBodyData, emailBody]);

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

  const rawBody = emailBody || email.bodySnippet || email.body || "";
  const hasContent = rawBody && rawBody.trim().length > 0;

  const isPlainText = rawBody && !/<[^>]+>/g.test(rawBody);



  const normalizeQuoteMarkers = (html: string): string => {
    let out = html;
    out = out.replace(/&gt;(&gt;)+/g, "&gt;");
    out = out.replace(/(>{2,})/g, ">");
    return out;
  };

  const processPlainTextEmail = (text: string): string => {
    let processed = text;
    try {
      processed = decodeURIComponent(text.replace(/\+/g, " "));
    } catch {
      processed = text;
    }
    // Remove [image: ...] placeholders from stripped HTML so plain-text fallback doesn't show metadata
    processed = processed.replace(/\[image:\s*[^\]]*\]/gi, "").trim();

    const lines = processed.split(/\r?\n/);
    const result: string[] = [];
    let inBlockquote = false;

    for (let i = 0; i < lines.length; i++) {
      const line = lines[i]!;
      const quoteMatch = line.match(/^(\s*>(?:>|\s)*)(.*)$/);
      const isQuotedLine = quoteMatch !== null;

      if (isQuotedLine) {
        const quotedContent = quoteMatch![2]!.trimEnd();
        if (!inBlockquote) {
          result.push("<blockquote style=\"margin:0 0 0 1em; padding-left:1em; border-left:3px solid #ccc; color:#666;\">");
          inBlockquote = true;
        }
        result.push(quotedContent ? `${quotedContent}<br>` : "<br>");
      } else {
        if (inBlockquote) {
          result.push("</blockquote>");
          inBlockquote = false;
        }
        result.push(line.replace(/\n/g, "<br>") + "<br>");
      }
    }
    if (inBlockquote) result.push("</blockquote>");

    processed = result.join("");

    processed = processed.replace(
      /(\b(?:https?:\/\/)?(?:www\.)?[-a-zA-Z0-9@:%._\+~#=]{1,256}\.[a-zA-Z0-9()]{1,6}\b[-a-zA-Z0-9()@:%_\+.~#?&\/\/=]*)/gi,
      (match) => {
        const url = match.startsWith("http") ? match : `https://${match}`;
        const displayText =
          match.length > 60 ? match.substring(0, 57) + "..." : match;
        return `<a href="${url}" target="_blank" rel="noopener noreferrer" style="color: #1a73e8; text-decoration: underline; word-break: break-all; display: inline-block; max-width: 100%;">${displayText}</a>`;
      }
    );

    return processed;
  };

  let displayBody = isPlainText
    ? processPlainTextEmail(rawBody)
    : rawBody;
  displayBody = normalizeQuoteMarkers(displayBody);

  const showLoading = isLoadingBody && !hasContent;

  const showError = (loadError || isError) && !hasContent && !isLoadingBody;

  return (
    <div
      className={cn(
        "min-h-0 cursor-pointer rounded-md border p-2 transition-all hover:translate-x-2",
        {
          "border-l-4 border-l-gray-900": isMe,
        },
      )}
    >
      {showLoading ? (
        <div className="flex min-h-[70vh] items-center justify-center rounded-md bg-white">
          <div className="flex flex-col items-center gap-4">
            <div className="relative">
              <div className="h-12 w-12 animate-spin rounded-full border-4 border-gray-200 border-t-yellow-500"></div>
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="h-6 w-6 animate-pulse rounded-full bg-yellow-500/20"></div>
              </div>
            </div>
            <div className="text-center">
              <div className="text-sm font-medium text-gray-700">
                Loading email content...
              </div>
              <div className="mt-1 text-xs text-gray-500">
                Fetching full email body
              </div>
            </div>
          </div>
        </div>
      ) : showError ? (
        <div className="flex min-h-[70vh] items-center justify-center rounded-md bg-white">
          <div className="text-center">
            <div className="mb-2 text-sm font-medium text-gray-700">
              Unable to load full email content
            </div>
            {email.bodySnippet && (
              <div className="mt-4 rounded-md border border-gray-200 bg-gray-50 p-4 text-left">
                <div className="mb-2 text-xs font-semibold uppercase text-gray-500">
                  Preview
                </div>
                <div className="text-sm text-gray-700">{email.bodySnippet}</div>
              </div>
            )}
          </div>
        </div>
      ) : hasContent ? (
        <div
          className="min-h-[70vh] overflow-y-auto rounded-md bg-white md:min-h-[70vh]"
          ref={letterRef}
        >
          <div
            className="email-body-wrapper"
            style={{
              padding: "16px",
              wordWrap: "break-word",
              overflowWrap: "break-word",
              wordBreak: "break-word",
              maxWidth: "100%",
              overflow: "hidden",
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
                
                /* Ensure links are clickable and wrap properly */
                .email-body-wrapper a {
                  cursor: pointer;
                  word-break: break-all;
                  display: inline-block;
                  max-width: 100%;
                  overflow-wrap: break-word;
                  hyphens: auto;
                }
                
                /* Preserve original link colors if specified, otherwise use blue */
                .email-body-wrapper a:not([style*="color"]):not([class*="color"]) {
                  color: #1a73e8 !important;
                  text-decoration: underline;
                }
                
                /* Force long text/URLs to break */
                .email-body-wrapper * {
                  word-wrap: break-word;
                  overflow-wrap: break-word;
                  word-break: break-word;
                  max-width: 100%;
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
                
                /* Mobile-specific fixes for email pop-ups and overlays */
                @media (max-width: 768px) {
                  /* Fix fixed/absolute positioned elements that cover content */
                  .email-body-wrapper [style*="position: fixed"],
                  .email-body-wrapper [style*="position:fixed"],
                  .email-body-wrapper [style*="position: absolute"],
                  .email-body-wrapper [style*="position:absolute"] {
                    position: relative !important;
                    top: auto !important;
                    left: auto !important;
                    right: auto !important;
                    bottom: auto !important;
                    width: 100% !important;
                    max-width: 100% !important;
                    margin: 0 !important;
                    transform: none !important;
                  }
                  
                  /* Fix pop-ups and modals in emails */
                  .email-body-wrapper div[style*="z-index"],
                  .email-body-wrapper div[style*="zIndex"] {
                    position: relative !important;
                    z-index: 1 !important;
                    max-width: 100% !important;
                    width: 100% !important;
                    margin: 0 auto !important;
                    left: auto !important;
                    right: auto !important;
                    top: auto !important;
                    bottom: auto !important;
                  }
                  
                  /* Ensure all containers fit mobile screen */
                  .email-body-wrapper > div,
                  .email-body-wrapper > table {
                    max-width: 100% !important;
                    width: 100% !important;
                    overflow-x: auto !important;
                  }
                  
                  /* Fix any elements with fixed positioning */
                  .email-body-wrapper *[style*="fixed"] {
                    position: relative !important;
                  }
                  
                  /* Make sure pop-ups don't overflow */
                  .email-body-wrapper div {
                    max-width: 100% !important;
                    overflow-x: auto !important;
                  }
                }
              `,
            }}
          />
        </div>
      ) : (
        <div className="flex min-h-[70vh] items-center justify-center rounded-md bg-white">
          <div className="text-sm text-muted-foreground">
            No email content available
          </div>
        </div>
      )}
    </div>
  );
};

export default EmailDisplay;
