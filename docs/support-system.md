# MigRent Support System - Architecture & Operations Guide

## System Overview

```
User (in-app/email/form)
    |
    v
[FastAPI Backend] --> POST /support/tickets
    |                     |
    |                     +--> Insert into `tickets` + `ticket_messages`
    |                     +--> Fire n8n webhook (new-ticket)
    |                     +--> Send confirmation email via Resend
    v
[n8n Automation]
    |
    +--> New Ticket Notification (email to agent + Slack)
    +--> SLA Reminders (cron every 15 min)
    +--> CSAT Follow-up (on resolved)
    |
    v
[Agent Dashboard] --> /support/agent
    |
    +--> View all tickets with filters
    +--> Reply, change status/priority
    +--> Add internal notes
    +--> View analytics
```

---

## N8N Workflows

### Workflow 1: New Ticket Notification

**Trigger:** HTTP Webhook `POST /webhook/new-ticket`

**Payload from FastAPI:**
```json
{
  "ticket_id": "abc123...",
  "subject": "Can't verify my identity",
  "category": "verification",
  "priority": "high",
  "email": "user@example.com",
  "name": "John Doe",
  "message": "I uploaded my passport but verification failed..."
}
```

**Nodes:**
1. **Webhook** - Receive POST from FastAPI
2. **Resend (Agent Alert)** - Send email to support@migrent-ai.com
   ```
   Subject: [New Ticket - {{priority}}] {{subject}}
   Body: Ticket from {{name}} ({{email}})
         Category: {{category}}
         Message: {{message}}
         Link: https://migrent-ai.vercel.app/support/agent/{{ticket_id}}
   ```
3. **Slack (Optional)** - Post to #support channel
   ```
   New support ticket ({{priority}}):
   {{subject}} from {{name}}
   Category: {{category}}
   ```

### Workflow 2: SLA Reminders

**Trigger:** Cron - every 15 minutes

**Nodes:**
1. **Cron** - `*/15 * * * *`
2. **Supabase HTTP** - Query overdue tickets:
   ```
   GET /rest/v1/tickets
     ?status=in.(open,pending_customer)
     &updated_at=lt.{{24_hours_ago}}
     &order=updated_at.asc
   Headers:
     apikey: {{SUPABASE_SERVICE_ROLE_KEY}}
     Authorization: Bearer {{SUPABASE_SERVICE_ROLE_KEY}}
   ```
3. **IF** - Split by status
4. **For open tickets (agent overdue):**
   - Resend email to support@migrent-ai.com:
     ```
     Subject: SLA Warning: {{count}} overdue tickets
     Body: The following tickets haven't been responded to in 24+ hours:
           {{ticket_list with links}}
     ```
5. **For pending_customer tickets:**
   - Resend gentle reminder to customer:
     ```
     Subject: We're waiting for your reply - MigRent Support
     Body: Hi {{name}},
           We noticed you haven't responded to your support ticket yet.
           Your ticket: {{subject}}
           Reply here: https://migrent-ai.vercel.app/support/tickets/{{ticket_id}}
     ```

### Workflow 3: CSAT Follow-up

**Trigger:** HTTP Webhook `POST /webhook/ticket-resolved`

**Payload from FastAPI:**
```json
{
  "ticket_id": "abc123...",
  "subject": "Can't verify my identity",
  "email": "user@example.com"
}
```

**Nodes:**
1. **Webhook** - Receive POST from FastAPI
2. **Wait** - 2 hours delay
3. **Resend (CSAT Email)** - Send to customer:
   ```
   Subject: How did we do? Rate your MigRent support experience
   Body:
     Hi there,

     Your ticket "{{subject}}" has been resolved.
     We'd love to hear how we did!

     Rate your experience:
     [1] [2] [3] [4] [5]

     Each number links to:
     https://migrent-ai.vercel.app/support/tickets/{{ticket_id}}?csat={{rating}}
   ```

### Setting up n8n webhooks

Set the `N8N_WEBHOOK_BASE` environment variable on Railway:
```
N8N_WEBHOOK_BASE=https://your-n8n-instance.com/webhook
```

The FastAPI backend fires webhooks to:
- `{N8N_WEBHOOK_BASE}/new-ticket`
- `{N8N_WEBHOOK_BASE}/agent-reply`
- `{N8N_WEBHOOK_BASE}/ticket-resolved`

---

## Analytics & Metrics Model

### Fields Tracked Per Ticket

