# MigRent AI Feature Implementation Guide

This guide covers the complete implementation of:
1. **Messaging System** - Real-time chat between seekers and owners
2. **Enhanced Search** - Destination filters, date picker, guest selection, "Near me"
3. **Wishlist** - Save listings, sync to profile
4. **Account Settings Redesign** - Tabbed interface with extended profile fields

---

## 1. Database Setup

### Apply Migration

Run the SQL migration to set up messaging and extended profiles:

```bash
# Via Supabase Dashboard:
1. Go to SQL Editor
2. Copy entire contents of: backend/migrations/002_add_messages_and_extended_profiles.sql
3. Execute

# OR via Supabase CLI:
supabase migration new add_messages_and_extended_profiles
# Copy migration file contents
supabase db push
```

### Verify in Supabase Console:
- ✅ `messages` table exists with RLS enabled
- ✅ `profiles` table has new columns (legal_name, preferred_name, phones, etc.)
- ✅ `listings` table has latitude/longitude columns
- ✅ PostGIS extension installed
- ✅ Spatial index on listings created

---

## 2. Backend API Integration

### Register New Routes

In your main FastAPI app file (`backend/main.py` or `backend/app.py`), add:

```python
from routes_messages import router as messages_router

# Include in your FastAPI app:
app.include_router(messages_router)
```

### New Backend Files Created:
- `backend/routes_messages.py` - Messaging endpoints
- `backend/models.py` - Updated with `MessageCreate`, `MessageOut`, and extended `ProfileUpdate`

### Messaging Endpoints Available:
```
POST /messages/send
  Body: {
    sender_id: string (UUID),
    receiver_id: string (UUID),
    listing_id: string (UUID),
    deal_id?: string (UUID),
    message_text: string
  }
  Returns: { success: bool, message: Message }

GET /messages/threads
  Returns: { threads: Thread[] }

GET /messages/thread/{listing_id}/{other_user_id}?limit=50&offset=0
  Returns: { messages: Message[] }

PATCH /messages/{message_id}/read
  Returns: { success: bool, message: Message }
```

---

## 3. Frontend API Client Updates

### File: `frontend/lib/api.ts`

**New functions added:**
```typescript
- sendMessage(token, data)
- getMessageThreads(token)
- getThreadMessages(token, listingId, otherUserId, limit)
- markMessageRead(token, messageId)
```

All functions follow existing pattern with Bearer token auth.

---

## 4. Frontend Pages & Components

### New Pages Created:

#### 4.1 Messages Page
**File:** `frontend/pages/account/messages.tsx`

Features:
- Real-time message threads sidebar
- Main chat window with auto-scroll
- Supabase realtime subscription for new messages
- Message read status tracking
- Conversations grouped by listing + user

**To Enable:** Replace link in navbar/sidebar from `/account/settings` to `/account/messages`

**Environment Check:**
```typescript
// Uses existing Supabase client from frontend/lib/supabase.ts
// Requires browser API_BASE_URL env var (already set)
```

---

#### 4.2 New Settings Page (Tabbed)
**File:** `frontend/pages/account/settings-new.tsx`

**Four Tabs:**
1. **Personal Info**
   - Legal name, preferred name
   - Phone numbers (multi-input)
   - Residential address
   - Emergency contact
   - Identity verification status

2. **Login & Security**
   - Account ID (read-only)
   - Password change
   - Connected accounts (Google toggle)
   - Account deletion (with confirmation)

3. **Payments**
   - Active deals table
   - Payout history
   - Payment methods (stub for future)

4. **Languages & Currency**
   - Language selector (20+ languages)
   - Timezone selector (AU timezones)
   - Currency (AUD only, read-only)

**To Enable:** Replace `/account/settings` route:
```typescript
// In pages/account/settings.tsx, replace with:
export { default } from './settings-new';
```

Or rename: `mv pages/account/settings.tsx pages/account/settings-old.tsx && mv pages/account/settings-new.tsx pages/account/settings.tsx`

---

#### 4.3 Extended Search Page
**File:** `frontend/pages/seeker/search-extended.tsx`

**New Filters:**
- Destination multi-select (20+ Australian locations)
- Check-in/check-out date pickers
- Guest breakdown: Adults (+18), Children (2-17), Infants (<2)
- Price slider (AUD $50-$1000/week)
- "Near me" geolocation button

