import { useState } from "react";
import { motion } from "framer-motion";
import GlassCard, { StatusBadge } from "../ui/GlassCard";
import {
  CreditCard,
  Building2,
  Receipt,
  Download,
  FileText,
  ExternalLink,
  DollarSign,
  CheckCircle2,
  Clock,
  TrendingUp,
  ArrowUpRight,
} from "lucide-react";
import type { ProfileData } from "../../hooks/useSettingsData";

interface PaymentsTabProps {
  profile: ProfileData | null;
  isOwner: boolean;
  showMessage: (text: string, type: "success" | "error" | "info") => void;
}

// Mock payout history
const MOCK_PAYOUTS = [
  { id: "1", date: "2026-02-28", amount: 1200, status: "completed", description: "Payout — February 2026" },
  { id: "2", date: "2026-01-31", amount: 950, status: "completed", description: "Payout — January 2026" },
  { id: "3", date: "2025-12-31", amount: 1100, status: "completed", description: "Payout — December 2025" },
];

export default function PaymentsTab({ profile, isOwner, showMessage }: PaymentsTabProps) {
  const [exportingCsv, setExportingCsv] = useState(false);

  const handleExportCsv = () => {
    setExportingCsv(true);
    showMessage("CSV export started — check your downloads", "success");
    setTimeout(() => setExportingCsv(false), 2000);
  };

  const handleStripeConnect = () => {
    showMessage("Redirecting to Stripe Connect setup...", "info");
    // In prod: redirect to Stripe Connect onboarding URL from backend
  };

  return (
    <div className="space-y-6">
      {/* Payout Method */}
      <GlassCard delay={0.05} gradient="pink-indigo">
        <div className="flex items-start gap-4 mb-4">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-emerald-400 to-teal-500 flex items-center justify-center shadow-lg shrink-0">
            <Building2 className="w-5 h-5 text-white" />
          </div>
          <div className="flex-1">
            <h3 className="font-bold text-slate-900 dark:text-white">Payout Method</h3>
            <p className="text-xs text-slate-500 dark:text-slate-400">Where your earnings will be sent</p>
          </div>
        </div>

        <div className="ml-14 space-y-3">
          <div className="flex items-center justify-between p-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50/50 dark:bg-slate-800/30">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-lg bg-slate-800 dark:bg-white flex items-center justify-center">
                <CreditCard className="w-4 h-4 text-white dark:text-slate-900" />
              </div>
              <div>
                <p className="text-sm font-medium text-slate-700 dark:text-slate-300">Bank Account</p>
                <p className="text-xs text-slate-400">·· ·· 4921</p>
              </div>
            </div>
            <StatusBadge status="verified" label="Primary" />
          </div>

          {/* Stripe Connect */}
          <div className="flex items-center justify-between p-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50/50 dark:bg-slate-800/30">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-lg bg-[#635BFF] flex items-center justify-center">
                <span className="text-white text-xs font-bold">S</span>
              </div>
              <div>
                <p className="text-sm font-medium text-slate-700 dark:text-slate-300">Stripe Connect</p>
                <p className="text-xs text-slate-400">Secure payment processing</p>
              </div>
            </div>
            <button
              onClick={handleStripeConnect}
              className="flex items-center gap-1 text-xs text-indigo-500 hover:text-indigo-600 font-medium"
            >
              Manage <ExternalLink className="w-3 h-3" />
            </button>
          </div>
        </div>
      </GlassCard>

      {/* Payout History */}
      <GlassCard delay={0.1}>
        <div className="flex items-start justify-between gap-4 mb-4">
          <div className="flex items-start gap-4">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-400 to-indigo-500 flex items-center justify-center shadow-lg shrink-0">
              <Receipt className="w-5 h-5 text-white" />
            </div>
            <div>
              <h3 className="font-bold text-slate-900 dark:text-white">Payout History</h3>
              <p className="text-xs text-slate-500 dark:text-slate-400">Your recent payouts</p>
            </div>
          </div>
          <button
            onClick={handleExportCsv}
            disabled={exportingCsv}
            className="flex items-center gap-1 text-xs text-slate-500 hover:text-slate-700 dark:hover:text-slate-300 font-medium transition-colors"
          >
            <Download className="w-3.5 h-3.5" />
            {exportingCsv ? "Exporting..." : "Export CSV"}
          </button>
        </div>

        <div className="ml-14">
          {MOCK_PAYOUTS.length > 0 ? (
            <div className="space-y-2">
              {MOCK_PAYOUTS.map((payout, i) => (
                <motion.div
                  key={payout.id}
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.15 + i * 0.05 }}
                  className="flex items-center justify-between p-3 rounded-xl border border-slate-100 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors group"
                >
                  <div className="flex items-center gap-3">
                    <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${
                      payout.status === "completed"
                        ? "bg-emerald-100 dark:bg-emerald-500/10"
                        : "bg-amber-100 dark:bg-amber-500/10"
                    }`}>
                      {payout.status === "completed" ? (
                        <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                      ) : (
                        <Clock className="w-4 h-4 text-amber-500" />
                      )}
                    </div>
                    <div>
                      <p className="text-sm font-medium text-slate-700 dark:text-slate-300">{payout.description}</p>
                      <p className="text-[11px] text-slate-400">
                        {new Date(payout.date).toLocaleDateString("en-AU", {
                          day: "numeric",
                          month: "short",
                          year: "numeric",
                        })}
                      </p>
                    </div>
                  </div>
                  <div className="text-right flex items-center gap-2">
                    <span className="text-sm font-bold text-slate-900 dark:text-white">
                      ${payout.amount.toLocaleString()}
                    </span>
                    <button className="opacity-0 group-hover:opacity-100 transition-opacity p-1">
                      <FileText className="w-3.5 h-3.5 text-slate-400 hover:text-slate-600" />
                    </button>
                  </div>
                </motion.div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8">
              <DollarSign className="w-8 h-8 text-slate-300 dark:text-slate-600 mx-auto mb-2" />
              <p className="text-sm text-slate-400 dark:text-slate-500">No payouts yet</p>
            </div>
          )}
        </div>
      </GlassCard>

      {/* Billing / Subscription */}
      <GlassCard delay={0.2}>
        <div className="flex items-start gap-4 mb-4">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-purple-400 to-pink-500 flex items-center justify-center shadow-lg shrink-0">
            <CreditCard className="w-5 h-5 text-white" />
          </div>
          <div>
            <h3 className="font-bold text-slate-900 dark:text-white">Billing</h3>
            <p className="text-xs text-slate-500 dark:text-slate-400">Your subscription & fees</p>
          </div>
        </div>

        <div className="ml-14 space-y-3">
          {isOwner && (
            <div className="flex items-center justify-between p-3 rounded-xl border border-emerald-200 dark:border-emerald-500/20 bg-emerald-50/50 dark:bg-emerald-500/5">
              <div>
                <p className="text-sm font-medium text-slate-700 dark:text-slate-300">Owner Annual Plan</p>
                <p className="text-xs text-slate-400">$99/year · Paid Jan 2026</p>
              </div>
              <StatusBadge status="verified" label="Active" />
            </div>
          )}
          <div className="flex items-center justify-between p-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50/50 dark:bg-slate-800/30">
            <div>
              <p className="text-sm font-medium text-slate-700 dark:text-slate-300">Seeker Verification</p>
              <p className="text-xs text-slate-400">$19 one-time · Paid</p>
            </div>
            <StatusBadge status="verified" label="Paid" />
          </div>
        </div>
      </GlassCard>

      {/* Tax Settings */}
      <GlassCard delay={0.25}>
        <div className="flex items-start gap-4 mb-4">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-cyan-400 to-blue-500 flex items-center justify-center shadow-lg shrink-0">
            <FileText className="w-5 h-5 text-white" />
          </div>
          <div>
            <h3 className="font-bold text-slate-900 dark:text-white">Tax Settings</h3>
            <p className="text-xs text-slate-500 dark:text-slate-400">ABN & invoicing preferences</p>
          </div>
        </div>

        <div className="ml-14 space-y-3">
          <div>
            <label className="block text-xs font-medium text-slate-500 dark:text-slate-400 mb-1.5">ABN</label>
            <div className="flex items-center gap-2">
              <div className="input-field bg-slate-50 dark:bg-slate-800/50 cursor-not-allowed text-slate-600 dark:text-slate-300 flex-1 flex items-center justify-between">
                <span>22 669 566 941</span>
                <StatusBadge status="verified" label="Valid" />
              </div>
            </div>
          </div>
          <div className="flex items-center justify-between p-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50/50 dark:bg-slate-800/30">
            <div>
              <p className="text-sm font-medium text-slate-700 dark:text-slate-300">Invoice Template</p>
              <p className="text-xs text-slate-400">Auto-generate PDF invoices for payouts</p>
            </div>
            <StatusBadge status="info" label="Coming Soon" />
          </div>
        </div>
      </GlassCard>
    </div>
  );
}
