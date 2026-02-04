# Integration Checklist

Follow these steps to integrate all new features into your existing application.

---

## Step 1: Backend Integration

### 1.1 Register Messaging Routes

**File:** `backend/main.py` (or wherever you initialize FastAPI)

Add before `app.run()` or final `if __name__` block:

```python
# Add to imports at top
from routes_messages import router as messages_router

# Add to your FastAPI app (after other routers)
app.include_router(messages_router)

# Example full integration:
from fastapi import FastAPI
from routes_auth import router as auth_router
from routes_listings import router as listings_router
from routes_matches import router as matches_router
from routes_deals import router as deals_router
from routes_profiles import router as profiles_router
from routes_reports import router as reports_router
from routes_support import router as support_router
from routes_messages import router as messages_router  # NEW

app = FastAPI()

app.include_router(auth_router)
app.include_router(listings_router)
app.include_router(matches_router)
app.include_router(deals_router)
app.include_router(profiles_router)
app.include_router(reports_router)
app.include_router(support_router)
app.include_router(messages_router)  # NEW
```

### 1.2 Verify Models Updated

**File:** `backend/models.py`

Check these classes exist:

```python
# Should exist after update:
class MessageCreate(BaseModel):
    sender_id: str
    receiver_id: str
    listing_id: str
    deal_id: Optional[str] = None
    message_text: str

class MessageOut(BaseModel):
    id: str
    sender_id: str
    receiver_id: str
    listing_id: str
    deal_id: Optional[str] = None
    message_text: str
    read_at: Optional[str] = None
    created_at: str
    updated_at: str

# ProfileUpdate should have these new fields:
class ProfileUpdate(BaseModel):
    # ... existing fields ...
    legal_name: Optional[str] = None
    preferred_name: Optional[str] = None
    phones: Optional[list[str]] = None
    residential_address: Optional[dict] = None
    emergency_contact: Optional[dict] = None
    preferred_language: Optional[str] = None
    preferred_currency: Optional[str] = None
    timezone: Optional[str] = None
    wishlist: Optional[list[str]] = None
    identity_verified: Optional[bool] = None
    identity_verification_url: Optional[str] = None
```

### 1.3 Copy Message Routes File

Copy `backend/routes_messages.py` to your backend directory.

**Verify imports work:**
```bash
cd backend
python -c "from routes_messages import router; print('✓ routes_messages imported successfully')"
```

---

## Step 2: Frontend API Client

### 2.1 Update API Functions

**File:** `frontend/lib/api.ts`

Add these new functions at the end:

```typescript
// ── Messaging endpoints ──────────────────────────────────────

export async function sendMessage(token: string, data: { ... }) { ... }
export async function getMessageThreads(token: string) { ... }
export async function getThreadMessages(token: string, listingId: string, otherUserId: string, limit?: number) { ... }
export async function markMessageRead(token: string, messageId: string) { ... }
```

(Copy entire "Messaging endpoints" section from updated api.ts file)

---

## Step 3: Frontend Pages

### 3.1 Create Messages Page

**File:** `frontend/pages/account/messages.tsx`

Copy the entire `messages.tsx` file provided.

**Verify:**
- Supabase import works
- useAuth hook is available
- API functions are imported

### 3.2 Replace Settings Page

**Option A: Replace existing**
```bash
cd frontend/pages/account
cp settings.tsx settings-old.tsx
cp settings-new.tsx settings.tsx
```

**Option B: Keep both (create new route)**
```bash
# Keep current settings.tsx as-is
# Create new /account/settings/new route
mkdir -p pages/account/settings
mv pages/account/settings-new.tsx pages/account/settings/new.tsx
```

Then update navigation to link to `/account/settings/new`

### 3.3 Create Search Extension

**Option A: Replace existing**
```bash
cd frontend/pages/seeker
cp search.tsx search-old.tsx
cp search-extended.tsx search.tsx
```

**Option B: Create alternative route**
```bash
# Keep current search.tsx
# New search page available at /seeker/search-v2
cp search-extended.tsx search-v2.tsx
```

### 3.4 Create Wishlist Page

