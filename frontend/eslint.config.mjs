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
    },
  },
  // Override default ignores of eslint-config-next.
  globalIgnores([
    // Default ignores of eslint-config-next:
    ".next/**",
    ".next-*/**",
    "out/**",
    "build/**",
    "next-env.d.ts",
    "public/service-worker.js",
    // MapLibre's worker, copied from node_modules on install.
    "public/vendor/**",
    "tests/e2e/**/*.mjs",
    "scripts/**/*.mjs",
    "playwright-report/**",
    "test-results/**",
  ]),
]);

export default eslintConfig;
