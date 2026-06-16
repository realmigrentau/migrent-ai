import { useState } from "react";
import VerificationModal from "./VerificationModal";

interface AvatarWithVerificationProps {
  name: string | null;
  photo: string | null;
  isVerified: boolean;
  verifiedLabel: string | null;
  size?: number;
  className?: string;
}

export default function AvatarWithVerification({
  name,
  photo,
  isVerified,
  verifiedLabel,
  size = 60,
  className = "",
}: AvatarWithVerificationProps) {
  const [showModal, setShowModal] = useState(false);

  const initial = (name || "U")[0].toUpperCase();

  return (
    <>
      <div
        onClick={() => setShowModal(true)}
        onKeyDown={(e) => {
          if (e.key === "Enter" || e.key === " ") {
            e.preventDefault();
            setShowModal(true);
          }
        }}
        role="button"
        tabIndex={0}
        aria-label={isVerified ? `${name || "User"} - verified profile` : `${name || "User"} - view profile`}
        className={`relative group cursor-pointer shrink-0 ${className}`}
        title={isVerified ? "Verified" : "Click to learn more"}
      >
        {/* Avatar circle */}
        <div
          style={{ width: size, height: size }}
          className={`rounded-full flex items-center justify-center text-white font-bold overflow-hidden ring-2 shadow-lg transition-all duration-200 group-hover:ring-[var(--color-primary)] group-hover:shadow-[var(--color-primary)]/20 ${
            isVerified
              ? "ring-[var(--color-line-2)] dark:ring-[var(--color-primary)]/40"
              : "ring-white dark:ring-slate-700"
          } bg-[var(--color-primary-soft)] from-[var(--color-primary)] to-[var(--color-primary)]`}
        >
          {photo ? (
            <img
              src={photo}
              alt={name || "User"}
              className="w-full h-full object-cover"
            />
          ) : (
            <span style={{ fontSize: size * 0.4 }}>{initial}</span>
          )}
        </div>

        {/* Verified check badge */}
        {isVerified && (
          <div
            className="absolute -bottom-0.5 -right-0.5 bg-[var(--color-surface-2)] rounded-full p-0.5"
            style={{
              width: size * 0.35,
              height: size * 0.35,
            }}
          >
            <div className="w-full h-full rounded-full bg-[var(--color-primary-soft)] from-[var(--color-primary)] to-[var(--color-primary)] flex items-center justify-center">
              <svg
                className="text-white"
                style={{ width: size * 0.18, height: size * 0.18 }}
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                strokeWidth={3}
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M5 13l4 4L19 7"
                />
              </svg>
            </div>
          </div>
        )}

        {/* Hover glow */}
        <div
          style={{ width: size + 8, height: size + 8, top: -4, left: -4 }}
          className="absolute rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-200 bg-primary-soft dark:bg-[var(--color-primary)]/10 pointer-events-none"
        />
      </div>

      <VerificationModal
        isOpen={showModal}
        onClose={() => setShowModal(false)}
        profile={{
          name,
          custom_pfp: photo,
          is_verified: isVerified,
          verifiedLabel,
        }}
      />
    </>
  );
}
