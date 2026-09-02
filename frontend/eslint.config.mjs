import { defineConfig, globalIgnores } from "eslint/config";
import nextVitals from "eslint-config-next/core-web-vitals";
import nextTs from "eslint-config-next/typescript";

const eslintConfig = defineConfig([
  ...nextVitals,
  ...nextTs,
  {
    rules: {
      // Advisory in this codebase: 90+ pre-existing `any`s in API glue and
      // JSX apostrophes are not defects. Surfaced as warnings so new code is
      // nudged without failing CI on old code.
      "@typescript-eslint/no-explicit-any": "warn",
      "react/no-unescaped-entities": "off",
      // React Compiler readiness rules shipped with eslint-config-next 16.
      // The patterns they flag (setState in effects for data fetching) are
      // intentional here; treat as warnings until the hooks are migrated.
      "react-hooks/set-state-in-effect": "warn",
      "react-hooks/immutability": "warn",
      "react-hooks/preserve-manual-memoization": "warn",
    },
  },
  // Override default ignores of eslint-config-next.
  globalIgnores([
    // Default ignores of eslint-config-next:
    ".next/**",
    "out/**",
    "build/**",
    "next-env.d.ts",
    "public/service-worker.js",
    "tests/e2e/**/*.mjs",
    "scripts/**/*.mjs",
    "playwright-report/**",
    "test-results/**",
  ]),
]);

export default eslintConfig;
