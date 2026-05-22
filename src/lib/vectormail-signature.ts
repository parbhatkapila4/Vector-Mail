export function appendVectorMailSignature(
  body: string,
  _isHtml = true,
): string {
  return body?.trimEnd() ?? "";
}
