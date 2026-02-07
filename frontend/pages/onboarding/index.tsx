import { useState } from "react";
import { useRouter } from "next/router";
import { useAuth } from "../../hooks/useAuth";
import { completeOnboarding } from "../../lib/api";
import { motion } from "framer-motion";

export default function OnboardingPage() {
  const router = useRouter();
  const { session, user } = useAuth();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const [legalName, setLegalName] = useState("");
  const [preferredName, setPreferredName] = useState("");
  const [residentialAddress, setResidentialAddress] = useState("");
  const [phone, setPhone] = useState("");

  if (!session || !user) {
    router.push("/signin");
    return null;
  }

  const canSubmit =
    legalName.trim() &&
    preferredName.trim() &&
    residentialAddress.trim() &&
    phone.trim();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!canSubmit) return;

    setLoading(true);
    setError("");

    const result = await completeOnboarding(session.access_token, {
      legal_name: legalName,
      preferred_name: preferredName,
      residential_address: residentialAddress,
      phone: phone,
    });

    if (result) {
      // Redirect to dashboard based on user role
      const role = user.user_metadata?.user_type || user.user_metadata?.type || "seeker";
      router.push(role === "owner" ? "/dashboard/owner" : "/dashboard/seeker");
    } else {
      setError("Failed to complete onboarding. Please try again.");
    }

    setLoading(false);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-pink-50 to-blue-50 flex items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="w-full max-w-md"
      >
        <div className="bg-white rounded-2xl shadow-xl p-8">
          <h1 className="text-3xl font-bold mb-2">Welcome to MigRent</h1>
          <p className="text-gray-600 mb-8">
            Let's get to know you. This information helps us personalize your experience.
          </p>

          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Legal Name *
              </label>
              <input
                type="text"
                value={legalName}
                onChange={(e) => setLegalName(e.target.value)}
                placeholder="Your full legal name"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-transparent"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Preferred Name *
              </label>
              <input
                type="text"
                value={preferredName}
                onChange={(e) => setPreferredName(e.target.value)}
                placeholder="What should we call you?"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-transparent"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Residential Address *
              </label>
              <input
                type="text"
                value={residentialAddress}
                onChange={(e) => setResidentialAddress(e.target.value)}
                placeholder="e.g., Bondi NSW 2026"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-transparent"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Phone Number *
              </label>
              <input
                type="tel"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="+61 2 1234 5678"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-transparent"
                required
              />
            </div>

            {error && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="p-3 bg-red-50 border border-red-200 rounded-lg text-sm text-red-700"
              >
                {error}
              </motion.div>
            )}

            <button
              type="submit"
              disabled={!canSubmit || loading}
              className="w-full bg-gradient-to-r from-pink-500 to-pink-600 text-white font-semibold py-3 rounded-lg hover:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed transition-all"
            >
              {loading ? "Setting up..." : "Complete Setup"}
            </button>
          </form>

          <p className="text-xs text-gray-500 text-center mt-6">
            This information is required and cannot be changed later.
          </p>
        </div>
      </motion.div>
    </div>
  );
}
