import { useState } from "react";
import { useRouter } from "next/router";
import { Archive, Bath, BedDouble, Car, ChevronRight, KeyRound, MoreHorizontal, Pencil, Plus } from "lucide-react";
import HubShell from "../../../components/hub/HubShell";
import HubLink, { useHubNavigate } from "../../../components/hub/HubLink";
import UnitRow from "../../../components/hub/owner/UnitRow";
import FunnelTable from "../../../components/hub/owner/FunnelTable";
import { Button, ButtonLink, IconButton } from "../../../components/hub/ui/Button";
import { CardSkeleton, EmptyState, ErrorState } from "../../../components/hub/ui/Feedback";
import { Field, Input, Select } from "../../../components/hub/ui/Field";
import { Fact, PageHeader, Panel, Section } from "../../../components/hub/ui/Layout";
import { Avatar, HomeImage } from "../../../components/hub/ui/Media";
import { Dialog, Menu } from "../../../components/hub/ui/Overlay";
import { useConfirm } from "../../../components/ui/ConfirmDialog";
import { useToast } from "../../../components/ui/Toast";
import { hubApi, HubError } from "../../../lib/hub/api";
import { aud, day, propertyTypeLabel } from "../../../lib/hub/format";
import { PROPERTY_TYPES, STATES } from "../../../lib/hub/listingDraft";
import { invalidate, useHubQuery } from "../../../lib/hub/query";
import type { PropertySummary } from "../../../lib/hub/types";

type PropertyDetail = Omit<PropertySummary, "tenancies"> & {
  tenancies: { id: string; listing_id: string; status: string; start_date: string; end_date: string | null; rent_amount: number; rent_frequency: string; renter: { id: string; name: string; avatar_url: string | null } | null }[];
};

function EditPropertyDialog({ p, open, onClose, onSaved }: { p: PropertyDetail; open: boolean; onClose: () => void; onSaved: () => void }) {
  const toast = useToast();
  const [f, setF] = useState({
    nickname: p.nickname ?? "",
    street_address: p.street_address,
    suburb: p.suburb ?? "",
    state: p.state ?? "",
    postcode: p.postcode ? String(p.postcode) : "",
    property_type: p.property_type ?? "",
    relationship: p.relationship,
  });
  const [busy, setBusy] = useState(false);
  const ok = f.street_address.trim().length >= 3 && (!f.postcode || /^\d{4}$/.test(f.postcode));

  async function save() {
    setBusy(true);
    try {
      await hubApi.patch(`/hub/properties/${p.id}`, {
        nickname: f.nickname.trim() || null,
        street_address: f.street_address.trim(),
        suburb: f.suburb.trim() || null,
        state: f.state || null,
        postcode: f.postcode ? Number(f.postcode) : null,
        property_type: f.property_type || null,
        relationship: f.relationship,
      });
      onSaved();
      onClose();
      toast.success("Property updated");
    } catch (e) {
      toast.error(e instanceof HubError ? e.message : "That didn't save.");
    } finally {
      setBusy(false);
    }
  }

  return (
    <Dialog
      open={open}
      onClose={onClose}
      title="Edit property"
      description="These are your records for the property. To change what renters see, edit each listing."
      footer={
        <>
          <Button variant="ghost" onClick={onClose}>
            Cancel
          </Button>
          <Button loading={busy} disabled={!ok} onClick={() => void save()}>
            Save
          </Button>
        </>
      }
    >
      <div className="grid gap-4 sm:grid-cols-2">
        <div className="sm:col-span-2">
          <Field label="Nickname" optional hint="Only you see this.">
            {({ id, describedBy }) => <Input id={id} value={f.nickname} maxLength={80} onChange={(e) => setF({ ...f, nickname: e.target.value })} aria-describedby={describedBy} />}
          </Field>
        </div>
        <div className="sm:col-span-2">
          <Field label="Street address">{({ id }) => <Input id={id} value={f.street_address} maxLength={300} onChange={(e) => setF({ ...f, street_address: e.target.value })} />}</Field>
        </div>
        <Field label="Suburb">{({ id }) => <Input id={id} value={f.suburb} maxLength={100} onChange={(e) => setF({ ...f, suburb: e.target.value })} />}</Field>
        <div className="grid grid-cols-2 gap-4">
          <Field label="State">
            {({ id }) => (
              <Select id={id} value={f.state} onChange={(e) => setF({ ...f, state: e.target.value })}>
                <option value="">-</option>
                {STATES.map((s) => (
                  <option key={s.value} value={s.value}>
                    {s.value}
                  </option>
                ))}
              </Select>
            )}
          </Field>
          <Field label="Postcode">{({ id }) => <Input id={id} inputMode="numeric" maxLength={4} value={f.postcode} onChange={(e) => setF({ ...f, postcode: e.target.value.replace(/\D/g, "") })} />}</Field>
        </div>
        <Field label="Kind of property">
          {({ id }) => (
            <Select id={id} value={f.property_type} onChange={(e) => setF({ ...f, property_type: e.target.value })}>
              <option value="">-</option>
              {PROPERTY_TYPES.map((t) => (
                <option key={t.value} value={t.value}>
                  {t.label}
                </option>
              ))}
            </Select>
          )}
        </Field>
        <Field label="You">
          {({ id }) => (
            <Select id={id} value={f.relationship} onChange={(e) => setF({ ...f, relationship: e.target.value as "owner" | "manager" })}>
              <option value="owner">Own it</option>
              <option value="manager">Manage it for the owner</option>
            </Select>
          )}
        </Field>
      </div>
    </Dialog>
  );
}