**Features:**
- Wishlist save to localStorage
- Sync wishlist to backend when logged in
- Responsive grid layout

**To Enable:** Replace search page or create new route

---

#### 4.4 Wishlist Page
**File:** `frontend/pages/seeker/wishlist.tsx`

**Features:**
- Display all saved listings
- Sort by: Recent, Price (low-high, high-low), Verified
- Remove from wishlist button
- Sync back to profile when logged in
- Empty state with CTA to search

**Route:** `/seeker/wishlist`

---

### 5. Supabase Real-Time Setup

In `frontend/pages/account/messages.tsx`, real-time is already configured:

```typescript
const channel = supabase
  .channel(`messages:${selectedThread.listing_id}`)
  .on(
    "postgres_changes",
    {
      event: "INSERT",
      schema: "public",
      table: "messages",
      filter: `listing_id=eq.${selectedThread.listing_id}`,
    },
    (payload) => {
      const newMsg = payload.new as Message;
      setMessages((prev) => [...prev, newMsg]);
    }
  )
  .subscribe();
```

**Prerequisites:**
- ✅ Supabase project has realtime enabled
- ✅ Database.realtime publication includes `messages` table

**Verify in Supabase Console:**
```sql
-- Check if realtime is enabled for messages:
SELECT schema, name, active FROM publication_tables;
```

If needed, enable via console or SQL:
```sql
CREATE PUBLICATION supabase_realtime FOR TABLE messages;
```

---

## 6. Data Flow Examples

### Flow 1: Save Listing to Wishlist

```
User clicks ♥ Save button on listing
  ↓
toggleSave(id) updates local Set
  ↓
Save to localStorage
  ↓
[If logged in] updateMyProfile() → backend
  ↓
Backend updates profiles.wishlist[]
  ↓
User navigates to /seeker/wishlist
  ↓
Page loads wishlist from localStorage (instant)
  ↓
[If logged in] Syncs with backend profile
```

### Flow 2: Send Message

```
User clicks send message button (on listing or conversation)
  ↓
handleSendMessage() validates:
  - Message not empty
  - Users are in a deal
  - Listing exists
  ↓
sendMessage(token, {sender_id, receiver_id, listing_id, message_text})
  ↓
Backend validates access in routes_messages.py
  ↓
INSERT into messages table
  ↓
Supabase realtime triggers POSTGRES_CHANGE event
  ↓
Other user's browser receives message (real-time)
  ↓
Message appears in chat window
```

### Flow 3: Update Account Settings

```
User navigates to /account/settings-new
  ↓
useEffect: fetchProfile() → getMyProfile()
  ↓
Profile data populates form fields
  ↓
User edits legal_name, timezone, etc.
  ↓
handleSaveProfile() → updateMyProfile()
  ↓
Backend updates profiles row (PATCH)
  ↓
Success message displays
  ↓
Data persists in database
```

---

## 7. Environment Variables Needed

Ensure these are set in your deployment:

**Frontend (.env.local or .env.production):**
```
NEXT_PUBLIC_API_BASE_URL=https://your-backend.com
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key
```

**Backend (.env or Railway):**
```
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_SECRET_KEY=your_service_role_key
STRIPE_SECRET_KEY=sk_live_...
STRIPE_WEBHOOK_SECRET=whsec_...
RESEND_API_KEY=re_...
FRONTEND_URL=https://your-frontend.vercel.app
```

---

## 8. Testing Checklist

### Before Deployment:

#### Local Testing:
- [ ] Run backend: `cd backend && python -m uvicorn main:app --reload`
- [ ] Run frontend: `cd frontend && npm run dev`
- [ ] Test messages page loads without errors
- [ ] Test sending message between two accounts
- [ ] Verify real-time message delivery (open 2 browsers, send message, check both update)
- [ ] Test wishlist save/load from localStorage
- [ ] Test sync wishlist to backend (logged in)
- [ ] Test settings page save (personal info, languages, timezone)
- [ ] Test password change flow

#### Supabase RLS Testing:
```sql
-- As authenticated user, verify:
SELECT * FROM messages WHERE sender_id = current_user_id;  -- Should work
SELECT * FROM messages WHERE receiver_id = current_user_id; -- Should work
SELECT * FROM messages WHERE sender_id != current_user_id; -- Should fail (403)
```

