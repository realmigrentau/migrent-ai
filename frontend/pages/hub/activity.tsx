import { useMemo, useState } from "react";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { Bell, Building2, CalendarClock, CheckCheck, FileText, Flag, KeyRound, MessageCircle, MoreHorizontal, Search, ShieldCheck, SlidersHorizontal, Trash2, Wrench } from "lucide-react";
import HubShell from "../../components/hub/HubShell";
import { useHubNavigate } from "../../components/hub/HubLink";
import { Button, ButtonLink, IconButton } from "../../components/hub/ui/Button";
import { EmptyState, ErrorState, RowSkeleton } from "../../components/hub/ui/Feedback";
import { Segmented } from "../../components/hub/ui/Field";
import { PageHeader } from "../../components/hub/ui/Layout";
import { Menu } from "../../components/hub/ui/Overlay";
import { useToast } from "../../components/ui/Toast";
import { hubApi, HubError } from "../../lib/hub/api";
import { relative } from "../../lib/hub/format";
import { invalidate, setQueryData, useHubQuery } from "../../lib/hub/query";
import { resolveStoredLink } from "../../lib/hub/routes";
import type { NotificationItem } from "../../lib/hub/types";
import { cn } from "../../lib/cn";

const PAGE = 30;

function iconFor(n: NotificationItem) {
  const t = `${n.entity_type ?? ""} ${n.type}`;
  const cls = "h-[18px] w-[18px]";
  if (/message/.test(t)) return <MessageCircle className={cls} strokeWidth={1.75} />;
  if (/inspection/.test(t)) return <CalendarClock className={cls} strokeWidth={1.75} />;
  if (/application/.test(t)) return <FileText className={cls} strokeWidth={1.75} />;
  if (/maintenance/.test(t)) return <Wrench className={cls} strokeWidth={1.75} />;
  if (/tenancy|rent/.test(t)) return <KeyRound className={cls} strokeWidth={1.75} />;
  if (/saved_search|match/.test(t)) return <Search className={cls} strokeWidth={1.75} />;
  if (/verification/.test(t)) return <ShieldCheck className={cls} strokeWidth={1.75} />;
  if (/report/.test(t)) return <Flag className={cls} strokeWidth={1.75} />;
  if (/listing|booking/.test(t)) return <Building2 className={cls} strokeWidth={1.75} />;
  return <Bell className={cls} strokeWidth={1.75} />;
}

function bucket(iso: string): string {
  const d = new Date(iso);
  const start = new Date();
  start.setHours(0, 0, 0, 0);
  const diff = (start.getTime() - new Date(d).setHours(0, 0, 0, 0)) / 86_400_000;
  if (diff <= 0) return "Today";
  if (diff === 1) return "Yesterday";
  if (diff < 7) return "This week";
  return "Earlier";
}

