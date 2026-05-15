export interface ConceptItem {
  title: string;
  description: string;
  iconPath: string;
}

export interface ErrorEntry {
  code: number;
  name: string;
  description: string;
  fix: string;
}

export interface ChangelogEntry {
  version: string;
  date: string;
  status: "stable" | "beta" | "deprecated";
  changes: string[];
}

export interface WebhookEvent {
  name: string;
  description: string;
}

export const apiStatus = {
  version: "v1",
  status: "Stable",
  baseUrlProd: "https://api.migrent.ai/v1",
  baseUrlSandbox: "https://api.sandbox.migrent.ai/v1",
  uptime: "99.9%",
  region: "Australia (ap-southeast-2)",
};

export const concepts: ConceptItem[] = [
  {
    title: "RESTful resources",
    description:
      "Predictable, resource-oriented URLs. JSON-encoded request bodies, JSON responses, standard HTTP verbs and status codes.",
    iconPath: "M4 6h16M4 12h16M4 18h16",
  },
  {
    title: "Australia-first",
    description:
      "All listings, bookings, payments and verification flows are scoped to Australian compliance: AUD pricing, ABN/visa checks, Australian residential tenancy rules.",
    iconPath: "M3 12l2-2 4 4 8-8 4 4",
  },
  {
    title: "Idempotent writes",
    description:
      "POST and PUT requests accept an Idempotency-Key header. Replaying the same key returns the original response, safely.",
    iconPath: "M4 4v6h6M20 20v-6h-6M4 20a16 16 0 0116-16M20 4a16 16 0 00-16 16",
  },
  {
    title: "Signed webhooks",
    description:
      "Every webhook is signed with HMAC-SHA256 using your endpoint secret. Verify the X-MigRent-Signature header before trusting payloads.",
    iconPath: "M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z",
  },
];

export const errors: ErrorEntry[] = [
  {
    code: 400,
    name: "bad_request",
    description: "The request body or query string was malformed.",
    fix: "Inspect the error.details array for the offending field. Validate JSON structure and required fields.",
  },
  {
    code: 401,
    name: "unauthorized",
    description: "Missing, invalid, or expired access token.",
    fix: "Re-issue a token via /v1/auth/token. Check the token has not expired (1 hour TTL).",
  },
  {
    code: 403,
    name: "forbidden",
    description: "Authenticated but the token lacks the required scope or role.",
    fix: "Request a token with the correct scope (e.g. bookings:write). Hosts and tenants have different permissions.",
  },
  {
    code: 404,
    name: "not_found",
    description: "Resource does not exist or is not visible to this token.",
    fix: "Confirm the resource ID. Some resources are owner-scoped and invisible to other users.",
  },
  {
    code: 409,
    name: "conflict",
    description: "The resource is in a state that conflicts with the request (e.g. booking already confirmed).",
    fix: "Refetch the resource and reconcile state before retrying.",
  },
  {
    code: 422,
    name: "unprocessable_entity",
    description: "Validation failed - the request is well-formed but semantically invalid.",
    fix: "Inspect error.details. Common causes: check_out before check_in, weekly_rent below minimum, missing verification.",
  },
  {
    code: 429,
    name: "rate_limited",
    description: "You have exceeded the request rate limit for this token.",
    fix: "Respect the Retry-After header. Default limit is 600 requests / minute / token.",
  },
  {
    code: 500,
    name: "internal_error",
    description: "An unexpected error occurred on the MigRent side.",
    fix: "Retry with exponential backoff. If the error persists, include the request_id when contacting support.",
  },
];

export const webhookEvents: WebhookEvent[] = [
  { name: "booking.created", description: "A tenant has submitted a booking request." },
  { name: "booking.confirmed", description: "A host has accepted a booking request." },
  { name: "booking.cancelled", description: "Either party cancelled the booking." },
  { name: "booking.completed", description: "Check-out has occurred and the booking is closed." },
  { name: "payment.completed", description: "A rent or bond payment cleared successfully." },
  { name: "payment.failed", description: "A scheduled payment failed - retry policy applies." },
  { name: "listing.published", description: "A host has published a listing - it is now searchable." },
  { name: "listing.unlisted", description: "A listing has been unpublished." },
  { name: "profile.verified", description: "Identity, visa, or ABN verification completed." },
  { name: "message.received", description: "A new in-platform message was sent between users." },
];

