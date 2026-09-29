import { Plus } from "lucide-react";
import HubShell from "../../components/hub/HubShell";
import RenterHome from "../../components/hub/home/RenterHome";
import OwnerHome from "../../components/hub/home/OwnerHome";
import AdminHome from "../../components/hub/home/AdminHome";
import { AdminPanelGate } from "../../components/hub/admin/AdminPanel";
import { ButtonLink } from "../../components/hub/ui/Button";
import { useHub } from "../../lib/hub/session";

export default function HubHome() {
  const { role } = useHub();
  return (
    <HubShell
      title="Home"
      fab={
        role === "owner" ? (
          <ButtonLink to="/properties/new" size="lg" icon={<Plus className="h-5 w-5" strokeWidth={2} />} className="rounded-full shadow-[var(--shadow-pop)]">
            Add property
          </ButtonLink>
        ) : undefined
      }
    >
      {role === "owner" ? <OwnerHome /> : role === "admin" ? (
        <AdminPanelGate>
          <AdminHome />
        </AdminPanelGate>
      ) : <RenterHome />}
    </HubShell>
  );
}
