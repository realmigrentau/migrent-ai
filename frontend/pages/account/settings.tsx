import { useState, useEffect } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import { useAuth } from "../../hooks/useAuth";
import { supabase } from "../../lib/supabase";
import { getMyProfile, updateMyProfile } from "../../lib/api";

type TabType = "personal" | "security" | "payments" | "languages";

const LANGUAGES = [
  { code: "en", name: "English" },
  { code: "es", name: "Spanish" },
  { code: "fr", name: "French" },
  { code: "de", name: "German" },
  { code: "it", name: "Italian" },
  { code: "pt", name: "Portuguese" },
  { code: "ja", name: "Japanese" },
  { code: "zh", name: "Mandarin Chinese" },
  { code: "hi", name: "Hindi" },
  { code: "ar", name: "Arabic" },
  { code: "ru", name: "Russian" },
  { code: "ko", name: "Korean" },
  { code: "th", name: "Thai" },
  { code: "vi", name: "Vietnamese" },
  { code: "id", name: "Indonesian" },
  { code: "pl", name: "Polish" },
  { code: "tr", name: "Turkish" },
  { code: "nl", name: "Dutch" },
  { code: "sv", name: "Swedish" },
  { code: "da", name: "Danish" },
];

const TIMEZONES = [
  "Australia/Sydney",
  "Australia/Melbourne",
  "Australia/Brisbane",
  "Australia/Adelaide",
  "Australia/Perth",
  "Australia/Hobart",
  "Australia/Darwin",
];

interface ProfileData {
  id: string;
  name: string;
  email: string;
  legal_name?: string;
  preferred_name?: string;
  phones?: string[];
  residential_address?: any;
  emergency_contact?: any;
  preferred_language?: string;
  preferred_currency?: string;
  timezone?: string;
  wishlist?: string[];
  identity_verified?: boolean;
  identity_verification_url?: string;
}

