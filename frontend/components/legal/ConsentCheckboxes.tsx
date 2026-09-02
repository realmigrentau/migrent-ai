import Link from "next/link";

/**
 * Sign-up consent.
 *
 * One required checkbox: agreement to the Terms and Privacy Policy. The
 * previous four checkboxes (facilitator status, rental-law compliance and a
 * broad indemnity) were UI friction standing in for legal drafting. Those
 * statements now appear as plain acknowledgements beneath the checkbox and
 * live in the Terms themselves, where counsel can review their wording.
 * See docs/legal/identity-and-claims.md, item "sign-up consent".
 *
 * The prop shape is unchanged so existing callers keep working: ticking the
 * box sets every key, unticking clears every key.
 */

interface Consents {
  facilitator: boolean;
  terms: boolean;
  rentalLaws: boolean;
  indemnity: boolean;
}

interface ConsentCheckboxesProps {
  consents: Consents;
  onChange: (consents: Consents) => void;
  error?: string;
  id?: string;
}

export default function ConsentCheckboxes({ consents, onChange, error, id = "consent-terms" }: ConsentCheckboxesProps) {
  const checked = consents.terms && consents.facilitator && consents.rentalLaws && consents.indemnity;
  const errorId = `${id}-error`;
  const descId = `${id}-description`;

  const set = (value: boolean) => onChange({ facilitator: value, terms: value, rentalLaws: value, indemnity: value });

  return (
    <div className="space-y-3">
      <div className="flex items-start gap-3">
        <input
          id={id}
          name="consent"
          type="checkbox"
          required
          checked={checked}
          onChange={(e) => set(e.target.checked)}
          aria-invalid={error && !checked ? true : undefined}
          aria-describedby={`${descId}${error && !checked ? ` ${errorId}` : ""}`}
          className="mt-0.5 w-5 h-5 rounded border-[var(--color-line-2)] text-[var(--color-primary)] focus:ring-[var(--color-ink)]/30 dark:bg-[var(--color-surface-muted)] shrink-0"
        />
        <label htmlFor={id} className="text-[13px] text-[var(--color-ink-2)] leading-relaxed cursor-pointer">
          I agree to the{" "}
          <Link href="/terms-of-service" target="_blank" rel="noopener" className="text-[var(--color-primary)] underline underline-offset-2">
            Terms of Service
          </Link>{" "}
          and{" "}
          <Link href="/privacy-policy" target="_blank" rel="noopener" className="text-[var(--color-primary)] underline underline-offset-2">
            Privacy Policy
          </Link>
          , and I am 18 or older.
        </label>
      </div>

      <p id={descId} className="text-[12px] text-[var(--color-ink-3)] leading-relaxed">
        By creating an account you acknowledge that MigRent introduces renters and hosts and is not a real estate agent; that it does not
        collect rent or bonds or manage tenancy agreements; and that you will follow the rental laws of your state or territory. The full
        wording is in the Terms.
      </p>

      {error && !checked && (
        <p id={errorId} role="alert" className="text-[12.5px] text-[var(--color-danger-500)]">
          {error}
        </p>
      )}
    </div>
  );
}
