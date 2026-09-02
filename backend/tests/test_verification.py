from tests.conftest import LISTING_DRAFT, OWNER_ID, SEEKER_ID, VERIFIED_OWNER_ID, auth


def test_unverified_owner_cannot_submit_for_review(client):
    r = client.post(f"/listings/{LISTING_DRAFT}/submit", headers=auth(OWNER_ID))
    assert r.status_code == 403
    assert "verification" in r.json()["detail"].lower()


def test_other_user_cannot_submit_someone_elses_listing(client):
    r = client.post(f"/listings/{LISTING_DRAFT}/submit", headers=auth(SEEKER_ID))
    assert r.status_code == 403


def test_unverified_owner_creates_draft_not_pending(client, db):
    payload = {
        "address": "5 Example Road",
        "suburb": "Parramatta",
        "postcode": 2150,
        "weekly_price": 280,
        "description": "Bright room close to shops and the station.",
        "images": [],
        "title": "Bright room",
    }
    r = client.post("/listings", json=payload, headers=auth(OWNER_ID))
    assert r.status_code == 200, r.text
    assert r.json()["is_draft"] is True
    assert r.json()["moderation_status"] == "draft"
    r2 = client.post("/listings", json=payload, headers=auth(VERIFIED_OWNER_ID))
    assert r2.json()["is_draft"] is False
    assert r2.json()["moderation_status"] == "pending_approval"


def test_create_listing_rejects_past_availability(client):
    payload = {
        "address": "5 Example Road", "suburb": "Parramatta", "postcode": 2150, "weekly_price": 280,
        "description": "Bright room close to shops and the station.", "available_from": "2026-03-20", "available_to": "2026-04-25",
    }
    r = client.post("/listings", json=payload, headers=auth(VERIFIED_OWNER_ID))
    assert r.status_code == 400
    assert "already passed" in r.json()["detail"]


def test_badge_refresh_never_awards_trust_words(client, db):
    r = client.post("/profiles/badges/refresh", headers=auth(OWNER_ID))
    assert r.status_code == 200
    assert all("verif" not in b.lower() for b in r.json()["badges"])
    stored = next(p for p in db.rows("profiles") if p["id"] == OWNER_ID)["badges"]
    assert "Verified host" not in stored


def test_public_profile_reports_real_verification_state(client):
    r = client.get(f"/profiles/{OWNER_ID}")
    assert r.status_code == 200
    body = r.json()
    assert body["verification"]["status"] == "unverified"
    assert body["achievement_badges"] == []
    for key in ("phone", "residential_address", "email", "verified", "role"):
        assert key not in body
    r2 = client.get("/profiles/public/pubverif02")
    assert r2.status_code == 200
    assert r2.json()["verification"]["status"] == "verified"
    assert r2.json()["verification"]["checks"]["government_id"] == "approved"
    assert client.get("/profiles/public/not-a-real-id-!!").status_code == 404


def test_paid_seeker_verification_is_disabled(client):
    r = client.post("/payments/create-verification-session", headers=auth(SEEKER_ID))
    assert r.status_code == 410
