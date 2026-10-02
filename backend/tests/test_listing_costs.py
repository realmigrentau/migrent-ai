"""
Money up front and where the home is (MIG-017, MIG-023, MIG-045).

Bond and rent in advance are whole weeks, capped at 4 and 2 in every state
(owner decision, 2026-10-01), so a renter can be shown the move-in total.
Suburb, state and postcode have to agree with the ABS localities.
"""

from datetime import date, timedelta

import pytest

from listing_rules import bond_weeks_from_text, check_location, cost_problems
from tests.conftest import LISTING_LIVE, VERIFIED_OWNER_ID, auth


def _lease(**over) -> dict:
    data = {
        "street_address": "15 Smith Street", "suburb": "Kellyville", "postcode": 2155, "state": "NSW",
        "property_type": "house", "place_type": "private_room",
        "title": "Bright room near the metro", "description": "A furnished room with a desk and built-in wardrobe.",
        "images": ["https://img.test/room.jpg"], "weekly_price": 320,
        "available_from": (date.today() + timedelta(days=7)).isoformat(),
        "furnished": True, "bills_included": False, "bills_estimate_weekly": 35,
        "listing_purpose": "long_term", "bond_weeks": 4, "rent_in_advance_weeks": 2, "newcomer_friendly": True,
    }
    data.update(over)
    return data


def _submit(client, data: dict):
    draft_id = client.post("/hub/listing-drafts", headers=auth(VERIFIED_OWNER_ID), json={"data": {}}).json()["draft"]["id"]
    assert client.put(f"/hub/listing-drafts/{draft_id}", headers=auth(VERIFIED_OWNER_ID), json={"data": data, "step": 5}).status_code == 200
    return client.post(f"/hub/listing-drafts/{draft_id}/submit", headers=auth(VERIFIED_OWNER_ID))


def _fields(r) -> set[str]:
    return {p["field"] for p in r.json()["detail"]["problems"]}


# ---------------------------------------------------------------------------
# Bond and rent in advance
# ---------------------------------------------------------------------------


def test_a_lease_must_state_bond_and_rent_in_advance():
    fields = {p["field"] for p in cost_problems({}, "long_term")}
    assert fields == {"bond_weeks", "rent_in_advance_weeks"}
    # Zero is an answer, and a short stay need not state either.
    assert cost_problems({"bond_weeks": 0, "rent_in_advance_weeks": 0}, "long_term") == []
    assert cost_problems({}, "short_stay") == []


@pytest.mark.parametrize("data", [{"bond_weeks": 5}, {"rent_in_advance_weeks": 3}, {"bond_weeks": -1}])
def test_more_than_the_cap_is_refused(data):
    full = {"bond_weeks": 4, "rent_in_advance_weeks": 2, **data}
    assert cost_problems(full, "long_term")


def test_wizard_submits_costs_onto_the_listing(client, db):
    r = _submit(client, _lease())
    assert r.status_code == 200, r.text
    listing = next(l for l in db.rows("listings") if l["id"] == r.json()["listing_id"])
    assert (listing["bond_weeks"], listing["rent_in_advance_weeks"], listing["bills_estimate_weekly"]) == (4, 2, 35)
    assert listing["newcomer_friendly"] is True
    assert "bond" not in listing  # the old free-text column is no longer written


def test_wizard_refuses_a_bond_over_four_weeks(client):
    r = _submit(client, _lease(bond_weeks=6))
    assert r.status_code == 422
    problem = next(p for p in r.json()["detail"]["problems"] if p["field"] == "bond_weeks")
    assert "4 weeks" in problem["message"]


def test_bills_estimate_is_dropped_when_bills_are_included(client, db):
    r = _submit(client, _lease(bills_included=True, bills_estimate_weekly=40))
    assert r.status_code == 200, r.text
    listing = next(l for l in db.rows("listings") if l["id"] == r.json()["listing_id"])
    assert listing.get("bills_estimate_weekly") is None


