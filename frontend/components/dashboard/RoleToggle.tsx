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
    <div className="relative inline-flex items-center rounded-xl bg-slate-100 dark:bg-slate-800 p-1">
      {/* Sliding background */}
      <motion.div
        className="absolute top-1 bottom-1 rounded-lg bg-rose-600"
        initial={false}
        animate={{
          left: isOwner ? "4px" : "50%",
          right: isOwner ? "50%" : "4px",
        }}
        transition={{ type: "spring", stiffness: 500, damping: 35 }}
      />

      <button
        onClick={() => onToggle("owner")}
        disabled={disabled}
        className={`relative z-10 flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-semibold transition-colors ${
          isOwner
            ? "text-white"
            : "text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-200"
        }`}
      >
        <Home className="w-4 h-4" />
        Owner
      </button>

      <button
        onClick={() => onToggle("seeker")}
        disabled={disabled}
        className={`relative z-10 flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-semibold transition-colors ${
          !isOwner
            ? "text-white"
            : "text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-200"
        }`}
      >
        <Search className="w-4 h-4" />
        Seeker
      </button>
    </div>
  );
}
