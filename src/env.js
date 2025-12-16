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
  },

  client: {},

  runtimeEnv: {
    DATABASE_URL: process.env.DATABASE_URL,
    NODE_ENV: process.env.NODE_ENV,
    OPENROUTER_API_KEY: process.env.OPENROUTER_API_KEY,
    OPENAI_API_KEY: process.env.OPENAI_API_KEY,
  },

  skipValidation: !!process.env.SKIP_ENV_VALIDATION,

  emptyStringAsUndefined: true,
});
