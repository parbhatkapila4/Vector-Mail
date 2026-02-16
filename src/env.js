import { createEnv } from "@t3-oss/env-nextjs";
import { z } from "zod";

export const env = createEnv({
  server: {
    DATABASE_URL: z.string().url().optional(),
    NODE_ENV: z
      .enum(["development", "test", "production"])
      .default("development"),
    OPENROUTER_API_KEY: z.string().min(1).optional(),
    OPENAI_API_KEY: z.string().min(1).optional(),

    ENABLE_EMAIL_SEND: z
      .string()
      .transform((val) => val === "true")
      .default("false")
      .optional(),
    CRON_SECRET: z.string().min(1).optional(),
    ADMIN_STATS_SECRET: z.string().min(1).optional(),
    AI_DAILY_CAP_TOKENS: z
      .string()
      .optional()
      .transform((v) => (v != null && v !== "" ? parseInt(v, 10) : undefined)),
    REDIS_URL: z.string().optional(),
    UPSTASH_REDIS_REST_URL: z.string().optional(),
    UPSTASH_REDIS_REST_TOKEN: z.string().optional(),
    INNGEST_EVENT_KEY: z.string().optional(),
    INNGEST_SIGNING_KEY: z.string().optional(),
  },

  client: {},

  runtimeEnv: {
    DATABASE_URL: process.env.DATABASE_URL,
    NODE_ENV: process.env.NODE_ENV,
    OPENROUTER_API_KEY: process.env.OPENROUTER_API_KEY,
    OPENAI_API_KEY: process.env.OPENAI_API_KEY,
    ENABLE_EMAIL_SEND: process.env.ENABLE_EMAIL_SEND,
    CRON_SECRET: process.env.CRON_SECRET,
    ADMIN_STATS_SECRET: process.env.ADMIN_STATS_SECRET,
    AI_DAILY_CAP_TOKENS: process.env.AI_DAILY_CAP_TOKENS,
    REDIS_URL: process.env.REDIS_URL,
    UPSTASH_REDIS_REST_URL: process.env.UPSTASH_REDIS_REST_URL,
    UPSTASH_REDIS_REST_TOKEN: process.env.UPSTASH_REDIS_REST_TOKEN,
    INNGEST_EVENT_KEY: process.env.INNGEST_EVENT_KEY,
    INNGEST_SIGNING_KEY: process.env.INNGEST_SIGNING_KEY,
  },

  skipValidation: !!process.env.SKIP_ENV_VALIDATION,

  emptyStringAsUndefined: true,
});