export const changelog: ChangelogEntry[] = [
  {
    version: "v1.4.0",
    date: "2026-05-01",
    status: "stable",
    changes: [
      "Added instant-book flag on /v1/listings - tenants can now skip host approval where the host opts in.",
      "Webhook deliveries now include X-MigRent-Delivery-Id for replay tracking.",
      "Pagination cursors are now opaque base64 strings - older numeric page params still work for v1.",
    ],
  },
  {
    version: "v1.3.0",
    date: "2026-03-12",
    status: "stable",
    changes: [
      "New booking lifecycle: request -> approved -> confirmed -> active -> completed.",
      "Added bond_status field to booking responses (held, partial_refund, released, forfeited).",
      "Bond refunds now return an estimated_refund_date in the cancel response.",
    ],
  },
  {
    version: "v1.2.0",
    date: "2026-01-20",
    status: "stable",
    changes: [
      "Profile verification now supports Australian visa grant notices (subclass 500, 482, 186, 189).",
      "Listings can include house_rules as a structured array (no_smoking, no_pets, quiet_after_10pm).",
      "Improved error.details shape - field-level validation errors now include path and message.",
    ],
  },
  {
    version: "v1.1.0",
    date: "2025-11-15",
    status: "stable",
    changes: [
      "Added Idempotency-Key support on POST /v1/bookings and POST /v1/listings.",
      "Rate limits raised from 300/min to 600/min for authenticated tokens.",
    ],
  },
  {
    version: "v1.0.0",
    date: "2025-09-01",
    status: "stable",
    changes: [
      "Public v1 launch: listings, bookings, profiles, webhooks.",
      "OAuth 2.0 client_credentials and authorization_code flows.",
    ],
  },
];

export const quickstartCurl = `curl https://api.migrent.ai/v1/listings?suburb=Bondi \\
  -H "Authorization: Bearer $MIGRENT_ACCESS_TOKEN" \\
  -H "Accept: application/json"`;

export const quickstartTokenCurl = `curl -X POST https://api.migrent.ai/v1/auth/token \\
  -H "Content-Type: application/json" \\
  -d '{
    "grant_type": "client_credentials",
    "client_id": "'"$MIGRENT_CLIENT_ID"'",
    "client_secret": "'"$MIGRENT_CLIENT_SECRET"'",
    "scope": "listings:read"
  }'`;

export const quickstartNode = `import { MigRent } from "@migrent/sdk"; // planned - V2

const migrent = new MigRent({
  clientId: process.env.MIGRENT_CLIENT_ID,
  clientSecret: process.env.MIGRENT_CLIENT_SECRET,
  environment: "sandbox",
});

const { data, pagination } = await migrent.listings.list({
  suburb: "Bondi",
  max_price: 500,
  per_page: 20,
});

console.log(\`Found \${pagination.total} listings\`);`;

export const webhookVerifyNode = `import crypto from "node:crypto";
import express from "express";

const app = express();

// Important: use the raw body, not the parsed JSON, for signature verification.
app.post(
  "/webhooks/migrent",
  express.raw({ type: "application/json" }),
  (req, res) => {
    const signature = req.header("X-MigRent-Signature");
    const timestamp = req.header("X-MigRent-Timestamp");
    const secret = process.env.MIGRENT_WEBHOOK_SECRET;

    const payload = \`\${timestamp}.\${req.body.toString("utf8")}\`;
    const expected = crypto
      .createHmac("sha256", secret)
      .update(payload)
      .digest("hex");

    if (signature !== expected) {
      return res.status(400).send("Invalid signature");
    }

    const event = JSON.parse(req.body.toString("utf8"));

    switch (event.type) {
      case "booking.confirmed":
        // handle confirmed booking
        break;
      case "payment.failed":
        // handle failed payment
        break;
    }

    res.status(200).send("ok");
  }
);`;

export const errorShapeJson = JSON.stringify(
  {
    error: {
      code: "unprocessable_entity",
      status: 422,
      message: "check_out must be after check_in",
      request_id: "req_01HK9X2A6F3M7Q8RZD5C4N1V0E",
      details: [
        { path: "check_out", message: "must be after check_in" },
      ],
      doc_url: "https://migrent-ai.vercel.app/developers#errors",
    },
  },
  null,
  2
);

export const paginationJson = JSON.stringify(
  {
    data: ["..."],
    pagination: {
      page: 2,
      per_page: 20,
      total: 142,
      total_pages: 8,
      next_cursor: "eyJpZCI6Imxzd...",
      prev_cursor: "eyJpZCI6Imxzc...",
    },
  },
  null,
  2
);