export default function SettingsPage() {
  const { session, user, loading, signOut } = useAuth();
  const [activeTab, setActiveTab] = useState<TabType>("personal");
  const [profile, setProfile] = useState<ProfileData | null>(null);
  const [loadingProfile, setLoadingProfile] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState("");

  // Form states
  const [legalName, setLegalName] = useState("");
  const [preferredName, setPreferredName] = useState("");
  const [phones, setPhones] = useState<string[]>([]);
  const [residentialAddress, setResidentialAddress] = useState("");
  const [addressSuggestions, setAddressSuggestions] = useState<string[]>([]);
  const [showAddressSuggestions, setShowAddressSuggestions] = useState(false);
  const [preferredLanguage, setPreferredLanguage] = useState("en");
  const [timezone, setTimezone] = useState("Australia/Sydney");

  // Security form states
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [deleteEmailConfirm, setDeleteEmailConfirm] = useState("");
  const [googleConnected, setGoogleConnected] = useState(false);

  useEffect(() => {
    if (session && user?.id) {
      fetchProfile();
      checkOAuthProviders();
    }
  }, [session, user?.id]);

  const checkOAuthProviders = async () => {
    try {
      const { data: { user: authUser } } = await supabase.auth.getUser();
      if (authUser?.app_metadata?.providers?.includes("google")) {
        setGoogleConnected(true);
      }
    } catch (err) {
      console.error("Failed to check OAuth providers:", err);
    }
  };

  const fetchProfile = async () => {
    setLoadingProfile(true);
    try {
      const data = await getMyProfile(session?.access_token || "");
      console.log("Fetched profile data:", data);

      if (data) {
        setProfile(data);

        // Set all fields from the profile
        if (data.legal_name) setLegalName(data.legal_name);
        if (data.preferred_name) setPreferredName(data.preferred_name);
        if (data.phones) setPhones(data.phones);

        if (data.residential_address) {
          const address = typeof data.residential_address === "string"
            ? data.residential_address
            : data.residential_address?.address || "";
          setResidentialAddress(address);
        }

        if (data.preferred_language) setPreferredLanguage(data.preferred_language);
        if (data.timezone) setTimezone(data.timezone);

        console.log("Profile loaded - legal_name:", data.legal_name, "residential_address:", data.residential_address);
      }
    } catch (err) {
      console.error("Failed to fetch profile:", err);
    } finally {
      setLoadingProfile(false);
    }
  };

  const handleSaveProfile = async () => {
    if (!session) {
      setMessage("Not authenticated");
      return;
    }
    setSaving(true);
    setMessage("");

    try {
      const updates: any = {
        legal_name: legalName || null,
        preferred_name: preferredName || null,
        phones: phones.filter((p) => p.trim()) || null,
        residential_address: residentialAddress ? { address: residentialAddress } : null,
        preferred_language: preferredLanguage || "en",
        timezone: timezone || "Australia/Sydney",
      };

      console.log("Saving profile with updates:", updates);

      const result = await updateMyProfile(session.access_token, updates);
      console.log("Profile update result:", result);

      if (result) {
        setMessage("✓ Profile saved successfully!");
        setTimeout(() => setMessage(""), 4000);
        // Refresh profile to confirm
        await fetchProfile();
      } else {
        setMessage("Failed to save profile");
      }
    } catch (err: any) {
      console.error("Failed to save profile:", err);
      setMessage(`Error: ${err?.message || "Failed to save profile"}`);
    } finally {
      setSaving(false);
    }
  };

  const handleChangePassword = async () => {
    if (newPassword !== confirmPassword) {
      setMessage("Passwords do not match");
      return;
    }
    if (newPassword.length < 6) {
      setMessage("Password must be at least 6 characters");
      return;
    }

    setSaving(true);
    try {
      const { error } = await supabase.auth.updateUser({
        password: newPassword,
      });
      if (error) {
        setMessage(error.message);
      } else {
        setMessage("Password changed successfully!");
        setCurrentPassword("");
        setNewPassword("");
        setConfirmPassword("");
        setTimeout(() => setMessage(""), 3000);
      }
    } catch (err) {
      console.error("Failed to change password:", err);
      setMessage("Failed to change password");
    } finally {
      setSaving(false);
    }
  };

  const australianLocations = [
    "Kellyville NSW 2155",
    "Baulkham Hills NSW 2153",
    "Astro NSW 2153",
    "Goo Goo NSW 2153",
    "Claude NSW 2153",
    "Surry Hills NSW 2010",
    "Bondi NSW 2026",
    "Manly NSW 2095",
    "Neutral Bay NSW 2089",
    "Cremorne NSW 2090",
    "Willoughby NSW 2068",
    "Chatswood NSW 2067",
    "Parramatta NSW 2150",
    "Penrith NSW 2750",
    "Wollongong NSW 2500",
    "Melbourne VIC 3000",
    "Fitzroy VIC 3065",
    "Carlton VIC 3053",
    "Brunswick VIC 3056",
    "Footscray VIC 3011",
    "Brisbane QLD 4000",
    "South Bank QLD 4101",
    "Fortitude Valley QLD 4006",
    "New Farm QLD 4005",
    "Perth WA 6000",
    "Northbridge WA 6003",
    "Subiaco WA 6008",
    "Adelaide SA 5000",
    "Rundle Mall SA 5000",
    "Sydney NSW 2000",
    "Wooloomooloo NSW 2011",
    "Kings Cross NSW 2011",
    "Darlinghurst NSW 2010",
    "Zetland NSW 2017",
    "Redfern NSW 2016",
    "Waterloo NSW 2017",
    "Alexandria NSW 2015",
    "Camperdown NSW 2050",
    "Glebe NSW 2037",
    "Newtown NSW 2042",
    "Enmore NSW 2042",
    "Marrickville NSW 2204",
    "Petersham NSW 2049",
    "Ashfield NSW 2131",
    "Hurlstone Park NSW 2193",
    "Croydon NSW 2132",
    "Strathfield NSW 2135",
    "Burwood NSW 2134",
    "Concord NSW 2137",
    "Drummoyne NSW 2047",
  ];

  const handleAddressChange = (value: string) => {
    setResidentialAddress(value);

    if (value.length < 2) {
      setAddressSuggestions([]);
      setShowAddressSuggestions(false);
      return;
    }

    const lowerValue = value.toLowerCase();
    const filtered = australianLocations.filter((loc) => {
      const locLower = loc.toLowerCase();
      // Match by suburb name OR postcode (works with numbers)
      return locLower.includes(lowerValue) || loc.includes(value);
    });

    // Show exactly 5 suggestions (or fewer if not available)
    setAddressSuggestions(filtered.slice(0, 5));
    setShowAddressSuggestions(filtered.length > 0);
  };

  const handlePhoneChange = (value: string, idx: number) => {
    let cleanedValue = value.replace(/\D/g, "");

    // Remove leading 0 if user types it
    if (cleanedValue.startsWith("0")) {
      cleanedValue = cleanedValue.slice(1);
    }

    // Add +61 prefix
    const formattedPhone = cleanedValue.length > 0 ? `+61${cleanedValue}` : "";

    const updated = [...phones];
    updated[idx] = formattedPhone;
    setPhones(updated);
  };

  const handleDeleteAccount = async () => {
    if (deleteEmailConfirm !== user?.email) {
      setMessage("Email does not match. Please type your exact email address.");
      return;
    }

    setSaving(true);
    setMessage("");
    try {
      const BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:8000";
      const res = await fetch(`${BASE_URL}/account/delete`, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${session?.access_token}`,
        },
      });

      if (res.ok) {
        setMessage("Account deleted successfully. Signing out...");
        setTimeout(async () => {
          await supabase.auth.signOut();
          window.location.href = "/";
        }, 1500);
      } else {
        const error = await res.json();
        setMessage(error.detail || "Failed to delete account");
      }
    } catch (err) {
      console.error("Failed to delete account:", err);
      setMessage("Failed to delete account: " + (err instanceof Error ? err.message : "Unknown error"));
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="w-8 h-8 border-2 border-rose-300 dark:border-rose-500/30 border-t-rose-500 rounded-full animate-spin" />
      </div>
    );
  }

  if (!session) {
    return (
      <div className="card p-8 rounded-2xl text-center max-w-md mx-auto mt-12">
        <h2 className="text-lg font-bold text-slate-900 dark:text-white mb-2">
          Sign in required
        </h2>
        <p className="text-sm text-slate-500 dark:text-slate-400 mb-4">
          Sign in to access account settings.
        </p>
        <Link
          href="/signin"
          className="btn-primary py-3 px-6 rounded-xl text-sm inline-block"
        >
          Sign in
        </Link>
      </div>
    );
  }

  const tabs: Array<{ id: TabType; label: string }> = [
    { id: "personal", label: "Personal info" },
    { id: "security", label: "Security" },
    { id: "payments", label: "Payments" },
    { id: "languages", label: "Essentials" },
  ];

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
        <h1 className="text-3xl md:text-4xl font-black tracking-tight text-slate-900 dark:text-white">
          Account <span className="gradient-text">Settings</span>
        </h1>
      </motion.div>

      <div className="grid lg:grid-cols-5 gap-6">
        {/* Sidebar navigation */}
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          className="lg:col-span-1"
        >
          <div className="card rounded-2xl overflow-hidden p-2 space-y-1 sticky top-24">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`w-full px-4 py-3 rounded-xl text-sm font-medium transition-all text-left ${
                  activeTab === tab.id
                    ? "bg-rose-100 dark:bg-rose-500/10 text-rose-600 dark:text-rose-400"
                    : "text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800/50"
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>
        </motion.div>

        {/* Content */}
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          className="lg:col-span-4"
        >
          {/* Personal Info Tab */}
          {activeTab === "personal" && (
            <div className="space-y-6">
              <div className="card p-6 rounded-2xl space-y-4">
                <h2 className="text-lg font-bold text-slate-900 dark:text-white">
                  Personal Information
                </h2>

                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                      Email
                    </label>
                    <div className="input-field bg-slate-50 dark:bg-slate-800/50 cursor-not-allowed text-slate-600 dark:text-slate-300">
                      {user?.email}
                    </div>
                  </div>

                  <div className="grid sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                        Legal name
                      </label>
                      <input
                        type="text"
                        value={legalName}
                        onChange={(e) => setLegalName(e.target.value)}
                        placeholder="Your full legal name"
                        className="input-field"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                        Preferred name
                      </label>
                      <input
                        type="text"
                        value={preferredName}
                        onChange={(e) => setPreferredName(e.target.value)}
                        placeholder="How you'd like to be called"
                        className="input-field"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                      Phone numbers
                    </label>
                    <div className="space-y-2">
                      {phones.map((phone, idx) => (
                        <div key={idx} className="flex gap-2">
                          <div className="flex-1 relative">
                            <div className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-500 dark:text-slate-400 text-sm font-medium pointer-events-none">
                              +61
                            </div>
                            <input
                              type="tel"
                              value={phone.replace(/^\+61/, "")}
                              onChange={(e) => handlePhoneChange(e.target.value, idx)}
                              placeholder="2 XXXX XXXX"
                              className="input-field flex-1 pl-12"
                            />
                          </div>
                          <button
                            onClick={() =>
                              setPhones(phones.filter((_, i) => i !== idx))
                            }
                            className="btn-secondary px-4 rounded-xl"
                          >
                            Remove
                          </button>
                        </div>
                      ))}
                      <button
                        onClick={() => setPhones([...phones, ""])}
                        className="btn-secondary px-4 py-2 rounded-xl text-sm"
                      >
                        + Add phone
                      </button>
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                      Residential address
                    </label>
                    <div className="relative">
                      <input
                        type="text"
                        value={residentialAddress}
                        onChange={(e) => handleAddressChange(e.target.value)}
                        placeholder="e.g. Bondi NSW 2026"
                        className="input-field"
                        autoComplete="off"
                      />
                      {showAddressSuggestions && addressSuggestions.length > 0 && (
                        <ul className="absolute left-0 right-0 top-12 bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-600 rounded-lg shadow-lg z-50 max-h-48 overflow-y-auto">
                          {addressSuggestions.map((suggestion, idx) => (
                            <li key={idx}>
                              <button
                                type="button"
                                onClick={() => {
                                  setResidentialAddress(suggestion);
                                  setShowAddressSuggestions(false);
                                }}
                                className="w-full text-left px-3 py-2 text-sm text-slate-900 dark:text-slate-100 hover:bg-slate-100 dark:hover:bg-slate-800"
                              >
                                {suggestion}
                              </button>
                            </li>
                          ))}
                        </ul>
                      )}
                    </div>
                    <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                      Only visible to verified users
                    </p>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                      Identity verification
                    </label>
                    <div className="flex items-center justify-between p-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/50">
                      <div className="flex items-center gap-2">
                        <span
                          className={`px-2 py-1 rounded-full text-xs font-semibold ${
                            profile?.identity_verified
                              ? "bg-emerald-100 dark:bg-emerald-500/10 text-emerald-600 dark:text-emerald-400"
                              : "bg-amber-100 dark:bg-amber-500/10 text-amber-600 dark:text-amber-400"
                          }`}
                        >
                          {profile?.identity_verified
                            ? "✓ Verified"
                            : "Pending"}
                        </span>
                        <p className="text-sm text-slate-600 dark:text-slate-300">
                          Stripe Identity
                        </p>
                      </div>
                      <button className="text-sm text-rose-500 hover:text-rose-600">
                        Upload docs
                      </button>
                    </div>
                  </div>
                </div>

                {message && (
                  <div
                    className={`p-3 rounded-xl text-sm ${
                      message.includes("success")
                        ? "bg-emerald-50 dark:bg-emerald-500/10 border border-emerald-200 dark:border-emerald-500/20 text-emerald-600 dark:text-emerald-400"
                        : "bg-red-50 dark:bg-red-500/10 border border-red-200 dark:border-red-500/20 text-red-600 dark:text-red-400"
                    }`}
                  >
                    {message}
                  </div>
                )}

                <button
                  onClick={handleSaveProfile}
                  disabled={saving || loadingProfile}
                  className="btn-primary py-2.5 px-5 rounded-xl text-sm disabled:opacity-50"
                >
                  {saving ? "Saving..." : "Save changes"}
                </button>
              </div>
            </div>
          )}

          {/* Security Tab */}
          {activeTab === "security" && (
            <div className="space-y-6">
              {/* Account ID */}
              <div className="card p-6 rounded-2xl space-y-4">
                <h2 className="text-lg font-bold text-slate-900 dark:text-white">
                  Account ID
                </h2>
                <div>
                  <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                    Your unique account identifier
                  </label>
                  <div className="input-field bg-slate-50 dark:bg-slate-800/50 cursor-not-allowed text-slate-400 dark:text-slate-500 text-xs font-mono break-all">
                    {user?.id}
                  </div>
                  <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                    Use this ID to report issues to support
                  </p>
                </div>
              </div>

              {/* Change Password */}
              <div className="card p-6 rounded-2xl space-y-4">
                <h2 className="text-lg font-bold text-slate-900 dark:text-white">
                  Password
                </h2>
                <input
                  type="password"
                  placeholder="Current password"
                  value={currentPassword}
                  onChange={(e) => setCurrentPassword(e.target.value)}
                  className="input-field"
                />
                <input
                  type="password"
                  placeholder="New password"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  className="input-field"
                />
                <input
                  type="password"
                  placeholder="Confirm new password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  className="input-field"
                />
                <button
                  onClick={handleChangePassword}
                  disabled={saving}
                  className="btn-primary py-2.5 px-5 rounded-xl text-sm disabled:opacity-50"
                >
                  {saving ? "Updating..." : "Change password"}
                </button>
              </div>

              {/* Connected Accounts */}
              <div className="card p-6 rounded-2xl space-y-4">
                <h2 className="text-lg font-bold text-slate-900 dark:text-white">
                  Connected Accounts
                </h2>
                <div className="space-y-3">
                  <div className="flex items-center justify-between p-3 rounded-xl border border-slate-200 dark:border-slate-700">
                    <div className="flex items-center gap-3">
                      <svg
                        className="w-5 h-5 text-slate-600 dark:text-slate-300"
                        viewBox="0 0 24 24"
                      >
                        <path
                          fill="currentColor"
                          d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 01-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z"
                        />
                        <path
                          fill="currentColor"
                          d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                        />
                        <path
                          fill="currentColor"
                          d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                        />
                        <path
                          fill="currentColor"
                          d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                        />
                      </svg>
                      <span className="text-sm text-slate-700 dark:text-slate-300">
                        Google
                      </span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className={`px-2.5 py-1 rounded-full text-xs font-semibold ${
                        googleConnected
                          ? "bg-green-100 dark:bg-green-500/10 text-green-700 dark:text-green-400"
                          : "bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400"
                      }`}>
                        {googleConnected ? "Connected" : "Not connected"}
                      </span>
                      {/* Placeholder for future disconnect button - disabled for now */}
                      {/* <button
                        onClick={handleToggleGoogle}
                        disabled={saving}
                        className="px-3 py-1 text-xs font-medium rounded-lg border border-slate-200 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors disabled:opacity-50"
                      >
                        {googleConnected ? "Disconnect" : "Connect"}
                      </button> */}
                    </div>
                  </div>
                </div>
              </div>

              {/* Danger Zone */}
              <div className="card p-6 rounded-2xl space-y-4 border-red-200 dark:border-red-500/20">
                <h2 className="text-lg font-bold text-red-600 dark:text-red-400">
                  Danger Zone
                </h2>

                <div className="space-y-4">
                  {/* Delete Account */}
                  <div className="p-4 rounded-xl border border-red-200 dark:border-red-500/20 bg-red-50 dark:bg-red-500/5">
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <h3 className="font-bold text-slate-900 dark:text-white text-sm">Delete Account</h3>
                        <p className="text-xs text-slate-600 dark:text-slate-400 mt-1">Permanently delete your account and all data. This action cannot be undone.</p>
                      </div>
                      {!showDeleteConfirm && (
                        <button
                          onClick={() => setShowDeleteConfirm(true)}
                          className="px-4 py-2 rounded-lg text-xs font-semibold text-red-600 dark:text-red-400 border border-red-200 dark:border-red-500/20 hover:bg-red-100 dark:hover:bg-red-500/10 transition-colors shrink-0"
                        >
                          Delete
                        </button>
                      )}
                    </div>
                    {showDeleteConfirm && (
                      <div className="space-y-3 mt-3 pt-3 border-t border-red-200 dark:border-red-500/20">
                        <p className="text-xs text-red-700 dark:text-red-300">This will permanently delete your account, all listings, and data. Type your email to confirm:</p>
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
                            {saving ? "Deleting..." : "Delete account"}
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Payments Tab */}
          {activeTab === "payments" && (
            <div className="space-y-6">
              <div className="card p-6 rounded-2xl space-y-4">
                <h2 className="text-lg font-bold text-slate-900 dark:text-white">
                  Payment Methods
                </h2>
                <p className="text-sm text-slate-500 dark:text-slate-400">
                  Payment methods coming soon
                </p>
              </div>

              <div className="card p-6 rounded-2xl space-y-4">
                <h2 className="text-lg font-bold text-slate-900 dark:text-white">
                  Active Deals
                </h2>
                <p className="text-sm text-slate-500 dark:text-slate-400">
                  No active deals at the moment
                </p>
              </div>

              <div className="card p-6 rounded-2xl space-y-4">
                <h2 className="text-lg font-bold text-slate-900 dark:text-white">
                  Payout History
                </h2>
                <p className="text-sm text-slate-500 dark:text-slate-400">
                  No payouts yet
                </p>
              </div>
            </div>
          )}

          {/* Languages & Currency Tab */}
          {activeTab === "languages" && (
            <div className="space-y-6">
              <div className="card p-6 rounded-2xl space-y-4">
                <h2 className="text-lg font-bold text-slate-900 dark:text-white">
                  Essentials
                </h2>

                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                      Preferred language
                    </label>
                    <select
                      value={preferredLanguage}
                      onChange={(e) => setPreferredLanguage(e.target.value)}
                      className="input-field"
                    >
                      {LANGUAGES.map((lang) => (
                        <option key={lang.code} value={lang.code}>
                          {lang.name}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                      Timezone
                    </label>
                    <select
                      value={timezone}
                      onChange={(e) => setTimezone(e.target.value)}
                      className="input-field"
                    >
                      {TIMEZONES.map((tz) => (
                        <option key={tz} value={tz}>
                          {tz}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                      Currency
                    </label>
                    <select
                      value="AUD"
                      disabled
                      className="input-field bg-slate-50 dark:bg-slate-800/50 cursor-not-allowed"
                    >
                      <option>AUD (Australian Dollar)</option>
                    </select>
                    <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                      All transactions are in AUD
                    </p>
                  </div>
                </div>

                <button
                  onClick={handleSaveProfile}
                  disabled={saving || loadingProfile}
                  className="btn-primary py-2.5 px-5 rounded-xl text-sm disabled:opacity-50"
                >
                  {saving ? "Saving..." : "Save preferences"}
                </button>
              </div>
            </div>
          )}
        </motion.div>
      </div>

      {/* Sign out */}
      <div className="pb-4">
        <button
          onClick={signOut}
          className="text-sm text-rose-500 hover:text-rose-600 underline underline-offset-2 transition-colors"
        >
          Sign out
        </button>
      </div>
    </div>
  );
}
