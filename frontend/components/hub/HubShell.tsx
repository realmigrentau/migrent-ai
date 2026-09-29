import { useEffect, useMemo, useState, type ReactNode } from "react";
import Head from "next/head";
import { useRouter } from "next/router";
import { motion, useReducedMotion } from "framer-motion";
import { ArrowLeft, ChevronsLeft, ChevronsRight, Command, Eye, LogOut, Search, Settings, UserRound } from "lucide-react";
import { Logo } from "../ui/Logo";
import { cn } from "../../lib/cn";
import { useHub } from "../../lib/hub/session";
import { useHubQuery } from "../../lib/hub/query";
import { hubSignInUrl, hubUrl, siteUrl, toHubPath } from "../../lib/hub/routes";
import type { HubCounts } from "../../lib/hub/types";
import HubLink, { useHubNavigate } from "./HubLink";
import CommandPalette from "./CommandPalette";
import { ThemeIconButton, ThemeSegmented } from "./ThemeToggle";
import { navFor, footerNav, isActive, type NavItem } from "./nav";
import { Avatar } from "./ui/Media";
import { Menu } from "./ui/Overlay";
import { ErrorState, Skeleton } from "./ui/Feedback";
import { Button } from "./ui/Button";

const RAIL_KEY = "migrent-hub-rail";

export function HubMark({ compact, className }: { compact?: boolean; className?: string }) {
  return (
    <span className={cn("inline-flex items-center gap-2.5", className)}>
      <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-[11px] bg-[var(--color-primary)] text-[color:var(--color-primary-fg)] shadow-[0_1px_0_rgb(255_255_255/0.2)_inset]">
        <Logo size={22} title="Migrent" />
      </span>
      {!compact && (
        <span className="flex items-baseline gap-1.5 leading-none">
          <span className="text-[17px] font-extrabold tracking-[-0.02em] text-[color:var(--color-ink)]">Migrent</span>
          <span className="text-[13px] font-semibold text-[color:var(--color-ink-3)]">Hub</span>
        </span>
      )}
    </span>
  );
}

function CountBadge({ n, className }: { n?: number; className?: string }) {
  if (!n) return null;
  return (
    <span className={cn("hub-badge-dot", className)} aria-hidden>
      {n > 99 ? "99+" : n}
    </span>
  );
}

function RailItem({ item, compact, active, count }: { item: NavItem; compact: boolean; active: boolean; count?: number }) {
  const Icon = item.icon;
  const label = count ? `${item.label}, ${count} new` : item.label;
  return (
    <HubLink to={item.to} className={cn("hub-nav-item", compact && "justify-center px-0")} aria-current={active ? "page" : undefined} aria-label={compact ? label : undefined}>
      {active && (
        <motion.span
          layoutId="hub-rail-active"
          aria-hidden
          className="absolute inset-0 rounded-[12px] bg-[var(--color-surface)] shadow-[0_1px_2px_rgb(16_24_40/0.06),0_0_0_1px_var(--color-line)]"
          transition={{ type: "spring", stiffness: 520, damping: 42 }}
        />
      )}
      <span className="hub-nav-icon relative z-[1] flex h-5 w-5 items-center justify-center">
        <Icon className="h-[19px] w-[19px]" strokeWidth={1.75} aria-hidden />
        {compact && <CountBadge n={count} className="-right-2.5 -top-2" />}
      </span>
      {!compact && <span className="relative z-[1] flex-1 truncate">{item.label}</span>}
      {!compact && count ? (
        <span className="relative z-[1] inline-flex h-5 min-w-5 items-center justify-center rounded-full bg-[var(--color-primary)] px-1.5 text-[11px] font-bold text-[color:var(--color-primary-fg)]" aria-hidden>
          {count > 99 ? "99+" : count}
        </span>
      ) : null}
      {compact && <span className="hub-tip" role="tooltip">{item.label}</span>}
    </HubLink>
  );
}