export default function ActivityPage() {
  const toast = useToast();
  const navigate = useHubNavigate();
  const reduce = useReducedMotion();
  const [filter, setFilter] = useState<"all" | "unread">("all");
  const key = `/notification-center?limit=${PAGE}${filter === "unread" ? "&unread_only=true" : ""}`;
  const { data, error, loading, refetch } = useHubQuery<{ notifications: NotificationItem[]; count: number }>(key);
  const [more, setMore] = useState<NotificationItem[]>([]);
  const [done, setDone] = useState(false);
  const [loadingMore, setLoadingMore] = useState(false);

  const items = useMemo(() => {
    const seen = new Set<string>();
    return [...(data?.notifications ?? []), ...more].filter((n) => (seen.has(n.id) ? false : (seen.add(n.id), true)));
  }, [data, more]);
  const unread = items.filter((n) => !n.is_read).length;
  const canLoadMore = !done && (data?.notifications.length ?? 0) >= PAGE;

  const patchLocal = (ids: string[], patch: Partial<NotificationItem> | null) => {
    const apply = (list: NotificationItem[]) => (patch ? list.map((n) => (ids.includes(n.id) ? { ...n, ...patch } : n)) : list.filter((n) => !ids.includes(n.id)));
    setQueryData<{ notifications: NotificationItem[]; count: number }>(key, (prev) => (prev ? { ...prev, notifications: apply(prev.notifications) } : prev!));
    setMore(apply);
    invalidate("/hub/counts");
  };

  async function markRead(ids: string[]) {
    patchLocal(ids, { is_read: true });
    try {
      await hubApi.post("/notification-center/mark-read", { notification_ids: ids });
    } catch {
      /* the badge corrects itself on the next refresh */
    }
  }

  async function markAll() {
    const ids = items.filter((n) => !n.is_read).map((n) => n.id);
    patchLocal(ids, { is_read: true });
    try {
      await hubApi.post("/notification-center/mark-all-read", {});
      toast.success("All caught up");
    } catch (e) {
      toast.error(e instanceof HubError ? e.message : "That didn't save.");
      void refetch();
    }
  }

  async function remove(id: string) {
    patchLocal([id], null);
    try {
      await hubApi.del(`/notification-center/${id}`);
    } catch (e) {
      toast.error(e instanceof HubError ? e.message : "That didn't go through.");
      void refetch();
    }
  }

  async function loadMore() {
    setLoadingMore(true);
    try {
      const res = await hubApi.get<{ notifications: NotificationItem[] }>(`${key}&offset=${items.length}`);
      setMore((xs) => [...xs, ...res.notifications]);
      if (res.notifications.length < PAGE) setDone(true);
    } catch (e) {
      toast.error(e instanceof HubError ? e.message : "More activity didn't load.");
    } finally {
      setLoadingMore(false);
    }
  }

  function open(n: NotificationItem) {
    if (!n.is_read) void markRead([n.id]);
    const target = resolveStoredLink(n.cta_url);
    if ("hub" in target) void navigate(target.hub);
    else window.location.href = target.href;
  }

  const groups: { label: string; items: NotificationItem[] }[] = [];
  for (const n of items) {
    const b = bucket(n.created_at);
    const g = groups.find((x) => x.label === b);
    if (g) g.items.push(n);
    else groups.push({ label: b, items: [n] });
  }

  return (
    <HubShell title="Activity">
      <PageHeader
        title="Activity"
        description="Updates on your applications, inspections, messages and homes."
        actions={
          <>
            <ButtonLink to="/settings#notifications" variant="ghost" size="sm" icon={<SlidersHorizontal className="h-4 w-4" strokeWidth={1.75} />}>
              Email preferences
            </ButtonLink>
            {unread > 0 && (
              <Button variant="secondary" size="sm" icon={<CheckCheck className="h-4 w-4" strokeWidth={1.75} />} onClick={() => void markAll()}>
                Mark all as read
              </Button>
            )}
          </>
        }
      />
      <Segmented
        label="Show"
        value={filter}
        onChange={(v) => {
          setFilter(v);
          setMore([]);
          setDone(false);
        }}
        options={[
          { value: "all", label: "All" },
          { value: "unread", label: "Unread" },
        ]}
        className="mb-6 w-fit"
      />

      <div className="max-w-[760px]">
        {error ? (
          <ErrorState message={error.message} offline={error.offline} onRetry={() => void refetch()} />
        ) : loading || !data ? (
          <RowSkeleton rows={6} />
        ) : items.length === 0 ? (
          <EmptyState
            icon={<Bell className="h-6 w-6" strokeWidth={1.75} />}
            title={filter === "unread" ? "You're all caught up" : "Nothing yet"}
            body={filter === "unread" ? "New updates will appear here." : "When an owner replies, an application moves or an inspection is booked, you'll see it here."}
          />
        ) : (
          <div className="flex flex-col gap-8">
            {groups.map((g) => (
              <section key={g.label} aria-labelledby={`act-${g.label}`}>
                <h2 id={`act-${g.label}`} className="mb-2 px-1 text-[12.5px] font-semibold uppercase tracking-[0.08em] text-[color:var(--color-ink-3)]">
                  {g.label}
                </h2>
                <ul className="flex flex-col overflow-hidden rounded-[20px] border border-[var(--color-line)] bg-[var(--color-surface)]">
                  <AnimatePresence initial={false}>
                    {g.items.map((n) => (
                      <motion.li
                        key={n.id}
                        layout={!reduce}
                        exit={reduce ? undefined : { opacity: 0, height: 0 }}
                        className="group relative flex items-start gap-3 border-t border-[var(--color-line)] first:border-0"
                      >
                        <button type="button" onClick={() => open(n)} className="flex min-w-0 flex-1 items-start gap-3.5 px-4 py-4 text-left transition-colors hover:bg-[var(--color-surface-hover)] focus-visible:bg-[var(--color-surface-hover)] focus-visible:outline-none sm:px-5">
                          <span
                            aria-hidden
                            className={cn(
                              "mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-full",
                              n.is_read ? "bg-[var(--color-surface-muted)] text-[color:var(--color-ink-3)]" : "bg-[var(--color-primary-soft)] text-[color:var(--color-primary)]",
                            )}
                          >
                            {iconFor(n)}
                          </span>
                          <span className="flex min-w-0 flex-1 flex-col gap-0.5 pr-8">
                            <span className={cn("text-[14.5px] leading-snug text-[color:var(--color-ink)]", n.is_read ? "font-medium" : "font-semibold")}>
                              {!n.is_read && <span className="sr-only">Unread: </span>}
                              {n.title}
                            </span>
                            {n.body && <span className="line-clamp-2 text-[13.5px] leading-snug text-[color:var(--color-ink-2)]">{n.body}</span>}
                            <span className="mt-0.5 text-[12.5px] text-[color:var(--color-ink-4)]">{relative(n.created_at)}</span>
                          </span>
                          {!n.is_read && <span aria-hidden className="mt-2 h-2.5 w-2.5 shrink-0 rounded-full bg-[var(--color-primary)]" />}
                        </button>
                        <div className="absolute right-2 top-3">
                          <Menu
                            label="Notification options"
                            trigger={(p) => (
                              <IconButton {...p} label="Notification options" size="sm" className="opacity-100 sm:opacity-0 sm:group-hover:opacity-100 sm:focus-visible:opacity-100 sm:aria-expanded:opacity-100">
                                <MoreHorizontal className="h-4 w-4" strokeWidth={1.75} />
                              </IconButton>
                            )}
                            items={[
                              ...(!n.is_read ? [{ label: "Mark as read", icon: <CheckCheck className="h-4 w-4" strokeWidth={1.75} />, onSelect: () => void markRead([n.id]) }] : []),
                              { label: "Remove", icon: <Trash2 className="h-4 w-4" strokeWidth={1.75} />, onSelect: () => void remove(n.id) },
                            ]}
                          />
                        </div>
                      </motion.li>
                    ))}
                  </AnimatePresence>
                </ul>
              </section>
            ))}
            {canLoadMore && (
              <div className="flex justify-center">
                <Button variant="secondary" loading={loadingMore} onClick={() => void loadMore()}>
                  Show older activity
                </Button>
              </div>
            )}
          </div>
        )}
      </div>
    </HubShell>
  );
}
