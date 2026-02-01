import { useState } from "react";
import { useRouter } from "next/router";
import Link from "next/link";
import { motion } from "framer-motion";
import { useAuth } from "../../../hooks/useAuth";

const MOCK_LISTING = {
  id: "1",
  address: "12 Crown St, Surry Hills",
  postcode: "2010",
  weeklyPrice: 250,
  roomType: "Private room",
  furnished: true,
  billsIncluded: true,
  description: "Bright private room in friendly sharehouse near Central Station. 5 min walk to buses and trains.",
  status: "active",
  views: 142,
  minStay: "3 months",
  noSmoking: true,
  quietHours: "10pm-7am",
};

const MOCK_APPLICANTS = [
  {
    id: "a1",
    name: "Maria G.",
    age: 24,
    occupation: "UX Designer",
    visaType: "Working Holiday (417)",
    lifestyle: ["Non-smoker", "Quiet", "Professional"],
    verified: true,
    status: "new",
    appliedAt: "3 hours ago",
    message: "Hi, I'm a UX designer from Brazil, recently arrived in Sydney. I'm clean, quiet, and looking for a friendly sharehouse. Would love to see the room!",
  },
  {
    id: "a2",
    name: "James L.",
    age: 22,
    occupation: "Student (USYD)",
    visaType: "Student Visa (500)",
    lifestyle: ["Student", "Tidy", "Social"],
    verified: false,
    status: "reviewing",
    appliedAt: "1 day ago",
    message: "Hey! I'm a uni student at USYD looking for somewhere close to campus. Very tidy and respectful of shared spaces.",
  },
  {
    id: "a3",
    name: "Priya S.",
    age: 27,
    occupation: "Software Engineer",
    visaType: "Temporary Skilled (482)",
    lifestyle: ["Professional", "Non-smoker", "Early riser"],
    verified: true,
    status: "interested",
    appliedAt: "3 days ago",
    message: "Hello, I'm a software engineer working in the CBD. I'm looking for a quiet, well-maintained home close to Central.",
  },
];

const APPLICANT_STATUS_STYLES: Record<string, string> = {
  new: "bg-blue-100 dark:bg-blue-500/10 text-blue-600 dark:text-blue-400 border-blue-200 dark:border-blue-500/20",
  reviewing: "bg-amber-100 dark:bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-200 dark:border-amber-500/20",
  interested: "bg-emerald-100 dark:bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-200 dark:border-emerald-500/20",
  confirmed: "bg-rose-100 dark:bg-rose-500/10 text-rose-600 dark:text-rose-400 border-rose-200 dark:border-rose-500/20",
};