def test_short_stays_take_no_rent_in_advance(client, db):
    r = _submit(client, _lease(listing_purpose="short_stay", bond_weeks=None, rent_in_advance_weeks=2))
    assert r.status_code == 200, r.text
    listing = next(l for l in db.rows("listings") if l["id"] == r.json()["listing_id"])
    assert listing.get("rent_in_advance_weeks") is None


@pytest.mark.parametrize("body", [{"bond_weeks": 5}, {"rent_in_advance_weeks": 4}])
def test_api_refuses_costs_over_the_cap(client, body):
    r = client.patch(f"/listings/{LISTING_LIVE}", headers=auth(VERIFIED_OWNER_ID), json=body)
    assert r.status_code == 422


def test_public_listing_shows_the_costs(client, db):
    for row in db.rows("listings"):
        if row["id"] == LISTING_LIVE:
            row.update(bond_weeks=4, rent_in_advance_weeks=2, bills_estimate_weekly=30, newcomer_friendly=True)
    body = client.get(f"/listings/{LISTING_LIVE}").json()
    assert (body["bond_weeks"], body["rent_in_advance_weeks"], body["bills_estimate_weekly"], body["newcomer_friendly"]) == (4, 2, 30, True)


def test_old_free_text_bond_is_read_as_weeks_when_it_plainly_is():
    assert bond_weeks_from_text("4 weeks") == 4
    assert bond_weeks_from_text("2 wks") == 2
    assert bond_weeks_from_text("6 weeks") is None  # over the cap: the host restates it
    assert bond_weeks_from_text("$1,200") is None
    assert bond_weeks_from_text(None) is None


def test_copying_an_old_listing_carries_its_bond_across(client, db):
    for row in db.rows("listings"):
        if row["id"] == LISTING_LIVE:
            row["bond"] = "4 weeks"
    r = client.post("/hub/listing-drafts", headers=auth(VERIFIED_OWNER_ID), json={"from_listing_id": LISTING_LIVE})
    assert r.status_code == 200, r.text
    assert r.json()["draft"]["data"]["bond_weeks"] == 4


# ---------------------------------------------------------------------------
# Suburb, state and postcode
# ---------------------------------------------------------------------------


@pytest.mark.parametrize(
    "suburb, postcode, state, problem",
    [
        ("Parramatta", 2150, "NSW", None),
        ("Parramatta", 3000, "VIC", "There's no Parramatta in VIC"),
        ("Parramatta", 9999, "VIC", "9999 is a QLD postcode"),
        ("Parramatta", 3000, None, "3000 is a VIC postcode"),
        ("Box Hill", 3128, "VIC", None),  # one in each of NSW and VIC
        ("Barooga", 3644, "NSW", None),  # a NSW town with a Victorian postcode
        ("Saint Kilda", 3182, "VIC", None),  # spelt either way
        ("Mt Druitt", 2770, "NSW", None),
    ],
)
def test_location_rules(suburb, postcode, state, problem):
    got = check_location(suburb, postcode, state)["problem"]
    if problem is None:
        assert got is None
    else:
        assert got and problem in got


def test_unusual_postcode_or_unknown_suburb_is_only_a_hint():
    out = check_location("Parramatta", 2151, "NSW")
    assert out["problem"] is None and "2150" in out["hint"]
    out = check_location("Nowhereville", 2150, "NSW")
    assert out["problem"] is None and out["hint"]


def test_wizard_refuses_a_suburb_in_the_wrong_state(client):
    r = _submit(client, _lease(suburb="Parramatta", postcode=3000, state="VIC"))
    assert r.status_code == 422
    assert "suburb" in _fields(r)


def test_editing_a_listing_to_a_mismatched_postcode_is_refused(client):
    r = client.patch(f"/listings/{LISTING_LIVE}", headers=auth(VERIFIED_OWNER_ID), json={"postcode": 3000})
    assert r.status_code == 400
    assert "Kellyville" in r.json()["detail"]