function AccountMenu({ align = "end", side = "bottom" }: { align?: "start" | "end"; side?: "top" | "bottom" }) {
  const { me, signOut, role } = useHub();
  const navigate = useHubNavigate();
  const router = useRouter();
  return (
    <Menu
      label="Account"
      align={align}
      side={side}
      trigger={(p) => (
        <button {...p} type="button" aria-label="Account menu" className="hub-press rounded-full focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-primary)] focus-visible:ring-offset-2">
          <Avatar name={me?.name || me?.email} src={me?.avatar_url} size={36} />
        </button>
      )}
      items={[
        ...(role === "renter" ? [{ label: "Rental Profile", icon: <UserRound className="h-4 w-4" strokeWidth={1.75} />, onSelect: () => void navigate("/profile") }] : []),
        { label: role === "renter" ? "Settings" : "Account and settings", icon: <Settings className="h-4 w-4" strokeWidth={1.75} />, onSelect: () => void navigate("/settings") },
        { label: "Back to Migrent", icon: <ArrowLeft className="h-4 w-4" strokeWidth={1.75} />, onSelect: () => void (window.location.href = siteUrl("/")) },
        {
          label: "Sign out",
          icon: <LogOut className="h-4 w-4" strokeWidth={1.75} />,
          onSelect: async () => {
            await signOut();
            void router.replace(hubUrl("/sign-in"));
          },
        },
      ]}
    />
  );
}

function ViewAsBanner() {
  const { viewAs, endViewAs } = useHub();
  const navigate = useHubNavigate();
  if (!viewAs) return null;
  return (
    <div role="status" className="sticky top-0 z-[60] flex items-center justify-center gap-3 bg-[var(--color-warn-500)] px-4 py-2 text-[13.5px] font-semibold text-white dark:text-[#1a1305]">
      <Eye className="h-4 w-4" strokeWidth={2} aria-hidden />
      <span>Viewing as {viewAs.name}. Read-only - nothing can be changed.</span>
      <button
        type="button"
        onClick={async () => {
          await endViewAs();
          void navigate("/admin/people");
        }}
        className="rounded-full bg-white/20 px-3 py-1 text-[12.5px] hover:bg-white/30"
      >
        Stop viewing
      </button>
    </div>
  );
}

function ShellSkeleton() {
  return (
    <div className="px-4 pt-8 sm:px-8 lg:pl-[300px]">
      <div className="mx-auto flex max-w-[1180px] flex-col gap-6" role="status" aria-busy="true">
        <span className="sr-only">Loading Migrent Hub</span>
        <Skeleton className="h-9 w-72" />
        <Skeleton className="h-4 w-96 max-w-full" />
        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          <Skeleton className="h-44 rounded-[22px]" />
          <Skeleton className="h-44 rounded-[22px]" />
          <Skeleton className="h-44 rounded-[22px]" />
        </div>
      </div>
    </div>
  );
}

interface HubShellProps {
  children: ReactNode;
  title: string;
  /** Pages that should render edge-to-edge (map search, conversations). */
  fullBleed?: boolean;
  /** Owner pages show "List a property" as a floating action on phones. */
  fab?: ReactNode;
  /** Phones: the page takes the whole screen (an open conversation), so the top bar and tab bar step aside. */
  immersive?: boolean;
  /** Desktop: the page fills the viewport exactly and scrolls inside itself. */
  fitDesktop?: boolean;
}

/**
 * The frame around every signed-in Hub page. It also guards the page:
 * nothing protected renders until the session, MFA and onboarding checks
 * have passed.
 */
