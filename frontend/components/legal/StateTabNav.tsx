import { useState, useEffect } from "react";
import { ChevronDown } from "lucide-react";

export interface StateTab {
  code: string;
  name: string;
}

const STATES: StateTab[] = [
  { code: "nsw", name: "New South Wales" },
  { code: "vic", name: "Victoria" },
  { code: "qld", name: "Queensland" },
  { code: "wa", name: "Western Australia" },
  { code: "sa", name: "South Australia" },
  { code: "tas", name: "Tasmania" },
  { code: "act", name: "ACT" },
  { code: "nt", name: "Northern Territory" },
];

interface StateTabNavProps {
  activeState: string;
  onStateChange: (code: string) => void;
}

export default function StateTabNav({ activeState, onStateChange }: StateTabNavProps) {
  const [mobileOpen, setMobileOpen] = useState(false);

  // Sync with URL hash on mount
  useEffect(() => {
    const hash = window.location.hash.replace("#", "").toLowerCase();
    if (hash && STATES.some((s) => s.code === hash)) {
      onStateChange(hash);
    }
  }, []);

  // Update hash on change
  useEffect(() => {
    if (activeState) {
      window.history.replaceState(null, "", `#${activeState}`);
    }
  }, [activeState]);

  const activeName = STATES.find((s) => s.code === activeState)?.name || "Select a state";

  return (
    <div>
      {/* Desktop tabs */}
      <div className="hidden md:flex flex-wrap gap-1 p-1 rounded-xl bg-[var(--color-surface-muted)]/50">
        {STATES.map((state) => (
          <button
            key={state.code}
            onClick={() => onStateChange(state.code)}
            className={`px-4 py-2.5 rounded-lg text-sm font-medium transition-all ${
              activeState === state.code
                ? "bg-white dark:bg-[var(--color-surface-muted)] text-[var(--color-primary)] dark:text-[var(--color-primary)] shadow-sm"
                : "text-[var(--color-ink-2)] hover:text-[var(--color-ink)] dark:hover:text-white hover:bg-white/50 dark:hover:bg-[var(--color-surface-muted)]"
            }`}
          >
            <span className="font-bold">{state.code.toUpperCase()}</span>
          </button>
        ))}
      </div>

      {/* Mobile dropdown */}
      <div className="md:hidden relative">
        <button
          onClick={() => setMobileOpen(!mobileOpen)}
          className="w-full flex items-center justify-between px-4 py-3 rounded-xl bg-[var(--color-surface-muted)]/50 text-sm font-medium text-[var(--color-ink)]"
        >
          <span>
            <span className="font-bold text-[var(--color-primary)] dark:text-[var(--color-primary)]">
              {activeState.toUpperCase()}
            </span>{" "}
            - {activeName}
          </span>
          <ChevronDown
            className={`w-4 h-4 transition-transform ${mobileOpen ? "rotate-180" : ""}`}
          />
        </button>
        {mobileOpen && (
          <div className="absolute top-full left-0 right-0 mt-1 z-20 bg-[var(--color-surface-2)] rounded-xl shadow-lg border border-[var(--color-line)] overflow-hidden">
            {STATES.map((state) => (
              <button
                key={state.code}
                onClick={() => {
                  onStateChange(state.code);
                  setMobileOpen(false);
                }}
                className={`w-full text-left px-4 py-3 text-sm transition-colors ${
                  activeState === state.code
                    ? "bg-[var(--color-primary-50)] text-[var(--color-primary)] dark:text-[var(--color-primary)] font-medium"
                    : "text-[var(--color-ink-2)] hover:bg-[var(--color-surface)] dark:hover:bg-[var(--color-surface-muted)]"
                }`}
              >
                <span className="font-bold">{state.code.toUpperCase()}</span> - {state.name}
              </button>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

export { STATES };
