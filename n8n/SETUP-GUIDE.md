
---

## Step 1: Import the Workflow

1. Open your N8N instance
2. Click **"Add workflow"** (or `Ctrl+K` → "New workflow")
3. Click the **three dots (⋯)** menu in the top bar → **"Import from File"**
4. Select `migrent-support-draft-workflow.json`
5. The workflow will load with all 7 nodes

---

## Step 2: Set Up Gmail OAuth Credentials

1. In N8N, go to **Settings → Credentials → Add Credential**
2. Search for **"Gmail OAuth2 API"**
3. You'll need a Google Cloud OAuth Client:

### Google Cloud Setup:
1. Go to [Google Cloud Console](https://console.cloud.google.com)
2. Select or create a project
3. **APIs & Services → Enable APIs** → Enable **Gmail API**
4. **APIs & Services → Credentials → Create Credentials → OAuth Client ID**
   - Application type: **Web application**
   - Authorized redirect URI: Copy from N8N's credential setup page (usually `https://your-n8n.com/rest/oauth2-credential/callback`)
5. Copy the **Client ID** and **Client Secret** back into N8N
6. Click **"Sign in with Google"** and authorize with `migrentau@gmail.com`
7. Grant permissions for reading email and creating drafts

---

## Step 3: Configure Each Node

### Node 1: Gmail Trigger - Watch Support Emails
- **Credential**: Select your Gmail OAuth credential
- **Poll Times**: Every minute (adjust as needed)
- **Filters**:
  - Read Status: `Unread`
  - Subject contains: `New support request from`
- This watches for incoming Resend notification emails

### Node 2: Parse Resend Email Body (Code Node)
- No configuration needed - the JavaScript parses the HTML email body
- It extracts: Name, Email, Role, Message from the Resend format:
  ```
  Subject: "New support request from Jane Doe (seeker)"
  Body: <p><strong>Name:</strong> Jane Doe</p>
        <p><strong>Email:</strong> jane@example.com</p>
        <p><strong>Role:</strong> seeker</p>
        <p><strong>Message:</strong></p>
        <p>I need help...</p>
  ```

### Node 3: Filter - Has Valid Email
- Ensures we only create drafts when a sender email was successfully parsed
- No configuration needed

### Node 4: Gmail - Create Draft Reply
- **IMPORTANT MANUAL STEP**: After import, you must configure this node:
  1. Click the node to open it
  2. Set **Resource** → `Draft`
  3. Set **Operation** → `Create`
  4. **Credential**: Select your Gmail OAuth credential
  5. The To, Subject, and Body fields are already configured with expressions

### Node 5: Format Notification (Code Node)
- Formats the notification message - no configuration needed

### Node 6: Gmail - Notify Draft Ready
- Sends you a self-notification email when a draft is created
- **Credential**: Select your Gmail OAuth credential

### Node 7: Slack - Notify Draft Ready (Optional)
- **Disabled by default** - enable if you want Slack notifications
- Requires Slack OAuth credential
- Set the channel in the node configuration

---

## Step 4: Test the Workflow

1. Click **"Test workflow"** in the top bar
2. Send a test contact form submission on your site
3. Or manually trigger by sending an email to `support@migrent-ai.com` / `migrentau@gmail.com` with:
   - Subject: `New support request from Test User (seeker)`
   - Body containing the HTML format above
4. Check that a draft appears in Gmail

---

## Step 5: Activate

1. Toggle the **Active** switch in the top-right corner
2. The workflow will now run automatically

---

## How the Smart Reply Works

The Code node analyzes the message content and generates contextual responses:

| Keywords Detected | Response Type |
|---|---|
| login, password, access | Account access troubleshooting |
| payment, refund, billing | Billing concern acknowledgment |
| listing, property, room | Listing help (different for owner vs seeker) |
| bug, error, broken | Bug report acknowledgment + info request |
| verify, verification, ID | Verification process explanation |
| message, chat, contact | Messaging help |
| (none of the above) | Generic follow-up response |

---

## Draft Email Format

The created draft looks like:

```
To: jane@example.com
Subject: Re: New support request from Jane Doe (seeker) - Jane Doe

Hi Jane Doe,

Thanks for reaching out about your Room Seeker account on MigRent AI.

Regarding "I need help finding a room near the CBD...":

  [Contextual response based on issue type]

Quick links:
  - Your Dashboard
  - Your Profile
  - Messages
  - Browse Listings

Best Wishes,
MigRent AI Support
```

---

## Troubleshooting

| Issue | Solution |
|---|---|
| No emails detected | Check Gmail Trigger filter - subject must contain "New support request from" |
| Email not parsed | Check the Resend email format matches the expected HTML structure |
| Draft not created | Verify Gmail OAuth has draft creation permissions |
| Wrong sender email | The parser reads from the email body, not the From header (Resend sends from resend@resend.dev) |

---

## Architecture

```
┌─────────────────┐     ┌──────────────┐     ┌─────────────┐
│  Gmail Trigger   │────▶│  Parse Email  │────▶│   Filter    │
│  (poll/1min)     │     │  (Code node)  │     │ (has email) │
└─────────────────┘     └──────────────┘     └──────┬──────┘
                                                     │
                                                     ▼
┌─────────────────┐     ┌──────────────┐     ┌─────────────┐
│  Notify (Email   │◀───│   Format     │◀────│ Create Gmail│
│  + Slack)        │     │ Notification │     │    Draft    │
└─────────────────┘     └──────────────┘     └─────────────┘
```
