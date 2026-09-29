import { useEffect } from "react";
import Head from "next/head";
import { ShieldAlert } from "lucide-react";
import { lockAdminPanel } from "../../lib/hub/adminPanel";
import { clearQueryCache } from "../../lib/hub/query";
import { hubUrl } from "../../lib/hub/routes";
import { supabase } from "../../lib/supabase";

/**
 * Where three wrong Admin panel passwords end up. The server has already
 * locked the panel for this account, ended its sessions everywhere and
 * alerted every admin (routes_hub_admin._lock_out); this page ends the
 * session in this browser too and says so, loudly.
 *
 * The police lights pulse once a second per colour, under the three
 * flashes a second that can trigger seizures, and stand still for anyone
 * who has asked their device to reduce motion.
 */
export default function AdminLockedPage() {
  useEffect(() => {
    lockAdminPanel();
    clearQueryCache();
    void supabase.auth.signOut().catch(() => {});
  }, []);

  return (
    <div className="hub hub-threat" role="alertdialog" aria-modal="true" aria-labelledby="threat-title" aria-describedby="threat-body">
      <Head>
        <title>Potential threat · Migrent Hub</title>
        <meta name="robots" content="noindex, nofollow" />
      </Head>
      <div className="hub-threat-lights" aria-hidden>
        <span className="hub-threat-red" />
        <span className="hub-threat-blue" />
      </div>
      <div className="hub-threat-bar" aria-hidden>
        <span className="hub-threat-red" />
        <span className="hub-threat-blue" />
      </div>

      <main className="relative z-[1] flex min-h-[100dvh] flex-col items-center justify-center px-4 py-16 text-center">
        <div className="flex w-full max-w-[720px] flex-col items-center gap-6">
          <span className="flex h-16 w-16 items-center justify-center rounded-[20px] bg-white/10 text-white ring-1 ring-white/25">
            <ShieldAlert className="h-9 w-9" strokeWidth={1.75} aria-hidden />
          </span>
          <div className="w-full rounded-[18px] border-2 border-white/80 bg-black/55 px-5 py-6 shadow-[0_0_60px_rgb(0_0_0/0.5)] backdrop-blur-sm sm:px-10 sm:py-8">
            <h1 id="threat-title" className="text-[40px] font-extrabold uppercase leading-[1.02] tracking-[0.04em] text-white sm:text-[64px]">
              Potential threat
            </h1>
            <p className="mt-3 text-[18px] font-bold uppercase tracking-[0.18em] text-white/90 sm:text-[22px]">Potential hack</p>
          </div>
          <div id="threat-body" className="flex max-w-[560px] flex-col gap-3 text-[16px] leading-relaxed text-white/90">
            <p>Three wrong Admin panel passwords were entered on this account.</p>
            <p>
              For everyone&apos;s safety you have been signed out, the Admin panel is locked for 15 minutes, and every Migrent admin has been alerted.
            </p>
          </div>
          <a
            href={hubUrl("/sign-in")}
            className="mt-2 inline-flex h-12 items-center justify-center rounded-[12px] bg-white px-6 text-[15px] font-semibold text-[#101828] hover:bg-white/90 focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-white/50"
          >
            Sign in again
          </a>
        </div>
      </main>
    </div>
  );
}
