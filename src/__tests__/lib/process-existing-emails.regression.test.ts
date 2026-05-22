import { readFileSync } from "node:fs";
import { join } from "node:path";

const FILE = join(
  process.cwd(),
  "src",
  "lib",
  "process-existing-emails.ts",
);

describe("process-existing-emails regression", () => {
  const source = readFileSync(FILE, "utf8");

  it("does NOT contain the JSON.stringify(...)::text[] anti-pattern", () => {
    const codeOnly = source
      .split("\n")
      .filter((line) => {
        const trimmed = line.trimStart();
        return !trimmed.startsWith("//") && !trimmed.startsWith("*");
      })
      .join("\n");

    expect(codeOnly).not.toMatch(
      /JSON\.stringify\([^)]*\)\s*\}?\s*::\s*text\s*\[\s*\]/i,
    );
  });

  it("uses Prisma's db.email.update with a real array for keywords", () => {
    expect(source).toMatch(/db\.email\.update\(/);
    expect(source).toMatch(/keywords:\s*analysis\.tags/);
  });

  it("isolates the ::vector cast to its own $executeRaw call", () => {
    const executeRawBlocks = source.match(/db\.\$executeRaw`[^`]*`/g) ?? [];
    for (const block of executeRawBlocks) {
      expect(block).toMatch(/embedding/);
      expect(block).not.toMatch(/\bkeywords\b/);
      expect(block).not.toMatch(/\bsummary\b/);
    }
  });
});
