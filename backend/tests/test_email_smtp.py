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


def test_the_gmail_relay_is_used_first(monkeypatch):
    calls = []

    class Resp:
        status_code = 200

        def raise_for_status(self):
            pass

        def json(self):
            return {"ok": True, "remaining": 99}

    def post(url, json=None, timeout=None, follow_redirects=None):
        calls.append((url, json, follow_redirects))
        return Resp()

    monkeypatch.setattr(email_bookings.httpx, "post", post)
    monkeypatch.setattr(email_bookings, "GMAIL_RELAY_URL", "https://script.google.com/macros/s/x/exec")
    monkeypatch.setattr(email_bookings, "GMAIL_RELAY_SECRET", "s3cret")
    monkeypatch.setattr(email_bookings, "SMTP_HOST", "smtp.gmail.com")  # set too, but the relay wins
    email_bookings._send_email("sam@example.com", "Hello", "<p>Hi</p>", text="Hi")
    url, body, follow = calls[0]
    assert url.endswith("/exec") and follow is True
    assert body["secret"] == "s3cret" and body["to"] == "sam@example.com" and body["html"] == "<p>Hi</p>"


def test_a_relay_refusal_is_logged_not_raised(monkeypatch, caplog):
    class Resp:
        status_code = 200

        def raise_for_status(self):
            pass

        def json(self):
            return {"ok": False, "error": "not allowed"}

    monkeypatch.setattr(email_bookings.httpx, "post", lambda *a, **k: Resp())
    monkeypatch.setattr(email_bookings, "GMAIL_RELAY_URL", "https://script.google.com/macros/s/x/exec")
    monkeypatch.setattr(email_bookings, "GMAIL_RELAY_SECRET", "wrong")
    email_bookings._send_email("sam@example.com", "Hello", "<p>Hi</p>")
    assert "not allowed" in caplog.text
