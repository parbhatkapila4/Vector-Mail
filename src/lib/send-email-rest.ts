
import axios from "axios";

export function formatEmailBody(text: string): string {
  if (!text || !text.trim()) {
    return text;
  }

  let processedText = text.replace(/\\n/g, "\n");
  processedText = processedText.replace(/^\s*\*\s+/gm, "- ");

  const hasHTML = /<[^>]+>/g.test(processedText);

  if (hasHTML) {
    processedText = processedText.replace(
      /<a\s+([^>]*?)>/gi,
      (match, attrs) => {
        if (attrs.includes("style=")) {
          return match.replace(
            /style=["']([^"']*?)["']/gi,
            (styleMatch, styleContent) => {
              let newStyle = styleContent;

              if (!newStyle.includes("color:")) {
                newStyle += " color: #0066cc;";
              } else {
                newStyle = newStyle.replace(
                  /color:\s*[^;]+/gi,
                  "color: #0066cc",
                );
              }

              if (!newStyle.includes("text-decoration:")) {
                newStyle += " text-decoration: underline;";
              } else {
                newStyle = newStyle.replace(
                  /text-decoration:\s*[^;]+/gi,
                  "text-decoration: underline",
                );
              }

              if (!newStyle.includes("cursor:")) {
                newStyle += " cursor: pointer;";
              }
              return `style="${newStyle}"`;
            },
          );
        } else {
          return `<a ${attrs} style="color: #0066cc; text-decoration: underline; cursor: pointer;">`;
        }
      },
    );

    processedText = processedText.replace(
      /<div[^>]*>/gi,
      '<p style="margin: 0 0 12px 0; line-height: 1.6;">',
    );
    processedText = processedText.replace(/<\/div>/gi, "</p>");

    processedText = processedText.replace(
      /<p(?![^>]*style)/gi,
      '<p style="margin: 0 0 12px 0; line-height: 1.6;"',
    );

    processedText = processedText.replace(
      /(<br\s*\/?>){2,}/gi,
      '</p><p style="margin: 0 0 12px 0; line-height: 1.6;">',
    );

    const hasParagraphs = /<p[^>]*>/i.test(processedText);
    if (!hasParagraphs) {
      let parts = processedText.split(/(<br\s*\/?>\s*<br\s*\/?>)/i);

      if (parts.length > 1) {
        const formattedParts: string[] = [];
        let currentPart = "";

        for (let i = 0; i < parts.length; i++) {
          const part = parts[i];
          if (part === undefined) continue;
          if (part.match(/^<br\s*\/?>\s*<br\s*\/?>$/i)) {
            if (currentPart.trim()) {
              formattedParts.push(
                `<p style="margin: 0 0 12px 0; line-height: 1.6;">${currentPart.trim()}</p>`,
              );
              currentPart = "";
            }
          } else {
            currentPart += part;
          }
        }

        if (currentPart.trim()) {
          formattedParts.push(
            `<p style="margin: 0 0 12px 0; line-height: 1.6;">${currentPart.trim()}</p>`,
          );
        }

        if (formattedParts.length > 0) {
          processedText = formattedParts.join("");
        }
      } else {
        parts = processedText.split(/([.!?]\s*<br\s*\/?>)/i);

        if (parts.length > 1) {
          const formattedParts: string[] = [];
          let currentPart = "";

          for (let i = 0; i < parts.length; i++) {
            const part = parts[i];
            if (part === undefined) continue;
            if (part.match(/^[.!?]\s*<br\s*\/?>$/i)) {
              currentPart += part.replace(/<br\s*\/?>/i, "");
              if (currentPart.trim()) {
                formattedParts.push(
                  `<p style="margin: 0 0 12px 0; line-height: 1.6;">${currentPart.trim()}</p>`,
                );
                currentPart = "";
              }
            } else {
              currentPart += part;
            }
          }

          if (currentPart.trim()) {
            formattedParts.push(
              `<p style="margin: 0 0 12px 0; line-height: 1.6;">${currentPart.trim()}</p>`,
            );
          }

          if (formattedParts.length > 0) {
            processedText = formattedParts.join("");
          } else {
            processedText = `<p style="margin: 0 0 12px 0; line-height: 1.6;">${processedText.replace(/<br\s*\/?>/gi, "<br>")}</p>`;
          }
        } else {
          processedText = `<p style="margin: 0 0 12px 0; line-height: 1.6;">${processedText.replace(/<br\s*\/?>/gi, "<br>")}</p>`;
        }
      }
    }

    processedText = processedText.replace(/([^>\s])(<a\s)/gi, "$1 $2");
    processedText = processedText.replace(/(<\/a>)([^<\s])/gi, "$1 $2");

    processedText = processedText.replace(/<p[^>]*>\s*<\/p>/gi, "");

    processedText = processedText.replace(
      /<p[^>]*>(<br\s*\/?>\s*)+/gi,
      '<p style="margin: 0 0 12px 0; line-height: 1.6;">',
    );
    processedText = processedText.replace(/(<br\s*\/?>\s*)+<\/p>/gi, "</p>");

    return processedText;
  }

  const paragraphs = processedText
    .split(/\n\s*\n/)
    .filter((para) => para.trim().length > 0)
    .map((para) => {
      const formatted = para.trim().replace(/\n/g, "<br>");
      return `<p style="margin: 0 0 12px 0; line-height: 1.6;">${formatted}</p>`;
    })
    .join("");

  return (
    paragraphs ||
    `<p style="margin: 0 0 12px 0; line-height: 1.6;">${processedText.trim()}</p>`
  );
}

