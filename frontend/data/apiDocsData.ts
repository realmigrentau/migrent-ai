export interface ApiEndpoint {
  method: "GET" | "POST" | "PUT" | "DELETE";
  path: string;
  description: string;
  auth: boolean;
  params?: { name: string; type: string; required: boolean; description: string }[];
  requestBody?: string;
  responseExample: string;
}

export interface ApiSection {
  id: string;
  title: string;
  description: string;
  endpoints: ApiEndpoint[];
}

const sections: ApiSection[] = [
  {
    id: "authentication",
    title: "Authentication",
    description:
      "MigRent API supports two authentication methods: API key authentication for server-to-server requests, and OAuth 2.0 for user-facing applications. All API requests must be authenticated. API keys should be included in the X-API-Key header, while OAuth tokens should use the standard Authorization: Bearer header.",
    endpoints: [
      {
        method: "POST",
        path: "/v1/auth/token",
        description:
          "Exchange client credentials for an access token using OAuth 2.0 client credentials flow.",
        auth: false,
        requestBody: JSON.stringify(
          {
            grant_type: "client_credentials",
            client_id: "your_client_id",
            client_secret: "your_client_secret",
            scope: "listings:read bookings:write profiles:read",
          },
          null,
          2
        ),
        responseExample: JSON.stringify(
          {
            access_token: "eyJhbGciOiJSUzI1NiIsInR5cCI6IkpXVCJ9...",
            token_type: "Bearer",
            expires_in: 3600,
            scope: "listings:read bookings:write profiles:read",
          },
          null,
          2
        ),
      },
      {
        method: "POST",
        path: "/v1/auth/token/refresh",
        description:
          "Refresh an expired access token using a refresh token. Only available for OAuth 2.0 authorization code flow.",
        auth: false,
        requestBody: JSON.stringify(
          {
            grant_type: "refresh_token",
            refresh_token: "dGhpcyBpcyBhIHJlZnJlc2ggdG9rZW4...",
            client_id: "your_client_id",
          },
          null,
          2
        ),
        responseExample: JSON.stringify(
          {
            access_token: "eyJhbGciOiJSUzI1NiIsInR5cCI6IkpXVCJ9...",
            token_type: "Bearer",
            expires_in: 3600,
            refresh_token: "bmV3IHJlZnJlc2ggdG9rZW4...",
          },
          null,
          2
        ),
      },
      {
        method: "POST",
        path: "/v1/auth/revoke",
        description: "Revoke an access token or refresh token. Use this when a user logs out or you need to invalidate credentials.",
        auth: true,
        requestBody: JSON.stringify(
          {
            token: "eyJhbGciOiJSUzI1NiIsInR5cCI6IkpXVCJ9...",
            token_type_hint: "access_token",
          },
          null,
          2
        ),
        responseExample: JSON.stringify(
          {
            success: true,
            message: "Token revoked successfully",
          },
          null,
          2
        ),
      },
    ],
  },
  {
    id: "listings",
    title: "Listings",
    description:
      "Manage rental property listings. Listings represent available rooms or properties that tenants can browse, search, and book. Each listing includes details about the property, pricing, availability, and the host profile.",
    endpoints: [
      {
        method: "GET",
        path: "/v1/listings",
        description:
          "Retrieve a paginated list of rental listings. Supports filtering by location, price range, room type, and availability dates.",
        auth: true,
        params: [
          { name: "suburb", type: "string", required: false, description: "Filter by suburb name (e.g., 'Bondi', 'Newtown')" },
          { name: "min_price", type: "number", required: false, description: "Minimum weekly rent in AUD" },
          { name: "max_price", type: "number", required: false, description: "Maximum weekly rent in AUD" },
          { name: "room_type", type: "string", required: false, description: "Room type: single, double, ensuite, studio" },
          { name: "available_from", type: "string", required: false, description: "Availability start date (ISO 8601 format)" },
          { name: "page", type: "number", required: false, description: "Page number for pagination (default: 1)" },
          { name: "per_page", type: "number", required: false, description: "Results per page, max 50 (default: 20)" },
        ],
        responseExample: JSON.stringify(
          {
            data: [
              {
                id: "lst_a1b2c3d4",
                title: "Sunny single room in Bondi",
                suburb: "Bondi",
                room_type: "single",
                weekly_rent: 380,
                bond: 1520,
                available_from: "2026-03-01",
                features: ["wifi", "furnished", "bills_included"],
                host: { id: "usr_x1y2z3", name: "Sarah M.", verified: true },
                images: ["https://cdn.migrent.ai/img/lst_a1b2c3d4_1.jpg"],
                created_at: "2026-02-15T10:30:00Z",
              },
            ],
            pagination: { page: 1, per_page: 20, total: 142, total_pages: 8 },
          },
          null,
          2
        ),
      },
      {
        method: "GET",
        path: "/v1/listings/:id",
        description:
          "Retrieve full details for a specific listing including all images, host profile, reviews, and availability calendar.",
        auth: true,
        params: [
          { name: "id", type: "string", required: true, description: "The listing ID (e.g., lst_a1b2c3d4)" },
        ],
        responseExample: JSON.stringify(
          {
            id: "lst_a1b2c3d4",
            title: "Sunny single room in Bondi",
            description: "A bright, furnished single room in a shared house...",
            suburb: "Bondi",
            address: "Available after booking confirmation",
            room_type: "single",
            weekly_rent: 380,
            bond: 1520,
            min_stay_weeks: 4,
            available_from: "2026-03-01",
            available_to: null,
            features: ["wifi", "furnished", "bills_included", "laundry", "parking"],
            house_rules: ["no_smoking", "no_pets", "quiet_after_10pm"],
            host: {
              id: "usr_x1y2z3",
              name: "Sarah M.",
              verified: true,
              response_rate: 0.95,
              avg_rating: 4.8,
            },
            images: [
              "https://cdn.migrent.ai/img/lst_a1b2c3d4_1.jpg",
              "https://cdn.migrent.ai/img/lst_a1b2c3d4_2.jpg",
            ],
            reviews_summary: { count: 23, avg_rating: 4.7 },
            created_at: "2026-02-15T10:30:00Z",
            updated_at: "2026-02-18T14:00:00Z",
          },
          null,
          2
        ),
      },
      {
        method: "POST",
        path: "/v1/listings",
        description:
          "Create a new rental listing. Requires host role permissions. The listing will be in draft status until published.",
        auth: true,
        requestBody: JSON.stringify(
          {
            title: "Cozy double room in Newtown",
            description: "A spacious double room in a friendly share house...",
            suburb: "Newtown",
            room_type: "double",
            weekly_rent: 430,
            bond: 1720,
            min_stay_weeks: 4,
            available_from: "2026-04-01",
            features: ["wifi", "furnished", "bills_included"],
            house_rules: ["no_smoking"],
            images: ["https://cdn.migrent.ai/img/upload_temp_1.jpg"],
          },
          null,
          2
        ),
        responseExample: JSON.stringify(
          {
            id: "lst_e5f6g7h8",
            status: "draft",
            title: "Cozy double room in Newtown",
            created_at: "2026-02-20T09:00:00Z",
            message: "Listing created. Publish to make it visible to tenants.",
          },
          null,
          2
        ),
      },
      {
        method: "PUT",
        path: "/v1/listings/:id",
        description:
          "Update an existing listing. Only the listing owner can update. Partial updates are supported.",
        auth: true,
        params: [
          { name: "id", type: "string", required: true, description: "The listing ID to update" },
        ],
        requestBody: JSON.stringify(
          {
            weekly_rent: 450,
            available_from: "2026-04-15",
            features: ["wifi", "furnished", "bills_included", "parking"],
          },
          null,
          2
        ),
        responseExample: JSON.stringify(
          {
            id: "lst_e5f6g7h8",
            status: "published",
            weekly_rent: 450,
            available_from: "2026-04-15",
            updated_at: "2026-02-20T11:30:00Z",
            message: "Listing updated successfully.",
          },
          null,
          2
        ),
      },
      {
        method: "DELETE",
        path: "/v1/listings/:id",
        description:
          "Delete a listing. Only the listing owner can delete. Active bookings must be resolved before deletion.",
        auth: true,
        params: [
          { name: "id", type: "string", required: true, description: "The listing ID to delete" },
        ],
        responseExample: JSON.stringify(
          {
            success: true,
            message: "Listing lst_e5f6g7h8 has been deleted.",
          },
          null,
          2
        ),
      },
    ],
  },
  {
    id: "bookings",
    title: "Bookings",
    description:
      "Manage rental bookings between tenants and hosts. A booking represents a confirmed rental agreement for a specific listing and date range. Bookings go through several states: pending, confirmed, active, completed, or cancelled.",
    endpoints: [
      {
        method: "GET",
        path: "/v1/bookings",
        description:
          "List all bookings for the authenticated user. Returns both bookings as a tenant and as a host.",
        auth: true,
        params: [
          { name: "status", type: "string", required: false, description: "Filter by status: pending, confirmed, active, completed, cancelled" },
          { name: "role", type: "string", required: false, description: "Filter by role: tenant, host" },
          { name: "page", type: "number", required: false, description: "Page number (default: 1)" },
          { name: "per_page", type: "number", required: false, description: "Results per page, max 50 (default: 20)" },
        ],
        responseExample: JSON.stringify(
          {
            data: [
              {
                id: "bkg_m1n2o3p4",
                listing_id: "lst_a1b2c3d4",
                listing_title: "Sunny single room in Bondi",
                tenant: { id: "usr_q5r6s7", name: "Alex T." },
                host: { id: "usr_x1y2z3", name: "Sarah M." },
                status: "confirmed",
                check_in: "2026-03-01",
                check_out: "2026-06-01",
                weekly_rent: 380,
                total_bond: 1520,
                created_at: "2026-02-18T16:00:00Z",
              },
            ],
            pagination: { page: 1, per_page: 20, total: 3, total_pages: 1 },
          },
          null,
          2
        ),
      },
      {
        method: "GET",
        path: "/v1/bookings/:id",
        description:
          "Retrieve full details of a specific booking including payment history and communication log.",
        auth: true,
        params: [
          { name: "id", type: "string", required: true, description: "The booking ID" },
        ],
        responseExample: JSON.stringify(
          {
            id: "bkg_m1n2o3p4",
            listing_id: "lst_a1b2c3d4",
            listing_title: "Sunny single room in Bondi",
            tenant: { id: "usr_q5r6s7", name: "Alex T.", email: "alex@example.com" },
            host: { id: "usr_x1y2z3", name: "Sarah M.", email: "sarah@example.com" },
            status: "confirmed",
            check_in: "2026-03-01",
            check_out: "2026-06-01",
            weekly_rent: 380,
            total_bond: 1520,
            bond_status: "held",
            payments: [
              { id: "pay_001", amount: 1520, type: "bond", status: "completed", date: "2026-02-18T16:05:00Z" },
              { id: "pay_002", amount: 380, type: "rent", status: "completed", date: "2026-03-01T00:00:00Z" },
            ],
            created_at: "2026-02-18T16:00:00Z",
            updated_at: "2026-03-01T00:01:00Z",
          },
          null,
          2
        ),
      },
      {
        method: "POST",
        path: "/v1/bookings",
        description:
          "Create a new booking request for a listing. The booking starts in pending status and the host must confirm within 48 hours.",
        auth: true,
        requestBody: JSON.stringify(
          {
            listing_id: "lst_a1b2c3d4",
            check_in: "2026-03-01",
            check_out: "2026-06-01",
            message: "Hi Sarah, I am a student from India arriving in March. I would love to rent this room.",
          },
          null,
          2
        ),
        responseExample: JSON.stringify(
          {
            id: "bkg_m1n2o3p4",
            status: "pending",
            listing_id: "lst_a1b2c3d4",
            check_in: "2026-03-01",
            check_out: "2026-06-01",
            weekly_rent: 380,
            total_bond: 1520,
            expires_at: "2026-02-20T16:00:00Z",
            message: "Booking request sent. The host has 48 hours to respond.",
          },
          null,
          2
        ),
      },
      {
        method: "PUT",
        path: "/v1/bookings/:id/cancel",
        description:
          "Cancel a booking. Cancellation policy varies based on timing and booking status. Bond refunds are processed according to the cancellation policy.",
        auth: true,
        params: [
          { name: "id", type: "string", required: true, description: "The booking ID to cancel" },
        ],
        requestBody: JSON.stringify(
          {
            reason: "Change of plans, no longer moving to Sydney.",
            request_bond_refund: true,
          },
          null,
          2
        ),
        responseExample: JSON.stringify(
          {
            id: "bkg_m1n2o3p4",
            status: "cancelled",
            cancelled_at: "2026-02-19T10:00:00Z",
            cancelled_by: "tenant",
            refund: {
              bond_refund: 1520,
              rent_refund: 0,
              refund_status: "processing",
              estimated_refund_date: "2026-02-26",
            },
            message: "Booking cancelled. Full bond refund will be processed within 5-7 business days.",
          },
          null,
          2
        ),
      },
    ],
  },
  {
    id: "profiles",
    title: "Profiles",
    description:
      "Manage user profiles for tenants and hosts. Profiles include personal information, verification status, preferences, and rental history. Verified profiles receive higher trust scores and better visibility in search results.",
    endpoints: [
      {
        method: "GET",
        path: "/v1/profiles/me",
        description:
          "Retrieve the authenticated user's profile including verification status, preferences, and statistics.",
        auth: true,
        responseExample: JSON.stringify(
          {
            id: "usr_q5r6s7",
            email: "alex@example.com",
            legal_name: "Alex Thompson",
            preferred_name: "Alex",
            phone: "+61 400 123 456",
            avatar_url: "https://cdn.migrent.ai/avatars/usr_q5r6s7.jpg",
            role: "tenant",
            verification: {
              email: true,
              phone: true,
              identity: true,
              visa: true,
            },
            preferences: {
              suburb_alerts: ["Bondi", "Newtown", "Surry Hills"],
              max_budget: 450,
              room_types: ["single", "double"],
              move_in_date: "2026-03-01",
            },
            stats: {
              bookings_completed: 2,
              avg_rating: 4.9,
              member_since: "2025-11-01T00:00:00Z",
            },
            created_at: "2025-11-01T00:00:00Z",
            updated_at: "2026-02-18T12:00:00Z",
          },
          null,
          2
        ),
      },
      {
        method: "PUT",
        path: "/v1/profiles/me",
        description:
          "Update the authenticated user's profile information and preferences. Partial updates are supported.",
        auth: true,
        requestBody: JSON.stringify(
          {
            preferred_name: "Alex T.",
            phone: "+61 400 999 888",
            preferences: {
              suburb_alerts: ["Bondi", "Newtown", "Marrickville"],
              max_budget: 500,
            },
          },
          null,
          2
        ),
        responseExample: JSON.stringify(
          {
            id: "usr_q5r6s7",
            preferred_name: "Alex T.",
            phone: "+61 400 999 888",
            updated_at: "2026-02-20T14:30:00Z",
            message: "Profile updated successfully.",
          },
          null,
          2
        ),
      },
      {
        method: "POST",
        path: "/v1/profiles/me/verify",
        description:
          "Submit identity or visa documents for verification. Supports passport, driver's license, and Australian visa grant notices. Verification is typically completed within 24-48 hours.",
        auth: true,
        requestBody: JSON.stringify(
          {
            document_type: "passport",
            document_country: "IN",
            document_number: "REDACTED",
            document_expiry: "2030-06-15",
            document_image_front: "https://cdn.migrent.ai/uploads/doc_front_abc123.jpg",
            document_image_back: null,
          },
          null,
          2
        ),
        responseExample: JSON.stringify(
          {
            verification_id: "ver_t8u9v0w1",
            document_type: "passport",
            status: "pending_review",
            submitted_at: "2026-02-20T15:00:00Z",
            estimated_completion: "2026-02-22T15:00:00Z",
            message: "Document submitted for verification. You will be notified once review is complete.",
          },
          null,
          2
        ),
      },
    ],
  },
  {
    id: "webhooks",
    title: "Webhooks",
    description:
      "Subscribe to real-time event notifications via webhooks. When an event occurs (e.g., a booking is confirmed, a payment is received), MigRent will send an HTTP POST request to your registered endpoint. Webhook payloads are signed with your webhook secret for security verification.",
    endpoints: [
      {
        method: "POST",
        path: "/v1/webhooks",
        description:
          "Register a new webhook endpoint. Specify the URL to receive events and which event types to subscribe to.",
        auth: true,
        requestBody: JSON.stringify(
          {
            url: "https://yourapp.com/webhooks/migrent",
            events: [
              "booking.created",
              "booking.confirmed",
              "booking.cancelled",
              "payment.completed",
              "payment.failed",
              "listing.published",
              "profile.verified",
            ],
            secret: "whsec_your_signing_secret",
          },
          null,
          2
        ),
        responseExample: JSON.stringify(
          {
            id: "whk_a2b3c4d5",
            url: "https://yourapp.com/webhooks/migrent",
            events: [
              "booking.created",
              "booking.confirmed",
              "booking.cancelled",
              "payment.completed",
              "payment.failed",
              "listing.published",
              "profile.verified",
            ],
            status: "active",
            created_at: "2026-02-20T16:00:00Z",
            message: "Webhook registered. A test event will be sent to verify your endpoint.",
          },
          null,
          2
        ),
      },
      {
        method: "GET",
        path: "/v1/webhooks",
        description:
          "List all registered webhook endpoints for the authenticated application, including their status and event subscriptions.",
        auth: true,
        params: [
          { name: "status", type: "string", required: false, description: "Filter by status: active, paused, failed" },
        ],
        responseExample: JSON.stringify(
          {
            data: [
              {
                id: "whk_a2b3c4d5",
                url: "https://yourapp.com/webhooks/migrent",
                events: ["booking.created", "booking.confirmed", "payment.completed"],
                status: "active",
                last_delivery: {
                  event: "booking.confirmed",
                  status: 200,
                  timestamp: "2026-02-20T15:45:00Z",
                },
                created_at: "2026-02-20T16:00:00Z",
              },
              {
                id: "whk_e6f7g8h9",
                url: "https://yourapp.com/webhooks/migrent-payments",
                events: ["payment.completed", "payment.failed"],
                status: "active",
                last_delivery: null,
                created_at: "2026-02-19T10:00:00Z",
              },
            ],
            total: 2,
          },
          null,
          2
        ),
      },
      {
        method: "DELETE",
        path: "/v1/webhooks/:id",
        description:
          "Unsubscribe and delete a webhook endpoint. Events will no longer be delivered to this URL once deleted.",
        auth: true,
        params: [
          { name: "id", type: "string", required: true, description: "The webhook ID to delete" },
        ],
        responseExample: JSON.stringify(
          {
            success: true,
            message: "Webhook whk_e6f7g8h9 has been deleted. Events will no longer be delivered to this endpoint.",
          },
          null,
          2
        ),
      },
    ],
  },
];

export function getAllSections(): ApiSection[] {
  return sections;
}

export function getSectionById(id: string): ApiSection | undefined {
  return sections.find((s) => s.id === id);
}
