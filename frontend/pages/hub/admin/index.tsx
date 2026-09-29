import AdminPanelShell, { AdminPasswordForm } from "../../../components/hub/admin/AdminPanel";
import AdminHome from "../../../components/hub/home/AdminHome";
import { Section } from "../../../components/hub/ui/Layout";

/** The Admin panel's front page: what is waiting on Migrent, and the panel's own password. */
export default function AdminPanelPage() {
  return (
    <AdminPanelShell title="Admin panel">
      <div className="flex flex-col gap-12">
        <AdminHome />
        <Section title="Admin password" description="The second password that opens this panel. Changing it here changes it for every admin.">
          <AdminPasswordForm />
        </Section>
      </div>
    </AdminPanelShell>
  );
}