**File:** `frontend/pages/seeker/wishlist.tsx`

Copy the entire `wishlist.tsx` file provided.

No existing file to replace; creates new route automatically.

---

## Step 4: Database Migration

### 4.1 Apply Supabase Migration

**Via Supabase Dashboard (Recommended):**

1. Go to **SQL Editor** in your Supabase dashboard
2. Click **New Query**
3. Copy entire contents of `backend/migrations/002_add_messages_and_extended_profiles.sql`
4. Click **Execute**
5. Verify success (no errors)

**Via Supabase CLI:**

```bash
# If using migrations
supabase migration new add_messages_and_extended_profiles
# Add file contents to migration
supabase db push
```

**Verify in Console:**

```sql
-- Check messages table exists
SELECT * FROM information_schema.tables WHERE table_name = 'messages';

-- Check profiles has new columns
SELECT column_name FROM information_schema.columns
WHERE table_name = 'profiles' AND column_name IN ('legal_name', 'preferred_name', 'timezone');

-- Check RLS is enabled
SELECT * FROM pg_tables WHERE tablename = 'messages';
```

---

## Step 5: Navigation Updates

### 5.1 Add Messages Link

**File:** `frontend/components/Layout.tsx` or your navbar component

Add link to messages page:

```tsx
<Link href="/account/messages" className="...">
  Messages
</Link>

// Or with icon:
<Link href="/account/messages" className="...">
  <span>💬</span> Messages
</Link>
```

### 5.2 Update Account Sidebar

If you have an account sidebar (`components/AccountSidebar.tsx`):

```tsx
const tabs = [
  { href: '/account/settings', label: 'Settings' },
  { href: '/account/messages', label: 'Messages' },
  { href: '/account/payments', label: 'Payments' },
  // ...
];
```

### 5.3 Add Wishlist Link

Update search page or sidebar:

```tsx
{saved.size > 0 && (
  <Link href="/seeker/wishlist">
    View Wishlist ({saved.size})
  </Link>
)}
```

---

## Step 6: Environment Variables

### 6.1 Frontend (.env.local for local, .env for production)

Verify these are set:

```
NEXT_PUBLIC_API_BASE_URL=http://localhost:8000  # Local
# or
NEXT_PUBLIC_API_BASE_URL=https://your-backend.railway.app  # Production

NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key_here
```

### 6.2 Backend (Railway/Heroku environment)

Verify these are set in your deployment:

```
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_SECRET_KEY=your_service_role_key
STRIPE_SECRET_KEY=sk_...
STRIPE_WEBHOOK_SECRET=whsec_...
RESEND_API_KEY=re_...
FRONTEND_URL=https://your-frontend.vercel.app
```

---

## Step 7: Local Testing

### 7.1 Start Backend

```bash
cd backend
python -m uvicorn main:app --reload --port 8000
```

Verify output:
```
✓ routes_messages imported
✓ Startup complete
✓ Application startup complete
```

### 7.2 Start Frontend

```bash
cd frontend
npm run dev
```

Navigate to `http://localhost:3000`

### 7.3 Test Messages Flow

1. Sign in as User A
2. Open `/account/messages`
3. Should see "No conversations yet"
4. Create a test deal between User A (owner) and User B (seeker)
5. Sign in as User B
6. Send a message
7. Sign back to User A, refresh messages page
8. **Should see new message in real-time** (or refresh)

### 7.4 Test Wishlist

1. Go to `/seeker/search` (or `/seeker/search-v2`)
2. Click "Save" heart icon on a listing
3. Verify button shows "♥ Saved"
4. Navigate to `/seeker/wishlist`
5. Listing should appear
6. Verify localStorage has wishlist data (DevTools → Application)

### 7.5 Test Settings

1. Go to `/account/settings` or `/account/settings/new`
2. Click on each tab (Personal Info, Security, Payments, Languages)
3. Fill in personal info form
4. Click "Save changes"
5. Verify success message appears
6. Refresh page, verify data persists
7. Check Supabase profiles table, verify columns updated

---

## Step 8: Production Deployment

