import Link from "next/link";
import { ShieldQuestion } from "lucide-react";
import SEOHead from "../components/SEOHead";

/**
 * Landing page for Stripe's cancel redirect if the optional $19
 * verification-badge checkout is abandoned. No charge is made.
 */
export default function VerificationCancelled() {
  return (
    <>
      <SEOHead
        title="Verification payment cancelled"
        description="The verification badge checkout was cancelled. No charge was made."
        noIndex
      />
      <div className="min-h-[70vh] flex items-center justify-center px-6">
        <div className="max-w-[480px] w-full text-center py-16">
          <span className="mx-auto w-12 h-12 rounded-full bg-[var(--color-surface-2)] border border-[var(--color-line)] text-[var(--color-ink-2)] flex items-center justify-center">
            <ShieldQuestion className="w-6 h-6" />
          </span>
          <div className="eyebrow mt-6">Checkout cancelled</div>
          <h1 className="font-serif text-[36px] sm:text-[42px] leading-[1.05] tracking-[-0.02em] text-[var(--color-ink)] mt-2">
            No charge was made.
          </h1>
          <p className="text-[15px] text-[var(--color-ink-2)] leading-[1.6] mt-4">
            You left the verification checkout before paying, so nothing was
            billed. The badge is optional - you can pick it up any time from
            your account settings.
          </p>
          <div className="flex flex-wrap justify-center gap-3 mt-8">
            <Link
              href="/account/settings?tab=verification"
              className="btn-primary h-[44px] px-6 rounded-[10px] inline-flex items-center text-[14.5px]"
            >
              Back to verification
            </Link>
            <Link
              href="/"
              className="h-[44px] px-6 rounded-[10px] inline-flex items-center text-[14.5px] font-semibold border border-[var(--color-line-2)] text-[var(--color-ink)] hover:bg-[var(--color-surface-2)] transition-colors"
            >
              Back to home
            </Link>
          </div>
        </div>
      </div>
    </>
  );
}
