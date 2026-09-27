"""
AI assistance behind a provider boundary.

One job today: help an owner write a listing title and description from
the facts they already entered. The owner sees the suggestion, edits it,
and chooses whether to use it - nothing here writes to a listing, and
listing creation never waits on it.

Off unless both are set on the server:
    AI_LISTING_ASSIST_ENABLED=true
    ANTHROPIC_API_KEY=...            (or another credential the SDK resolves)
Optional:
    AI_LISTING_MODEL                  defaults to claude-opus-5

AI is never used to assess, rank, score or decide on a renter. That
boundary is deliberate and should not move without a policy decision.

Requests use server-side refusal fallbacks ("fallbacks": "default") so a
safety-classifier decline is retried on Anthropic's recommended fallback
model inside the same call instead of failing the owner's request.
"""

from __future__ import annotations

import json
import logging
import os
from typing import Optional, Protocol

logger = logging.getLogger(__name__)

DEFAULT_MODEL = "claude-opus-5"
MAX_TITLE = 80


class AIUnavailable(RuntimeError):
    pass


class ListingCopyProvider(Protocol):
    def listing_copy(self, facts: dict, *, tone: str, focus: Optional[str]) -> dict: ...


SYSTEM_PROMPT = """You write rental listings for Migrent, an Australian housing platform used by people who are often new to the country.

Write from the facts provided and nothing else. If a fact is missing, leave it out - never invent features, distances, prices, rules or neighbourhood claims.

Style: Australian English, plain and warm, specific over salesy. Short paragraphs. No emojis, no exclamation marks, no capital-letter shouting, no em dashes (use a regular hyphen). Prices are weekly, written like "$320 a week".

Fairness: describe the home, never the ideal tenant. Do not mention or imply a preference about anyone's race, nationality, ethnicity, religion, age, disability, relationship status, pregnancy or family situation. Do not use phrases like "professionals only", "no students", "suits a quiet Christian" or "locals preferred". If the facts include a house rule, state it as a rule about the home (for example "no smoking inside").

Return a title of at most 80 characters and a description of 80 to 220 words."""


OUTPUT_SCHEMA = {
    "type": "object",
    "properties": {
        "title": {"type": "string"},
        "description": {"type": "string"},
    },
    "required": ["title", "description"],
    "additionalProperties": False,
}

ALLOWED_FACTS = (
    "property_type", "place_type", "unit_label", "suburb", "state", "bedrooms", "bathrooms", "bathroom_type", "beds",
    "parking", "furnished", "bills_included", "internet_included", "air_conditioning", "laundry", "dishwasher",
    "pets_allowed", "no_smoking", "quiet_hours", "highlights", "nearest_transport", "weekly_price", "available_from",
    "min_stay_weeks", "listing_purpose", "who_else_lives_here", "total_other_people", "neighbourhood_vibe",
    "accessibility_notes", "existing_description",
)


def _clean(text: str) -> str:
    return (text or "").replace("—", "-").replace("–", "-").strip()


class AnthropicListingCopy:
    def __init__(self, model: str):
        try:
            import anthropic  # imported lazily: the API runs without it
        except ImportError as e:  # pragma: no cover - depends on deployment
            raise AIUnavailable("The AI client library is not installed") from e
        self._anthropic = anthropic
        self._client = anthropic.Anthropic(timeout=45.0, max_retries=2)
        self._model = model

    def listing_copy(self, facts: dict, *, tone: str, focus: Optional[str]) -> dict:
        anthropic = self._anthropic
        cleaned = {k: facts[k] for k in ALLOWED_FACTS if facts.get(k) not in (None, "", [])}
        brief = {"facts": cleaned, "tone": tone}
        if focus:
            brief["owner_request"] = focus[:300]
        try:
            response = self._client.beta.messages.create(
                model=self._model,
                max_tokens=2000,
                betas=["server-side-fallback-2026-07-01"],
                fallbacks="default",
                output_config={"effort": "low", "format": {"type": "json_schema", "schema": OUTPUT_SCHEMA}},
                system=SYSTEM_PROMPT,
                messages=[{"role": "user", "content": json.dumps(brief, ensure_ascii=False, default=str)}],
            )
        except anthropic.RateLimitError as e:
            raise AIUnavailable("The writing assistant is busy. Try again in a minute.") from e
        except anthropic.APIConnectionError as e:
            raise AIUnavailable("The writing assistant could not be reached.") from e
        except anthropic.APIStatusError as e:
            logger.warning("listing copy failed: %s %s", e.status_code, getattr(e, "message", ""))
            raise AIUnavailable("The writing assistant is not available right now.") from e

        if response.stop_reason == "refusal":
            raise AIUnavailable("The writing assistant could not help with this listing. You can write it yourself.")
        text = next((b.text for b in response.content if getattr(b, "type", None) == "text"), "")
        try:
            data = json.loads(text)
        except (TypeError, ValueError) as e:
            raise AIUnavailable("The suggestion came back incomplete. Try again.") from e
        title = _clean(data.get("title", ""))[:MAX_TITLE]
        description = _clean(data.get("description", ""))
        if not title or len(description) < 10:
            raise AIUnavailable("The suggestion came back incomplete. Try again.")
        return {"title": title, "description": description}


def listing_assist_enabled() -> bool:
    flag = os.environ.get("AI_LISTING_ASSIST_ENABLED", "").strip().lower() in ("1", "true", "yes")
    has_credential = bool(os.environ.get("ANTHROPIC_API_KEY") or os.environ.get("ANTHROPIC_AUTH_TOKEN"))
    return flag and has_credential


def get_listing_copy_provider() -> ListingCopyProvider:
    if not listing_assist_enabled():
        raise AIUnavailable("The writing assistant is not switched on.")
    return AnthropicListingCopy(os.environ.get("AI_LISTING_MODEL", DEFAULT_MODEL).strip() or DEFAULT_MODEL)
