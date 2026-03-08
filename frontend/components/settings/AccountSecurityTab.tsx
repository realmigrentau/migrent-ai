import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import GlassCard, { StatusBadge } from "../ui/GlassCard";
import {
  Mail,
  Lock,
  Smartphone,
  Monitor,
  LogOut,
  Trash2,
  Eye,
  EyeOff,
  Copy,
  Check,
  Shield,
  Key,
  AlertTriangle,
} from "lucide-react";
import type { ProfileData, SessionInfo } from "../../hooks/useSettingsData";

interface AccountSecurityTabProps {
  user: any;
  profile: ProfileData | null;
  googleConnected: boolean;
  sessions: SessionInfo[];
  saving: boolean;
  changePassword: (pw: string) => Promise<boolean>;
  deleteAccount: () => Promise<boolean>;
  signOut: () => void;
  showMessage: (text: string, type: "success" | "error" | "info") => void;
}

export default function AccountSecurityTab({
  user,
  profile,
  googleConnected,
  sessions,
  saving,
  changePassword,
  deleteAccount,
  signOut,
  showMessage,
}: AccountSecurityTabProps) {
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPasswords, setShowPasswords] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [deleteEmailConfirm, setDeleteEmailConfirm] = useState("");
  const [copied, setCopied] = useState(false);

  const handleChangePassword = async () => {
    if (newPassword !== confirmPassword) {
      showMessage("Passwords do not match", "error");
      return;
    }
    if (newPassword.length < 6) {
      showMessage("Password must be at least 6 characters", "error");
      return;
    }
    const ok = await changePassword(newPassword);
    if (ok) {
      setCurrentPassword("");
      setNewPassword("");
      setConfirmPassword("");
    }
  };

  const handleDeleteAccount = async () => {
    if (deleteEmailConfirm !== user?.email) {
      showMessage("Email does not match", "error");
      return;
    }
    await deleteAccount();
  };

  const copyAccountId = () => {
    if (user?.id) {
      navigator.clipboard.writeText(user.id);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  return (
    <div className="space-y-6">
      {/* Email Section */}
      <GlassCard delay={0.05} gradient="indigo">
        <div className="flex items-start gap-4">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-400 to-indigo-500 flex items-center justify-center shadow-lg shrink-0">
            <Mail className="w-5 h-5 text-white" />
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-1">
              <h3 className="font-bold text-slate-900 dark:text-white">Email Address</h3>
              <StatusBadge status="verified" label="Verified" />
            </div>
            <p className="text-sm text-slate-600 dark:text-slate-400 break-all">{user?.email}</p>
          </div>
        </div>
      </GlassCard>

      {/* Account ID */}
      <GlassCard delay={0.1}>
        <div className="flex items-start gap-4">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-slate-400 to-slate-600 flex items-center justify-center shadow-lg shrink-0">
            <Key className="w-5 h-5 text-white" />
          </div>
          <div className="flex-1 min-w-0">
            <h3 className="font-bold text-slate-900 dark:text-white mb-1">Account ID</h3>
            <div className="flex items-center gap-2">
              <code className="text-xs text-slate-500 dark:text-slate-400 font-mono break-all bg-slate-100 dark:bg-slate-800 rounded-lg px-2.5 py-1.5 flex-1">
                {user?.id}
              </code>
              <button
                onClick={copyAccountId}
                className="p-2 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors shrink-0"
                title="Copy ID"
              >
                {copied ? (
                  <Check className="w-4 h-4 text-emerald-500" />
                ) : (
                  <Copy className="w-4 h-4 text-slate-400" />
                )}
              </button>
            </div>
            <p className="text-xs text-slate-400 dark:text-slate-500 mt-1.5">Use this ID for support requests</p>
          </div>
        </div>
      </GlassCard>

      {/* Password */}
      <GlassCard delay={0.15}>
        <div className="flex items-start gap-4 mb-5">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-amber-400 to-orange-500 flex items-center justify-center shadow-lg shrink-0">
            <Lock className="w-5 h-5 text-white" />
          </div>
          <div>
            <h3 className="font-bold text-slate-900 dark:text-white">Change Password</h3>
            <p className="text-xs text-slate-500 dark:text-slate-400">Secure your account with a strong password</p>
          </div>
        </div>

        <div className="space-y-3 ml-14">
          <div className="relative">
            <input
              type={showPasswords ? "text" : "password"}
              placeholder="Current password"
              value={currentPassword}
              onChange={(e) => setCurrentPassword(e.target.value)}
              className="input-field pr-10"
            />
          </div>
          <input
            type={showPasswords ? "text" : "password"}
            placeholder="New password (min 6 characters)"
            value={newPassword}
            onChange={(e) => setNewPassword(e.target.value)}
            className="input-field"
          />
          <input
            type={showPasswords ? "text" : "password"}
            placeholder="Confirm new password"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            className="input-field"
          />

          <div className="flex items-center justify-between">
            <button
              onClick={() => setShowPasswords(!showPasswords)}
              className="flex items-center gap-1.5 text-xs text-slate-500 hover:text-slate-700 dark:hover:text-slate-300 transition-colors"
            >
              {showPasswords ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
              {showPasswords ? "Hide" : "Show"} passwords
            </button>
            <button
              onClick={handleChangePassword}
              disabled={saving || !newPassword || !confirmPassword}
              className="btn-primary py-2 px-5 rounded-xl text-sm disabled:opacity-50"
            >
              {saving ? "Updating..." : "Change password"}
            </button>
          </div>
        </div>
      </GlassCard>

      {/* Connected Accounts */}
      <GlassCard delay={0.2}>
        <div className="flex items-start gap-4 mb-4">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-indigo-400 to-purple-500 flex items-center justify-center shadow-lg shrink-0">
            <Shield className="w-5 h-5 text-white" />
          </div>
          <div>
            <h3 className="font-bold text-slate-900 dark:text-white">Login Methods</h3>
            <p className="text-xs text-slate-500 dark:text-slate-400">Connected accounts & login options</p>
          </div>
        </div>

        <div className="ml-14 space-y-3">
          {/* Google */}
          <div className="flex items-center justify-between p-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50/50 dark:bg-slate-800/30">
            <div className="flex items-center gap-3">
              <svg className="w-5 h-5" viewBox="0 0 24 24">
                <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 01-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z" />
                <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
                <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
              </svg>
              <span className="text-sm font-medium text-slate-700 dark:text-slate-300">Google</span>
            </div>
            <StatusBadge status={googleConnected ? "verified" : "inactive"} label={googleConnected ? "Connected" : "Not connected"} />
          </div>

          {/* Magic Link */}
          <div className="flex items-center justify-between p-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50/50 dark:bg-slate-800/30">
            <div className="flex items-center gap-3">
              <Mail className="w-5 h-5 text-indigo-500" />
              <span className="text-sm font-medium text-slate-700 dark:text-slate-300">Magic Link</span>
            </div>
            <StatusBadge status="verified" label="Available" />
          </div>
        </div>
      </GlassCard>

      {/* Active Sessions */}
      <GlassCard delay={0.25}>
        <div className="flex items-start gap-4 mb-4">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-cyan-400 to-blue-500 flex items-center justify-center shadow-lg shrink-0">
            <Monitor className="w-5 h-5 text-white" />
          </div>
          <div>
            <h3 className="font-bold text-slate-900 dark:text-white">Active Sessions</h3>
            <p className="text-xs text-slate-500 dark:text-slate-400">Devices where you're currently logged in</p>
          </div>
        </div>

        <div className="ml-14 space-y-3">
          {sessions.map((s) => (
            <div
              key={s.id}
              className="flex items-center justify-between p-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50/50 dark:bg-slate-800/30"
            >
              <div className="flex items-center gap-3">
                {s.device.includes("Mobile") || s.device.includes("iPhone") ? (
                  <Smartphone className="w-5 h-5 text-slate-500" />
                ) : (
                  <Monitor className="w-5 h-5 text-slate-500" />
                )}
                <div>
                  <p className="text-sm font-medium text-slate-700 dark:text-slate-300">{s.device}</p>
                  <p className="text-xs text-slate-400">{s.location} · {s.lastActive}</p>
                </div>
              </div>
              {s.current ? (
                <span className="flex items-center gap-1.5 text-xs font-medium text-emerald-600 dark:text-emerald-400">
                  <span className="pulse-dot" />
                  Current
                </span>
              ) : (
                <button className="text-xs text-rose-500 hover:text-rose-600 font-medium">
                  Log out
                </button>
              )}
            </div>
          ))}

          <button
            onClick={signOut}
            className="flex items-center gap-2 text-sm text-rose-500 hover:text-rose-600 font-medium transition-colors mt-2"
          >
            <LogOut className="w-4 h-4" />
            Log out of all devices
          </button>
        </div>
      </GlassCard>

      {/* Danger Zone */}
      <GlassCard delay={0.3} gradient="rose">
        <div className="flex items-start gap-4 mb-4">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-red-400 to-red-600 flex items-center justify-center shadow-lg shrink-0">
            <AlertTriangle className="w-5 h-5 text-white" />
          </div>
          <div>
            <h3 className="font-bold text-red-600 dark:text-red-400">Danger Zone</h3>
            <p className="text-xs text-slate-500 dark:text-slate-400">Permanent actions - cannot be undone</p>
          </div>
        </div>

        <div className="ml-14">
          <div className="p-4 rounded-xl border border-red-200 dark:border-red-500/20 bg-red-50/50 dark:bg-red-500/5">
            <div className="flex items-start justify-between gap-3">
              <div>
                <h4 className="font-bold text-slate-900 dark:text-white text-sm">Delete Account</h4>
                <p className="text-xs text-slate-600 dark:text-slate-400 mt-1">
                  Permanently delete your account and all data. This cannot be undone.
                </p>
              </div>
              {!showDeleteConfirm && (
                <button
                  onClick={() => setShowDeleteConfirm(true)}
                  className="px-4 py-2 rounded-lg text-xs font-semibold text-red-600 dark:text-red-400 border border-red-200 dark:border-red-500/20 hover:bg-red-100 dark:hover:bg-red-500/10 transition-colors shrink-0"
                >
                  <Trash2 className="w-3.5 h-3.5 inline mr-1" />
                  Delete
                </button>
              )}
            </div>

            <AnimatePresence>
              {showDeleteConfirm && (
                <motion.div
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: "auto", opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  className="overflow-hidden"
                >
                  <div className="space-y-3 mt-3 pt-3 border-t border-red-200 dark:border-red-500/20">
                    <p className="text-xs text-red-700 dark:text-red-300">
                      Type your email to confirm: <strong>{user?.email}</strong>
                    </p>
                    <input
                      type="email"
                      placeholder={user?.email}
                      value={deleteEmailConfirm}
                      onChange={(e) => setDeleteEmailConfirm(e.target.value)}
                      className="input-field text-sm"
                    />
                    <div className="flex gap-2">
                      <button
                        onClick={() => {
                          setShowDeleteConfirm(false);
                          setDeleteEmailConfirm("");
                        }}
                        className="btn-secondary py-2 px-4 rounded-lg text-sm flex-1"
                      >
                        Cancel
                      </button>
                      <button
                        onClick={handleDeleteAccount}
                        disabled={saving || deleteEmailConfirm !== user?.email}
                        className="px-4 py-2 rounded-lg text-sm font-semibold bg-red-500 text-white hover:bg-red-600 transition-colors disabled:opacity-50 flex-1"
                      >
                        {saving ? "Deleting..." : "Delete forever"}
                      </button>
                    </div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
      </GlassCard>
    </div>
  );
}
