import { createCallerFactory, createTRPCRouter } from "@/server/api/trpc";
import { accountRouter } from "./routers/account";

export const appRouter = createTRPCRouter({
  account: accountRouter,
});

export type AppRouter = typeof appRouter;

export const createCaller = createCallerFactory(appRouter);