const WATERMARK = `<div style="margin-top: 24px; padding-top: 16px; border-top: 1px solid #e0e0e0; text-align: center; width: 100%;"><div style="color: #999999; font-size: 11px; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; display: inline-block; margin: 0 auto;">Generated by VectorMail</div></div>`;

export interface RestSendPayload {
  accountId: string;
  to: string[];
  subject: string;
  body: string;
  cc?: string[];
  bcc?: string[];
  attachments?: Array<{
    name: string;
    content: string;
    contentType: string;
  }>;
}

export interface AccountForSend {
  id: string;
  token: string;
  emailAddress: string;
  name: string | null;
}

export async function sendEmailRest(
  account: AccountForSend,
  payload: RestSendPayload,
): Promise<{ id?: string }> {
  const fromEmail = account.emailAddress;
  const fromName = account.name || account.emailAddress;
  const formattedBody = formatEmailBody(payload.body);
  const emailBodyWithWatermark = formattedBody + WATERMARK;

  const aurinkoHeaders: Record<string, string> = {
    Authorization: `Bearer ${account.token}`,
    "X-Aurinko-Account-Id": account.id,
    "Content-Type": "application/json",
  };

  const emailPayload: Record<string, unknown> = {
    from: { address: fromEmail, name: fromName },
    to: payload.to.map((email: string) => ({ address: email, name: email })),
    subject: payload.subject,
    body: emailBodyWithWatermark,
    cc: payload.cc
      ? payload.cc.map((email: string) => ({ address: email, name: email }))
      : undefined,
    bcc: payload.bcc
      ? payload.bcc.map((email: string) => ({ address: email, name: email }))
      : undefined,
  };

  if (payload.attachments && payload.attachments.length > 0) {
    (emailPayload as Record<string, unknown>).attachments =
      payload.attachments.map((att) => ({
        filename: att.name,
        name: att.name,
        content: att.content,
        contentType: att.contentType,
        mimeType: att.contentType,
      }));
  }

  const response = await axios.post(
    "https://api.aurinko.io/v1/email/messages",
    emailPayload,
    {
      params: { returnIds: true },
      headers: aurinkoHeaders,
    },
  );

  return response.data;
}
