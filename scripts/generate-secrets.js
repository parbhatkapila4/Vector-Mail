const crypto = require("crypto");

function secret(prefix) {
  return prefix + "_" + crypto.randomBytes(24).toString("base64url");
}

const cronSecret = secret("vm_cron");
const adminSecret = secret("vm_admin");

console.log("\n# Add these to your .env (do not commit .env):\n");
console.log("CRON_SECRET=" + cronSecret);
console.log("ADMIN_STATS_SECRET=" + adminSecret);
console.log("\n");
