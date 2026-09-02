# Legal identity, fees and public claims

Single source in code: `frontend/lib/siteIdentity.ts` (fees mirrored in `backend/payments.py`). Everything below is either confirmed there or listed as a release blocker.

## Confirmed and now consistent across the site

| Item | Value | Source |
|---|---|---|
| Brand name | MigRent (never "MigRent AI") | `siteIdentity.brandName` |
| ABN | 22 669 566 941 | appeared consistently in prior copy |
| Live domain | https://migrent.vercel.app | `lib/site.ts` |
| Support channel | email, weekdays, reply within one business day | `siteIdentity.support` |
| Host fee | AUD $99 per property, charged when the first booking on that property is confirmed; later bookings on the same property incur nothing (`FEE_MODEL=per_property`) | `siteIdentity.fees.host`, `backend/payments.py`, `routes_bookings.listing_fee_due` |
| Seeker fees | $0. MigRent never holds rent, bond or deposit. Stripe processes the host fee only. | `siteIdentity.fees.seeker` |
| Paid seeker "verification" ($19) | disabled (`SEEKER_VERIFICATION_ENABLED=false`); it set a `verified` flag without checking anything | `routes_verification.py` |
| Legacy "deals" flow | retired (410) | `routes_deals.py` |

## Release blockers: decisions only the owner and Australian counsel can make

1. **Legal entity.** Old copy said "MigRent Pty Ltd", "Sole Trader" and "MigRent AI". Public copy now shows the trading name and ABN only, with "Entity details are being confirmed" where a structure was previously asserted. Set `siteIdentity.legalEntity` once confirmed.
2. **Principal place of business.** Old copy said both "Sydney, NSW" and "Naarm / Melbourne". Public copy now says "Australia". The arbitration seat in `/contact-legal` and `/support-disputes` still says Sydney; counsel must confirm the seat and governing law.
3. **Custom domain.** `migrent.com.au` is registered with no DNS. It must not appear in canonical URLs, sitemaps or "email us at" copy until it resolves and role mailboxes exist (`siteIdentity.plannedDomainLive`).
4. **Role email addresses.** Only `migrentau@gmail.com` works. `support@ / legal@ / privacy@migrent.com.au` do not exist and were removed from public copy. Gmail as the sending address also fails DMARC; verify a sending domain in Resend before relying on transactional mail.
5. **Terms, privacy, consent, indemnity, no-agency wording.** Sign-up now asks for one consent (Terms + Privacy + 18+). The facilitator, rental-law and indemnity statements moved from checkboxes into acknowledgement text and the Terms. Counsel must review: whether an indemnity from consumers is enforceable under the ACL; the "not an agent" positioning against state property-agent licensing; bond guidance per state (NSW RBO, VIC RTBA, QLD RTA); representations about verification; retention of ID documents; minors (see `docs/policies/age-and-safeguarding.md`).
6. **Effective and review dates.** Unknown; `siteIdentity.legal.*` are null and pages that showed "Last reviewed: March 2026" should be confirmed or updated by counsel.
7. **Fee model.** The site promised "$99 per property" while the code charged per booking and the calculator charged per room. Code now matches the promise (per property). If the intended model is per booking, flip `FEE_MODEL` and change the pricing page before deploying.
8. **Named people and quotes.** Blog authors ("Priya Sharma" etc.), the founder note on `/contact`, and any testimonial must be real, consented people. Author markup is no longer emitted in structured data until confirmed.
9. **Suburb statistics.** Sources and as-at dates exist as columns (`suburbs.data_source`, `data_as_at`, migration 041) but are not populated for most rows; pages should not show a figure without its source.
10. **GST statement** on `/abn-terms` ("not registered for GST as turnover is below $75,000") is a factual claim only the owner can confirm.

## Sign-up consent

One required checkbox: "I agree to the Terms of Service and Privacy Policy, and I am 18 or older." Acknowledgement text beneath it states the facilitator model, no rent/bond handling and the rental-law obligation. This is the minimum needed to form the contract; it is not legal advice. Counsel should confirm whether separate, unbundled consents are required for any purpose under the Privacy Act (for example marketing email).
