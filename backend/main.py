import os
import logging
from dotenv import load_dotenv

load_dotenv()

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from routes_auth import router as auth_router
from routes_listings import router as listings_router
from routes_matches import router as matches_router
from routes_deals import router as deals_router, webhook_router
from routes_support import router as support_router
from routes_reports import router as reports_router

# ── Startup validation ──────────────────────────────────────
REQUIRED_ENV = ["SUPABASE_URL", "SUPABASE_ANON_KEY", "STRIPE_SECRET_KEY", "STRIPE_WEBHOOK_SECRET"]
missing = [v for v in REQUIRED_ENV if not os.environ.get(v)]
if missing:
    logger.warning(f"Missing environment variables: {', '.join(missing)} — some features will not work")

logger.info(f"PORT env var = {os.environ.get('PORT', 'not set')}")

app = FastAPI(title="MigRent AI", version="0.1.0")

# ── Rate limiting ───────────────────────────────────────────
from limiter import limiter
from slowapi import _rate_limit_exceeded_handler
from slowapi.errors import RateLimitExceeded

app.state.limiter = limiter
app.add_exception_handler(RateLimitExceeded, _rate_limit_exceeded_handler)

# ── CORS ────────────────────────────────────────────────────
FRONTEND_URL = os.environ.get("FRONTEND_URL", "")
allowed_origins = [
    "http://localhost:3000",
    "https://migrent-ai.vercel.app",
]
if FRONTEND_URL:
    allowed_origins.append(FRONTEND_URL)

app.add_middleware(
    CORSMiddleware,
    allow_origins=allowed_origins,
    allow_credentials=True,
    allow_methods=["GET", "POST", "PATCH", "DELETE", "OPTIONS"],
    allow_headers=["Authorization", "Content-Type"],
)

app.include_router(auth_router)
app.include_router(listings_router)
app.include_router(matches_router)
app.include_router(deals_router)
app.include_router(support_router)
app.include_router(reports_router)
app.include_router(webhook_router)

# Note: each router defines its own prefix (/auth, /listings, /matches, /deals)


@app.get("/")
def health():
    return {"status": "ok"}
