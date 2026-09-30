import { useEffect } from "react";
import Head from "next/head";
import PoliceAlert, { policeActionClass } from "../../components/hub/admin/PoliceAlert";
import { lockAdminPanel } from "../../lib/hub/adminPanel";
import { clearQueryCache } from "../../lib/hub/query";
import { hubUrl } from "../../lib/hub/routes";
import { supabase } from "../../lib/supabase";

/**
 * Where three wrong Admin panel passwords end up. The server has already
 * locked the panel for this account, ended its sessions everywhere and
 * alerted every admin (routes_hub_admin._lock_out); this page ends the
 * session in this browser too and says so, loudly: police lights and a
 * siren (components/hub/admin/PoliceAlert.tsx).
 */
export default function AdminLockedPage() {
  useEffect(() => {
    lockAdminPanel("signout");
    clearQueryCache();
    void supabase.auth.signOut().catch(() => {});
  }, []);

  return (
    <>
      <Head>
        <title>Potential threat · Migrent Hub</title>
        <meta name="robots" content="noindex, nofollow" />
      </Head>
      <PoliceAlert
        title="Potential threat"
        subtitle="Potential hack"
        action={
          <a href={hubUrl("/sign-in")} className={policeActionClass}>
            Sign in again
          </a>
        }
      >
        <p>Three wrong Admin panel passwords were entered on this account.</p>
        <p>For everyone&apos;s safety you have been signed out, the Admin panel is locked for 15 minutes, and every Migrent admin has been alerted.</p>
      </PoliceAlert>
    </>
  );
}