def test_location_check_endpoint_for_the_wizard(client):
    r = client.get("/hub/location-check", params={"suburb": "Parramatta", "postcode": "3000", "state": "VIC"}, headers=auth(VERIFIED_OWNER_ID))
    assert r.status_code == 200
    assert "no Parramatta in VIC" in r.json()["problem"]
    ok = client.get("/hub/location-check", params={"suburb": "parramatta", "postcode": "2150", "state": "NSW"}, headers=auth(VERIFIED_OWNER_ID)).json()
    assert ok["problem"] is None and ok["match"] == {"suburb": "Parramatta", "state": "NSW", "postcode": "2150"}
    assert client.get("/hub/location-check", params={"suburb": "Parramatta"}).status_code == 401


def test_property_with_a_mismatched_location_is_refused(client):
    r = client.post(
        "/hub/properties",
        headers=auth(VERIFIED_OWNER_ID),
        json={"street_address": "1 Church Street", "suburb": "Parramatta", "state": "VIC", "postcode": 3000},
    )
    assert r.status_code == 400


# ---------------------------------------------------------------------------
# Search
# ---------------------------------------------------------------------------


def _ids(client, **params) -> set[str]:
    r = client.get("/listings/search", params=params)
    assert r.status_code == 200, r.text
    return {l["id"] for l in r.json()}


def test_search_by_lease_or_short_stay(client, db):
    # Listings from before the two were told apart count as leases.
    assert LISTING_LIVE in _ids(client, lease_type="long_term")
    assert LISTING_LIVE not in _ids(client, lease_type="short_stay")
    for row in db.rows("listings"):
        if row["id"] == LISTING_LIVE:
            row["listing_purpose"] = "short_stay"
    assert LISTING_LIVE in _ids(client, lease_type="short_stay")
    assert LISTING_LIVE not in _ids(client, lease_type="long_term")


def test_search_for_homes_that_welcome_new_arrivals(client, db):
    assert LISTING_LIVE not in _ids(client, newcomer_friendly="true")
    for row in db.rows("listings"):
        if row["id"] == LISTING_LIVE:
            row["newcomer_friendly"] = True
    assert LISTING_LIVE in _ids(client, newcomer_friendly="true")


def test_saved_search_alerts_respect_lease_type_and_newcomer(client, db):
    from routes_hub_renter import query_public_listings
    from db import get_supabase_admin

    sb = get_supabase_admin()
    ids = lambda params: {r["id"] for r in query_public_listings(sb, params, limit=50)}  # noqa: E731
    assert LISTING_LIVE in ids({"listing_purpose": "long_term"})
    assert LISTING_LIVE not in ids({"listing_purpose": "short_stay"})
    assert LISTING_LIVE not in ids({"newcomer_friendly": True})
    for row in db.rows("listings"):
        if row["id"] == LISTING_LIVE:
            row["newcomer_friendly"] = True
    assert LISTING_LIVE in ids({"newcomer_friendly": "true"})


@pytest.mark.parametrize("postcode, state", [(7000, "TAS"), (800, "NT")])
def test_one_rent_period_in_advance_in_tasmania_and_the_nt(client, postcode, state):
    # The law there allows rent in advance for one rent period only, so with
    # weekly rent Migrent allows one week (Phase C check of each state's law).
    data = {"bond_weeks": 4, "rent_in_advance_weeks": 2, "postcode": postcode, "state": state}
    problem = next(p for p in cost_problems(data, "long_term") if p["field"] == "rent_in_advance_weeks")
    assert "1 week" in problem["message"]
    assert cost_problems({**data, "rent_in_advance_weeks": 1}, "long_term") == []
    # NSW keeps 2 weeks.
    assert cost_problems({**data, "postcode": 2150, "state": "NSW"}, "long_term") == []


def test_api_refuses_two_weeks_in_advance_in_tasmania(client, db):
    for row in db.rows("listings"):
        if row["id"] == LISTING_LIVE:
            row.update(postcode=7000, suburb="Hobart")
    r = client.patch(f"/listings/{LISTING_LIVE}", headers=auth(VERIFIED_OWNER_ID), json={"rent_in_advance_weeks": 2})
    assert r.status_code == 400 and "1 week" in r.json()["detail"]
