import { Resend } from "resend";
import { env } from "@/env";
import { makeTagLogger } from "@/lib/logging/console-shim";

const notifyLog = makeTagLogger("notify.waitlist");

export interface WaitlistNotification {
  email: string;
  inboxAnswer: string | null;
}

function escapeHtml(value: string): string {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

export async function notifyWaitlistSignup(
  entry: WaitlistNotification,
): Promise<void> {
  const apiKey = env.RESEND_API_KEY?.trim();
  const to = env.ADMIN_EMAIL?.trim();
  const from = env.RESEND_FROM_EMAIL?.trim();

  if (!apiKey || !to || !from) {
    notifyLog.warn(
      "waitlist email not sent: set RESEND_API_KEY, ADMIN_EMAIL and RESEND_FROM_EMAIL to enable it",
    );
    return;
  }

  const answer = entry.inboxAnswer?.trim();

  try {
    const resend = new Resend(apiKey);
    const { error } = await resend.emails.send({
      from,
      to,
      subject: `Waitlist: ${entry.email}`,
      replyTo: entry.email,
      text: [
        `New VectorMail waitlist signup.`,
        ``,
        `Email: ${entry.email}`,
        ``,
        `Inbox situation:`,
        answer || "(not answered)",
      ].join("\n"),
      html: [
        `<p><strong>New VectorMail waitlist signup.</strong></p>`,
        `<p><strong>Email:</strong> ${escapeHtml(entry.email)}</p>`,
        `<p><strong>Inbox situation:</strong><br>`,
        answer ? escapeHtml(answer).replace(/\n/g, "<br>") : "<em>(not answered)</em>",
        `</p>`,
      ].join(""),
    });
    if (error) {
      notifyLog.error("resend rejected the waitlist email", error);
      return;
    }
    notifyLog.log("waitlist email sent", { to });
  } catch (error) {
    notifyLog.error("failed to send waitlist email", error);
  }
}
