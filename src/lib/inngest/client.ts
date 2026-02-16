import { Inngest } from "inngest";

export const inngest = new Inngest({
  id: "vectormail-ai",
  eventKey: process.env.INNGEST_EVENT_KEY,
});
