"""
A live listing whose substance changes goes back to review (MIG-010).

Without this, a host could get a genuine listing approved, then swap the
photos, address or text and keep the ID-checked badge while it stayed live.
"""

import pytest

from tests.conftest import LISTING_LIVE, VERIFIED_OWNER_ID, auth


def _status(db) -> str:
    return next(r for r in db.rows("listings") if r["id"] == LISTING_LIVE)["moderation_status"]


def _patch(client, body: dict):
    r = client.patch(f"/listings/{LISTING_LIVE}", headers=auth(VERIFIED_OWNER_ID), json=body)
    assert r.status_code == 200, r.text
    return r.json()


@pytest.mark.parametrize(
    "body",
    [
        {"title": "Room with ensuite"},
        {"description": "Pay a holding deposit to my bank account before you inspect."},
        {"images": ["https://img.test/b.jpg"]},
        {"bond_weeks": 4},
        {"rent_in_advance_weeks": 2},
        {"weekly_price": 150},  # 50% drop
        {"weekly_price": 400},  # 33% rise
    ],
)
def test_material_change_to_a_live_listing_goes_back_to_review(client, db, body):
    out = _patch(client, body)
    assert out["moderation_status"] == "pending_approval"
    assert _status(db) == "pending_approval"
    assert client.get(f"/listings/{LISTING_LIVE}").status_code == 404
    events = [e for e in db.rows("moderation_events") if e["listing_id"] == LISTING_LIVE and e["event_type"] == "submitted"]
    assert events and events[-1]["metadata"]["reason"] == "material_edit"


@pytest.mark.parametrize(
    "body",
    [
        {"weekly_price": 320},  # under 15%
        {"furnished": True},
        {"title": "Sunny room"},  # unchanged
        {"available_to": "2027-06-30"},
    ],
)
def test_small_or_unchanged_edits_stay_live(client, db, body):
    out = _patch(client, body)
    assert out["moderation_status"] == "approved"
    assert client.get(f"/listings/{LISTING_LIVE}").status_code == 200


def test_editing_a_draft_does_not_submit_it(client, db):
    for r in db.rows("listings"):
        if r["id"] == LISTING_LIVE:
            r["moderation_status"] = "draft"
    out = _patch(client, {"title": "Still a draft"})
    assert out["moderation_status"] == "draft"
