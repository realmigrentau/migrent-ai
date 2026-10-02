"""Rules a listing has to meet before renters see it.

Two kinds live here:

* Money up front. Migrent caps bond at 4 weeks' rent and rent in advance at
  2 weeks (owner decision, 2026-10-01), so a host who follows it can never
  overcharge by mistake. Checked against each state's own source on
  2026-10-02 (frontend/data/rentalLaws.ts): 4 weeks' bond is at or below the
  limit everywhere, but Tasmania and the Northern Territory allow rent in
  advance for one rent period only, so there the cap is 1 week (rent on
  Migrent is weekly). Counsel should confirm the wording before launch.

* Where the home is. Suburb, state and postcode are checked against the ABS
  suburbs and localities (data/suburb_postcodes.json, written by
  frontend/scripts/abs/build-backend-index.mjs). ABS postal areas only
  approximate Australia Post's postcodes, so only clear mistakes are refused:
  a suburb that is not in the chosen state, or a postcode from another state
  that the ABS does not map onto that suburb. Anything less certain comes back
  as a hint for the wizard to show, and moderation sees every listing anyway.
"""

import json
import logging
import re
from functools import lru_cache
from pathlib import Path
from typing import Any, Optional

from hub_common import state_for_postcode

logger = logging.getLogger(__name__)

MAX_BOND_WEEKS = 4
MAX_RENT_IN_ADVANCE_WEEKS = 2
# One rent period only (Residential Tenancy Act 1997 (Tas) s 17;
# Residential Tenancies Act 1999 (NT) s 39).
ONE_PERIOD_STATES = ("TAS", "NT")
MAX_BILLS_ESTIMATE_WEEKLY = 1000

BOND_LIMIT_MESSAGE = f"Migrent allows a bond of up to {MAX_BOND_WEEKS} weeks' rent"


def max_rent_in_advance_weeks(state: Optional[str]) -> int:
    return 1 if (state or "").upper() in ONE_PERIOD_STATES else MAX_RENT_IN_ADVANCE_WEEKS


def advance_limit_message(state: Optional[str]) -> str:
    weeks = max_rent_in_advance_weeks(state)
    if weeks == 1:
        return f"In {state.upper()} the law allows rent in advance for one rent period only, so Migrent allows 1 week"
    return f"Migrent allows up to {weeks} weeks' rent in advance"

INDEX_FILE = Path(__file__).parent / "data" / "suburb_postcodes.json"


# ---------------------------------------------------------------------------
# Money up front
# ---------------------------------------------------------------------------


def _int_or_none(v: Any) -> Optional[int]:
    if v is None or v == "":
        return None
    try:
        return int(v)
    except (TypeError, ValueError):
        return None


def cost_problems(data: dict, purpose: str) -> list[dict]:
    """Bond and rent in advance, in the wizard's problem shape. A lease has to
    state both (zero is an answer); a short stay may leave bond out and never
    takes rent in advance through a listing."""
    problems = []
    state = data.get("state") or state_for_postcode(data.get("postcode"))

    def add(field: str, message: str):
        problems.append({"step": "pricing", "field": field, "message": message})

    bond = _int_or_none(data.get("bond_weeks"))
    advance = _int_or_none(data.get("rent_in_advance_weeks"))
    if bond is not None and not 0 <= bond <= MAX_BOND_WEEKS:
        add("bond_weeks", BOND_LIMIT_MESSAGE)
    if advance is not None and not 0 <= advance <= max_rent_in_advance_weeks(state):
        add("rent_in_advance_weeks", advance_limit_message(state))
    if purpose == "long_term":
        if bond is None:
            add("bond_weeks", "Choose the bond (choose No bond if there isn't one)")
        if advance is None:
            add("rent_in_advance_weeks", "Choose how much rent is paid in advance")
    bills = _int_or_none(data.get("bills_estimate_weekly"))
    if bills is not None and not 0 <= bills <= MAX_BILLS_ESTIMATE_WEEKLY:
        add("bills_estimate_weekly", "Enter a weekly bills estimate in dollars")
    return problems


