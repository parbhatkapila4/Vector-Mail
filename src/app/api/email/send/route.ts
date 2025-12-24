import { auth } from "@clerk/nextjs/server";
import { NextRequest, NextResponse } from "next/server";
import { db } from "@/server/db";
import { env } from "@/env";
import axios from "axios";

export async function POST(req: NextRequest) {
  const enableEmailSend =
    env.ENABLE_EMAIL_SEND ?? process.env.ENABLE_EMAIL_SEND === "true";

  if (!enableEmailSend) {
    console.log(
      "[EMAIL_SEND] Feature disabled - ENABLE_EMAIL_SEND:",
      process.env.ENABLE_EMAIL_SEND,
      "env.ENABLE_EMAIL_SEND:",
      env.ENABLE_EMAIL_SEND,
    );
    return NextResponse.json(
      {
        error: "Email sending is disabled",
        message:
          "ENABLE_EMAIL_SEND is set to false. Please set ENABLE_EMAIL_SEND=true in your .env file and restart the server.",
      },
      { status: 403 },
    );
  }

  const { userId } = await auth();
  if (!userId) {
    return NextResponse.json(
      {
        error: "Unauthorized",
        message: "You must be logged in to send emails",
      },
      { status: 401 },
    );
  }

  const contentType = req.headers.get("content-type") || "";
  const isFormData = contentType.includes("multipart/form-data");

  let accountId: string;
  let to: string[];
  let subject: string;
  let emailBody: string;
  let cc: string[] | undefined;
  let bcc: string[] | undefined;
  let attachments: File[] = [];

  try {
    if (isFormData) {
      const formData = await req.formData();
      
      accountId = formData.get("accountId") as string;
      const toStr = formData.get("to") as string;
      try {
        to = JSON.parse(toStr || "[]");
      } catch {
        to = toStr ? toStr.split(",").map((e) => e.trim()) : [];
      }
      subject = formData.get("subject") as string;
      emailBody = formData.get("body") as string;
      
      const ccStr = formData.get("cc") as string | null;
      if (ccStr) {
        try {
          cc = JSON.parse(ccStr);
        } catch {
          cc = ccStr.split(",").map((e) => e.trim());
        }
      }
      
      const bccStr = formData.get("bcc") as string | null;
      if (bccStr) {
        try {
          bcc = JSON.parse(bccStr);
        } catch {
          bcc = bccStr.split(",").map((e) => e.trim());
        }
      }

      const attachmentFiles = formData.getAll("attachments");
      attachments = attachmentFiles.filter(
        (file): file is File => file instanceof File && file.size > 0
      );
    } else {
      const body = await req.json();

      accountId = body.accountId;
      to = body.to;
      subject = body.subject;
      emailBody = body.body;
      cc = body.cc;
      bcc = body.bcc;
    }
  } catch (error) {
    console.error("[EMAIL_SEND] Error parsing request:", error);
    return NextResponse.json(
      {
        error: "Invalid request",
        message: "Failed to parse request body. Please check your input.",
        details: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 400 },
    );
  }

  if (!accountId || typeof accountId !== "string") {
    return NextResponse.json(
      { error: "Invalid accountId", message: "accountId is required" },
      { status: 400 },
    );
  }

  if (!to || !Array.isArray(to) || to.length === 0) {
    return NextResponse.json(
      {
        error: "Invalid recipients",
        message: "At least one 'to' recipient is required",
      },
      { status: 400 },
    );
  }

  if (!subject || typeof subject !== "string") {
    return NextResponse.json(
      { error: "Invalid subject", message: "subject is required" },
      { status: 400 },
    );
  }

  if (!emailBody || typeof emailBody !== "string") {
    return NextResponse.json(
      { error: "Invalid body", message: "body is required" },
      { status: 400 },
    );
  }

  let account;
  try {
    account = await db.account.findFirst({
      where: {
        id: accountId,
        userId,
      },
      select: {
        id: true,
        emailAddress: true,
        name: true,
        token: true,
        provider: true,
      },
    });
  } catch (error) {
    console.error("[EMAIL_SEND] Database error:", error);
    return NextResponse.json(
      {
        error: "Database error",
        message: "Failed to retrieve account information",
      },
      { status: 500 },
    );
  }

  if (!account) {
    return NextResponse.json(
      {
        error: "Account not found",
        message: "Account not found or you don't have access to it",
      },
      { status: 404 },
    );
  }

  const fromEmail = account.emailAddress;
  const fromName = account.name || account.emailAddress;

  function formatEmailBody(text: string): string {
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

  const formattedBody = formatEmailBody(emailBody);

  const watermark = `<div style="margin-top: 24px; padding-top: 16px; border-top: 1px solid #e0e0e0; text-align: center; width: 100%;"><div style="color: #999999; font-size: 11px; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; display: inline-block; margin: 0 auto;">Generated by VectorMail</div></div>`;

  const emailBodyWithWatermark = formattedBody + watermark;

  try {
    const aurinkoHeaders: Record<string, string> = {
      Authorization: `Bearer ${account.token}`,
      "X-Aurinko-Account-Id": account.id,
    };

    let response;
    
    if (attachments.length > 0) {
      let attachmentData;
      try {
        attachmentData = await Promise.all(
          attachments.map(async (file) => {
            try {
              const maxSize = 25 * 1024 * 1024;
              if (file.size > maxSize) {
                throw new Error(`File ${file.name} exceeds maximum size of 25MB`);
              }

              const arrayBuffer = await file.arrayBuffer();
              const base64 = Buffer.from(arrayBuffer).toString("base64");
              return {
                name: file.name,
                content: base64,
                contentType: file.type || "application/octet-stream",
              };
            } catch (fileError) {
              console.error(`[EMAIL_SEND] Error processing file ${file.name}:`, fileError);
              throw new Error(`Failed to process attachment: ${file.name} - ${fileError instanceof Error ? fileError.message : "Unknown error"}`);
            }
          }),
        );
      } catch (attachmentError) {
        console.error("[EMAIL_SEND] Error processing attachments:", attachmentError);
        return NextResponse.json(
          {
            error: "Attachment processing failed",
            message: attachmentError instanceof Error ? attachmentError.message : "Failed to process one or more attachments",
            details: "Please check file sizes and try again",
          },
          { status: 400 },
        );
      }

      const emailPayload = {
        from: {
          address: fromEmail,
          name: fromName,
        },
        to: to.map((email: string) => ({
          address: email,
          name: email,
        })),
        subject: subject,
        body: emailBodyWithWatermark,
        cc: cc
          ? cc.map((email: string) => ({
              address: email,
              name: email,
            }))
          : undefined,
        bcc: bcc
          ? bcc.map((email: string) => ({
              address: email,
              name: email,
            }))
          : undefined,
        attachments: attachmentData.map((att) => ({
          filename: att.name,
          name: att.name,
          content: att.content,
          contentType: att.contentType,
          mimeType: att.contentType,
        })),
      };

      aurinkoHeaders["Content-Type"] = "application/json";

      console.log("[EMAIL_SEND] Sending email with attachments via Aurinko API");
      console.log("[EMAIL_SEND] Attachments:", attachmentData.length);
      console.log("[EMAIL_SEND] Attachment names:", attachmentData.map(a => a.name));
      console.log("[EMAIL_SEND] First attachment sample (first 100 chars of base64):", attachmentData[0]?.content?.substring(0, 100));

      try {
        response = await axios.post(
          `https://api.aurinko.io/v1/email/messages`,
          emailPayload,
          {
            params: {
              returnIds: true,
            },
            headers: aurinkoHeaders,
          },
        );
      } catch (aurinkoError) {
        if (axios.isAxiosError(aurinkoError)) {
          const errorStatus = aurinkoError.response?.status;
          const errorData = aurinkoError.response?.data;
          
          console.error("[EMAIL_SEND] Aurinko API Error Details:");
          console.error("[EMAIL_SEND] Status:", errorStatus);
          console.error("[EMAIL_SEND] Response Data:", JSON.stringify(errorData, null, 2));
          console.error("[EMAIL_SEND] Request Payload (sample):", {
            from: emailPayload.from,
            to: emailPayload.to,
            subject: emailPayload.subject,
            attachmentsCount: emailPayload.attachments?.length,
            firstAttachmentName: emailPayload.attachments?.[0]?.name,
          });

          if (errorStatus === 400 && emailPayload.attachments && emailPayload.attachments.length > 0) {
            console.warn("[EMAIL_SEND] Attempting to send email without attachments as fallback...");
            // eslint-disable-next-line @typescript-eslint/no-unused-vars
            const { attachments: _, ...emailPayloadWithoutAttachments } = emailPayload;

            try {
              response = await axios.post(
                `https://api.aurinko.io/v1/email/messages`,
                emailPayloadWithoutAttachments,
                {
                  params: {
                    returnIds: true,
                  },
                  headers: aurinkoHeaders,
                },
              );
              
              return NextResponse.json(
                {
                  success: true,
                  message: "Email sent successfully (attachments were removed - Aurinko API doesn't support attachments in this format)",
                  messageId: response.data.id,
                  warning: "Attachments were not included. The Aurinko API may not support attachments in the current format.",
                },
                { status: 200 },
              );
            } catch {
              throw aurinkoError;
            }
          }
        }
        throw aurinkoError;
      }
    } else {
      const emailPayload = {
        from: {
          address: fromEmail,
          name: fromName,
        },
        to: to.map((email: string) => ({
          address: email,
          name: email,
        })),
        subject: subject,
        body: emailBodyWithWatermark,
        cc: cc
          ? cc.map((email: string) => ({
              address: email,
              name: email,
            }))
          : undefined,
        bcc: bcc
          ? bcc.map((email: string) => ({
              address: email,
              name: email,
            }))
          : undefined,
      };

      aurinkoHeaders["Content-Type"] = "application/json";

      console.log("[EMAIL_SEND] Sending email via Aurinko API");
      console.log("[EMAIL_SEND] From:", fromEmail);
      console.log("[EMAIL_SEND] To:", to);
      console.log("[EMAIL_SEND] Subject:", subject);

      response = await axios.post(
        `https://api.aurinko.io/v1/email/messages`,
        emailPayload,
        {
          params: {
            returnIds: true,
          },
          headers: aurinkoHeaders,
        },
      );
    }

    console.log("[EMAIL_SEND] Success - Response:", response.data);

    return NextResponse.json(
      {
        success: true,
        message: "Email sent successfully",
        messageId: response.data.id,
      },
      { status: 200 },
    );
  } catch (error) {
    console.error("[EMAIL_SEND] Error sending email:", error);

    try {
      if (axios.isAxiosError(error)) {
        const status = error.response?.status;
        const errorData = error.response?.data;

        console.error("[EMAIL_SEND] Axios error - Status:", status);
        console.error("[EMAIL_SEND] Axios error - Data:", JSON.stringify(errorData, null, 2));

        if (status === 401) {
          return NextResponse.json(
            {
              error: "Invalid token",
              message:
                "The authentication token is invalid or expired. Please reconnect your account.",
              details: errorData || error.message,
            },
            { status: 401 },
          );
        }

        if (status === 403) {
          return NextResponse.json(
            {
              error: "Permission denied",
              message:
                "The account does not have permission to send emails. Please check your account permissions.",
              details: errorData || error.message,
            },
            { status: 403 },
          );
        }

        const errorMessage = errorData?.message || errorData?.error || error.message || "Unknown error";
        const errorDetails = typeof errorData === 'object' ? JSON.stringify(errorData, null, 2) : errorData;

        return NextResponse.json(
          {
            error: "Email sending failed",
            message: `Failed to send email via Aurinko API: ${errorMessage}`,
            details: errorDetails || error.message,
            status: status || 500,
            hint: attachments.length > 0 ? "Attachments might not be supported in this format. Try sending without attachments." : undefined,
          },
          { status: status || 500 },
        );
      }

      if (error instanceof Error && error.message.includes("attachment")) {
        return NextResponse.json(
          {
            error: "Attachment processing failed",
            message: error.message,
            details: "Failed to process one or more attachments",
          },
          { status: 400 },
        );
      }

      return NextResponse.json(
        {
          error: "Unknown error",
          message: "An unexpected error occurred while sending the email",
          details: error instanceof Error ? error.message : "Unknown error",
        },
        { status: 500 },
      );
    } catch (jsonError) {
      console.error("[EMAIL_SEND] Critical error creating error response:", jsonError);
      return new Response(
        JSON.stringify({
          error: "Internal server error",
          message: "An unexpected error occurred",
        }),
        {
          status: 500,
          headers: { "Content-Type": "application/json" },
        },
      );
    }
  }
}
