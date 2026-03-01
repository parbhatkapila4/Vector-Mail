import { db } from "@/server/db";

const CONDITION_TYPE_TAG_MATCH = "TAG_MATCH";
export async function applyFilterRulesForThread(params: {
  threadId: string;
  accountId: string;
}): Promise<void> {
  const { threadId, accountId } = params;

  const rules = await db.filterRule.findMany({
    where: {
      accountId,
      conditionType: CONDITION_TYPE_TAG_MATCH,
    },
    include: { label: true },
  });

  if (rules.length === 0) return;


  const emails = await db.email.findMany({
    where: { threadId },
    select: { keywords: true },
  });

  const threadTagSet = new Set<string>();
  for (const e of emails) {
    const tags = e.keywords ?? [];
    for (const t of tags) {
      threadTagSet.add(String(t).toLowerCase().trim());
    }
  }

  for (const rule of rules) {
    const matchValue = String(rule.conditionValue).toLowerCase().trim();
    if (!threadTagSet.has(matchValue)) continue;

    await db.threadLabel.upsert({
      where: {
        threadId_labelId: { threadId, labelId: rule.labelId },
      },
      create: { threadId, labelId: rule.labelId },
      update: {},
    });
  }
}
