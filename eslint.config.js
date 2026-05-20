import { FlatCompat } from "@eslint/eslintrc";
import tseslint from "typescript-eslint";

const compat = new FlatCompat({
  baseDirectory: import.meta.dirname,
});

export default tseslint.config(
  {
    ignores: [
      ".next/**",
      "coverage/**",
      "node_modules/**",
      "public/**",
      "scripts/**",
      "**/*.test.ts",
      "**/*.test.tsx",
      "**/*.spec.ts",
      "**/*.spec.tsx",
      "e2e/**",
      "**/bun.lock",
      "bun.lock",
      "**/package-lock.json",
      "**/yarn.lock",
      "**/pnpm-lock.yaml",
      "**/*.lock",
      "**/*.prisma",
      "prisma/**",
      "next-env.d.ts",
      "**/*.d.ts",
    ],
  },
  ...compat.extends("next/core-web-vitals"),
  {
    rules: {
      "@next/next/no-duplicate-head": "off",
    },
  },
  {
    files: ["**/*.ts", "**/*.tsx"],
    extends: [...tseslint.configs.recommended],
    rules: {
      "@typescript-eslint/array-type": "off",
      "@typescript-eslint/consistent-type-definitions": "off",
      "@typescript-eslint/no-unused-vars": "warn",
      "@typescript-eslint/no-explicit-any": "warn",
      "@typescript-eslint/no-require-imports": "warn",
      "@typescript-eslint/no-wrapper-object-types": "warn",
      "react/no-unescaped-entities": "off",
      "react-hooks/rules-of-hooks": "warn",
      "react-hooks/exhaustive-deps": "warn",
      "prefer-const": "warn",
      "jsx-a11y/alt-text": "warn",
      "import/no-anonymous-default-export": "warn",
      "react/display-name": "warn",
      "@next/next/no-duplicate-head": "off",
    },
  },
  {
    files: ["src/**/*.{ts,tsx}"],
    ignores: ["src/components/providers/ProvidersWrapper.tsx"],
    rules: {
      "no-restricted-imports": [
        "error",
        {
          paths: [
            {
              name: "@clerk/nextjs",
              importNames: ["ClerkProvider"],
              message:
                "ClerkProvider must only be imported in src/components/providers/ProvidersWrapper.tsx (Server Component). Putting it under \"use client\" drops SSR auth hydration.",
            },
          ],
        },
      ],
    },
  },
  {
    linterOptions: {
      reportUnusedDisableDirectives: true,
    },
    languageOptions: {
      parserOptions: {
        // `projectService: true` auto-discovers every tsconfig.*.json in
        // the project root. Test files live in tsconfig.test.json so the
        // parser can find them even though they're excluded from the
        // main tsconfig.json (which keeps `tsc --noEmit` fast for CI).
        projectService: true,
      },
    },
  },
);
