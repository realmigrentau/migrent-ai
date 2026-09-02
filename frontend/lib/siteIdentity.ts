/**
 * The single source of truth for who MigRent is, what it charges and how to
 * reach it. Every footer, legal page, contact page, email template and
 * pricing surface reads from here. Nothing below may be duplicated as a
 * string literal elsewhere; tests/unit/siteIdentity.test.ts greps for
 * drift.
 *
 * Fields marked `confirmed: false` are NOT verified facts. The site
 * previously alternated between "MigRent", "MigRent AI", "MigRent Pty Ltd",
 * "Sole Trader", "Sydney" and "Naarm / Melbourne". Until the owner and
 * Australian counsel confirm the legal identity, public copy uses the
 * neutral forms exposed by the helpers at the bottom of this file. See
 * docs/legal/identity-and-claims.md for the checklist.
 */

import { SITE_URL } from "./site";

export const IDENTITY_VERSION = "2026-09-03";

export const siteIdentity = {
  version: IDENTITY_VERSION,

  /** Public brand name. Always "MigRent". Never "MigRent AI". */
  brandName: "MigRent",

  /** Registered business identifiers. */
  abn: "22 669 566 941",

  /** UNCONFIRMED. Options observed in old copy: "Sole Trader", "Pty Ltd". */
  legalEntity: {
    name: "MigRent",
    entityType: null as "sole_trader" | "pty_ltd" | null,
    confirmed: false,
  },

  /** UNCONFIRMED. Old copy said both "Sydney, NSW" and "Naarm / Melbourne". */
  principalLocation: {
    city: null as string | null,
    state: null as string | null,
    country: "Australia",
    confirmed: false,
  },

  /** The domain the site is actually served from. migrent.com.au is
   * registered but has no DNS, so it must not appear in canonical URLs,
   * sitemaps or "contact us at" copy until it resolves. */
  domain: SITE_URL,
  plannedDomain: "https://migrent.com.au",
  plannedDomainLive: false,

  /** Only one inbox exists today. Role addresses at migrent.com.au have no
   * mailbox behind them (the domain has no MX), so they are not offered. */
  emails: {
    support: "migrentau@gmail.com",
    legal: "migrentau@gmail.com",
    privacy: "migrentau@gmail.com",
    security: "migrentau@gmail.com",
    press: "migrentau@gmail.com",
    roleAddressesLive: false,
  },

  /** What people can actually expect from support. No "24/7", no "24h". */
  support: {
    channel: "email" as const,
    hours: "weekdays, Australian business hours",
    responseTarget: "within one business day",
    phone: null as string | null,
  },

  /** Fees. These must agree with backend/payments.py. */
  fees: {
    currency: "AUD",
    host: {
      listingFee: 99,
      /** One fee per property, charged when the first booking on that
       * property is confirmed. Later bookings on the same property do not
       * incur it again. Mirrors FEE_MODEL=per_property on the backend. */
      model: "per_property" as "per_property" | "per_booking",
      chargedWhen: "when a booking on that property is first confirmed",
    },
    seeker: {
      platformFee: 0,
      /** The paid seeker badge is switched off (it verified nothing). */
      verification: { enabled: false, fee: 19 },
    },
    /** MigRent never holds rent, bonds or deposits. Stripe processes the
     * host fee only. */
    holdsRentOrBond: false,
  },

  /** Effective and review dates for legal documents. Unknown dates are
   * null and rendered as "under review" rather than invented. */
  legal: {
    termsEffective: null as string | null,
    privacyEffective: null as string | null,
    lastCounselReview: null as string | null,
    counselReviewRequired: true,
  },

  /** Claims that were removed because nothing supports them. Kept here so
   * a future copywriter sees why. */
  removedClaims: [
    "24/7 support",
    "All systems operational",
    "MigRent Guarantee",
    "thousands of listings",
    "every host verified (as an absolute)",
    "no rental history needed (as an absolute)",
    "Sydney & Adelaide (manifest)",
  ],
} as const;

/** Neutral copyright line that asserts only what is confirmed. */
export function copyrightLine(year = new Date().getFullYear()): string {
  return `© ${year} ${siteIdentity.brandName} · ABN ${siteIdentity.abn} · ${siteIdentity.principalLocation.country}`;
}

/** Business-details block for contact/legal pages. */
export function businessDetails(): { label: string; value: string }[] {
  const rows: { label: string; value: string }[] = [
    { label: "Trading name", value: siteIdentity.brandName },
    { label: "ABN", value: siteIdentity.abn },
    { label: "Location", value: siteIdentity.principalLocation.country },
    { label: "Email", value: siteIdentity.emails.support },
  ];
  if (siteIdentity.legalEntity.confirmed && siteIdentity.legalEntity.entityType) {
    rows.splice(1, 0, { label: "Structure", value: siteIdentity.legalEntity.entityType === "pty_ltd" ? "Pty Ltd" : "Sole trader" });
  }
  return rows;
}

export function supportPromise(): string {
  return `Email support, ${siteIdentity.support.hours}. We aim to reply ${siteIdentity.support.responseTarget}.`;
}

export function hostFeeSentence(): string {
  const { listingFee, chargedWhen } = siteIdentity.fees.host;
  return `Hosts pay a one-off AUD $${listingFee} per property, ${chargedWhen}. Nothing before, nothing after.`;
}

export function seekerFeeSentence(): string {
  return "Renters pay MigRent nothing. Browsing, messaging and applying are free, and MigRent never handles your rent or bond.";
}
