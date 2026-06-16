import { motion } from "framer-motion";
import GlassCard, { StatusBadge } from "../ui/GlassCard";
import {
  Building2,
  Receipt,
  FileText,
  ExternalLink,
  DollarSign,
} from "lucide-react";
import type { ProfileData } from "../../hooks/useSettingsData";

interface PaymentsTabProps {
  profile: ProfileData | null;
  isOwner: boolean;
  showMessage: (text: string, type: "success" | "error" | "info") => void;
}

export default function PaymentsTab({ profile, isOwner, showMessage }: PaymentsTabProps) {
  const handleStripeConnect = () => {
    showMessage("Redirecting to Stripe Connect setup...", "info");
    // Redirect to Stripe Connect onboarding URL from backend
  };

  return (
    <div className="space-y-6">
      {/* Payout Method */}
      <GlassCard delay={0.05} gradient="pink-indigo">
        <div className="flex items-start gap-4 mb-4">
          <div className="w-10 h-10 rounded-xl bg-[var(--color-primary-soft)] from-[var(--color-accent)] to-[var(--color-primary)] flex items-center justify-center shadow-lg shrink-0">
            <Building2 className="w-5 h-5 text-white" />
          </div>
          <div className="flex-1">
            <h3 className="font-bold text-[var(--color-ink)]">Payout Method</h3>
            <p className="text-xs text-[var(--color-ink-3)]">Where your earnings will be sent</p>
          </div>
        </div>

        <div className="ml-14 space-y-3">
          {/* Stripe Connect */}
          <div className="flex items-center justify-between p-3 rounded-xl border border-[var(--color-line)] bg-[var(--color-surface)]/50 dark:bg-[var(--color-surface-muted)]/30">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-lg bg-[#635BFF] flex items-center justify-center">
                <span className="text-white text-xs font-bold">S</span>
              </div>
              <div>
                <p className="text-sm font-medium text-[var(--color-ink-2)]">Stripe Connect</p>
                <p className="text-xs text-[var(--color-ink-3)]">Secure payment processing</p>
              </div>
            </div>
            <button
              onClick={handleStripeConnect}
              className="flex items-center gap-1 text-xs text-[var(--color-primary)] hover:text-[var(--color-primary)] font-medium"
            >
              Set up <ExternalLink className="w-3 h-3" />
            </button>
          </div>

          <p className="text-xs text-[var(--color-ink-3)]">
            Connect your bank account through Stripe to receive booking payments securely.
          </p>
        </div>
      </GlassCard>

      {/* Payout History */}
      <GlassCard delay={0.1}>
        <div className="flex items-start gap-4 mb-4">
          <div className="w-10 h-10 rounded-xl bg-[var(--color-primary-soft)] from-blue-400 to-[var(--color-primary)] flex items-center justify-center shadow-lg shrink-0">
            <Receipt className="w-5 h-5 text-white" />
          </div>
          <div>
            <h3 className="font-bold text-[var(--color-ink)]">Payout History</h3>
            <p className="text-xs text-[var(--color-ink-3)]">Your recent payouts</p>
          </div>
        </div>

        <div className="ml-14">
          <div className="text-center py-8">
            <DollarSign className="w-8 h-8 text-[var(--color-ink-4)] mx-auto mb-2" />
            <p className="text-sm font-medium text-[var(--color-ink-3)]">No payouts yet</p>
            <p className="text-xs text-[var(--color-ink-3)] mt-1">
              Your payout history will appear here once you receive your first booking payment.
            </p>
          </div>
        </div>
      </GlassCard>

      {/* Tax Settings */}
      <GlassCard delay={0.2}>
        <div className="flex items-start gap-4 mb-4">
          <div className="w-10 h-10 rounded-xl bg-[var(--color-primary-soft)] from-cyan-400 to-[var(--color-primary)] flex items-center justify-center shadow-lg shrink-0">
            <FileText className="w-5 h-5 text-white" />
          </div>
          <div>
            <h3 className="font-bold text-[var(--color-ink)]">Tax Settings</h3>
            <p className="text-xs text-[var(--color-ink-3)]">ABN and invoicing preferences</p>
          </div>
        </div>

        <div className="ml-14 space-y-3">
          <div>
            <label className="block text-xs font-medium text-[var(--color-ink-3)] mb-1.5">ABN (optional)</label>
            <input
              type="text"
              placeholder="Enter your ABN"
              className="input-field bg-[var(--color-surface)] text-[var(--color-ink-2)] flex-1 w-full"
              maxLength={14}
            />
            <p className="text-xs text-[var(--color-ink-3)] mt-1">
              Required for owners earning over $75,000/year.
            </p>
          </div>
          <div className="flex items-center justify-between p-3 rounded-xl border border-[var(--color-line)] bg-[var(--color-surface)]/50 dark:bg-[var(--color-surface-muted)]/30">
            <div>
              <p className="text-sm font-medium text-[var(--color-ink-2)]">Invoice Template</p>
              <p className="text-xs text-[var(--color-ink-3)]">Auto-generate PDF invoices for payouts</p>
            </div>
            <StatusBadge status="info" label="In next release" />
          </div>
        </div>
      </GlassCard>
    </div>
  );
}
