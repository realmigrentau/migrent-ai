"""Every Migrent email uses the shared design (email_theme.py), and text
other people wrote is escaped, never run as HTML."""

import os
import sys

import pytest

sys.path.insert(0, os.path.join(os.path.dirname(__file__), "..", "scripts"))


@pytest.fixture
def all_emails(monkeypatch):
    # The preview script swaps the senders for a recorder; register the real
    # ones first so they are put back after this test.
    import email_bookings
    import move_in
    import notification_service

    for mod, name in ((email_bookings, "_send_email"), (notification_service, "_send_email"), (move_in, "build_receipt"), (move_in, "_contact")):
        monkeypatch.setattr(mod, name, getattr(mod, name))
    import email_previews

    monkeypatch.setattr(email_bookings, "_send_email", email_previews.record)

    email_previews.CAPTURED.clear()
    email_previews.custom_emails()
    email_previews.move_in_receipts()
    email_previews.notification_emails()
    return list(email_previews.CAPTURED)


def test_every_email_has_the_new_design(all_emails):
    assert len(all_emails) >= 40
    for e in all_emails:
        assert "/banner-" in e["html"], e["name"]
        assert "Stay safe:" in e["html"], e["name"]
        assert "—" not in e["html"] and "—" not in e["subject"], e["name"]


def test_other_peoples_text_is_escaped(monkeypatch):
    import email_bookings

    sent = []
    monkeypatch.setattr(email_bookings, "_send_email", lambda to, subject, html, text="", headers=None: sent.append(html))
    email_bookings.send_listing_rejected_to_owner("o@example.com", "<b>Olive</b>", "<script>alert(1)</script>", "Bad <img src=x>")
    assert "<script>" not in sent[0] and "&lt;script&gt;" in sent[0]
    assert "<img src=x>" not in sent[0]
