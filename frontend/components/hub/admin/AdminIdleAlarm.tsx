import { useRouter } from "next/router";
import { dismissAdminIdleAlert, useAdminIdleAlert } from "../../../lib/hub/adminPanel";
import { toHubPath } from "../../../lib/hub/routes";
import { useHubNavigate } from "../HubLink";
import PoliceAlert, { policeActionClass } from "./PoliceAlert";

/**
 * When the Admin panel locks itself after 30 seconds without activity:
 * police lights and the siren over whatever Hub page is open, until the
 * admin goes back to the password screen. Rendered by HubShell.
 */
export default function AdminIdleAlarm() {
  const raised = useAdminIdleAlert();
  const router = useRouter();
  const navigate = useHubNavigate();
  if (!raised) return null;

  const unlockAgain = () => {
    dismissAdminIdleAlert();
    // Admin pages show the password form themselves; anywhere else, go there.
    if (!toHubPath(router.asPath).startsWith("/admin")) void navigate("/admin");
  };

  return (
    <PoliceAlert
      title="Admin panel locked"
      subtitle="No activity for 30 seconds"
      action={
        <button type="button" onClick={unlockAgain} className={policeActionClass}>
          Unlock again
        </button>
      }
    >
      <p>Nothing moved for 30 seconds, so the Admin panel locked itself to keep it safe.</p>
      <p>Enter the admin password to open it again.</p>
    </PoliceAlert>
  );
}
