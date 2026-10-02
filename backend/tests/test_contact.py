"""
The Contact page opens a ticket in the Admin panel's Support queue (MIG-065).
It used to write support_requests, which no screen read.
"""

from tests.conftest import ADMIN_ID, auth


def test_a_contact_message_becomes_a_support_ticket(client, db, monkeypatch):
    sent = []
    import email_bookings

    monkeypatch.setattr(email_bookings, "send_support_request_received", lambda to, name, ref, subject: sent.append((to, ref, subject)))
    r = client.post(
        "/support/contact",
        json={"name": "Amina", "email": "amina@example.com", "role": "seeker", "topic": "SAFETY", "subject": "A host asked for cash", "message": "He wants the bond in cash before I see the room."},
    )
    assert r.status_code == 200, r.text
    ref = r.json()["reference"]

    ticket = db.rows("tickets")[-1]
    assert ticket["source"] == "contact_form" and ticket["category"] == "trust_safety" and ticket["priority"] == "high"
    assert ticket["subject"] == "A host asked for cash"
    assert [m["body"].startswith("He wants the bond") for m in db.rows("ticket_messages") if m["ticket_id"] == ticket["id"]] == [True]
    assert sent == [("amina@example.com", ref, "A host asked for cash")]

    queue = client.get("/hub/admin/support/tickets", headers=auth(ADMIN_ID)).json()
    rows = queue.get("tickets", queue) if isinstance(queue, dict) else queue
    assert any(t["id"] == ticket["id"] for t in rows)


def test_short_messages_are_refused_clearly(client):
    r = client.post("/support/contact", json={"name": "A", "email": "a@example.com", "role": "owner", "message": "Call me"})
    assert r.status_code == 422
