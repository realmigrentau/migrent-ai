# MigRent

A room-finding marketplace for migrants, students and new arrivals in
Australia. Hosts have their government ID checked before a room goes live;
renters pay MigRent nothing; MigRent never holds rent or bond.

## Stack

- `frontend/`: Next.js 16 (Pages Router), React 19, Tailwind 4, MapLibre GL
  with MapTiler tiles, Supabase Auth, hCaptcha. Deployed on Vercel.
- `backend/`: FastAPI (Python 3.12), Supabase Postgres via `supabase-py`,
  Stripe (host listing fee only). Deployed on Render.
- `backend/migrations/`: SQL applied by hand in the Supabase SQL editor, in
  order. `042_verification_lifecycle_public_contract.sql` is the latest.

There is no AI matching, no Pinecone, no Claude integration in this
codebase: `backend/matching_engine.py` is a small rules-based scorer.

## Run locally

```bash
cd backend && python -m venv venv && venv/bin/pip install -r requirements.txt
cp .env.example .env   # fill in Supabase + test Stripe keys
venv/bin/uvicorn main:app --reload --port 8000
```

```bash
cd frontend && npm ci
cp .env.local.example .env.local
npm run dev
```

## Verify

```bash
cd backend && venv/bin/python -m pytest tests -q
cd frontend && npm run lint && npm run typecheck && npm run test:unit
cd frontend && npm run build:test && npm run test:e2e   # Playwright against the mock API
```

## Documents

- `docs/security/public-data-contract.md`: what the public can ever see.
- `docs/product/listing-lifecycle.md`, `docs/product/access-control-matrix.md`.
- `docs/legal/identity-and-claims.md`: the decisions that block launch.
- `docs/security/secrets-and-environments.md`, `docs/security/retention-and-deletion.md`.
- `BATCH_5_DEPLOY.md`: deployment order and rollback for the current branch.
