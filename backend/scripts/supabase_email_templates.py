"""
The sign-in emails Supabase sends (confirm sign-up, sign-in link, password
reset, change of email, reauthentication), in Migrent's email design.

    cd backend && python scripts/supabase_email_templates.py "<output folder>"

Paste each file into Supabase > Authentication > Emails > Templates. The
{{ .ConfirmationURL }} and {{ .Token }} parts are Supabase's own fields.
"""

from __future__ import annotations

import os
import sys

sys.path.insert(0, os.path.join(os.path.dirname(__file__), ".."))
os.environ.setdefault("FRONTEND_URL", "https://migrent.vercel.app")

import email_theme as et  # noqa: E402

LINK = "{{ .ConfirmationURL }}"
t = et.THEMES["account"]

TEMPLATES = [
    (
        "1-confirm-signup.html",
        "Confirm signup",
        "Confirm your email for Migrent",
        et.render(
            "account",
            eyebrow="Almost there",
            title="Confirm your email",
            preheader="One tap to finish creating your Migrent account.",
            paragraphs=["Thanks for joining Migrent. Tap the button to confirm this is your email address and finish setting up your account."],
            cta=("Confirm my email", LINK),
            after=[et.tip("Didn't sign up?", "You can ignore this email. No account is created unless you confirm.", t)],
        ),
    ),
    (
        "2-magic-link.html",
        "Magic Link",
        "Your Migrent sign-in link",
        et.render(
            "account",
            eyebrow="Sign in",
            title="Your sign-in link",
            preheader="Tap to sign in to Migrent. The link works once.",
            paragraphs=["Tap the button to sign in to Migrent. The link works once and expires in an hour."],
            cta=("Sign in to Migrent", LINK),
            after=[et.tip("Didn't ask for this?", "Ignore this email. Nobody can sign in without this link.", t)],
        ),
    ),
    (
        "3-reset-password.html",
        "Reset Password",
        "Reset your Migrent password",
        et.render(
            "security",
            eyebrow="Password reset",
            title="Reset your password",
            preheader="Choose a new password for your Migrent account.",
            paragraphs=["Someone (hopefully you) asked to reset the password for your Migrent account. Tap the button to choose a new one. The link expires in an hour."],
            cta=("Choose a new password", LINK),
            after=[et.tip("Didn't ask for this?", "Your password hasn't changed. You can ignore this email.", et.THEMES["security"])],
        ),
    ),
    (
        "4-change-email.html",
        "Change Email Address",
        "Confirm your new email for Migrent",
        et.render(
            "account",
            eyebrow="Email change",
            title="Confirm your new email",
            preheader="Confirm the change of email address on your Migrent account.",
            paragraphs=["Tap the button to confirm {{ .NewEmail }} as the new email address for your Migrent account."],
            cta=("Confirm the change", LINK),
            after=[et.tip("Didn't ask for this?", "Don't tap the button, and change your password in Migrent Hub settings.", t)],
        ),
    ),
    (
        "5-reauthentication.html",
        "Reauthentication",
        "Your Migrent confirmation code",
        et.render(
            "security",
            eyebrow="Confirmation code",
            title="Your confirmation code",
            preheader="Use this code to confirm it's you.",
            paragraphs=["Enter this code in Migrent to confirm it's you. It expires shortly."],
            blocks=[et.security_code("{{ .Token }}", et.THEMES["security"], note="Never share this code. Migrent will never ask you for it.")],
        ),
    ),
]


def main(out: str) -> None:
    os.makedirs(out, exist_ok=True)
    lines = ["Paste each into Supabase > Authentication > Emails > Templates.", ""]
    for fname, template, subject, body in TEMPLATES:
        with open(os.path.join(out, fname), "w") as f:
            f.write(body)
        lines.append(f"{template}:  subject = {subject}   message body = contents of {fname}")
    with open(os.path.join(out, "READ ME.txt"), "w") as f:
        f.write("\n".join(lines) + "\n")
    print(f"{len(TEMPLATES)} templates -> {out}")


if __name__ == "__main__":
    main(sys.argv[1] if len(sys.argv) > 1 else "supabase-email-templates")
