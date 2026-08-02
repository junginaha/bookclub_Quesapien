import { FlatCompat } from "@eslint/eslintrc";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const compat = new FlatCompat({ baseDirectory: __dirname });

const config = [
  {
    ignores: [".next/**", "node_modules/**", ".claude/worktrees/**", "supabase/.temp/**"],
  },
  {
    linterOptions: { reportUnusedDisableDirectives: false },
  },
  ...compat.extends("next/core-web-vitals", "next/typescript"),
  {
    rules: {
      // Existing code intentionally uses Supabase's dynamic row shapes and
      // styled anchor navigation. Keep lint focused on correctness without
      // forcing a broad UI/data refactor during repository hygiene work.
      "@next/next/no-html-link-for-pages": "off",
      "@typescript-eslint/no-empty-object-type": "off",
      "@typescript-eslint/no-explicit-any": "off",
      "@typescript-eslint/triple-slash-reference": "off",
      "react/no-unescaped-entities": "off",
    },
  },
];

export default config;
