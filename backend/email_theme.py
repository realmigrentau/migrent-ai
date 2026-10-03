"""
Migrent's email design (3 October 2026): a coloured banner per kind of
email, a white card with the details, a clear button, and a dark footer.

Built for email apps, not browsers: tables for layout, inline styles,
images for the banners (frontend/public/email, made by
frontend/scripts/email-banners.mjs), and no CSS an email app strips. Every
colour that carries text meets WCAG AA contrast.

    render("inspections", title="Inspection tomorrow", ...)
"""

from __future__ import annotations

import html
import os
from dataclasses import dataclass
from typing import Optional, Sequence


@dataclass(frozen=True)
class Theme:
    label: str  # the small coloured tag above the title
    color: str  # buttons and accents (white text on it is AA)
    tint: str  # light background for boxes
    ink: str  # text on the tint


# Kept in step with frontend/scripts/email-banners.mjs.
THEMES: dict[str, Theme] = {
    "account": Theme("Your account", "#3153D9", "#EEF2FF", "#2639A8"),
    "applications": Theme("Applications", "#2453D6", "#E8F1FF", "#1E3A8A"),
    "inspections": Theme("Inspections", "#C2410C", "#FFF4E6", "#9A3412"),
    "messages": Theme("Messages", "#4338CA", "#F1EEFF", "#3730A3"),
    "money": Theme("Payments", "#047857", "#E9FBF3", "#065F46"),
    "listings": Theme("Your listing", "#6D28D9", "#F3EDFF", "#5B21B6"),
    "searches": Theme("New homes", "#0369A1", "#E7F6FD", "#075985"),
    "home": Theme("Your home", "#0F766E", "#E6FAF7", "#115E59"),
    "reviews": Theme("Reviews", "#BE185D", "#FFEDF5", "#9D174D"),
    "security": Theme("Security", "#B91C1C", "#FEF0F0", "#991B1B"),
    "support": Theme("Support", "#3153D9", "#EAF4FF", "#2639A8"),
    "stays": Theme("Short stays", "#C2410C", "#FFF1EC", "#9A3412"),
    "identity": Theme("ID check", "#0F766E", "#E8FAF1", "#115E59"),
    "mentors": Theme("Mentors", "#7C3AED", "#F5EEFF", "#6D28D9"),
}

INK = "#101828"
BODY = "#344054"
MUTED = "#667085"
LINE = "#E4E7EC"
PAGE = "#EEF1F8"
FOOTER = "#0B1533"
FONT = "-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,'Helvetica Neue',Arial,sans-serif"


def _site() -> str:
    return os.environ.get("FRONTEND_URL", "https://migrent.vercel.app").rstrip("/")


def _hub() -> str:
    return os.environ.get("HUB_BASE_URL", "").rstrip("/") or f"{_site()}/hub"


def asset(name: str) -> str:
    """Where email images are served from (EMAIL_ASSET_BASE overrides it
    for previews made before a deploy)."""
    base = os.environ.get("EMAIL_ASSET_BASE", "").rstrip("/") or f"{_site()}/email"
    return f"{base}/{name}"


def esc(value) -> str:
    return html.escape("" if value is None else str(value))


def button(text: str, url: str, theme: Theme) -> str:
    return f"""<table role="presentation" cellpadding="0" cellspacing="0" border="0" style="margin:28px 0 8px;">
  <tr><td bgcolor="{theme.color}" style="border-radius:999px;background:{theme.color};">
    <a href="{esc(url)}" style="display:inline-block;padding:15px 30px;font-family:{FONT};font-size:16px;font-weight:700;line-height:20px;color:#ffffff;text-decoration:none;border-radius:999px;">{esc(text)} &rarr;</a>
  </td></tr></table>"""


