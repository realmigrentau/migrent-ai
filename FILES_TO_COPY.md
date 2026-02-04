# Complete File Reference - Copy Instructions

## Files Generated (10 Total)

Copy these files to their respective locations in your project:

---

## Backend Files (3)

### 1. SQL Migration
```
FROM: backend/migrations/002_add_messages_and_extended_profiles.sql
TO:   backend/migrations/002_add_messages_and_extended_profiles.sql
TYPE: NEW FILE
SIZE: 206 lines

EXECUTE IN: Supabase Dashboard → SQL Editor
```

### 2. Messaging Routes
```
FROM: backend/routes_messages.py
TO:   backend/routes_messages.py
TYPE: NEW FILE
SIZE: 220 lines

IMPORTS:
  - models (MessageCreate, MessageOut)
  - db (get_supabase)
  - routes_listings (get_current_user)
```

### 3. Updated Models
```
FROM: backend/models.py (sections to add)
TO:   backend/models.py
TYPE: MODIFIED FILE (add at end)
SIZE: Add ~35 lines

ADD TO ProfileUpdate CLASS:
  - legal_name
  - preferred_name
  - phones
  - residential_address
  - emergency_contact
  - preferred_language
  - preferred_currency
  - timezone
  - wishlist
  - identity_verified
  - identity_verification_url

ADD NEW CLASSES:
  - MessageCreate (5 fields)
  - MessageOut (8 fields)
```

### 4. Update Main App (NOT A FILE - JUST 2 LINES)
```
FILE:   backend/main.py (or app.py)
ACTION: Add 2 lines

ADD:
  from routes_messages import router as messages_router
  app.include_router(messages_router)

LOCATION: After other router imports/includes
```

---

## Frontend Files (5)

### 1. Messages Page
```
FROM: frontend/pages/account/messages.tsx
TO:   frontend/pages/account/messages.tsx
TYPE: NEW FILE
SIZE: 400 lines

CREATES ROUTE: /account/messages
IMPORTS:
  - useAuth from hooks
  - supabase from lib
  - API functions from lib/api.ts
```

### 2. New Settings Page (OPTION A: Replace)
```
FROM: frontend/pages/account/settings-new.tsx
TO:   frontend/pages/account/settings.tsx (BACKUP OLD FIRST!)
TYPE: NEW FILE (replaces old)
SIZE: 600 lines

CREATES ROUTE: /account/settings
IMPORTS:
  - useAuth, supabase
  - getMyProfile, updateMyProfile from lib/api.ts

NOTE: Rename old settings.tsx to settings-old.tsx first
```

### 2b. New Settings Page (OPTION B: Keep Both)
```
FROM: frontend/pages/account/settings-new.tsx
TO:   frontend/pages/account/settings/new.tsx
TYPE: NEW FILE (alternate route)
SIZE: 600 lines

CREATES ROUTE: /account/settings/new
UPDATE NAV: Change link from /account/settings to /account/settings/new
```

### 3. Extended Search Page (OPTION A: Replace)
```
FROM: frontend/pages/seeker/search-extended.tsx
TO:   frontend/pages/seeker/search.tsx (BACKUP OLD FIRST!)
TYPE: NEW FILE (replaces old)
SIZE: 400 lines

CREATES ROUTE: /seeker/search
IMPORTS:
  - useAuth, API functions
```

### 3b. Extended Search Page (OPTION B: Keep Both)
```
FROM: frontend/pages/seeker/search-extended.tsx
TO:   frontend/pages/seeker/search-v2.tsx
TYPE: NEW FILE (alternate route)
SIZE: 400 lines

CREATES ROUTE: /seeker/search-v2
UPDATE NAV: Add link to /seeker/search-v2 or toggle between versions
```

### 4. Wishlist Page
```
FROM: frontend/pages/seeker/wishlist.tsx
TO:   frontend/pages/seeker/wishlist.tsx
TYPE: NEW FILE
SIZE: 350 lines

CREATES ROUTE: /seeker/wishlist
IMPORTS:
  - useAuth, API functions
  - PLACEHOLDER_LISTINGS (mock data)
```

