import { postRouter } from "@/server/api/routers/post";
import { createCallerFactory, createTRPCRouter } from "@/server/api/trpc";
import { accountRouter } from "./routers/account";

export const appRouter = createTRPCRouter({
  post: postRouter,
  account: accountRouter,
});

export type AppRouter = typeof appRouter;

export const createCaller = createCallerFactory(appRouter);