def bond_weeks_from_text(text: Any) -> Optional[int]:
    """Read the old free-text bond ("4 weeks", "2 wks") as whole weeks, when
    it plainly is one. Dollar amounts and anything above the cap are left for
    the host to restate."""
    if not isinstance(text, str):
        return None
    m = re.fullmatch(r"\s*(\d)\s*(weeks?|wks?|w)\b.*", text.strip().lower())
    if not m:
        return None
    weeks = int(m.group(1))
    return weeks if 0 <= weeks <= MAX_BOND_WEEKS else None


# ---------------------------------------------------------------------------
# Where the home is
# ---------------------------------------------------------------------------


def normalise_place(name: Any) -> str:
    """One spelling for comparison: case, "Saint"/"St", "Mount"/"Mt",
    apostrophes, full stops and hyphens do not count."""
    s = str(name or "").lower().strip()
    s = s.replace("'", "").replace("’", "").replace(".", "")
    s = re.sub(r"[-\s]+", " ", s)
    s = re.sub(r"\bsaint\b", "st", s)
    s = re.sub(r"\bmount\b", "mt", s)
    s = re.sub(r"\bmountain\b", "mtn", s)
    return s.strip()


@lru_cache(maxsize=1)
def _index() -> dict[str, list[tuple[str, str, frozenset[str]]]]:
    """normalised name -> [(display name, state, postcodes)]"""
    try:
        raw = json.loads(INDEX_FILE.read_text())
    except (OSError, ValueError):
        logger.warning("suburb index %s is missing; location checks are off", INDEX_FILE)
        return {}
    out: dict[str, list[tuple[str, str, frozenset[str]]]] = {}
    for name, state, postcodes in raw.get("rows", []):
        out.setdefault(normalise_place(name), []).append((name, state, frozenset(postcodes)))
    return out


def _postcode_str(postcode: Any) -> Optional[str]:
    try:
        n = int(postcode)
    except (TypeError, ValueError):
        return None
    return str(n).zfill(4) if 200 <= n <= 9999 else None


def _states_text(states: set[str]) -> str:
    ordered = sorted(states)
    return ordered[0] if len(ordered) == 1 else ", ".join(ordered[:-1]) + " and " + ordered[-1]


def check_location(suburb: Any, postcode: Any, state: Optional[str] = None) -> dict:
    """{"problem": refuse with this, "hint": show this, "match": the place}"""
    result: dict[str, Any] = {"problem": None, "hint": None, "match": None}
    index = _index()
    pc = _postcode_str(postcode)
    if not index or not pc or not str(suburb or "").strip():
        return result
    state = (state or "").upper() or None
    entries = index.get(normalise_place(suburb), [])
    range_state = state_for_postcode(pc)

    if state and range_state and range_state != state and not any(pc in e[2] for e in entries if e[1] == state):
        result["problem"] = f"{pc} is a {range_state} postcode, not {state}. Check the postcode and the state."
        return result
    if not entries:
        where = f" in {state}" if state else ""
        result["hint"] = f"We couldn't find {str(suburb).strip()}{where}. Check the spelling, or choose your suburb from the list."
        return result

    candidates = [e for e in entries if e[1] == state] if state else entries
    display = entries[0][0]
    if not candidates:
        result["problem"] = f"There's no {display} in {state}. {display} is in {_states_text({e[1] for e in entries})}. Check the suburb and the state."
        return result
    exact = [e for e in candidates if pc in e[2]]
    if exact:
        result["match"] = {"suburb": exact[0][0], "state": exact[0][1], "postcode": pc}
        return result
    if range_state not in {e[1] for e in candidates}:
        result["problem"] = f"{display} is in {_states_text({e[1] for e in candidates})}, but {pc} is a {range_state} postcode. Check the postcode."
        return result
    usual = sorted({p for e in candidates for p in e[2]})
    if usual:
        result["hint"] = f"{display} usually has the postcode {' or '.join(usual)}. Check that {pc} is right."
    return result


def location_problem(suburb: Any, postcode: Any, state: Optional[str] = None) -> Optional[str]:
    return check_location(suburb, postcode, state)["problem"]
