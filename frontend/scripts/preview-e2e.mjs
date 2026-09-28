#!/usr/bin/env node
/**
 * Serve the Playwright production build (NEXT_DIST_DIR=.next-e2e) with the
 * mock API, for looking at it in a browser the way the tests see it.
 *
 *   NEXT_DIST_DIR=.next-e2e npm run build:test   # once
 *   npm run preview:e2e                          # http://localhost:3100
 */
import { readFileSync } from "node:fs";
import { spawn } from "node:child_process";

const env = { ...process.env, NEXT_DIST_DIR: ".next-e2e", MOCK_API_PORT: "8787" };
for (const line of readFileSync(".env.test", "utf8").split("\n")) {
  const m = line.match(/^([A-Z0-9_]+)=(.*)$/);
  if (m) env[m[1]] = m[2];
}
const procs = [
  spawn(process.execPath, ["tests/e2e/mock-api.mjs"], { env, stdio: "inherit" }),
  spawn(process.platform === "win32" ? "npx.cmd" : "npx", ["next", "start", "-p", "3100"], { env, stdio: "inherit" }),
];
const stop = () => procs.forEach((p) => p.kill("SIGTERM"));
process.on("SIGINT", stop);
process.on("SIGTERM", stop);
procs.forEach((p) => p.on("exit", (code) => code && stop()));
