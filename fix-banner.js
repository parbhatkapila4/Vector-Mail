const fs = require("fs");
const path = "src/components/mail/Mail.tsx";
let s = fs.readFileSync(path, "utf8");
const toRemove =
  /\s*<span className="w-full text-center text-\[11px\] text-\[#5f6368\] dark:text-\[#9aa0a6\]">\s*We.ll get back to you once your account is enabled\.\s*<\/span>/;
const removed = s.replace(toRemove, "");
if (removed.length !== s.length) {
  fs.writeFileSync(path, removed);
  console.log("Removed");
} else {
  console.log("No match, length before:", s.length);
}
