import { db } from "@/server/db";


async function fixSentThreads() {
  console.log("Fixing sent threads that were incorrectly marked as inbox...");

  try {

    const threads = await db.thread.findMany({
      where: {
        inboxStatus: true,
        sentStatus: false,
        draftStatus: false,
      },
      include: {
        emails: {
          select: {
            emailLabel: true,
            sysLabels: true,
          },
        },
      },
    });

    console.log(`Found ${threads.length} threads to check`);

    let fixedCount = 0;

    for (const thread of threads) {

      const hasSentEmail = thread.emails.some(
        (email) =>
          email.emailLabel === "sent" ||
          email.sysLabels?.includes("sent")
      );


      const isDraft = thread.emails.some(
        (email) =>
          email.emailLabel === "draft" ||
          email.sysLabels?.includes("draft")
      );

      if (hasSentEmail && !isDraft) {

        await db.thread.update({
          where: { id: thread.id },
          data: {
            sentStatus: true,
            inboxStatus: false,
            draftStatus: false,
          },
        });
        fixedCount++;
        console.log(`Fixed thread ${thread.id} - marked as sent`);
      }
    }

    console.log(`\nFixed ${fixedCount} threads!`);
    console.log(`\nYour sent emails should now appear in the Sent folder!`);

  } catch (error) {
    console.error("Error fixing threads:", error);
    throw error;
  } finally {
    await db.$disconnect();
  }
}

fixSentThreads()
  .then(() => {
    process.exit(0);
  })
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
