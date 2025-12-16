import { FlatCompat } from "@eslint/eslintrc";
import tseslint from "typescript-eslint";

const compat = new FlatCompat({
  baseDirectory: import.meta.dirname,
});

export default tseslint.config(
  {
    ignores: [
      ".next/**",
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
    ],
  },
  ...compat.extends("next/core-web-vitals"),
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
    },
  },
  {
    linterOptions: {
      reportUnusedDisableDirectives: true,
    },
    languageOptions: {
      parserOptions: {
        projectService: true,
      },
    },
  },
);
