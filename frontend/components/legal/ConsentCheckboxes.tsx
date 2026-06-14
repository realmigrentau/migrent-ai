import Link from "next/link";
import { motion } from "framer-motion";

interface ConsentCheckboxesProps {
  consents: {
    facilitator: boolean;
    terms: boolean;
    rentalLaws: boolean;
    indemnity: boolean;
  };
  onChange: (consents: ConsentCheckboxesProps["consents"]) => void;
  error?: string;
}

export default function ConsentCheckboxes({ consents, onChange, error }: ConsentCheckboxesProps) {
  const allChecked = consents.facilitator && consents.terms && consents.rentalLaws && consents.indemnity;

  const toggle = (key: keyof typeof consents) => {
    onChange({ ...consents, [key]: !consents[key] });
  };

  return (
    <div className="space-y-3">
      <p className="text-xs font-semibold text-[var(--color-ink-3)] uppercase tracking-wider">
        Legal Acknowledgements
      </p>

      <label className="flex items-start gap-3 cursor-pointer group">
        <input
          type="checkbox"
          checked={consents.facilitator}
          onChange={() => toggle("facilitator")}
          className="mt-0.5 w-4 h-4 rounded border-[var(--color-line-2)] dark:border-[var(--color-line-2)] text-[var(--color-primary)] focus:ring-[var(--color-ink)]/30 dark:bg-[var(--color-surface-muted)] shrink-0"
        />
        <span className="text-xs text-[var(--color-ink-2)] leading-relaxed group-hover:text-[var(--color-ink)] dark:group-hover:text-white transition-colors">
          I understand MigRent is a <strong>facilitator only</strong>, not a real estate agent, and does not collect rent, bonds, or manage tenancy agreements.
        </span>
      </label>

      <label className="flex items-start gap-3 cursor-pointer group">
        <input
          type="checkbox"
          checked={consents.terms}
          onChange={() => toggle("terms")}
          className="mt-0.5 w-4 h-4 rounded border-[var(--color-line-2)] dark:border-[var(--color-line-2)] text-[var(--color-primary)] focus:ring-[var(--color-ink)]/30 dark:bg-[var(--color-surface-muted)] shrink-0"
        />
        <span className="text-xs text-[var(--color-ink-2)] leading-relaxed group-hover:text-[var(--color-ink)] dark:group-hover:text-white transition-colors">
          I agree to the{" "}
          <Link href="/terms-of-service" target="_blank" className="text-[var(--color-primary)] hover:text-[var(--color-primary)] dark:hover:text-[var(--color-primary)] underline underline-offset-2">Terms of Service</Link>,{" "}
          <Link href="/privacy-policy" target="_blank" className="text-[var(--color-primary)] hover:text-[var(--color-primary)] dark:hover:text-[var(--color-primary)] underline underline-offset-2">Privacy Policy</Link>, and{" "}
          <Link href="/disclaimer" target="_blank" className="text-[var(--color-primary)] hover:text-[var(--color-primary)] dark:hover:text-[var(--color-primary)] underline underline-offset-2">Platform Disclaimer</Link>.
        </span>
      </label>

      <label className="flex items-start gap-3 cursor-pointer group">
        <input
          type="checkbox"
          checked={consents.rentalLaws}
          onChange={() => toggle("rentalLaws")}
          className="mt-0.5 w-4 h-4 rounded border-[var(--color-line-2)] dark:border-[var(--color-line-2)] text-[var(--color-primary)] focus:ring-[var(--color-ink)]/30 dark:bg-[var(--color-surface-muted)] shrink-0"
        />
        <span className="text-xs text-[var(--color-ink-2)] leading-relaxed group-hover:text-[var(--color-ink)] dark:group-hover:text-white transition-colors">
          I will comply with all applicable <Link href="/rental-laws" target="_blank" className="text-[var(--color-primary)] hover:text-[var(--color-primary)] dark:hover:text-[var(--color-primary)] underline underline-offset-2">local rental laws</Link> and regulations in my state or territory.
        </span>
      </label>

      <label className="flex items-start gap-3 cursor-pointer group">
        <input
          type="checkbox"
          checked={consents.indemnity}
          onChange={() => toggle("indemnity")}
          className="mt-0.5 w-4 h-4 rounded border-[var(--color-line-2)] dark:border-[var(--color-line-2)] text-[var(--color-primary)] focus:ring-[var(--color-ink)]/30 dark:bg-[var(--color-surface-muted)] shrink-0"
        />
        <span className="text-xs text-[var(--color-ink-2)] leading-relaxed group-hover:text-[var(--color-ink)] dark:group-hover:text-white transition-colors">
          I <Link href="/terms-of-service#10" target="_blank" className="text-[var(--color-primary)] hover:text-[var(--color-primary)] dark:hover:text-[var(--color-primary)] underline underline-offset-2">indemnify MigRent</Link> against any claims arising from deals or arrangements I make through the platform.
        </span>
      </label>

      {error && !allChecked && (
        <motion.p
          initial={{ opacity: 0, y: -5 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-xs text-[var(--color-danger-500)] dark:text-[var(--color-danger-500)]"
        >
          {error}
        </motion.p>
      )}
    </div>
  );
}
