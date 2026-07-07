import Link from "next/link";
import { BadgeCheck } from "lucide-react";
import SEOHead from "../components/SEOHead";

/**
 * Landing page for Stripe's success redirect after the optional $19
 * verification-badge payment (backend routes_verification.py).
 * Quiet confirmation per the design system - no confetti.
 */
export default function VerificationSuccess() {
  return (
    <>
      <SEOHead
        title="Verification payment received"
        description="Your verification badge payment was received."
        noIndex
      />
      <div className="min-h-[70vh] flex items-center justify-center px-6">
        <div className="max-w-[480px] w-full text-center py-16">
          <span className="mx-auto w-12 h-12 rounded-full bg-[var(--color-accent-soft)] text-[var(--color-accent)] flex items-center justify-center">
            <BadgeCheck className="w-6 h-6" />
          </span>
          <div className="eyebrow mt-6">Payment received</div>
          <h1 className="font-serif text-[36px] sm:text-[42px] leading-[1.05] tracking-[-0.02em] text-[var(--color-ink)] mt-2">
            Your verification is underway.
          </h1>
          <p className="text-[15px] text-[var(--color-ink-2)] leading-[1.6] mt-4">
            Thanks - your payment went through. Your verified badge will appear
            on your profile once your ID check is complete. You can follow the
            status from your account settings.
          </p>
          <div className="flex flex-wrap justify-center gap-3 mt-8">
            <Link
              href="/account/settings?tab=verification"
              className="btn-primary h-[44px] px-6 rounded-[10px] inline-flex items-center text-[14.5px]"
            >
              View verification status
            </Link>
            <Link
              href="/dashboard"
              className="h-[44px] px-6 rounded-[10px] inline-flex items-center text-[14.5px] font-semibold border border-[var(--color-line-2)] text-[var(--color-ink)] hover:bg-[var(--color-surface-2)] transition-colors"
            >
              Go to dashboard
            </Link>
          </div>
        </div>
      </div>
    </>
  );
}
