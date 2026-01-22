import { db } from "@/server/db";

async function fixExistingAccounts() {
  console.log("Fixing existing accounts...");

  try {

    const accounts = await db.account.findMany({
      select: {
        id: true,
        emailAddress: true,
        tokenExpiresAt: true,
        needsReconnection: true,
      },
    });

    console.log(`Found ${accounts.length} accounts to check`);

    for (const account of accounts) {
      console.log(`\nAccount: ${account.emailAddress} (ID: ${account.id})`);
      console.log(`  - tokenExpiresAt: ${account.tokenExpiresAt}`);
      console.log(`  - needsReconnection: ${account.needsReconnection}`);


      const updates: {
        tokenExpiresAt?: null;
        needsReconnection?: boolean;
      } = {};


      if (account.tokenExpiresAt !== null) {
        updates.tokenExpiresAt = null;
        console.log(` Will set tokenExpiresAt to null`);
      }



      if (account.needsReconnection) {
        updates.needsReconnection = false;
        console.log(` Will reset needsReconnection to false`);
      }


      if (Object.keys(updates).length > 0) {
        await db.account.update({
          where: { id: account.id },
          data: updates,
        });
        console.log(`Updated!`);
      } else {
        console.log(` No changes needed`);
      }
    }

    console.log("\n All accounts fixed!");
    console.log("\n Your accounts should now work without reconnection prompts!");

  } catch (error) {
    console.error(" Error fixing accounts:", error);
    throw error;
  } finally {
    await db.$disconnect();
  }
}

fixExistingAccounts()
  .then(() => {
    process.exit(0);
  })
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