def details(rows: Sequence[tuple[str, str]], theme: Theme, *, title: Optional[str] = None) -> str:
    """A tinted box of label / value rows. Values are escaped here."""
    head = f'<tr><td colspan="2" style="padding:0 0 10px;font-family:{FONT};font-size:12px;font-weight:700;letter-spacing:0.08em;text-transform:uppercase;color:{theme.ink};">{esc(title)}</td></tr>' if title else ""
    body = "".join(
        f"""<tr>
      <td style="padding:9px 0;border-top:1px solid rgba(16,24,40,0.07);font-family:{FONT};font-size:14px;line-height:20px;color:{MUTED};vertical-align:top;width:42%;">{esc(label)}</td>
      <td style="padding:9px 0;border-top:1px solid rgba(16,24,40,0.07);font-family:{FONT};font-size:14px;line-height:20px;color:{INK};font-weight:600;text-align:right;vertical-align:top;">{esc(value)}</td></tr>"""
        for label, value in rows
    )
    return f"""<table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="margin:22px 0 4px;background:{theme.tint};border-radius:16px;border-left:4px solid {theme.color};">
  <tr><td style="padding:18px 20px 12px;"><table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0">{head}{body}</table></td></tr></table>"""


def tip(title: str, text: str, theme: Theme) -> str:
    return f"""<table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="margin:22px 0 0;">
  <tr><td style="padding:16px 18px;border:1px dashed {theme.color};border-radius:14px;font-family:{FONT};font-size:14px;line-height:21px;color:{BODY};">
    <span style="display:inline-block;margin-bottom:4px;font-size:12px;font-weight:700;letter-spacing:0.08em;text-transform:uppercase;color:{theme.ink};">{esc(title)}</span><br>{esc(text)}
  </td></tr></table>"""


def note(title: str, text: str, theme: Theme) -> str:
    """A solid tinted box for the thing that matters most (a reason, what
    to change)."""
    return f"""<table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="margin:20px 0 4px;">
  <tr><td style="padding:16px 18px;background:{theme.tint};border-radius:14px;font-family:{FONT};font-size:15px;line-height:23px;color:{INK};">
    <span style="display:inline-block;margin-bottom:4px;font-size:12px;font-weight:700;letter-spacing:0.08em;text-transform:uppercase;color:{theme.ink};">{esc(title)}</span><br>{esc(text)}
  </td></tr></table>"""


def steps(items: Sequence[str], theme: Theme, *, title: Optional[str] = None) -> str:
    """Numbered steps in coloured circles."""
    head = f'<div style="margin:22px 0 10px;font-family:{FONT};font-size:12px;font-weight:700;letter-spacing:0.08em;text-transform:uppercase;color:{theme.ink};">{esc(title)}</div>' if title else '<div style="height:18px;"></div>'
    rows = "".join(
        f"""<tr>
      <td width="38" style="vertical-align:top;padding:0 0 12px;"><div style="width:28px;height:28px;line-height:28px;border-radius:999px;background:{theme.color};color:#ffffff;text-align:center;font-family:{FONT};font-size:14px;font-weight:800;">{i}</div></td>
      <td style="vertical-align:top;padding:4px 0 12px;font-family:{FONT};font-size:15px;line-height:22px;color:{BODY};">{esc(item)}</td></tr>"""
        for i, item in enumerate(items, 1)
    )
    return f'{head}<table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0">{rows}</table>'


def security_code(code: str, theme: Theme, note: str = "The renter, the owner and Migrent have the same code. Check it matches when you meet.") -> str:
    return f"""<table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="margin:24px 0 0;">
  <tr><td align="center" style="padding:20px;border:2px dashed {theme.color};border-radius:18px;background:#ffffff;font-family:{FONT};">
    <div style="font-size:12px;font-weight:700;letter-spacing:0.1em;text-transform:uppercase;color:{theme.ink};">Security code</div>
    <div style="margin:6px 0;font-family:'SFMono-Regular',Menlo,Consolas,monospace;font-size:30px;font-weight:700;letter-spacing:6px;color:{INK};">{esc(code)}</div>
    <div style="font-size:13px;line-height:19px;color:{MUTED};">{esc(note)}</div>
  </td></tr></table>"""


def stars(n: int = 5, color: str = "#F59E0B") -> str:
    return f'<div style="font-size:28px;letter-spacing:6px;color:{color};margin:18px 0 0;">{"&#9733;" * n}</div>'