| Metric | Field | How It's Set |
|--------|-------|-------------|
| First Response Time | `tickets.first_response_at` | Set when agent first replies |
| Resolution Time | `tickets.resolved_at` | Set when status changes to "resolved" |
| CSAT Rating | `tickets.csat_rating` | Set via CSAT follow-up |
| Message Count | Count of `ticket_messages` | Computed on read |

### Computed Metrics (from `/support/analytics/summary`)

- **Total tickets** by status, priority, category
- **Average CSAT** across all rated tickets
- **Open vs resolved** ratio

### Future Dashboards to Build

1. **Tickets by Category** - Bar chart showing which categories generate most tickets
2. **Average First Response Time** - Line chart over time (goal: < 4 hours)
3. **Average Resolution Time** - Line chart over time (goal: < 24 hours)
4. **CSAT by Category** - Which categories have lowest satisfaction
5. **New vs Returning Users** - Are repeat users creating tickets? (join on user_id)
6. **Volume Over Time** - Daily/weekly ticket creation trends

### How to Compute Advanced Metrics

For first response time and resolution time, run a nightly SQL job (or Supabase Edge Function):

```sql
-- Average first response time (in hours) for last 30 days
SELECT
  AVG(EXTRACT(EPOCH FROM (first_response_at - created_at)) / 3600) as avg_hours
FROM tickets
WHERE first_response_at IS NOT NULL
  AND created_at > now() - interval '30 days';

-- Average resolution time (in hours) for last 30 days
SELECT
  AVG(EXTRACT(EPOCH FROM (resolved_at - created_at)) / 3600) as avg_hours
FROM tickets
WHERE resolved_at IS NOT NULL
  AND created_at > now() - interval '30 days';

-- Tickets by category for last 30 days
SELECT category, COUNT(*) as count
FROM tickets
WHERE created_at > now() - interval '30 days'
GROUP BY category
ORDER BY count DESC;

-- CSAT by category
SELECT category, AVG(csat_rating) as avg_csat, COUNT(*) as rated_count
FROM tickets
WHERE csat_rating IS NOT NULL
GROUP BY category
ORDER BY avg_csat ASC;
```

---

## File Map

### Backend
```
backend/
  models_support.py           - Pydantic models (TicketCreate, HelpArticleCreate, etc.)
  routes_support_tickets.py   - All support API endpoints
  routes_support.py           - Original contact form (kept for backwards compat)
  migrations/018_support_system.sql - Full schema
```

### Frontend
```
frontend/
  components/support/
    SupportWidget.tsx          - Floating help button + panel
    TicketList.tsx             - Reusable ticket list
    TicketDetail.tsx           - Ticket detail with messages, CSAT, agent controls
  pages/
    help/
      index.tsx                - Help center landing (search + categories)
      [slug].tsx               - Individual help article
    support/
      tickets/
        index.tsx              - "My Tickets" for logged-in users
        [id].tsx               - User ticket detail
      agent/
        index.tsx              - Agent dashboard with filters + analytics
        [id].tsx               - Agent ticket detail with controls
  lib/
    api.ts                     - All support API functions (createTicket, listTickets, etc.)
```

### Database Tables
```
tickets                    - Main ticket records
ticket_messages            - Thread of messages per ticket
ticket_tags               - Tag definitions
ticket_tag_links          - Many-to-many ticket <-> tag
help_articles             - Knowledge base articles
help_article_categories   - Article categories
support_events            - Audit log for all ticket changes
```

---

## Deployment Checklist

1. Run `migrations/018_support_system.sql` in Supabase SQL Editor
2. Set `N8N_WEBHOOK_BASE` in Railway environment variables
3. Ensure `RESEND_API_KEY` is set in Railway
4. Push code to GitHub (auto-deploys to Railway + Vercel)
5. Create n8n workflows matching the specs above
6. Seed some help articles via `POST /support/help/articles` (agent auth required)
7. Test the full flow: widget -> create ticket -> agent reply -> resolve -> CSAT

## Channel Stubs (Future)

For WhatsApp/phone support, add these to the ticket `source` check constraint:
```sql
ALTER TABLE tickets DROP CONSTRAINT tickets_source_check;
ALTER TABLE tickets ADD CONSTRAINT tickets_source_check
  CHECK (source IN ('in_app', 'email', 'contact_form', 'whatsapp', 'phone'));
```

Then create n8n workflows that receive WhatsApp webhooks (via Twilio or similar) and create tickets via the API.