export default function HubShell({ children, title, fullBleed, fab, immersive, fitDesktop }: HubShellProps) {
  const router = useRouter();
  const { status, role, meError, refreshMe } = useHub();
  const reduce = useReducedMotion();
  const hubPath = toHubPath(router.asPath);
  const [compact, setCompact] = useState(false);
  const [paletteOpen, setPaletteOpen] = useState(false);

  useEffect(() => {
    try {
      const stored = localStorage.getItem(RAIL_KEY);
      setCompact(stored ? stored === "compact" : window.innerWidth < 1280);
    } catch {
      /* default expanded */
    }
  }, []);
  const toggleRail = () => {
    setCompact((c) => {
      try {
        localStorage.setItem(RAIL_KEY, c ? "expanded" : "compact");
      } catch {
        /* ignore */
      }
      return !c;
    });
  };

  // Guard.
  useEffect(() => {
    const next = encodeURIComponent(hubPath);
    if (status === "signed-out") void router.replace(hubSignInUrl(hubPath));
    else if (status === "needs-mfa") void router.replace(`${hubUrl("/verify-mfa")}?next=${next}`);
    else if (status === "needs-onboarding" && !hubPath.startsWith("/welcome")) void router.replace(`${hubUrl("/welcome")}?next=${next}`);
  }, [status, hubPath, router]);

  const counts = useHubQuery<HubCounts>(status === "ready" ? "/hub/counts" : null);
  useEffect(() => {
    if (status !== "ready") return;
    const id = window.setInterval(() => void counts.refetch().catch(() => {}), 60_000);
    return () => window.clearInterval(id);
  }, [status, counts.refetch]); // eslint-disable-line react-hooks/exhaustive-deps

  const c = counts.data;
  const hasHome = (c?.tenancies ?? 0) > 0;
  const { primary, tabs } = useMemo(() => navFor(role, { hasHome }), [role, hasHome]);

  const pageTitle = `${title} · Migrent Hub`;
  const head = (
    <Head>
      <title>{pageTitle}</title>
      <meta name="robots" content="noindex, nofollow" />
    </Head>
  );

  if (status === "error") {
    return (
      <div className="hub">
        {head}
        <div className="mx-auto max-w-[520px] px-4 pt-24">
          <ErrorState message={meError || "Migrent Hub could not load your account."} onRetry={() => void refreshMe()} />
        </div>
      </div>
    );
  }

  if (status !== "ready") {
    return (
      <div className="hub">
        {head}
        <ShellSkeleton />
      </div>
    );
  }

  const railWidth = compact ? 76 : 248;

  return (
    <div className="hub">
      {head}
      <a href="#hub-main" className="sr-only focus:not-sr-only focus:fixed focus:left-4 focus:top-4 focus:z-[100] focus:rounded-[10px] focus:bg-[var(--color-surface)] focus:px-4 focus:py-2 focus:font-semibold focus:shadow-[var(--shadow-pop)]">
        Skip to content
      </a>
      <ViewAsBanner />

      {/* Desktop floating rail */}
      <nav aria-label="Migrent Hub" className="hub-rail hidden lg:flex" style={{ width: railWidth }}>
        <div className={cn("flex items-center px-3 pb-3 pt-4", compact ? "justify-center" : "justify-between")}>
          <HubLink to="/" aria-label="Migrent Hub home" className="rounded-[12px] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-primary)]">
            <HubMark compact={compact} />
          </HubLink>
        </div>
        {!compact && (
          <button
            type="button"
            onClick={() => setPaletteOpen(true)}
            className="mx-3 mb-2 flex h-10 items-center gap-2.5 rounded-[12px] border border-[var(--color-line)] bg-[var(--color-surface)] px-3 text-[13.5px] text-[color:var(--color-ink-3)] transition-colors hover:border-[var(--color-line-2)] hover:text-[color:var(--color-ink-2)]"
          >
            <Search className="h-4 w-4" strokeWidth={1.75} aria-hidden />
            <span className="flex-1 text-left">Jump to</span>
            <kbd className="inline-flex items-center gap-0.5 text-[11px] font-semibold">
              <Command className="h-3 w-3" strokeWidth={2} aria-hidden />K
            </kbd>
          </button>
        )}
        <div className="flex flex-1 flex-col gap-0.5 overflow-y-auto px-3 py-1">
          {primary.map((item) => (
            <RailItem key={item.to} item={item} compact={compact} active={isActive(item, hubPath)} count={item.count ? c?.[item.count] : undefined} />
          ))}
        </div>
        <div className="flex flex-col gap-0.5 border-t border-[var(--color-line)] px-3 py-3">
          {footerNav.map((item) => (
            <RailItem key={item.to} item={item} compact={compact} active={isActive(item, hubPath)} count={item.count ? c?.[item.count] : undefined} />
          ))}
          <a href={siteUrl("/")} className={cn("hub-nav-item", compact && "justify-center px-0")} aria-label={compact ? "Back to Migrent" : undefined}>
            <span className="hub-nav-icon flex h-5 w-5 items-center justify-center">
              <ArrowLeft className="h-[19px] w-[19px]" strokeWidth={1.75} aria-hidden />
            </span>
            {!compact && <span className="flex-1">Back to Migrent</span>}
            {compact && <span className="hub-tip" role="tooltip">Back to Migrent</span>}
          </a>
          <div className={cn("mt-2 flex items-center gap-2", compact ? "flex-col" : "justify-between px-1")}>
            {/* At the foot of the rail, so it opens upwards and stays on screen. */}
            <AccountMenu align="start" side="top" />
            {!compact && <ThemeSegmented compact />}
            {compact && <ThemeIconButton />}
          </div>
          <button
            type="button"
            onClick={toggleRail}
            aria-label={compact ? "Expand navigation" : "Collapse navigation"}
            aria-expanded={!compact}
            className="mt-2 flex h-9 items-center justify-center rounded-[10px] text-[color:var(--color-ink-3)] hover:bg-[var(--color-surface-hover)] hover:text-[color:var(--color-ink)]"
          >
            {compact ? <ChevronsRight className="h-4 w-4" strokeWidth={1.75} /> : <ChevronsLeft className="h-4 w-4" strokeWidth={1.75} />}
          </button>
        </div>
      </nav>

      {/* Phone and tablet top bar */}
      <header className={cn("sticky top-0 z-30 flex h-14 items-center justify-between gap-3 border-b border-[var(--color-glass-line)] bg-[var(--color-glass)] px-4 backdrop-blur-xl lg:hidden", immersive && "!hidden")}>
        <HubLink to="/" aria-label="Migrent Hub home">
          <HubMark />
        </HubLink>
        <div className="flex items-center gap-1">
          <button type="button" onClick={() => setPaletteOpen(true)} aria-label="Search and jump" className="hub-press inline-flex h-10 w-10 items-center justify-center rounded-full text-[color:var(--color-ink-2)] hover:bg-[var(--color-surface-hover)]">
            <Search className="h-[18px] w-[18px]" strokeWidth={1.75} aria-hidden />
          </button>
          <ThemeIconButton />
          <AccountMenu />
        </div>
      </header>

      <main
        id="hub-main"
        tabIndex={-1}
        className={cn("hub-main outline-none", !immersive && "hub-bottom-space", fitDesktop && "lg:pb-0", fullBleed ? "" : "px-4 pt-6 sm:px-6 lg:pr-8 lg:pt-10")}
        style={{ ["--rail" as string]: `${railWidth + 32}px` }}
      >
        <div className="lg:pl-[var(--rail)]">
          <motion.div
            key={router.pathname}
            initial={reduce ? false : { opacity: 0, y: 6 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.22, ease: [0.22, 1, 0.36, 1] }}
            className={cn(fullBleed ? "" : "mx-auto w-full max-w-[1180px]")}
          >
            {children}
          </motion.div>
        </div>
      </main>

      {fab && !immersive && <div className="hub-fab lg:hidden">{fab}</div>}

      {/* Phone tab bar */}
      <nav aria-label="Migrent Hub" className={cn("hub-tabbar lg:hidden", immersive && "!hidden")}>
        {tabs.map((item) => {
          const active = isActive(item, hubPath);
          const Icon = item.icon;
          const n = item.count ? c?.[item.count] : undefined;
          return (
            <HubLink key={item.to} to={item.to} className="hub-tab" aria-current={active ? "page" : undefined} aria-label={n ? `${item.label}, ${n} new` : item.label}>
              {active && (
                <motion.span layoutId="hub-tab-active" aria-hidden className="absolute inset-0 rounded-[16px] bg-[var(--color-surface)] shadow-[0_0_0_1px_var(--color-line)]" transition={{ type: "spring", stiffness: 520, damping: 42 }} />
              )}
              <span className="hub-nav-icon relative z-[1]">
                <Icon className="h-[21px] w-[21px]" strokeWidth={1.75} aria-hidden />
                <CountBadge n={n} className="-right-3 -top-1.5" />
              </span>
              <span className="relative z-[1]">{item.label}</span>
            </HubLink>
          );
        })}
      </nav>

      <CommandPalette open={paletteOpen} onOpenChange={setPaletteOpen} />
    </div>
  );
}

/** Used by pages that need a quick way back to the Hub from an error. */
export function HubHomeButton() {
  return (
    <Button variant="secondary" size="sm" onClick={() => (window.location.href = hubUrl("/"))}>
      Go to Hub home
    </Button>
  );
}