export default function ListingDetail() {
  const router = useRouter();
  const { id } = router.query;
  const { session, loading } = useAuth();
  const [applicantStatuses, setApplicantStatuses] = useState<Record<string, string>>(
    Object.fromEntries(MOCK_APPLICANTS.map((a) => [a.id, a.status]))
  );

  const updateStatus = (applicantId: string, status: string) => {
    setApplicantStatuses((prev) => ({ ...prev, [applicantId]: status }));
  };

  const listing = MOCK_LISTING;

  if (loading)
    return (
      <div className="flex items-center justify-center py-20">
        <div className="w-8 h-8 border-2 border-rose-300 dark:border-rose-500/30 border-t-rose-500 rounded-full animate-spin" />
      </div>
    );

  if (!session)
    return (
      <div className="card p-8 rounded-2xl text-center max-w-md mx-auto mt-12">
        <h2 className="text-lg font-bold text-slate-900 dark:text-white mb-2">Sign in required</h2>
        <p className="text-sm text-slate-500 dark:text-slate-400 mb-4">Sign in to manage this listing.</p>
        <Link href="/signin" className="btn-primary py-3 px-6 rounded-xl text-sm inline-block">Sign in</Link>
      </div>
    );

  return (
    <div className="space-y-8">
      {/* Breadcrumb */}
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex items-center gap-2 text-sm text-slate-500 dark:text-slate-400">
        <Link href="/owner/listings" className="hover:text-rose-500 transition-colors">My listings</Link>
        <span>/</span>
        <span className="text-slate-900 dark:text-white font-medium">{listing.address}</span>
      </motion.div>

      {/* Listing summary - as seekers see it */}
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="card p-6 rounded-2xl">
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="w-full sm:w-40 h-28 rounded-xl bg-slate-100 dark:bg-slate-800 overflow-hidden shrink-0">
            <img
              src="https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?w=400&h=280&fit=crop"
              alt={listing.address}
              className="w-full h-full object-cover"
            />
          </div>
          <div className="flex-1">
            <div className="flex items-start justify-between gap-3">
              <div>
                <h1 className="text-xl font-black text-slate-900 dark:text-white">{listing.address}</h1>
                <p className="text-sm text-slate-500 dark:text-slate-400">{listing.postcode} · {listing.roomType}</p>
              </div>
              <div className="px-3 py-1.5 rounded-lg bg-rose-50 dark:bg-rose-500/10 border border-rose-100 dark:border-rose-500/20">
                <span className="text-rose-600 dark:text-rose-400 font-bold">${listing.weeklyPrice}</span>
                <span className="text-rose-400 dark:text-rose-500 text-xs">/wk</span>
              </div>
            </div>
            <div className="flex flex-wrap gap-2 mt-3">
              {listing.furnished && <span className="px-2 py-0.5 rounded-full text-xs bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300">Furnished</span>}
              {listing.billsIncluded && <span className="px-2 py-0.5 rounded-full text-xs bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300">Bills incl.</span>}
              {listing.noSmoking && <span className="px-2 py-0.5 rounded-full text-xs bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300">No smoking</span>}
              <span className="px-2 py-0.5 rounded-full text-xs bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300">Min {listing.minStay}</span>
            </div>
            <p className="text-sm text-slate-600 dark:text-slate-300 mt-3">{listing.description}</p>
            <div className="flex items-center gap-4 mt-3 text-xs text-slate-500 dark:text-slate-400">
              <span>{listing.views} views</span>
              <span>{MOCK_APPLICANTS.length} applicants</span>
              <span className={`px-2 py-0.5 rounded-full font-semibold border capitalize ${
                listing.status === "active"
                  ? "bg-emerald-100 dark:bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-200 dark:border-emerald-500/20"
                  : "bg-amber-100 dark:bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-200 dark:border-amber-500/20"
              }`}>
                {listing.status}
              </span>
            </div>
          </div>
        </div>
      </motion.div>

      {/* Applicants */}
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}>
        <h2 className="text-xl font-bold text-slate-900 dark:text-white mb-4">
          Applicants ({MOCK_APPLICANTS.length})
        </h2>

        <div className="space-y-4">
          {MOCK_APPLICANTS.map((applicant, i) => {
            const currentStatus = applicantStatuses[applicant.id] || applicant.status;
            return (
              <motion.div
                key={applicant.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 + i * 0.05 }}
                className="card p-5 rounded-2xl"
              >
                <div className="flex items-start gap-4">
                  {/* Avatar */}
                  <div className="w-12 h-12 shrink-0 rounded-full bg-gradient-to-br from-rose-400 to-blue-400 flex items-center justify-center text-white font-bold text-lg">
                    {applicant.name[0]}
                  </div>

                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <h3 className="font-bold text-slate-900 dark:text-white">{applicant.name}</h3>
                      {applicant.verified && (
                        <span className="px-2 py-0.5 rounded-full text-xs bg-emerald-100 dark:bg-emerald-500/10 text-emerald-600 dark:text-emerald-400">
                          ✓ Verified
                        </span>
                      )}
                      <span className={`px-2 py-0.5 rounded-full text-xs font-semibold border capitalize ${APPLICANT_STATUS_STYLES[currentStatus] || ""}`}>
                        {currentStatus === "interested" ? "Interested" : currentStatus === "confirmed" ? "Deal confirmed" : currentStatus}
                      </span>
                    </div>
                    <p className="text-sm text-slate-500 dark:text-slate-400 mt-0.5">
                      {applicant.age} · {applicant.occupation} · {applicant.visaType}
                    </p>

                    <div className="flex flex-wrap gap-1.5 mt-2">
                      {applicant.lifestyle.map((tag) => (
                        <span key={tag} className="px-2 py-0.5 rounded-full text-xs bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300">
                          {tag}
                        </span>
                      ))}
                    </div>

                    {applicant.message && (
                      <p className="text-sm text-slate-600 dark:text-slate-300 mt-3 p-3 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-700">
                        &ldquo;{applicant.message}&rdquo;
                      </p>
                    )}

                    <p className="text-xs text-slate-400 dark:text-slate-500 mt-2">Applied {applicant.appliedAt}</p>

                    {/* Status buttons */}
                    <div className="flex flex-wrap gap-2 mt-3">
                      {(["reviewing", "interested", "confirmed"] as const).map((s) => (
                        <button
                          key={s}
                          onClick={() => updateStatus(applicant.id, s)}
                          className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                            currentStatus === s
                              ? "bg-rose-500 text-white"
                              : "btn-secondary py-1.5 px-3 rounded-lg text-xs"
                          }`}
                        >
                          {s === "reviewing" ? "Reviewing" : s === "interested" ? "Interested" : "Deal confirmed"}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              </motion.div>
            );
          })}
        </div>
      </motion.div>
    </div>
  );
}
