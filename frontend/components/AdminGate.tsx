import { useState, useEffect, ReactNode } from "react";
import { motion } from "framer-motion";

const ADMIN_USERNAME = "7ADAM15";
const ADMIN_PASSWORD = "craver_rules";
const LOCKOUT_PASSWORD = "westxlopez";
const MAX_ATTEMPTS = 3;
const SESSION_KEY = "admin_gate_auth";

export default function AdminGate({ children }: { children: ReactNode }) {
  const [authenticated, setAuthenticated] = useState(false);
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [attempts, setAttempts] = useState(0);
  const [locked, setLocked] = useState(false);
  const [lockoutPassword, setLockoutPassword] = useState("");
  const [error, setError] = useState("");
  const [lockoutError, setLockoutError] = useState("");
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    const stored = sessionStorage.getItem(SESSION_KEY);
    if (stored === "true") {
      setAuthenticated(true);
    }
  }, []);

  const handleLogin = () => {
    setError("");
    if (username === ADMIN_USERNAME && password === ADMIN_PASSWORD) {
      sessionStorage.setItem(SESSION_KEY, "true");
      setAuthenticated(true);
      return;
    }

    const next = attempts + 1;
    setAttempts(next);

    if (next >= MAX_ATTEMPTS) {
      setLocked(true);
    } else {
      setError(`Invalid credentials. ${MAX_ATTEMPTS - next} attempt${MAX_ATTEMPTS - next === 1 ? "" : "s"} remaining.`);
    }
  };

  const handleLockoutSubmit = () => {
    setLockoutError("");
    if (lockoutPassword === LOCKOUT_PASSWORD) {
      setLocked(false);
      setAttempts(0);
      setUsername("");
      setPassword("");
      setLockoutPassword("");
    } else {
      setLockoutError("Wrong password.");
    }
  };

  if (!mounted) return null;

  if (authenticated) {
    return <>{children}</>;
  }

  // Lockout screen with flashing red/blue
  if (locked) {
    return (
      <>
        <style jsx global>{`
          @keyframes flash-bg {
            0%, 100% { background-color: #dc2626; }
            50% { background-color: #2563eb; }
          }
          .lockout-flash {
            animation: flash-bg 0.5s ease-in-out infinite;
          }
        `}</style>
        <div className="lockout-flash fixed inset-0 z-[9999] flex items-center justify-center">
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-black/90 border-2 border-white rounded-2xl p-10 max-w-md w-full mx-4 text-center"
          >
            <div className="w-16 h-16 mx-auto mb-5 rounded-full bg-red-600 flex items-center justify-center">
              <svg className="w-8 h-8 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
              </svg>
            </div>
            <h1 className="text-2xl font-black text-white mb-2">LOCKED OUT</h1>
            <p className="text-white/70 text-sm mb-6">Too many failed attempts. Enter recovery password to continue.</p>
            <input
              type="password"
              placeholder="Recovery password"
              value={lockoutPassword}
              onChange={(e) => setLockoutPassword(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleLockoutSubmit()}
              className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-xl text-white placeholder-white/40 text-center text-lg focus:outline-none focus:border-white/50 mb-4"
              autoFocus
            />
            <button
              onClick={handleLockoutSubmit}
              className="w-full py-3 rounded-xl text-sm font-bold text-white bg-white/20 hover:bg-white/30 transition-colors"
            >
              Submit
            </button>
            {lockoutError && (
              <p className="mt-3 text-red-300 text-sm font-medium">{lockoutError}</p>
            )}
          </motion.div>
        </div>
      </>
    );
  }

  // Normal login gate
  return (
    <div className="min-h-[70vh] flex items-center justify-center px-4">
      <motion.div
        initial={{ opacity: 0, y: 30, scale: 0.96 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ duration: 0.5 }}
        className="relative w-full max-w-sm"
      >
        <div className="card p-8 rounded-2xl">
          <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-rose-400/50 to-transparent rounded-t-2xl" />

          <div className="text-center mb-6">
            <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-rose-500 to-rose-600 flex items-center justify-center text-white font-black text-lg mx-auto mb-4">
              <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M16.5 10.5V6.75a4.5 4.5 0 10-9 0v3.75m-.75 11.25h10.5a2.25 2.25 0 002.25-2.25v-6.75a2.25 2.25 0 00-2.25-2.25H6.75a2.25 2.25 0 00-2.25 2.25v6.75a2.25 2.25 0 002.25 2.25z" />
              </svg>
            </div>
            <h1 className="text-xl font-black tracking-tight text-slate-900 dark:text-white">
              Admin Access
            </h1>
            <p className="text-slate-500 dark:text-slate-400 text-sm mt-1">Enter your credentials to proceed.</p>
          </div>

          <div className="space-y-3">
            <input
              type="text"
              placeholder="Username"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              className="input-field"
              autoFocus
            />
            <input
              type="password"
              placeholder="Password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleLogin()}
              className="input-field"
            />
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={handleLogin}
              className="w-full btn-primary py-3 rounded-xl text-sm"
            >
              Enter
            </motion.button>
            {error && (
              <motion.p
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                className="text-sm text-center p-3 rounded-xl bg-red-50 dark:bg-red-500/10 border border-red-200 dark:border-red-500/20 text-red-600 dark:text-red-400"
              >
                {error}
              </motion.p>
            )}
          </div>
        </div>
      </motion.div>
    </div>
  );
}
