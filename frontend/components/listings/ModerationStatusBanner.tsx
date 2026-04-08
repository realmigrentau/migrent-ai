/**
 * ModerationStatusBanner - Shows the owner what is happening with their listing.
 *
 * Displayed on the listing edit page and owner dashboard.
 * Uses calm, fair, professional language. No public shaming.
 */

interface ModerationStatusBannerProps {
  status: string;
  moderationNotes?: string | null;
  moderationReason?: string | null;
}

const STATUS_CONFIG: Record<string, {
  bg: string;
  border: string;
  iconColor: string;
  textColor: string;
  title: string;
  description: string;
  icon: JSX.Element;
}> = {
  pending_approval: {
    bg: "bg-amber-50 dark:bg-amber-500/10",
    border: "border-amber-200 dark:border-amber-500/20",
    iconColor: "text-amber-500",
    textColor: "text-amber-800 dark:text-amber-300",
    title: "Pending Review",
    description: "Your listing is being reviewed by our team. This usually takes less than 24 hours.",
    icon: (
      <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M12 6v6h4.5m4.5 0a9 9 0 11-18 0 9 9 0 0118 0z" />
      </svg>
    ),
  },
  approved: {
    bg: "bg-emerald-50 dark:bg-emerald-500/10",
    border: "border-emerald-200 dark:border-emerald-500/20",
    iconColor: "text-emerald-500",
    textColor: "text-emerald-800 dark:text-emerald-300",
    title: "Live",
    description: "Your listing is approved and visible to seekers.",
    icon: (
      <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
      </svg>
    ),
  },
  flagged: {
    bg: "bg-orange-50 dark:bg-orange-500/10",
    border: "border-orange-200 dark:border-orange-500/20",
    iconColor: "text-orange-500",
    textColor: "text-orange-800 dark:text-orange-300",
    title: "Under Review",
    description: "Your listing is being reviewed by our team. You will be notified once the review is complete.",
    icon: (
      <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m9-.75a9 9 0 11-18 0 9 9 0 0118 0zm-9 3.75h.008v.008H12v-.008z" />
      </svg>
    ),
  },
  hidden: {
    bg: "bg-orange-50 dark:bg-orange-500/10",
    border: "border-orange-200 dark:border-orange-500/20",
    iconColor: "text-orange-500",
    textColor: "text-orange-800 dark:text-orange-300",
    title: "Under Review",
    description: "Your listing is temporarily not visible while our team reviews it. We will be in touch shortly.",
    icon: (
      <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M3.98 8.223A10.477 10.477 0 001.934 12C3.226 16.338 7.244 19.5 12 19.5c.993 0 1.953-.138 2.863-.395M6.228 6.228A10.45 10.45 0 0112 4.5c4.756 0 8.773 3.162 10.065 7.498a10.523 10.523 0 01-4.293 5.774M6.228 6.228L3 3m3.228 3.228l3.65 3.65m7.894 7.894L21 21m-3.228-3.228l-3.65-3.65m0 0a3 3 0 10-4.243-4.243m4.242 4.242L9.88 9.88" />
      </svg>
    ),
  },
  changes_requested: {
    bg: "bg-blue-50 dark:bg-blue-500/10",
    border: "border-blue-200 dark:border-blue-500/20",
    iconColor: "text-blue-500",
    textColor: "text-blue-800 dark:text-blue-300",
    title: "Changes Requested",
    description: "Our team has requested some updates before your listing can go live.",
    icon: (
      <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M16.862 4.487l1.687-1.688a1.875 1.875 0 112.652 2.652L10.582 16.07a4.5 4.5 0 01-1.897 1.13L6 18l.8-2.685a4.5 4.5 0 011.13-1.897l8.932-8.931z" />
      </svg>
    ),
  },
  rejected: {
    bg: "bg-red-50 dark:bg-red-500/10",
    border: "border-red-200 dark:border-red-500/20",
    iconColor: "text-red-500",
    textColor: "text-red-800 dark:text-red-300",
    title: "Not Approved",
    description: "Your listing was not approved. You can update it and resubmit for review.",
    icon: (
      <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M9.75 9.75l4.5 4.5m0-4.5l-4.5 4.5M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
      </svg>
    ),
  },
  delete_requested: {
    bg: "bg-red-50 dark:bg-red-500/10",
    border: "border-red-200 dark:border-red-500/20",
    iconColor: "text-red-500",
    textColor: "text-red-800 dark:text-red-300",
    title: "Under Review",
    description: "Your listing is currently under review by our team.",
    icon: (
      <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m9-.75a9 9 0 11-18 0 9 9 0 0118 0zm-9 3.75h.008v.008H12v-.008z" />
      </svg>
    ),
  },
  deleted: {
    bg: "bg-slate-50 dark:bg-slate-500/10",
    border: "border-slate-200 dark:border-slate-500/20",
    iconColor: "text-slate-500",
    textColor: "text-slate-700 dark:text-slate-400",
    title: "Removed",
    description: "This listing has been removed. If you believe this was a mistake, please contact support.",
    icon: (
      <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M14.74 9l-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 01-2.244 2.077H8.084a2.25 2.25 0 01-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 00-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 013.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 00-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 00-7.5 0" />
      </svg>
    ),
  },
};

export default function ModerationStatusBanner({
  status,
  moderationNotes,
  moderationReason,
}: ModerationStatusBannerProps) {
  const config = STATUS_CONFIG[status];
  if (!config) return null;

  // Don't show banner for approved listings (clean state)
  if (status === "approved") return null;

  return (
    <div className={`${config.bg} ${config.border} border rounded-xl p-4 mb-6`}>
      <div className="flex items-start gap-3">
        <div className={`${config.iconColor} mt-0.5 shrink-0`}>
          {config.icon}
        </div>
        <div className="flex-1 min-w-0">
          <h3 className={`font-semibold text-sm ${config.textColor}`}>
            {config.title}
          </h3>
          <p className={`text-sm mt-1 ${config.textColor} opacity-80`}>
            {config.description}
          </p>

          {/* Show moderation notes/reason if available */}
          {(status === "changes_requested" || status === "rejected") && moderationNotes && (
            <div className="mt-3 p-3 bg-white/60 dark:bg-white/5 rounded-lg">
              <p className="text-xs font-medium text-slate-500 dark:text-slate-400 mb-1">
                Feedback from our team:
              </p>
              <p className="text-sm text-slate-700 dark:text-slate-300">
                {moderationNotes}
              </p>
            </div>
          )}

          {status === "rejected" && moderationReason && !moderationNotes && (
            <div className="mt-3 p-3 bg-white/60 dark:bg-white/5 rounded-lg">
              <p className="text-xs font-medium text-slate-500 dark:text-slate-400 mb-1">
                Reason:
              </p>
              <p className="text-sm text-slate-700 dark:text-slate-300">
                {moderationReason}
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