def room_cards(rooms: Sequence[dict], theme: Theme) -> str:
    """Up to three homes with a photo, title, price and suburb."""
    cells = []
    for r in list(rooms)[:3]:
        cells.append(
            f"""<tr><td style="padding:0 0 14px;">
  <a href="{esc(r['url'])}" style="text-decoration:none;color:{INK};display:block;border:1px solid {LINE};border-radius:16px;overflow:hidden;">
    <img src="{esc(r['image'])}" width="520" alt="" style="display:block;width:100%;max-width:520px;height:auto;border:0;">
    <div style="padding:14px 16px;font-family:{FONT};">
      <div style="font-size:16px;font-weight:700;line-height:22px;color:{INK};">{esc(r['title'])}</div>
      <div style="font-size:14px;line-height:20px;color:{MUTED};margin-top:2px;">{esc(r['suburb'])}</div>
      <div style="margin-top:8px;"><span style="font-size:18px;font-weight:800;color:{theme.color};">{esc(r['price'])}</span> <span style="font-size:13px;color:{MUTED};">a week</span>
      {f'<span style="margin-left:8px;display:inline-block;padding:3px 9px;border-radius:999px;background:{theme.tint};color:{theme.ink};font-size:12px;font-weight:700;">{esc(r["badge"])}</span>' if r.get("badge") else ""}</div>
    </div>
  </a></td></tr>"""
        )
    return f'<table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="margin:22px 0 0;">{"".join(cells)}</table>'


