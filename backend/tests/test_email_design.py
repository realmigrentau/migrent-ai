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
        # Every email asks to be moved out of spam, with a link to the guide.
        assert "/email-help" in e["html"] and "Found this in Spam" in e["html"], e["name"]
        assert "—" not in e["html"] and "—" not in e["subject"], e["name"]


def test_other_peoples_text_is_escaped(monkeypatch):
    import email_bookings

    sent = []
    monkeypatch.setattr(email_bookings, "_send_email", lambda to, subject, html, text="", headers=None: sent.append(html))
    email_bookings.send_listing_rejected_to_owner("o@example.com", "<b>Olive</b>", "<script>alert(1)</script>", "Bad <img src=x>")
    assert "<script>" not in sent[0] and "&lt;script&gt;" in sent[0]
    assert "<img src=x>" not in sent[0]


def test_every_email_gets_a_plain_text_copy(monkeypatch):
    """Spam filters expect a text/plain part beside the HTML."""
    import email_bookings
    import email_theme as et

    seen = []
    monkeypatch.setattr(email_bookings, "_deliver", lambda to, subject, html, text="", headers=None: seen.append(text))
    html = et.render("account", title="Hello there", greeting="Sam", paragraphs=["Your room & your rules."], cta=("Open Migrent Hub", "https://migrent.test/hub"))
    email_bookings._send_email("sam@example.com", "Hi", html)
    text = seen[0]
    assert "Hi Sam," in text and "Your room & your rules." in text
    assert "Open Migrent Hub" in text and "(https://migrent.test/hub)" in text
    assert "<" not in text.replace("<https", "")


def test_outside_tests_emails_never_hold_up_the_request(monkeypatch):
    import threading

    import email_bookings

    release = threading.Event()
    done = []

    def slow(*a, **k):
        release.wait(5)
        done.append(1)

    monkeypatch.setattr(email_bookings, "_SEND_INLINE", False)
    monkeypatch.setattr(email_bookings, "_deliver", slow)
    email_bookings._send_email("sam@example.com", "Hi", "<p>Hi</p>", text="Hi")
    assert done == []  # returned before the slow send finished
    release.set()
    email_bookings._executor().shutdown(wait=True)
    email_bookings._pool = None
    assert done == [1]
