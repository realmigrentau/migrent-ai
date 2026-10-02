"""Gmail SMTP sending (email_bookings._send_smtp), with the network faked."""

import email_bookings


class FakeSMTP:
    sent = []

    def __init__(self, host, port, context=None, timeout=None):
        self.host, self.port = host, port

    def __enter__(self):
        return self

    def __exit__(self, *a):
        return False

    def login(self, user, password):
        self.user, self.password = user, password

    def send_message(self, msg):
        FakeSMTP.sent.append((self, msg))


def test_smtp_is_used_when_configured(monkeypatch):
    import smtplib

    FakeSMTP.sent = []
    monkeypatch.setattr(smtplib, "SMTP_SSL", FakeSMTP)
    monkeypatch.setattr(email_bookings, "SMTP_HOST", "smtp.gmail.com")
    monkeypatch.setattr(email_bookings, "SMTP_USER", "migrentau@gmail.com")
    monkeypatch.setattr(email_bookings, "SMTP_PASSWORD", "abcdabcdabcdabcd")
    monkeypatch.setattr(email_bookings, "REPLY_TO", "")
    email_bookings._send_email("sam@example.com", "Hello", "<p>Hi</p>", text="Hi", headers={"List-Unsubscribe": "<https://x.test/u>"})
    (conn, msg) = FakeSMTP.sent[0]
    assert conn.host == "smtp.gmail.com" and conn.port == 465 and conn.user == "migrentau@gmail.com"
    assert msg["To"] == "sam@example.com" and "migrentau@gmail.com" in msg["From"] and "Migrent" in msg["From"]
    assert msg["List-Unsubscribe"] == "<https://x.test/u>"
    assert msg.get_body(("html",)).get_content().strip() == "<p>Hi</p>"


def test_a_failed_send_never_raises(monkeypatch):
    import smtplib

    class Broken(FakeSMTP):
        def login(self, user, password):
            raise smtplib.SMTPAuthenticationError(535, b"bad password")

    monkeypatch.setattr(smtplib, "SMTP_SSL", Broken)
    monkeypatch.setattr(email_bookings, "SMTP_HOST", "smtp.gmail.com")
    monkeypatch.setattr(email_bookings, "SMTP_USER", "migrentau@gmail.com")
    monkeypatch.setattr(email_bookings, "SMTP_PASSWORD", "x")
    email_bookings._send_email("sam@example.com", "Hello", "<p>Hi</p>")