#### API Integration Testing:
```bash
# Test send message:
curl -X POST http://localhost:8000/messages/send \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -d '{
    "sender_id": "user1_uuid",
    "receiver_id": "user2_uuid",
    "listing_id": "listing_uuid",
    "message_text": "Test message"
  }'

# Test get threads:
curl http://localhost:8000/messages/threads \
  -H "Authorization: Bearer YOUR_TOKEN"
```

---

## 9. Deployment Steps

### 1. Supabase Migration
```bash
# Push migration via Supabase dashboard or CLI
# Verify: All tables and RLS policies created
```

### 2. Backend Deployment
```bash
# Update requirements if needed
pip freeze > requirements.txt

# Deploy to Railway/Heroku
git add backend/
git commit -m "Add messaging system and extended profiles"
git push heroku main
```

### 3. Frontend Deployment
```bash
# Update pages (replace old search.tsx, settings.tsx with new versions)
# Or create as alternative routes and update navigation

git add frontend/pages/account/messages.tsx
git add frontend/pages/account/settings-new.tsx
git add frontend/pages/seeker/search-extended.tsx
git add frontend/pages/seeker/wishlist.tsx
git add frontend/lib/api.ts
git commit -m "Add messaging, wishlist, and settings redesign"
git push origin main
# Vercel auto-deploys
```

---

## 10. Post-Deployment Checklist

- [ ] Verify all database tables/columns exist in Supabase
- [ ] Test messages endpoint returns 200 (auth required)
- [ ] Test search page loads with new filters
- [ ] Send test message between two users, verify real-time
- [ ] Save listing to wishlist, navigate to /seeker/wishlist
- [ ] Update profile settings, check profile updates in DB
- [ ] Test geolocation "Near me" button (mobile/desktop)
- [ ] Monitor backend logs for errors
- [ ] Check Vercel deployment logs for any build issues

---

## 11. Future Enhancements

- **Notifications:** Email/SMS when message received
- **Read Receipts:** Show "Read at 2:30pm" in chat
- **Typing Indicator:** "User is typing..."
- **Message Reactions:** Emoji reactions to messages
- **Bulk Messaging:** Owner can message multiple seekers
- **Scheduled Messages:** Send message at specific time
- **Message Search:** Full-text search in conversations
- **Auto-Reply:** Set auto-reply when away
- **Archive Conversations:** Hide old conversations
- **Block User:** Block messages from specific users

---

## 12. File Summary

### Created Files:
```
backend/
├── migrations/002_add_messages_and_extended_profiles.sql
├── routes_messages.py (NEW)
└── models.py (UPDATED)

frontend/
├── lib/api.ts (UPDATED - added messaging functions)
├── pages/account/messages.tsx (NEW)
├── pages/account/settings-new.tsx (NEW)
├── pages/seeker/search-extended.tsx (NEW)
└── pages/seeker/wishlist.tsx (NEW)
```

### Modified Files:
```
backend/models.py:
  - Added MessageCreate, MessageOut models
  - Extended ProfileUpdate with 10 new fields

frontend/lib/api.ts:
  - Added 4 new messaging functions

backend/main.py (needs update):
  - Include routes_messages router
```

---

## 13. Support & Troubleshooting

### Issue: Messages not sending
**Solution:** Check RLS policies in Supabase → messages table
```sql
SELECT * FROM pg_policies WHERE tablename = 'messages';
```

### Issue: Real-time not working
**Solution:** Verify realtime publication:
```sql
SELECT * FROM publication_tables WHERE publication = 'supabase_realtime';
```

### Issue: Wishlist not persisting
**Solution:** Check localStorage in browser DevTools → Application → Local Storage

### Issue: 403 on messaging endpoint
**Solution:** Verify user is either:
1. Listing owner (checks user.id == listing.owner_id), OR
2. Seeker with active deal on that listing (checks deals table)

---

## 14. Performance Optimization (Future)

- Index on `messages.created_at DESC` for pagination
- Cache profile data in Redis
- Batch message inserts for bulk operations
- Debounce typing indicator updates
- Lazy-load message history as user scrolls up
- Archive old messages (>30 days) to cold storage

---

**Last Updated:** 2026-02-04
**Version:** 1.0
**Status:** Ready for Production
