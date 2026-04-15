import { createCallerFactory, createTRPCRouter } from "@/server/api/trpc";
import { accountRouter } from "./routers/account";
import { automationRouter } from "./routers/automation";

export const appRouter = createTRPCRouter({
  account: accountRouter,
  automation: automationRouter,
});

export type AppRouter = typeof appRouter;

export const createCaller = createCallerFactory(appRouter);