export default function PropertyPage() {
  const router = useRouter();
  const navigate = useHubNavigate();
  const toast = useToast();
  const confirm = useConfirm();
  const id = typeof router.query.id === "string" ? router.query.id : null;
  const { data, error, refetch } = useHubQuery<{ property: PropertyDetail }>(id ? `/hub/properties/${id}` : null);
  const [editing, setEditing] = useState(false);
  const p = data?.property;

  async function archive() {
    if (!p) return;
    if (!(await confirm({ title: "Archive this property?", description: "It's removed from your properties. You can only archive a property once its listings are archived and no one is living there.", confirmLabel: "Archive", tone: "danger" }))) return;
    try {
      await hubApi.post(`/hub/properties/${p.id}/archive`, {});
      invalidate("/hub/properties");
      invalidate("/hub/home");
      toast.success("Property archived");
      void navigate("/properties");
    } catch (e) {
      toast.error(e instanceof HubError ? e.message : "That didn't archive.");
    }
  }

  if (error) {
    return (
      <HubShell title="Property">
        <PageHeader title="Property" back={{ to: "/properties", label: "Properties" }} />
        {error.status === 404 ? <EmptyState title="Property not found" body="It may have been archived, or it belongs to a different account." /> : <ErrorState message={error.message} offline={error.offline} onRetry={() => void refetch()} />}
      </HubShell>
    );
  }
  if (!p) {
    return (
      <HubShell title="Property">
        <CardSkeleton />
      </HubShell>
    );
  }

  const name = p.nickname || p.street_address;
  const refresh = () => {
    invalidate("/hub/properties");
    void refetch();
  };

  return (
    <HubShell title={name}>
      <PageHeader
        title={name}
        back={{ to: "/properties", label: "Properties" }}
        description={`${p.street_address}, ${[p.suburb, p.state, p.postcode].filter(Boolean).join(" ")}`}
        actions={
          <>
            <ButtonLink to={`/properties/new?property=${p.id}`} icon={<Plus className="h-4 w-4" strokeWidth={1.9} />}>
              Add a listing
            </ButtonLink>
            <Menu
              label="Property options"
              trigger={(t) => (
                <IconButton {...t} label="Property options">
                  <MoreHorizontal className="h-5 w-5" strokeWidth={1.75} />
                </IconButton>
              )}
              items={[
                { label: "Edit property details", icon: <Pencil className="h-4 w-4" strokeWidth={1.75} />, onSelect: () => setEditing(true) },
                { label: "Archive property", icon: <Archive className="h-4 w-4" strokeWidth={1.75} />, danger: true, onSelect: () => void archive() },
              ]}
            />
          </>
        }
      />

      <div className="grid gap-10 lg:grid-cols-[minmax(0,1fr)_320px]">
        <div className="flex min-w-0 flex-col gap-10">
          <Section title="Listings" description={p.units.length > 1 ? "Each room or unit is listed on its own." : undefined}>
            {p.units.length === 0 ? (
              <EmptyState compact title="Nothing listed here yet" body="List the whole place, or each room separately." action={<ButtonLink to={`/properties/new?property=${p.id}`}>Add a listing</ButtonLink>} />
            ) : (
              <ul className="flex flex-col overflow-hidden rounded-[20px] border border-[var(--color-line)] bg-[var(--color-surface)]">
                {p.units.map((u) => (
                  <li key={u.id} className="border-t border-[var(--color-line)] first:border-0">
                    <UnitRow u={u} fallbackLabel={p.units.length === 1 ? "Whole place" : undefined} />
                  </li>
                ))}
              </ul>
            )}
          </Section>

          {p.tenancies.length > 0 && (
            <Section title="Living here now">
              <ul className="flex flex-col overflow-hidden rounded-[20px] border border-[var(--color-line)] bg-[var(--color-surface)]">
                {p.tenancies.map((t) => {
                  const unit = p.units.find((u) => u.id === t.listing_id);
                  return (
                    <li key={t.id} className="border-t border-[var(--color-line)] first:border-0">
                      <HubLink to={`/tenancies/${t.id}`} className="flex items-center gap-4 px-4 py-3.5 hover:bg-[var(--color-surface-hover)] sm:px-5">
                        <Avatar name={t.renter?.name} src={t.renter?.avatar_url} size={40} />
                        <div className="min-w-0 flex-1">
                          <p className="truncate text-[15px] font-semibold text-[color:var(--color-ink)]">{t.renter?.name ?? "Renter"}</p>
                          <p className="truncate text-[13px] text-[color:var(--color-ink-3)]">
                            {unit?.unit_label ? `${unit.unit_label} · ` : ""}
                            {aud(t.rent_amount)} a week · since {day(t.start_date)}
                          </p>
                        </div>
                        <KeyRound className="h-4 w-4 text-[color:var(--color-ink-3)]" strokeWidth={1.75} aria-hidden />
                        <ChevronRight className="h-4 w-4 text-[color:var(--color-ink-4)]" strokeWidth={2} aria-hidden />
                      </HubLink>
                    </li>
                  );
                })}
              </ul>
            </Section>
          )}

          {p.performance && p.units.length > 0 && (
            <Section title="Last 30 days" description={p.performance.tracking_since ? `Counted on Migrent since ${day(p.performance.tracking_since)}. Your own visits aren't counted.` : "Nothing recorded yet. Views, saves and enquiries appear here once the listing is live."}>
              <FunnelTable units={p.units} perf={p.performance} />
            </Section>
          )}
        </div>

        <aside className="flex flex-col gap-5 lg:sticky lg:top-10 lg:self-start">
          <Panel padded={false} className="overflow-hidden">
            <HomeImage src={p.cover_image} alt="" className="aspect-[16/10] w-full" rounded="rounded-none" sizes="320px" />
            <dl className="grid grid-cols-2 gap-4 p-5">
              <Fact label="Kind" value={propertyTypeLabel(p.property_type) || "-"} />
              <Fact label="You" value={p.relationship === "manager" ? "Manage it" : "Own it"} />
              {p.bedrooms != null && <Fact icon={<BedDouble className="h-4 w-4" strokeWidth={1.75} />} label="Bedrooms" value={p.bedrooms} />}
              {p.bathrooms != null && <Fact icon={<Bath className="h-4 w-4" strokeWidth={1.75} />} label="Bathrooms" value={p.bathrooms} />}
              {p.parking_spaces != null && <Fact icon={<Car className="h-4 w-4" strokeWidth={1.75} />} label="Car spaces" value={p.parking_spaces} />}
            </dl>
          </Panel>
          <Panel className="grid grid-cols-2 gap-4">
            <Fact label="Available now" value={p.summary.available} />
            <Fact label="Occupied" value={p.summary.occupied} />
            <Fact label="To review" value={p.summary.applications} />
            <Fact label="Open times" value={p.summary.inspections} />
          </Panel>
        </aside>
      </div>

      {editing && <EditPropertyDialog p={p} open={editing} onClose={() => setEditing(false)} onSaved={refresh} />}
    </HubShell>
  );
}
