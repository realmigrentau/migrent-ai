import type { NextApiRequest, NextApiResponse } from "next";

/**
 * Server-side admin credential verification.
 * Credentials are stored in environment variables, never exposed to the client.
 */
export default function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  const { username, password } = req.body;

  if (!username || !password) {
    return res.status(400).json({ valid: false, error: "Missing credentials" });
  }

  const adminUser = process.env.ADMIN_USERNAME;
  const adminPass = process.env.ADMIN_PASSWORD;
  const lockoutPass = process.env.ADMIN_LOCKOUT_PASSWORD;

  if (!adminUser || !adminPass) {
    console.error("ADMIN_USERNAME or ADMIN_PASSWORD env vars not set");
    return res.status(500).json({ valid: false, error: "Admin auth not configured" });
  }

  // Handle lockout recovery (sent as username="_lockout_")
  if (username === "_lockout_") {
    const valid = lockoutPass ? password === lockoutPass : false;
    return res.status(valid ? 200 : 401).json({ valid });
  }

  const valid = username === adminUser && password === adminPass;

  return res.status(valid ? 200 : 401).json({ valid });
}
