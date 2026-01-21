import { db } from "../src/server/db";

async function resetReconnectionFlag() {
  console.log("Resetting needsReconnection flag for all accounts...");

  const result = await db.account.updateMany({
    where: {
      needsReconnection: true,
    },
    data: {
      needsReconnection: false,
    },
  });

  console.log(`✅ Reset needsReconnection for ${result.count} accounts`);

  const accounts = await db.account.findMany({
    select: {
      id: true,
      emailAddress: true,
      needsReconnection: true,
    },
  });

  console.log("\nCurrent accounts:");
  accounts.forEach(acc => {
    console.log(`  - ${acc.emailAddress} (${acc.id}): needsReconnection = ${acc.needsReconnection}`);
  });

  process.exit(0);
}

resetReconnectionFlag().catch((error) => {
  console.error("Error:", error);
  process.exit(1);
});
