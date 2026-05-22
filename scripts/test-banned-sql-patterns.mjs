const BANNED_PATTERNS = [
  {
    name: "JSON.stringify to text[] cast",
    pattern: /JSON\.stringify\([^)]*\)\s*\}?\s*::\s*text\s*\[\s*\]/i,
  },
  {
    name: "JSON.stringify to ::json cast",
    pattern: /JSON\.stringify\([^)]*\)\s*\}?\s*::\s*json(?!\w)/i,
  },
];

function isCommentLine(line) {
  const trimmed = line.trimStart();
  return trimmed.startsWith("//") || trimmed.startsWith("*");
}

const cases = [
  [true, '"keywords" = ${JSON.stringify(analysis.tags)}::text[]'],
  [true, '"keywords" = ${JSON.stringify(arr)} ::text[]'],
  [true, '"keywords" = ${JSON.stringify(arr)}::text [ ]'],
  [true, '"data" = ${JSON.stringify(obj)}::json'],
  [true, '"data" = ${JSON.stringify(obj)} :: json'],
  [true, "JSON.stringify(arr)::text[]"],
  [true, "JSON.stringify(o)  ::  text  [  ]"],
  [false, '"embedding" = ${JSON.stringify(vec)}::vector'],
  [false, "JSON.stringify(vec)::vector"],
  [false, "db.email.update({ data: { keywords: analysis.tags } })"],
  [false, "WHERE id = ANY(${emailIds}::text[])"],
  [false, "const json = JSON.stringify(obj);"],
  [false, "// JSON.stringify(...) :: text[] is banned - see scripts/check"],
];

let failed = 0;
for (const [shouldMatch, line] of cases) {
  const skip = isCommentLine(line);
  const matchedRule = skip
    ? null
    : BANNED_PATTERNS.find((r) => r.pattern.test(line));
  const actual = !!matchedRule;
  const ok = actual === shouldMatch;
  if (!ok) failed++;
  console.log(
    `${ok ? "OK " : "FAIL"}  expect=${shouldMatch ? "catch" : "pass "}  actual=${actual ? "catch" : "pass "}  → ${line}`,
  );
}
console.log(`\n${cases.length - failed}/${cases.length} cases pass.`);
process.exit(failed ? 1 : 0);