### 5. Updated API Client
```
FROM: frontend/lib/api.ts (messaging section)
TO:   frontend/lib/api.ts
TYPE: MODIFIED FILE (add at end)
SIZE: Add ~80 lines

ADD 4 NEW FUNCTIONS:
  - sendMessage()
  - getMessageThreads()
  - getThreadMessages()
  - markMessageRead()

LOCATION: After last existing function
```

---

## Documentation Files (3)

### 1. Quick Start
```
FILE: QUICKSTART.md
TYPE: REFERENCE
SIZE: 200 lines

Contains: 30-minute integration guide
```

### 2. Implementation Guide
```
FILE: FEATURE_IMPLEMENTATION_GUIDE.md
TYPE: REFERENCE
SIZE: 400+ lines

Contains: Complete technical documentation, data flows, troubleshooting
```

### 3. Integration Checklist
```
FILE: INTEGRATION_CHECKLIST.md
TYPE: REFERENCE
SIZE: 300+ lines

Contains: Step-by-step integration with verification
```

### 4. Feature Summary
```
FILE: FEATURE_SUMMARY.md
TYPE: REFERENCE
SIZE: 300+ lines

Contains: Overview, architecture, statistics
```

### 5. This File
```
FILE: FILES_TO_COPY.md
TYPE: REFERENCE
SIZE: This document
```

---

## Step-by-Step Copy Instructions

### Step 1: Backend Preparation (5 minutes)

```bash
# Copy new routes file
cp backend/routes_messages.py /YOUR/PROJECT/backend/

# Backup original models.py
cp backend/models.py backend/models.py.bak

# Edit models.py to add:
# - MessageCreate class
# - MessageOut class
# - Extended ProfileUpdate fields

# Edit main.py to add:
# from routes_messages import router as messages_router
# app.include_router(messages_router)

# Test import
cd backend && python -c "from routes_messages import router; print('✓ Success')"
```

### Step 2: Database (2 minutes)

```bash
# Copy migration to Supabase
# - Open Supabase Dashboard
# - SQL Editor → New Query
# - Paste contents of: backend/migrations/002_add_messages_and_extended_profiles.sql
# - Click Execute
# - Verify: No errors, tables created
```

### Step 3: Frontend Pages (10 minutes)

```bash
# Option A: Replace existing pages (recommended for clean install)
cp frontend/pages/account/messages.tsx /YOUR/PROJECT/frontend/pages/account/
cp frontend/pages/account/settings-new.tsx /YOUR/PROJECT/frontend/pages/account/settings.tsx
cp frontend/pages/seeker/search-extended.tsx /YOUR/PROJECT/frontend/pages/seeker/search.tsx
cp frontend/pages/seeker/wishlist.tsx /YOUR/PROJECT/frontend/pages/seeker/

# Option B: Keep existing pages (recommended for gradual rollout)
cp frontend/pages/account/messages.tsx /YOUR/PROJECT/frontend/pages/account/
cp frontend/pages/account/settings-new.tsx /YOUR/PROJECT/frontend/pages/account/settings-new.tsx
cp frontend/pages/seeker/search-extended.tsx /YOUR/PROJECT/frontend/pages/seeker/search-v2.tsx
cp frontend/pages/seeker/wishlist.tsx /YOUR/PROJECT/frontend/pages/seeker/
```

### Step 4: Frontend API Client (5 minutes)

```bash
# Backup original
cp frontend/lib/api.ts frontend/lib/api.ts.bak

# Edit api.ts to add 4 messaging functions at the end:
# - sendMessage()
# - getMessageThreads()
# - getThreadMessages()
# - markMessageRead()
```

### Step 5: Update Navigation (2 minutes)

```bash
# Add link to /account/messages in your navbar/sidebar
# Add link to /seeker/wishlist (or button in search)
```

---

## Files Checklist

