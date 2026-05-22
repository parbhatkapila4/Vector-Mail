import { readdirSync, readFileSync, statSync } from "node:fs";
import { join, relative } from "node:path";

const ROOT = new URL("..", import.meta.url).pathname.replace(/^\//, "");
const SCAN_DIRS = ["src", "prisma"];
const SCAN_EXTENSIONS = new Set([".ts", ".tsx", ".js", ".jsx", ".mjs", ".cjs"]);
const BANNED_PATTERNS = [
  {
    name: "JSON.stringify to text[] cast",
    pattern: /JSON\.stringify\([^)]*\)\s*\}?\s*::\s*text\s*\[\s*\]/i,
    explanation: [
      '  JSON serializes a JS array as ["a","b"], but PostgreSQL text[]',
      "  literal syntax is {a,b}. The ::text[] cast on a JSON string always",
      "  throws `22P02 malformed array literal` and rolls back the UPDATE.",
      "  Fix: use Prisma's safe path - db.table.update({ data: { col: arr } }).",
      "  Or, if you must use raw SQL, build the PG array literal manually:",
      "    const lit = `{${arr.map(v => v.replace(/,/g, '')).join(',')}}`;",
    ].join("\n"),
  },
  {
    name: "JSON.stringify to ::json cast",
    pattern: /JSON\.stringify\([^)]*\)\s*\}?\s*::\s*json(?!\w)/i,
    explanation: [
      "  Prisma parameter binding already escapes JSON correctly. Passing a",
      "  JSON.stringified value and then casting again is double-escaping and",
      "  will produce a string instead of a JSON object. Use Prisma's",
      "  Prisma.InputJsonValue type or the json column directly via",
      "  db.table.update({ data: { col: value } }).",
    ].join("\n"),
  },
];

const offenders = [];

function walk(dir) {
  let entries;
  try {
    entries = readdirSync(dir);
  } catch {
    return;
  }
  for (const name of entries) {
    if (name === "node_modules" || name.startsWith(".")) continue;
    const full = join(dir, name);
    let st;
    try {
      st = statSync(full);
    } catch {
      continue;
    }
    if (st.isDirectory()) {
      walk(full);
      continue;
    }
    const dot = name.lastIndexOf(".");
    if (dot < 0) continue;
    const ext = name.slice(dot);
    if (!SCAN_EXTENSIONS.has(ext)) continue;
    scanFile(full);
  }
}

function scanFile(file) {
  let content;
  try {
    content = readFileSync(file, "utf8");
  } catch {
    return;
  }
  const lines = content.split("\n");
  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    const trimmed = line.trimStart();
    if (trimmed.startsWith("//") || trimmed.startsWith("*")) continue;
    for (const rule of BANNED_PATTERNS) {
      if (rule.pattern.test(line)) {
        offenders.push({
          file: relative(ROOT, file),
          lineNumber: i + 1,
          lineText: line.trim(),
          ruleName: rule.name,
          explanation: rule.explanation,
        });
      }
    }
  }
}

for (const dir of SCAN_DIRS) {
  walk(join(ROOT, dir));
}

if (offenders.length === 0) {
  console.log("[banned-sql-check] clean - no forbidden raw-SQL patterns.");
  process.exit(0);
}

console.error("\nBANNED RAW-SQL PATTERN DETECTED - commit blocked.\n");
for (const o of offenders) {
  console.error(`  ${o.file}:${o.lineNumber}`);
  console.error(`    rule: ${o.ruleName}`);
  console.error(`    code: ${o.lineText}`);
  console.error(o.explanation);
  console.error("");
}
console.error(
  `Found ${offenders.length} forbidden raw-SQL ${offenders.length === 1 ? "pattern" : "patterns"}. See scripts/check-banned-sql-patterns.mjs for the full rule list and rationale.\n`,
);
process.exit(1);
