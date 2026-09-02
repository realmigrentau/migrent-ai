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
  // The "Send test email" button used to call an open /api/emails/send
  // endpoint that would mail any address it was given. Transactional email
  // is sent by the backend only; there is no browser-triggered send.

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
      gradient: "from-[var(--color-accent)] to-[var(--color-primary)]",
    },
    {
      key: "email_verification",
      label: "Verification Updates",
      description: "Status changes for your identity verification",
      icon: Shield,
      gradient: "from-[var(--color-warn-500)] to-[var(--color-warn-500)]",
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
      gradient: "from-yellow-400 to-[var(--color-warn-500)]",
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
          <div className="w-10 h-10 rounded-xl bg-[var(--color-primary-soft)] from-blue-400 to-[var(--color-primary)] flex items-center justify-center shadow-lg shrink-0">
            <Mail className="w-5 h-5 text-white" />
          </div>
          <div>
            <h3 className="font-bold text-[var(--color-ink)]">Email Notifications</h3>
            <p className="text-xs text-[var(--color-ink-3)]">Choose what emails you'd like to receive</p>
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
                className="flex items-center justify-between p-3 rounded-xl hover:bg-[var(--color-surface)]/50 transition-colors group"
              >
                <div className="flex items-center gap-3 flex-1 min-w-0">
                  <div className={`w-8 h-8 rounded-lg bg-[var(--color-primary-soft)] ${pref.gradient} flex items-center justify-center shadow-sm shrink-0`}>
                    <Icon className="w-4 h-4 text-white" />
                  </div>
                  <div className="min-w-0">
                    <p className="text-sm font-medium text-[var(--color-ink)]">{pref.label}</p>
                    <p className="text-[11px] text-[var(--color-ink-3)] truncate">{pref.description}</p>
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
          <div className="w-10 h-10 rounded-xl bg-[var(--color-primary-soft)] from-[var(--color-warn-500)] to-[var(--color-warn-500)] flex items-center justify-center shadow-lg shrink-0">
            <Smartphone className="w-5 h-5 text-white" />
          </div>
          <div>
            <h3 className="font-bold text-[var(--color-ink)]">Push Notifications</h3>
            <p className="text-xs text-[var(--color-ink-3)]">Real-time alerts on your device</p>
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
                className="flex items-center justify-between p-3 rounded-xl hover:bg-[var(--color-surface)]/50 transition-colors"
              >
                <div className="flex items-center gap-3 flex-1 min-w-0">
                  <div className={`w-8 h-8 rounded-lg bg-[var(--color-primary-soft)] ${pref.gradient} flex items-center justify-center shadow-sm shrink-0`}>
                    <Icon className="w-4 h-4 text-white" />
                  </div>
                  <div className="min-w-0">
                    <p className="text-sm font-medium text-[var(--color-ink)]">{pref.label}</p>
                    <p className="text-[11px] text-[var(--color-ink-3)] truncate">{pref.description}</p>
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
          <div className="w-10 h-10 rounded-xl bg-[var(--color-primary-soft)] from-[var(--color-accent)] to-[var(--color-primary)] flex items-center justify-center shadow-lg shrink-0">
            <Zap className="w-5 h-5 text-white" />
          </div>
          <div className="flex-1">
            <h3 className="text-sm font-bold text-[var(--color-ink)]">Smart Notifications</h3>
            <p className="text-xs text-[var(--color-ink-3)]">
              Emails powered by our intelligent automation system for optimal delivery
            </p>
          </div>
        </div>
      </GlassCard>

      {/* Test Email */}

    </div>
  );
}