def render(
    kind: str,
    *,
    title: str,
    preheader: str = "",
    greeting: Optional[str] = None,
    paragraphs: Sequence[str] = (),
    blocks: Sequence[str] = (),
    cta: Optional[tuple[str, str]] = None,
    after: Sequence[str] = (),
    footer_note: str = "",
    eyebrow: Optional[str] = None,
) -> str:
    """A whole email. `paragraphs` are plain text (escaped here); `blocks`
    and `after` are HTML made by the helpers above (details, tip, ...),
    placed before and after the button."""
    t = THEMES.get(kind, THEMES["account"])
    paras = "".join(f'<p style="margin:0 0 14px;font-family:{FONT};font-size:16px;line-height:25px;color:{BODY};">{esc(p)}</p>' for p in paragraphs)
    hello = f'<p style="margin:0 0 14px;font-family:{FONT};font-size:16px;line-height:25px;color:{BODY};">Hi {esc(greeting)},</p>' if greeting else ""
    preheader_html = f'<div style="display:none;max-height:0;overflow:hidden;opacity:0;color:transparent;">{esc(preheader)}&#847;&zwnj;&nbsp;&#847;&zwnj;&nbsp;&#847;&zwnj;&nbsp;</div>' if preheader else ""
    note = f'<p style="margin:14px 0 0;font-family:{FONT};font-size:12px;line-height:18px;color:#98A2B3;">{footer_note}</p>' if footer_note else ""
    year = "2026"
    return f"""<!DOCTYPE html>
<html lang="en-AU" xmlns="http://www.w3.org/1999/xhtml">
<head>
<meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><meta name="x-apple-disable-message-reformatting">
<meta name="color-scheme" content="light"><meta name="supported-color-schemes" content="light">
<title>{esc(title)}</title>
</head>
<body style="margin:0;padding:0;background:{PAGE};">
{preheader_html}
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" bgcolor="{PAGE}" style="background:{PAGE};">
<tr><td align="center" style="padding:28px 12px;">
  <table role="presentation" width="600" cellpadding="0" cellspacing="0" border="0" style="width:100%;max-width:600px;">
    <!-- header -->
    <tr><td style="padding:0 4px 16px;">
      <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0"><tr>
        <td style="vertical-align:middle;"><a href="{_site()}" style="text-decoration:none;"><img src="{asset('logo.png')}" width="34" height="34" alt="" style="display:inline-block;vertical-align:middle;border:0;border-radius:9px;"><span style="display:inline-block;vertical-align:middle;margin-left:10px;font-family:{FONT};font-size:21px;font-weight:800;letter-spacing:-0.4px;color:{INK};">Migrent</span></a></td>
        <td align="right" style="vertical-align:middle;"><a href="{_hub()}" style="font-family:{FONT};font-size:13px;font-weight:600;color:{t.color};text-decoration:none;">Open Migrent Hub</a></td>
      </tr></table>
    </td></tr>
    <!-- banner -->
    <tr><td style="border-radius:24px 24px 0 0;overflow:hidden;background:{t.color};">
      <img src="{asset(f'banner-{kind}.png')}" width="600" alt="" style="display:block;width:100%;max-width:600px;height:auto;border:0;border-radius:24px 24px 0 0;">
    </td></tr>
    <!-- card -->
    <tr><td bgcolor="#ffffff" style="background:#ffffff;padding:30px 36px 34px;border-radius:0 0 24px 24px;">
      <span style="display:inline-block;padding:5px 12px;border-radius:999px;background:{t.tint};font-family:{FONT};font-size:12px;font-weight:700;letter-spacing:0.06em;text-transform:uppercase;color:{t.ink};">{esc(eyebrow or t.label)}</span>
      <h1 style="margin:14px 0 18px;font-family:{FONT};font-size:28px;line-height:35px;font-weight:800;letter-spacing:-0.5px;color:{INK};">{esc(title)}</h1>
      {hello}{paras}{''.join(blocks)}
      {button(cta[0], cta[1], t) if cta else ''}
      {''.join(after)}
    </td></tr>
    <!-- safety strip -->
    <tr><td style="padding:18px 8px 0;">
      <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0"><tr>
        <td style="padding:14px 18px;border-radius:16px;background:#ffffff;font-family:{FONT};font-size:13px;line-height:19px;color:{BODY};">
          <b style="color:{INK};">Stay safe:</b> never pay a deposit or bond before you've seen a home and have a written agreement. Migrent will never ask for your password.
        </td></tr></table>
    </td></tr>
    <!-- footer -->
    <tr><td style="padding:18px 8px 0;">
      <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" bgcolor="{FOOTER}" style="background:{FOOTER};border-radius:20px;">
        <tr><td style="padding:26px 28px;font-family:{FONT};">
          <img src="{asset('logo.png')}" width="30" height="30" alt="" style="display:inline-block;vertical-align:middle;border:0;border-radius:8px;"><span style="display:inline-block;vertical-align:middle;margin-left:9px;font-size:18px;font-weight:800;color:#ffffff;">Migrent</span>
          <p style="margin:12px 0 16px;font-size:14px;line-height:21px;color:#C7D0E6;">Find, secure and manage a home in Australia. Hosts are ID-checked before a room goes live.</p>
          <p style="margin:0;font-size:13px;line-height:22px;">
            <a href="{_hub()}" style="color:#ffffff;text-decoration:none;font-weight:600;">Migrent Hub</a> <span style="color:#46557A;">&nbsp;|&nbsp;</span>
            <a href="{_site()}/seeker/search" style="color:#ffffff;text-decoration:none;font-weight:600;">Find a room</a> <span style="color:#46557A;">&nbsp;|&nbsp;</span>
            <a href="{_site()}/help" style="color:#ffffff;text-decoration:none;font-weight:600;">Help</a> <span style="color:#46557A;">&nbsp;|&nbsp;</span>
            <a href="{_hub()}/settings#notifications" style="color:#ffffff;text-decoration:none;font-weight:600;">Email settings</a>
          </p>
          {note}
          <p style="margin:14px 0 0;font-size:12px;line-height:18px;color:#7E8BA8;">&copy; {year} Migrent, Australia. You're getting this because you have a Migrent account or wrote to us.</p>
        </td></tr></table>
    </td></tr>
  </table>
</td></tr></table>
</body></html>"""


def render_raw(kind: str, content_html: str, *, preheader: str = "", title: str = "Migrent", footer_note: str = "") -> str:
    """The new frame around older hand-written content (kept for anything
    not yet written with the helpers above)."""
    return render(kind, title=title, preheader=preheader, blocks=[content_html], footer_note=footer_note, eyebrow=None).replace(
        f'<h1 style="margin:14px 0 18px;font-family:{FONT};font-size:28px;line-height:35px;font-weight:800;letter-spacing:-0.5px;color:{INK};">{esc(title)}</h1>', "", 1
    )