### 8.1 Supabase (No changes needed)

- Migration already applied
- RLS policies in place
- Realtime enabled

### 8.2 Backend Deployment

**If using Railway:**

```bash
# Commit changes
git add backend/routes_messages.py backend/models.py backend/main.py
git commit -m "feat: Add messaging system with extended profiles"

# Push to Railway
git push origin main
# or if Railway is connected to main branch, auto-deploys

# Verify in Railway dashboard that new endpoints are available
```

**If using Heroku:**

```bash
git add backend/
git commit -m "feat: Add messaging system"
git push heroku main

# Check logs:
heroku logs --tail
```

### 8.3 Frontend Deployment

**If using Vercel:**

```bash
# Commit changes
git add frontend/pages/account/messages.tsx
git add frontend/pages/account/settings.tsx  # or settings-new.tsx
git add frontend/pages/seeker/wishlist.tsx
git add frontend/pages/seeker/search.tsx  # or search-extended.tsx
git add frontend/lib/api.ts
git commit -m "feat: Add messaging, wishlist, and settings redesign"

# Push to main
git push origin main

# Vercel auto-deploys
# Check: https://vercel.com/your-project
```

---

## Step 9: Verification Checklist

After deployment, verify:

### Backend:
- [ ] `GET /docs` shows all new endpoints
- [ ] `POST /messages/send` returns 401 without auth
- [ ] `GET /messages/threads` works when authenticated
- [ ] No 500 errors in logs

### Frontend (Local):
- [ ] Pages load without errors
- [ ] Messages page: real-time updates work
- [ ] Wishlist: save/load works
- [ ] Settings: form submission works
- [ ] Navigation links don't 404

### Frontend (Production):
- [ ] All pages load on Vercel
- [ ] Real-time messages work
- [ ] Can send/receive messages between two users
- [ ] Wishlist persists after page refresh
- [ ] Settings changes persist

### Supabase:
- [ ] `messages` table has data (if tested)
- [ ] RLS policies not blocking legitimate queries
- [ ] Realtime is active and delivering updates

---

## Step 10: Quick Reference

### New Routes:

**Frontend:**
- `/account/messages` - Message inbox
- `/account/settings` or `/account/settings/new` - Account settings with tabs
- `/seeker/wishlist` - Saved listings
- `/seeker/search-v2` (optional) - Enhanced search

**Backend:**
- `POST /messages/send` - Send message
- `GET /messages/threads` - Get all threads
- `GET /messages/thread/{listing_id}/{other_user_id}` - Get thread messages
- `PATCH /messages/{message_id}/read` - Mark as read

### New Fields in Profiles:
```
legal_name, preferred_name, phones[], residential_address,
emergency_contact, preferred_language, preferred_currency,
timezone, wishlist[], identity_verified, identity_verification_url
```

### Backward Compatibility:
✅ All new fields are OPTIONAL (nullable)
✅ Existing endpoints unchanged
✅ Old settings page still works (if not replaced)
✅ Old search page still works (if not replaced)

---

## Troubleshooting

### Issue: "Module not found" error on routes_messages

**Solution:**
```bash
cd backend
ls -la routes_messages.py  # Verify file exists
python -c "import routes_messages"  # Test import
```

### Issue: "RLS policy denied" when sending message

**Solution:** Check:
```sql
SELECT * FROM pg_policies WHERE tablename = 'messages';
-- Should have at least 3 policies:
-- - messages_sender_select
-- - messages_sender_insert
-- - messages_sender_update
```

### Issue: Real-time not working

**Solution:**
1. Check Supabase dashboard → Realtime → Status
2. Verify `messages` table is in publication:
   ```sql
   SELECT * FROM pg_publication_tables WHERE pubname = 'supabase_realtime';
   ```
3. If missing, enable via dashboard or SQL

### Issue: Settings changes not saving

**Solution:**
1. Verify API token is valid in browser DevTools → Network
2. Check backend logs for errors
3. Verify `profiles` RLS allows UPDATE for authenticated users

---

**Status:** ✅ Ready to integrate
**Last Updated:** 2026-02-04
