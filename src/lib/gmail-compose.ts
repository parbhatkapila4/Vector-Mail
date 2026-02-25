function htmlToPlainText(html: string): string {
  if (!html || typeof html !== "string") return "";
  const trimmed = html.trim();
  if (!trimmed) return "";
  if (!/<[a-z][\s\S]*>/i.test(trimmed)) return trimmed;
  const div = typeof document !== "undefined" ? document.createElement("div") : null;
  if (div) {
    div.innerHTML = trimmed;
    return (div.textContent ?? div.innerText ?? "").trim();
  }
  return trimmed.replace(/<[^>]*>/g, "").trim();
}

export interface OpenGmailComposeOptions {
  to?: string;
  cc?: string;
  subject?: string;
  body?: string;
}

export function openGmailCompose({
  to = "",
  cc = "",
  subject = "",
  body = "",
}: OpenGmailComposeOptions): void {
  const plainBody = htmlToPlainText(body) || body;
  const params = new URLSearchParams({
    view: "cm",
    fs: "1",
    to: String(to).trim(),
    su: String(subject).trim(),
    body: plainBody,
  });
  if (cc.trim()) params.set("cc", cc.trim());
  window.open(`https://mail.google.com/mail/?${params.toString()}`, "_blank");
}
