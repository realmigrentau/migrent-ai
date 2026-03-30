import { useState, useEffect, useCallback, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import GlassCard, { StatusBadge, ProgressRing } from "../ui/GlassCard";
import {
  Mail,
  Shield,
  Star,
  CheckCircle2,
  Clock,
  AlertCircle,
  ChevronRight,
  Sparkles,
  Award,
  TrendingUp,
  Upload,
  FileText,
  Loader2,
  X,
} from "lucide-react";
import type { ProfileData } from "../../hooks/useSettingsData";
import {
  getOwnerVerificationStatus,
  uploadGovernmentID,
} from "../../lib/api";
import { useAuth } from "../../hooks/useAuth";

interface VerificationTabProps {
  profile: ProfileData | null;
  verificationProgress: {
    percentage: number;
    steps: { label: string; done: boolean; icon: string }[];
  };
  saving: boolean;
  startIdVerification: () => Promise<string | null>;
  showMessage: (text: string, type: "success" | "error" | "info") => void;
}

interface OwnerVerificationStatus {
  email_verified: boolean;
  id_document_type: string | null;
  id_status: string;
  id_rejection_reason: string | null;
  fully_verified: boolean;
}

export default function VerificationTab({
  profile,
  verificationProgress,
  saving,
  startIdVerification,
  showMessage,
}: VerificationTabProps) {
  const { session, user } = useAuth();
  const [ownerStatus, setOwnerStatus] = useState<OwnerVerificationStatus | null>(null);
  const [loadingStatus, setLoadingStatus] = useState(true);

  // ID Upload state
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [docType, setDocType] = useState("passport");
  const [uploading, setUploading] = useState(false);
  const [dragOver, setDragOver] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Detect owner from multiple sources
  const userMeta = user?.user_metadata || {};
  const isOwnerHint =
    profile?.role === "owner" ||
    userMeta.user_type === "owner" ||
    userMeta.type === "owner";

  // Always try to fetch verification status
  const fetchStatus = useCallback(async () => {
    if (!session?.access_token) {
      setLoadingStatus(false);
      return;
    }
    try {
      const data = await getOwnerVerificationStatus(session.access_token);
      if (data) setOwnerStatus(data);
    } catch {
      // ignore
    } finally {
      setLoadingStatus(false);
    }
  }, [session?.access_token]);

  useEffect(() => {
    fetchStatus();
  }, [fetchStatus]);

  // ID Upload handlers
  const handleFileDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(false);
    const file = e.dataTransfer.files[0];
    if (file) validateAndSetFile(file);
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) validateAndSetFile(file);
  };

  const validateAndSetFile = (file: File) => {
    const allowed = ["image/jpeg", "image/png", "image/webp", "application/pdf"];
    if (!allowed.includes(file.type)) {
      showMessage("File must be JPEG, PNG, WebP, or PDF", "error");
      return;
    }
    if (file.size > 10 * 1024 * 1024) {
      showMessage("File must be under 10MB", "error");
      return;
    }
    setSelectedFile(file);
  };

  const handleUploadID = async () => {
    if (!session?.access_token || !selectedFile) return;
    setUploading(true);
    const result = await uploadGovernmentID(session.access_token, selectedFile, docType);
    setUploading(false);
    if (result.error) {
      showMessage(result.error, "error");
    } else {
      showMessage(result.message || "Document uploaded! We will review it soon.", "success");
      setSelectedFile(null);
      fetchStatus();
    }
  };

  // Compute verification steps
  const emailDone = ownerStatus?.email_verified ?? true;
  const idStatus = ownerStatus?.id_status ?? "not_submitted";
  const idDone = idStatus === "approved";
  const fullyVerified = ownerStatus?.fully_verified ?? false;

  const completedSteps = [emailDone, idDone].filter(Boolean).length;
  const ownerProgress = Math.round((completedSteps / 2) * 100);

  const { percentage, steps } = verificationProgress;
  const isSuperhost = (profile?.average_rating || 0) >= 4.8 && (profile?.reviews_count || 0) >= 10;

  // Show generic profile view only for non-owners who have no verification record
  if (!ownerStatus && !isOwnerHint) {
    return (
      <div className="space-y-6">
        <GlassCard delay={0.05} gradient="emerald">
          <div className="flex flex-col sm:flex-row items-center gap-6">
            <ProgressRing
              progress={percentage}
              size={100}
              strokeWidth={8}
              color={percentage >= 80 ? "emerald" : percentage >= 50 ? "indigo" : "rose"}
            />
            <div className="text-center sm:text-left flex-1">
              <h2 className="text-xl font-bold text-slate-900 dark:text-white mb-1">
                Profile {percentage}% Complete
              </h2>
              <p className="text-sm text-slate-600 dark:text-slate-400 mb-3">
                {percentage >= 100
                  ? "Your profile is fully complete!"
                  : `Complete ${steps.filter((s) => !s.done).length} more steps to unlock all features`}
              </p>
              <div className="flex flex-wrap gap-1.5">
                {steps.map((step, i) => (
                  <motion.div
                    key={step.label}
                    initial={{ opacity: 0, scale: 0 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: 0.3 + i * 0.05 }}
                    className={`
                      inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-medium border
                      ${step.done
                        ? "bg-emerald-50 dark:bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 border-emerald-200 dark:border-emerald-500/30"
                        : "bg-slate-50 dark:bg-slate-800 text-slate-500 dark:text-slate-400 border-slate-200 dark:border-slate-700"
                      }
                    `}
                  >
                    <span>{step.icon}</span>
                    {step.done ? "Done" : "-"}
                  </motion.div>
                ))}
              </div>
            </div>
          </div>
        </GlassCard>
      </div>
    );
  }

  // ─── OWNER VERIFICATION STEPPER (2 steps: Email + ID) ──────────
  return (
    <div className="space-y-6">
      {/* Overall Progress */}
      <GlassCard delay={0.05} gradient={fullyVerified ? "emerald" : "none"}>
        <div className="flex flex-col sm:flex-row items-center gap-6">
          <ProgressRing
            progress={ownerProgress}
            size={100}
            strokeWidth={8}
            color={fullyVerified ? "emerald" : ownerProgress >= 50 ? "indigo" : "rose"}
          />
          <div className="text-center sm:text-left flex-1">
            <h2 className="text-xl font-bold text-slate-900 dark:text-white mb-1">
              {fullyVerified ? "Fully Verified - You Can List Rooms!" : `Owner Verification - ${completedSteps}/2 Steps Done`}
            </h2>
            <p className="text-sm text-slate-600 dark:text-slate-400">
              {fullyVerified
                ? "All verification steps are complete. You can now create listings."
                : "Complete both steps below to list rooms on MigRent. This keeps our community safe."}
            </p>
          </div>
        </div>
      </GlassCard>

      {loadingStatus ? (
        <div className="flex items-center justify-center py-12">
          <Loader2 className="w-6 h-6 animate-spin text-slate-400" />
        </div>
      ) : (
        <>
          {/* STEP 1: Email */}
          <GlassCard delay={0.1}>
            <div className="flex items-center gap-4">
              <div className={`w-10 h-10 rounded-xl flex items-center justify-center shadow-md shrink-0 ${emailDone ? "bg-gradient-to-br from-blue-400 to-indigo-500" : "bg-slate-200 dark:bg-slate-700"}`}>
                {emailDone ? <CheckCircle2 className="w-5 h-5 text-white" /> : <Mail className="w-5 h-5 text-slate-500" />}
              </div>
              <div className="flex-1">
                <div className="flex items-center gap-2">
                  <p className="text-sm font-semibold text-slate-900 dark:text-white">Step 1: Email Verified</p>
                  <StatusBadge status="verified" label="Done" />
                </div>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                  Verified with {profile?.email || "your email"}
                </p>
              </div>
            </div>
          </GlassCard>

          {/* STEP 2: Government ID Upload */}
          <GlassCard delay={0.15}>
            <div className="flex items-start gap-4">
              <div className={`w-10 h-10 rounded-xl flex items-center justify-center shadow-md shrink-0 mt-0.5 ${idDone ? "bg-gradient-to-br from-amber-400 to-orange-500" : idStatus === "pending" ? "bg-gradient-to-br from-blue-400 to-blue-500" : "bg-slate-200 dark:bg-slate-700"}`}>
                {idDone ? (
                  <CheckCircle2 className="w-5 h-5 text-white" />
                ) : idStatus === "pending" ? (
                  <Clock className="w-5 h-5 text-white" />
                ) : (
                  <Shield className="w-5 h-5 text-slate-500" />
                )}
              </div>
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-1">
                  <p className="text-sm font-semibold text-slate-900 dark:text-white">Step 2: Government ID</p>
                  {idDone ? (
                    <StatusBadge status="verified" label="Approved" />
                  ) : idStatus === "pending" ? (
                    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-medium bg-blue-50 dark:bg-blue-500/10 text-blue-600 dark:text-blue-400 border border-blue-200 dark:border-blue-500/30">
                      <Clock className="w-2.5 h-2.5" /> Under Review
                    </span>
                  ) : idStatus === "rejected" ? (
                    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-medium bg-red-50 dark:bg-red-500/10 text-red-600 dark:text-red-400 border border-red-200 dark:border-red-500/30">
                      <AlertCircle className="w-2.5 h-2.5" /> Rejected
                    </span>
                  ) : (
                    <StatusBadge status="action" label="Required" />
                  )}
                </div>

                {idDone ? (
                  <p className="text-xs text-slate-500 dark:text-slate-400">
                    Your {ownerStatus?.id_document_type?.replace("_", " ") || "government ID"} has been verified.
                  </p>
                ) : idStatus === "pending" ? (
                  <p className="text-xs text-slate-500 dark:text-slate-400">
                    Your document is being reviewed. This usually takes 24-48 hours. We will email you when it is done.
                  </p>
                ) : (
                  <div className="mt-3 space-y-4">
                    {idStatus === "rejected" && ownerStatus?.id_rejection_reason && (
                      <div className="bg-red-50 dark:bg-red-500/10 border border-red-200 dark:border-red-500/30 rounded-xl p-3">
                        <p className="text-xs font-medium text-red-700 dark:text-red-400 mb-1">Reason for rejection:</p>
                        <p className="text-xs text-red-600 dark:text-red-400">{ownerStatus.id_rejection_reason}</p>
                      </div>
                    )}

                    <p className="text-xs text-slate-500 dark:text-slate-400">
                      Upload a clear photo or scan of your government-issued ID. Accepted: passport, driver's licence, visa, or national ID.
                    </p>

                    {/* Document type selector */}
                    <div>
                      <label className="text-xs font-medium text-slate-700 dark:text-slate-300 mb-1.5 block">Document type</label>
                      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                        {[
                          { value: "passport", label: "Passport" },
                          { value: "drivers_licence", label: "Driver's Licence" },
                          { value: "visa", label: "Visa" },
                          { value: "national_id", label: "National ID" },
                        ].map((dt) => (
                          <button
                            key={dt.value}
                            onClick={() => setDocType(dt.value)}
                            className={`px-3 py-2 rounded-xl text-xs font-medium border transition-all ${
                              docType === dt.value
                                ? "bg-rose-50 dark:bg-rose-500/10 border-rose-300 dark:border-rose-500/30 text-rose-700 dark:text-rose-400"
                                : "bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400 hover:border-slate-300"
                            }`}
                          >
                            {dt.label}
                          </button>
                        ))}
                      </div>
                    </div>

                    {/* File upload zone */}
                    <div
                      onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
                      onDragLeave={() => setDragOver(false)}
                      onDrop={handleFileDrop}
                      onClick={() => fileInputRef.current?.click()}
                      className={`border-2 border-dashed rounded-xl p-6 text-center cursor-pointer transition-all ${
                        dragOver
                          ? "border-rose-400 bg-rose-50/50 dark:bg-rose-500/5"
                          : selectedFile
                          ? "border-emerald-300 bg-emerald-50/50 dark:bg-emerald-500/5"
                          : "border-slate-200 dark:border-slate-700 hover:border-slate-300 dark:hover:border-slate-600"
                      }`}
                    >
                      <input
                        ref={fileInputRef}
                        type="file"
                        accept="image/jpeg,image/png,image/webp,application/pdf"
                        onChange={handleFileSelect}
                        className="hidden"
                      />
                      {selectedFile ? (
                        <div className="flex items-center justify-center gap-2">
                          <FileText className="w-5 h-5 text-emerald-500" />
                          <span className="text-sm text-emerald-700 dark:text-emerald-400 font-medium">{selectedFile.name}</span>
                          <button
                            onClick={(e) => { e.stopPropagation(); setSelectedFile(null); }}
                            className="ml-2 p-1 rounded-full hover:bg-slate-100 dark:hover:bg-slate-800"
                          >
                            <X className="w-3.5 h-3.5 text-slate-400" />
                          </button>
                        </div>
                      ) : (
                        <>
                          <Upload className="w-8 h-8 text-slate-400 mx-auto mb-2" />
                          <p className="text-sm text-slate-600 dark:text-slate-400">
                            Drag and drop your ID here, or <span className="text-rose-500 font-medium">browse</span>
                          </p>
                          <p className="text-[10px] text-slate-400 mt-1">JPEG, PNG, WebP, or PDF - Max 10MB</p>
                        </>
                      )}
                    </div>

                    {selectedFile && (
                      <button
                        onClick={handleUploadID}
                        disabled={uploading}
                        className="w-full btn-primary py-3 rounded-xl text-sm font-medium flex items-center justify-center gap-2 disabled:opacity-50"
                      >
                        {uploading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Upload className="w-4 h-4" />}
                        {uploading ? "Uploading..." : "Submit for Review"}
                      </button>
                    )}

                    <div className="bg-blue-50 dark:bg-blue-500/10 border border-blue-200 dark:border-blue-500/30 rounded-xl p-3">
                      <p className="text-[11px] text-blue-700 dark:text-blue-400 leading-relaxed">
                        <strong>Privacy:</strong> Your ID is stored securely and encrypted. Only MigRent admins can view it during review. It is never shared with other users or third parties. We comply with Australian privacy laws.
                      </p>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </GlassCard>

          {/* Fully verified congratulations */}
          {fullyVerified && (
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="bg-gradient-to-r from-emerald-50 to-teal-50 dark:from-emerald-500/10 dark:to-teal-500/10 rounded-2xl p-6 text-center border border-emerald-200 dark:border-emerald-500/30"
            >
              <div className="text-4xl mb-3">🎉</div>
              <h3 className="text-lg font-bold text-emerald-800 dark:text-emerald-300 mb-1">
                You are a Verified Owner!
              </h3>
              <p className="text-sm text-emerald-600 dark:text-emerald-400 mb-4">
                Both verification steps are complete. You can now list rooms on MigRent.
              </p>
              <a
                href="/owner/listings/new"
                className="inline-flex items-center gap-2 bg-emerald-600 hover:bg-emerald-700 text-white px-6 py-3 rounded-xl text-sm font-semibold transition-colors"
              >
                List Your Room
                <ChevronRight className="w-4 h-4" />
              </a>
            </motion.div>
          )}

          {/* Stats bar */}
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.25 }}
            className="grid grid-cols-3 gap-3"
          >
            <div className="backdrop-blur-xl bg-blue-50/80 dark:bg-blue-500/10 rounded-xl p-3 text-center border border-blue-100 dark:border-blue-500/20">
              <TrendingUp className="w-5 h-5 text-blue-500 mx-auto mb-1" />
              <p className="text-lg font-bold text-blue-700 dark:text-blue-400">3x</p>
              <p className="text-[10px] text-blue-600/70 dark:text-blue-400/60">More bookings</p>
            </div>
            <div className="backdrop-blur-xl bg-emerald-50/80 dark:bg-emerald-500/10 rounded-xl p-3 text-center border border-emerald-100 dark:border-emerald-500/20">
              <Star className="w-5 h-5 text-emerald-500 mx-auto mb-1" />
              <p className="text-lg font-bold text-emerald-700 dark:text-emerald-400">
                {profile?.average_rating?.toFixed(1) || "-"}
              </p>
              <p className="text-[10px] text-emerald-600/70 dark:text-emerald-400/60">Rating</p>
            </div>
            <div className="backdrop-blur-xl bg-purple-50/80 dark:bg-purple-500/10 rounded-xl p-3 text-center border border-purple-100 dark:border-purple-500/20">
              <Award className="w-5 h-5 text-purple-500 mx-auto mb-1" />
              <p className="text-lg font-bold text-purple-700 dark:text-purple-400">
                {profile?.badges?.length || 0}
              </p>
              <p className="text-[10px] text-purple-600/70 dark:text-purple-400/60">Badges</p>
            </div>
          </motion.div>

          {/* Superhost Badge */}
          <GlassCard delay={0.3} gradient={isSuperhost ? "amber" : "none"}>
            <div className="flex items-center gap-4">
              <div className={`w-16 h-16 rounded-2xl flex items-center justify-center ${isSuperhost ? "bg-gradient-to-br from-yellow-400 to-amber-500 shadow-lg" : "bg-slate-100 dark:bg-slate-800 border-2 border-dashed border-slate-300 dark:border-slate-600"}`}>
                <Star className={`w-8 h-8 ${isSuperhost ? "text-white" : "text-slate-400 dark:text-slate-500"}`} />
              </div>
              <div className="flex-1">
                <h3 className="font-bold text-slate-900 dark:text-white">
                  {isSuperhost ? "You're a Superhost!" : "Superhost Badge"}
                </h3>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                  {isSuperhost ? "Congratulations! You've earned the Superhost badge." : "Maintain a 4.85+ rating with 10+ reviews to unlock"}
                </p>
              </div>
            </div>
          </GlassCard>

          <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.35 }} className="text-center py-3">
            <p className="text-xs text-slate-400 dark:text-slate-500 italic">
              Verified owners get 3x more bookings and appear higher in search results
            </p>
          </motion.div>
        </>
      )}
    </div>
  );
}
