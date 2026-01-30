

export async function generateEmail(
  _context: string,
  _prompt: string,
): Promise<{ content: string }> {
  throw new Error(
    "generateEmail is deprecated. Use fetch('/api/generate-email', { body: JSON.stringify({ context, prompt, mode: 'compose' }) }) with a timeout instead.",
  );
}

export async function generate(
  _input: string,
  _context?: string,
): Promise<{ content: string }> {
  throw new Error(
    "generate is deprecated. Use fetch('/api/generate-email', { body: JSON.stringify({ prompt, context, mode: 'complete' }) }) with a timeout instead.",
  );
}
