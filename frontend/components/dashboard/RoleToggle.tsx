import { motion } from "framer-motion";
import { UserRole } from "../../hooks/useDashboard";
import { Home, Search } from "lucide-react";

interface RoleToggleProps {
  role: UserRole;
  onToggle: (role: "seeker" | "owner") => void;
  disabled?: boolean;
}

export default function RoleToggle({ role, onToggle, disabled }: RoleToggleProps) {
  const isOwner = role === "owner";

  return (
    <div className="relative inline-flex items-center rounded-[10px] bg-[var(--color-surface-sunk)] p-[3px]">
      {/* Sliding background */}
      <motion.div
        className="absolute top-[3px] bottom-[3px] rounded-[7px] bg-[var(--color-surface-2)] shadow-[var(--shadow-soft)] border border-[var(--color-line)]"
        initial={false}
        animate={{
          left: isOwner ? "3px" : "50%",
          right: isOwner ? "50%" : "3px",
        }}
        transition={{ type: "spring", stiffness: 500, damping: 35 }}
      />

      <button
        onClick={() => onToggle("owner")}
        disabled={disabled}
        className={`relative z-10 flex items-center gap-1.5 px-3.5 py-1.5 rounded-[7px] text-[13px] font-semibold transition-colors ${
          isOwner
            ? "text-[var(--color-ink)]"
            : "text-[var(--color-ink-3)] hover:text-[var(--color-ink-2)]"
        }`}
      >
        <Home className="w-3.5 h-3.5" />
        Owner
      </button>

      <button
        onClick={() => onToggle("seeker")}
        disabled={disabled}
        className={`relative z-10 flex items-center gap-1.5 px-3.5 py-1.5 rounded-[7px] text-[13px] font-semibold transition-colors ${
          !isOwner
            ? "text-[var(--color-ink)]"
            : "text-[var(--color-ink-3)] hover:text-[var(--color-ink-2)]"
        }`}
      >
        <Search className="w-3.5 h-3.5" />
        Seeker
      </button>
    </div>
  );
}
