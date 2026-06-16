import { supabase } from "../lib/supabase";
import { motion } from "framer-motion";

interface MicrosoftSignInButtonProps {
  redirectTo?: string;
  disabled?: boolean;
}

export default function MicrosoftSignInButton({ redirectTo, disabled }: MicrosoftSignInButtonProps) {
  const handleMicrosoftSignIn = async () => {
    await supabase.auth.signInWithOAuth({
      provider: "azure",
      options: {
        redirectTo,
        scopes: "email profile openid",
      },
    });
  };

  return (
    <motion.button
      whileHover={disabled ? {} : { scale: 1.01 }}
      whileTap={disabled ? {} : { scale: 0.99 }}
      onClick={handleMicrosoftSignIn}
      disabled={disabled}
      className="w-full flex items-center justify-center gap-3 px-4 py-3 rounded-xl bg-[var(--color-surface-2)] border border-[var(--color-line)] text-sm font-semibold text-[var(--color-ink-2)] hover:bg-[var(--color-surface)] dark:hover:bg-[var(--color-surface-muted)] transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
    >
      <svg width="18" height="18" viewBox="0 0 21 21">
        <rect x="1" y="1" width="9" height="9" fill="#f25022" />
        <rect x="11" y="1" width="9" height="9" fill="#7fba00" />
        <rect x="1" y="11" width="9" height="9" fill="#00a4ef" />
        <rect x="11" y="11" width="9" height="9" fill="#ffb900" />
      </svg>
      Continue with Microsoft
    </motion.button>
  );
}