### Backend
- [ ] `backend/migrations/002_add_messages_and_extended_profiles.sql` copied
- [ ] `backend/routes_messages.py` copied
- [ ] `backend/models.py` updated with new fields and classes
- [ ] `backend/main.py` updated with router include
- [ ] Test: `python -c "from routes_messages import router"`

### Database
- [ ] Supabase migration executed
- [ ] Verify: `messages` table exists
- [ ] Verify: `profiles` has new columns
- [ ] Verify: RLS policies exist

### Frontend Pages
- [ ] `frontend/pages/account/messages.tsx` copied
- [ ] `frontend/pages/account/settings.tsx` (or settings-new.tsx) copied
- [ ] `frontend/pages/seeker/search.tsx` (or search-v2.tsx) copied
- [ ] `frontend/pages/seeker/wishlist.tsx` copied

### Frontend API
- [ ] `frontend/lib/api.ts` updated with 4 new functions

### Navigation
- [ ] Messages link added to navbar
- [ ] Wishlist link added to search or sidebar

### Documentation
- [ ] QUICKSTART.md (reference)
- [ ] FEATURE_IMPLEMENTATION_GUIDE.md (reference)
- [ ] INTEGRATION_CHECKLIST.md (reference)
- [ ] FEATURE_SUMMARY.md (reference)

---

## Estimated File Sizes

| File | Type | Lines | Size |
|------|------|-------|------|
| 002_add_messages.sql | SQL | 206 | 8 KB |
| routes_messages.py | Python | 220 | 9 KB |
| messages.tsx | TSX | 400 | 15 KB |
| settings-new.tsx | TSX | 600 | 24 KB |
| search-extended.tsx | TSX | 400 | 16 KB |
| wishlist.tsx | TSX | 350 | 14 KB |
| models.py (additions) | Python | 35 | 2 KB |
| api.ts (additions) | TypeScript | 80 | 4 KB |
| **Total Code** | | **2,286** | **92 KB** |
| Documentation | Markdown | 1,000+ | 40 KB |
| **Total Package** | | **3,200+** | **132 KB** |

---

## Quick Copy Commands

### All at once (replace existing - use with caution!)

```bash
# Backend
cp backend/routes_messages.py /YOUR/BACKEND/
cp backend/models.py /YOUR/BACKEND/models.py.bak
# Manually merge models.py

# Frontend pages
cp frontend/pages/account/messages.tsx /YOUR/FRONTEND/pages/account/
cp frontend/pages/account/settings-new.tsx /YOUR/FRONTEND/pages/account/settings.tsx
cp frontend/pages/seeker/search-extended.tsx /YOUR/FRONTEND/pages/seeker/search.tsx
cp frontend/pages/seeker/wishlist.tsx /YOUR/FRONTEND/pages/seeker/

# Backend main.py needs manual edit (2 lines)
# Frontend api.ts needs manual edit (add functions)
# Database migration needs manual execution in Supabase
```

### Safe approach (keep originals - recommended!)

```bash
# Backend
cp backend/routes_messages.py /YOUR/BACKEND/
cp backend/models.py /YOUR/BACKEND/models.py.new
# Review and merge models.py manually

# Frontend pages
cp frontend/pages/account/messages.tsx /YOUR/FRONTEND/pages/account/
cp frontend/pages/account/settings-new.tsx /YOUR/FRONTEND/pages/account/settings-new.tsx
cp frontend/pages/seeker/search-extended.tsx /YOUR/FRONTEND/pages/seeker/search-v2.tsx
cp frontend/pages/seeker/wishlist.tsx /YOUR/FRONTEND/pages/seeker/

cp frontend/lib/api.ts /YOUR/FRONTEND/lib/api.ts.new
# Review and merge api.ts manually
```

---

## Verification After Copy

```bash
# Backend
python -m py_compile backend/routes_messages.py
python -c "from routes_messages import router"

# Frontend
npm run build  # Check for TypeScript errors

# Check all imports resolve
grep -r "from.*routes_messages" backend/
grep -r "sendMessage" frontend/lib/
```

---

**Total Integration Time: 30 minutes**

**Get started:** Begin with QUICKSTART.md

---

Last Updated: February 4, 2026
