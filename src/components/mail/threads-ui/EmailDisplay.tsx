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

  const needsFullBody = !emailBody || emailBody.length < 100;

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
      enabled:
        !!accountId &&
        accountId.length > 0 &&
        !!email.id &&
        email.id.length > 0 &&
        needsFullBody,
      refetchOnWindowFocus: false,
      refetchOnMount: false,
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

      const emailContainer = letterRef.current.querySelector(
        ".email-body-wrapper",
      );
      if (emailContainer) {
        const textElements = emailContainer.querySelectorAll(
          "p, div, span, li, td, th, h1, h2, h3, h4, h5, h6",
        );
        textElements.forEach((element) => {
          if (!(element instanceof HTMLElement)) return;
          const currentStyle = element.getAttribute("style") || "";
          if (
            !currentStyle.includes("color") ||
            currentStyle.match(
              /color:\s*(#[fF]{3,6}|rgb\([^)]*255[^)]*\)|rgba\([^)]*255[^)]*\))/,
            )
          ) {
            const computedColor = window.getComputedStyle(element).color;
            const rgb = computedColor.match(/\d+/g);
            if (rgb && rgb.length >= 3) {
              const r = rgb[0];
              const g = rgb[1];
              const b = rgb[2];
              if (r && g && b) {
                const brightness =
                  (parseInt(r, 10) + parseInt(g, 10) + parseInt(b, 10)) / 3;
                if (brightness > 200 || !currentStyle.includes("color")) {
                  element.style.color = "#000000";
                }
              } else if (!currentStyle.includes("color")) {
                element.style.color = "#000000";
              }
            } else if (!currentStyle.includes("color")) {
              element.style.color = "#000000";
            }
          }
        });

        const links = emailContainer.querySelectorAll("a");
        links.forEach((link) => {
          if (!link.getAttribute("target")) {
            link.setAttribute("target", "_blank");
          }
          if (!link.getAttribute("rel")) {
            link.setAttribute("rel", "noopener noreferrer");
          }
          const currentStyle = link.getAttribute("style") || "";
          if (!currentStyle.includes("color")) {
            link.style.color = "#1a73e8";
            if (!currentStyle.includes("text-decoration")) {
              link.style.textDecoration = "underline";
            }
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
        });
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
              color: "#000000",
            }}
            dangerouslySetInnerHTML={{
              __html: sanitizeEmailHtml(displayBody),
            }}
          />
          <style
            dangerouslySetInnerHTML={{
              __html: `
                /* Isolated email container - preserve original Gmail-like rendering */
                .email-body-wrapper {
                  /* Reset any inherited styles that might interfere */
                  box-sizing: border-box;
                  /* Default dark black text color for all text */
                  color: #000000;
                }
                /* Ensure all text elements inherit dark color by default */
                .email-body-wrapper,
                .email-body-wrapper p,
                .email-body-wrapper div,
                .email-body-wrapper span,
                .email-body-wrapper li,
                .email-body-wrapper td,
                .email-body-wrapper th,
                .email-body-wrapper h1,
                .email-body-wrapper h2,
                .email-body-wrapper h3,
                .email-body-wrapper h4,
                .email-body-wrapper h5,
                .email-body-wrapper h6 {
                  color: #000000;
                }
                /* Only apply responsive image styles if email doesn't specify */
                .email-body-wrapper img:not([width]):not([style*="width"]):not([style*="max-width"]) {
                  max-width: 100% !important;
                  height: auto !important;
                }
                /* Ensure links are clickable and visible */
                .email-body-wrapper a {
                  cursor: pointer;
                }
                /* Links without explicit color should be blue */
                .email-body-wrapper a:not([style*="color"]) {
                  color: #1a73e8;
                  text-decoration: underline;
                }
                /* Preserve email's original table formatting */
                .email-body-wrapper table {
                  border-collapse: separate;
                  border-spacing: 0;
                  width: 100%;
                }
                /* Preserve email's paragraph spacing */
                .email-body-wrapper p {
                  /* Let email's styles control margin/padding */
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
