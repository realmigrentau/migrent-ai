#!/usr/bin/env node
/**
 * Run the site against the local mock API instead of Render and Supabase:
 * the mock (tests/e2e/mock-api.mjs) plus `next dev` with the public env
 * pointed at it. Sign in to Migrent Hub with the fixture accounts listed in
 * tests/e2e/hub-mock.mjs. Uses its own build directory so it can run next
 * to another dev server in the same checkout.
 *
 *   npm run dev:mock            # http://localhost:3200
 */
import { spawn } from "node:child_process";

const MOCK = process.env.MOCK_API_PORT || "8787";
const PORT = process.env.PORT || "3200";
const env = {
  ...process.env,
  MOCK_API_PORT: MOCK,
  NEXT_DIST_DIR: ".next-mock",
  NEXT_PUBLIC_API_BASE_URL: `http://127.0.0.1:${MOCK}`,
  NEXT_PUBLIC_SUPABASE_URL: `http://127.0.0.1:${MOCK}`,
  NEXT_PUBLIC_SUPABASE_ANON_KEY: "anon-test-key",
  NEXT_PUBLIC_FRONTEND_URL: `http://localhost:${PORT}`,
  NEXT_PUBLIC_HCAPTCHA_SITE_KEY: "",
};

const procs = [
  spawn(process.execPath, ["tests/e2e/mock-api.mjs"], { env, stdio: "inherit" }),
  spawn(process.platform === "win32" ? "npx.cmd" : "npx", ["next", "dev", "-p", PORT], { env, stdio: "inherit" }),
];
const stop = () => procs.forEach((p) => p.kill("SIGTERM"));
process.on("SIGINT", stop);
process.on("SIGTERM", stop);
procs.forEach((p) => p.on("exit", (code) => code && stop()));
