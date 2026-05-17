import { useState } from "react";
import { motion } from "framer-motion";
import GlassCard, { ToggleSwitch } from "../ui/GlassCard";
import {
  Mail,
  Bell,
  Smartphone,
  MessageSquare,
  DollarSign,
  Shield,
  BarChart3,
  Zap,
  Send,
  CheckCircle2,
  Loader2,
  AlertCircle,
} from "lucide-react";
import type { NotificationPrefs } from "../../hooks/useSettingsData";
import { useNotifications } from "../../hooks/useNotifications";

interface NotificationsTabProps {
  notifPrefs: NotificationPrefs;
  updateNotifPrefs: (key: keyof NotificationPrefs, value: boolean) => void;
  showMessage: (text: string, type: "success" | "error" | "info") => void;
}

export default function NotificationsTab({
  notifPrefs,
  updateNotifPrefs,
  showMessage,
}: NotificationsTabProps) {
  const [testSent, setTestSent] = useState(false);
  const { sendTestEmail, sending } = useNotifications();

  const handleTestEmail = async () => {
    try {
      await sendTestEmail();
      setTestSent(true);
      showMessage("Test email sent! Check your inbox.", "success");
      setTimeout(() => setTestSent(false), 3000);
    } catch (err: any) {
      showMessage(err.message || "Failed to send test email", "error");
    }
  };

  const emailPrefs: Array<{
    key: keyof NotificationPrefs;
    label: string;
    description: string;
    icon: any;
    gradient: string;
  }> = [
    {
      key: "email_bookings",
      label: "Booking Requests",
      description: "When someone requests to book your room",
      icon: MessageSquare,
      gradient: "from-blue-400 to-[var(--color-primary)]",
    },
    {
      key: "email_payments",
      label: "Payments Received",
      description: "When you receive a payout or payment",
      icon: DollarSign,
      gradient: "from-[var(--color-accent)] to-teal-500",
    },
    {
      key: "email_verification",
      label: "Verification Updates",
      description: "Status changes for your identity verification",
      icon: Shield,
      gradient: "from-amber-400 to-orange-500",
    },
    {
      key: "email_messages",
      label: "New Messages",
      description: "When you receive a new message from a user",
      icon: Mail,
      gradient: "from-[var(--color-primary)] to-[var(--color-primary)]",
    },
    {
      key: "email_weekly_summary",
      label: "Weekly Summary",
      description: "A weekly overview of your listings & activity",
      icon: BarChart3,
      gradient: "from-[var(--color-primary)] to-[var(--color-primary)]",
    },
  ];

  const pushPrefs: Array<{
    key: keyof NotificationPrefs;
    label: string;
    description: string;
    icon: any;
    gradient: string;
  }> = [
    {
      key: "push_matches",
      label: "New Matches",
      description: "When AI finds a matching room for you",
      icon: Zap,
      gradient: "from-yellow-400 to-amber-500",
    },
    {
      key: "push_host_responses",
      label: "Host Responses",
      description: "When a host responds to your inquiry",
      icon: MessageSquare,
      gradient: "from-cyan-400 to-[var(--color-primary)]",
    },
    {
      key: "push_new_listings",
      label: "New Listings",
      description: "When new rooms match your preferences",
      icon: Bell,
      gradient: "from-[var(--color-primary)] to-[var(--color-primary)]",
    },
  ];

  return (
    <div className="space-y-6">
      {/* Email Preferences */}
      <GlassCard delay={0.05}>
        <div className="flex items-start gap-4 mb-5">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-400 to-[var(--color-primary)] flex items-center justify-center shadow-lg shrink-0">
            <Mail className="w-5 h-5 text-white" />
          </div>
          <div>
            <h3 className="font-bold text-slate-900 dark:text-white">Email Notifications</h3>
            <p className="text-xs text-slate-500 dark:text-slate-400">Choose what emails you'd like to receive</p>
          </div>
        </div>

        <div className="ml-14 space-y-1">
          {emailPrefs.map((pref, i) => {
            const Icon = pref.icon;
            return (
              <motion.div
                key={pref.key}
                initial={{ opacity: 0, x: -8 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.1 + i * 0.04 }}
                className="flex items-center justify-between p-3 rounded-xl hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors group"
              >
                <div className="flex items-center gap-3 flex-1 min-w-0">
                  <div className={`w-8 h-8 rounded-lg bg-gradient-to-br ${pref.gradient} flex items-center justify-center shadow-sm shrink-0`}>
                    <Icon className="w-4 h-4 text-white" />
                  </div>
                  <div className="min-w-0">
                    <p className="text-sm font-medium text-slate-900 dark:text-white">{pref.label}</p>
                    <p className="text-[11px] text-slate-400 dark:text-slate-500 truncate">{pref.description}</p>
                  </div>
                </div>
                <ToggleSwitch
                  enabled={notifPrefs[pref.key]}
                  onChange={(val) => updateNotifPrefs(pref.key, val)}
                />
              </motion.div>
            );
          })}
        </div>
      </GlassCard>

      {/* Push Notifications */}
      <GlassCard delay={0.15}>
        <div className="flex items-start gap-4 mb-5">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-amber-400 to-orange-500 flex items-center justify-center shadow-lg shrink-0">
            <Smartphone className="w-5 h-5 text-white" />
          </div>
          <div>
            <h3 className="font-bold text-slate-900 dark:text-white">Push Notifications</h3>
            <p className="text-xs text-slate-500 dark:text-slate-400">Real-time alerts on your device</p>
          </div>
        </div>

        <div className="ml-14 space-y-1">
          {pushPrefs.map((pref, i) => {
            const Icon = pref.icon;
            return (
              <motion.div
                key={pref.key}
                initial={{ opacity: 0, x: -8 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.2 + i * 0.04 }}
                className="flex items-center justify-between p-3 rounded-xl hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors"
              >
                <div className="flex items-center gap-3 flex-1 min-w-0">
                  <div className={`w-8 h-8 rounded-lg bg-gradient-to-br ${pref.gradient} flex items-center justify-center shadow-sm shrink-0`}>
                    <Icon className="w-4 h-4 text-white" />
                  </div>
                  <div className="min-w-0">
                    <p className="text-sm font-medium text-slate-900 dark:text-white">{pref.label}</p>
                    <p className="text-[11px] text-slate-400 dark:text-slate-500 truncate">{pref.description}</p>
                  </div>
                </div>
                <ToggleSwitch
                  enabled={notifPrefs[pref.key]}
                  onChange={(val) => updateNotifPrefs(pref.key, val)}
                />
              </motion.div>
            );
          })}
        </div>
      </GlassCard>

      {/* Smart System Info */}
      <GlassCard delay={0.25} gradient="emerald">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[var(--color-accent)] to-teal-500 flex items-center justify-center shadow-lg shrink-0">
            <Zap className="w-5 h-5 text-white" />
          </div>
          <div className="flex-1">
            <h3 className="text-sm font-bold text-slate-900 dark:text-white">Smart Notifications</h3>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Emails powered by our intelligent automation system for optimal delivery
            </p>
          </div>
        </div>
      </GlassCard>

      {/* Test Email */}
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
        className="flex justify-center"
      >
        <button
          onClick={handleTestEmail}
          disabled={testSent || sending}
          className={`
            flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-medium transition-all
            ${testSent
              ? "bg-[var(--color-accent-soft)] dark:bg-[var(--color-accent-soft)]0/10 text-[var(--color-accent)] dark:text-[var(--color-accent)] border border-[var(--color-accent-soft)] dark:border-[var(--color-accent-soft)]"
              : "btn-secondary hover:border-[var(--color-primary-soft)] dark:hover:border-[var(--color-primary)]/30"
            }
          `}
        >
          {sending ? (
            <>
              <Loader2 className="w-4 h-4 animate-spin" />
              Sending...
            </>
          ) : testSent ? (
            <>
              <CheckCircle2 className="w-4 h-4" />
              Test Email Sent!
            </>
          ) : (
            <>
              <Send className="w-4 h-4" />
              Send Test Email
            </>
          )}
        </button>
      </motion.div>
    </div>
  );
}
