import { useRouter } from "next/router";
import { ArrowLeft, ChevronRight, CircleHelp, LogOut, Plus, Settings, ShieldCheck } from "lucide-react";
import HubShell from "../../components/hub/HubShell";
import HubLink from "../../components/hub/HubLink";
import { ThemeSegmented } from "../../components/hub/ThemeToggle";
import { footerNav, navFor, type NavItem } from "../../components/hub/nav";
import { StatusBadge } from "../../components/hub/ui/Feedback";
import { Avatar } from "../../components/hub/ui/Media";
import { hubUrl, siteUrl } from "../../lib/hub/routes";
import { useHubQuery } from "../../lib/hub/query";
import { useHub } from "../../lib/hub/session";
import type { HubCounts } from "../../lib/hub/types";

function Row({ item, count }: { item: NavItem; count?: number }) {
  const Icon = item.icon;
  return (
    <HubLink to={item.to} className="flex h-14 items-center gap-3.5 px-4 text-[15px] font-medium text-[color:var(--color-ink)] transition-colors hover:bg-[var(--color-surface-hover)]">
      <Icon className="h-5 w-5 text-[color:var(--color-ink-2)]" strokeWidth={1.75} aria-hidden />
      <span className="flex-1">{item.label}</span>
      {count ? <span className="rounded-full bg-[var(--color-primary)] px-2 py-0.5 text-[12px] font-bold text-[color:var(--color-primary-fg)]">{count}</span> : null}
      <ChevronRight className="h-4 w-4 text-[color:var(--color-ink-4)]" strokeWidth={2} aria-hidden />
    </HubLink>
  );
}

function Group({ title, children }: { title?: string; children: React.ReactNode }) {
  return (
    <section className="flex flex-col gap-2">
      {title && <h2 className="px-1 text-[12.5px] font-semibold uppercase tracking-[0.08em] text-[color:var(--color-ink-3)]">{title}</h2>}
      <div className="divide-y divide-[var(--color-line)] overflow-hidden rounded-[20px] border border-[var(--color-line)] bg-[var(--color-surface)]">{children}</div>
    </section>
  );
}

/**
 * The Profile tab on phones: everything that isn't one of the four other
 * tabs, so every Hub destination is two taps away. Works on desktop too.
 */
export default function MePage() {
  const { me, role, signOut } = useHub();
  const router = useRouter();
  const counts = useHubQuery<HubCounts>("/hub/counts");
  const c = counts.data;
  const { primary, tabs } = navFor(role, { hasHome: (c?.tenancies ?? 0) > 0 });
  const tabPaths = new Set(tabs.map((t) => t.to));
  const rest = [...primary.filter((p) => !tabPaths.has(p.to)), ...footerNav.filter((f) => !tabPaths.has(f.to))];
  const roleLabel = role === "owner" ? (me?.owner_kind === "property_manager" ? "Property manager" : "Owner") : role === "admin" ? "Migrent administrator" : "Renter";
  const v = me?.owner_verification;

  return (
    <HubShell title="Profile">
      <div className="mx-auto flex max-w-[640px] flex-col gap-7">
        <HubLink to={role === "renter" ? "/profile" : "/settings"} className="flex items-center gap-4 rounded-[22px] border border-[var(--color-line)] bg-[var(--color-surface)] p-5 transition-colors hover:bg-[var(--color-surface-hover)]">
          <Avatar name={me?.name || me?.email} src={me?.avatar_url} size={60} />
          <div className="flex min-w-0 flex-1 flex-col gap-1">
            <p className="truncate text-[19px] font-semibold tracking-[-0.01em] text-[color:var(--color-ink)]">{me?.name || "Add your name"}</p>
            <p className="truncate text-[13.5px] text-[color:var(--color-ink-3)]">{me?.email}</p>
            <div className="mt-1 flex flex-wrap gap-2">
              <StatusBadge tone="neutral" icon={false}>
                {roleLabel}
              </StatusBadge>
              {role === "owner" && v && (
                <StatusBadge tone={v.status === "verified" ? "info" : v.status === "pending" ? "warning" : "neutral"} icon={v.status === "verified"}>
                  {v.status === "verified" ? "ID checked" : v.status === "pending" ? "ID check in progress" : "ID not checked"}
                </StatusBadge>
              )}
            </div>
          </div>
          <ChevronRight className="h-5 w-5 text-[color:var(--color-ink-4)]" strokeWidth={2} aria-hidden />
        </HubLink>

        {role === "owner" && (
          <HubLink to="/properties/new" className="flex h-14 items-center justify-center gap-2 rounded-[18px] bg-[var(--color-primary)] text-[15px] font-semibold text-[color:var(--color-primary-fg)] hover:bg-[var(--color-primary-hover)]">
            <Plus className="h-5 w-5" strokeWidth={2} aria-hidden />
            List a property
          </HubLink>
        )}

        <Group>
          {rest.map((item) => (
            <Row key={item.to} item={item} count={item.count ? c?.[item.count] : undefined} />
          ))}
        </Group>

        {role === "owner" && v?.status !== "verified" && (
          <Group title="Trust">
            <Row item={{ label: v?.status === "pending" ? "ID check in progress" : "Check your ID", to: "/settings#verification", icon: ShieldCheck }} />
          </Group>
        )}

        <Group title="Appearance">
          <div className="flex items-center justify-between gap-4 px-4 py-3">
            <span className="text-[15px] font-medium text-[color:var(--color-ink)]">Theme</span>
            <ThemeSegmented />
          </div>
        </Group>

        <Group>
          {role === "admin" && (
            <a href={siteUrl("/admin")} className="flex h-14 items-center gap-3.5 px-4 text-[15px] font-medium text-[color:var(--color-ink)] hover:bg-[var(--color-surface-hover)]">
              <Settings className="h-5 w-5 text-[color:var(--color-ink-2)]" strokeWidth={1.75} aria-hidden />
              <span className="flex-1">Admin console</span>
            </a>
          )}
          <a href={siteUrl("/help")} className="flex h-14 items-center gap-3.5 px-4 text-[15px] font-medium text-[color:var(--color-ink)] hover:bg-[var(--color-surface-hover)]">
            <CircleHelp className="h-5 w-5 text-[color:var(--color-ink-2)]" strokeWidth={1.75} aria-hidden />
            <span className="flex-1">Help and safety</span>
          </a>
          <a href={siteUrl("/")} className="flex h-14 items-center gap-3.5 px-4 text-[15px] font-medium text-[color:var(--color-ink)] hover:bg-[var(--color-surface-hover)]">
            <ArrowLeft className="h-5 w-5 text-[color:var(--color-ink-2)]" strokeWidth={1.75} aria-hidden />
            <span className="flex-1">Back to Migrent</span>
          </a>
          <button
            type="button"
            onClick={async () => {
              await signOut();
              void router.replace(hubUrl("/sign-in"));
            }}
            className="flex h-14 w-full items-center gap-3.5 px-4 text-left text-[15px] font-medium text-[color:var(--color-danger-500)] hover:bg-[var(--color-surface-hover)]"
          >
            <LogOut className="h-5 w-5" strokeWidth={1.75} aria-hidden />
            Sign out
          </button>
        </Group>
      </div>
    </HubShell>
  );
}
