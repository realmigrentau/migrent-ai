import { useState, useRef, useEffect } from "react";
import { Bell } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import NotificationDropdown from "./NotificationDropdown";

interface NotificationBellProps {
  unreadCount: number;
  collapsed?: boolean;
}

export default function NotificationBell({ unreadCount, collapsed }: NotificationBellProps) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  // Close on click outside
  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setOpen(false);
      }
    }
    if (open) {
      document.addEventListener("mousedown", handleClick);
    }
    return () => document.removeEventListener("mousedown", handleClick);
  }, [open]);

  return (
    <div ref={ref} className="relative">
      <button
        onClick={() => setOpen(!open)}
        className={`relative flex items-center gap-2 rounded-xl text-sm font-medium transition-all cursor-pointer ${
          collapsed ? "justify-center px-2 py-2.5" : "px-3 py-2.5"
        } ${
          open
            ? "bg-indigo-50 dark:bg-indigo-500/10 text-indigo-600 dark:text-indigo-400"
            : "text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800/50"
        }`}
        title={collapsed ? "Notifications" : undefined}
      >
        <span className="relative">
          <Bell className="w-5 h-5" />
          <AnimatePresence>
            {unreadCount > 0 && (
              <motion.span
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                exit={{ scale: 0 }}
                className="absolute -top-1.5 -right-1.5 min-w-[18px] h-[18px] flex items-center justify-center rounded-full bg-rose-500 text-white text-[10px] font-bold px-1 shadow-sm"
              >
                {unreadCount > 99 ? "99+" : unreadCount}
              </motion.span>
            )}
          </AnimatePresence>
        </span>
        {!collapsed && "Notifications"}
      </button>

      {/* Dropdown */}
      <AnimatePresence>
        {open && (
          <NotificationDropdown onClose={() => setOpen(false)} />
        )}
      </AnimatePresence>
    </div>
  );
}
