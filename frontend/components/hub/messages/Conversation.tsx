import { useCallback, useEffect, useLayoutEffect, useRef, useState } from "react";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { Archive, ArrowLeft, BellOff, Bell, CalendarDays, FileText, Flag, Home, Loader2, MoreHorizontal, Paperclip, Pencil, RotateCw, Send, ShieldAlert, Sparkles, X } from "lucide-react";
import { cn } from "../../../lib/cn";
import { hubApi, hubUploadWithProgress, HubError } from "../../../lib/hub/api";
import { weekly, whenLabel } from "../../../lib/hub/format";
import { invalidate, setQueryData, useHubQuery } from "../../../lib/hub/query";
import { applicationCopy } from "../../../lib/hub/status";
import type { Conversation as ConversationData, Message, Template } from "../../../lib/hub/types";
import { useToast } from "../../ui/Toast";
import HubLink, { useHubNavigate } from "../HubLink";
import ReportDialog from "../ReportDialog";
import { Button, IconButton } from "../ui/Button";
import { EmptyState, ErrorState, Skeleton, StatusBadge } from "../ui/Feedback";
import { Avatar, HomeImage } from "../ui/Media";
import { Menu } from "../ui/Overlay";

function dayLabel(iso: string) {
  const d = new Date(iso);
  const today = new Date();
  const y = new Date(Date.now() - 86_400_000);
  if (d.toDateString() === today.toDateString()) return "Today";
  if (d.toDateString() === y.toDateString()) return "Yesterday";
  return new Intl.DateTimeFormat("en-AU", { weekday: "long", day: "numeric", month: "long" }).format(d);
}

function clock(iso: string) {
  return new Intl.DateTimeFormat("en-AU", { hour: "numeric", minute: "2-digit" }).format(new Date(iso));
}

interface Pending {
  path: string;
  name: string;
  type: string;
}

export default function Conversation({ threadKey, onBack }: { threadKey: string; onBack?: () => void }) {
  const toast = useToast();
  const navigate = useHubNavigate();
  const reduce = useReducedMotion();
  const key = `/hub/inbox/${threadKey}`;
  const { data, error, loading, refetch } = useHubQuery<ConversationData>(key);
  const [text, setText] = useState("");
  const [local, setLocal] = useState<Message[]>([]);
  const [attachment, setAttachment] = useState<Pending | null>(null);
  const [uploading, setUploading] = useState<number | null>(null);
  const [reportOpen, setReportOpen] = useState(false);
  const [older, setOlder] = useState<Message[]>([]);
  const [olderDone, setOlderDone] = useState(false);
  const [loadingOlder, setLoadingOlder] = useState(false);
  const keepOffset = useRef<number | null>(null);
  const scroller = useRef<HTMLDivElement>(null);
  const input = useRef<HTMLTextAreaElement>(null);
  const file = useRef<HTMLInputElement>(null);
  const templates = useHubQuery<{ templates: Template[] }>(data?.my_side === "owner" ? "/hub/templates" : null);

  // Poll while the conversation is on screen.
  useEffect(() => {
    const id = window.setInterval(() => {
      if (document.visibilityState === "visible") void refetch().catch(() => {});
    }, 6000);
    return () => window.clearInterval(id);
  }, [refetch]);

  useEffect(() => {
    setLocal([]);
    setText("");
    setAttachment(null);
    setOlder([]);
    setOlderDone(false);
  }, [threadKey]);

  // Opening a conversation marks it read: refresh the counts once.
  useEffect(() => {
    if (data) {
      invalidate("/hub/counts");
      invalidate("/hub/inbox?");
    }
  }, [data?.key]); // eslint-disable-line react-hooks/exhaustive-deps

  const server = data?.messages ?? [];
  const serverIds = new Set(server.map((m) => m.id));
  const messages = [...older.filter((m) => !serverIds.has(m.id)), ...server, ...local.filter((m) => !serverIds.has(m.id))];
  const lastId = messages[messages.length - 1]?.id;
  const canLoadOlder = !olderDone && (older.length > 0 || !!data?.has_more);

  // Follow the newest message; keep the reading position when older ones load.
  useLayoutEffect(() => {
    const el = scroller.current;
    if (!el) return;
    if (keepOffset.current !== null) {
      el.scrollTop = el.scrollHeight - keepOffset.current;
      keepOffset.current = null;
      return;
    }
    el.scrollTop = el.scrollHeight;
  }, [lastId, older.length, threadKey]);

  async function loadOlder() {
    const oldest = messages[0];
    if (!oldest || loadingOlder) return;
    setLoadingOlder(true);
    try {
      const res = await hubApi.get<ConversationData>(`/hub/inbox/${threadKey}?before=${encodeURIComponent(oldest.created_at)}`);
      if (scroller.current) keepOffset.current = scroller.current.scrollHeight - scroller.current.scrollTop;
      setOlder((xs) => [...res.messages, ...xs]);
      if (!res.has_more) setOlderDone(true);
    } catch (e) {
      toast.error(e instanceof HubError ? e.message : "Earlier messages didn't load.");
    } finally {
      setLoadingOlder(false);
    }
  }

  const autosize = () => {
    const el = input.current;
    if (!el) return;
    el.style.height = "auto";
    el.style.height = `${Math.min(el.scrollHeight, 180)}px`;
  };

  const send = useCallback(
    async (retry?: Message) => {
      const body = retry ? retry.text : text.trim();
      const att = retry ? null : attachment;
      if (!body && !att) return;
      const tempId = retry?.id ?? `temp-${Date.now()}`;
      const optimistic: Message = { id: tempId, from_me: true, text: body || att?.name || "", attachment_url: null, attachment_name: att?.name ?? null, attachment_type: att?.type ?? null, read_at: null, created_at: new Date().toISOString(), pending: true };
      setLocal((xs) => [...xs.filter((m) => m.id !== tempId), optimistic]);
      if (!retry) {
        setText("");
        setAttachment(null);
        window.requestAnimationFrame(autosize);
      }
      try {
        const res = await hubApi.post<{ message: Message }>(`/hub/inbox/${threadKey}/messages`, { text: body, attachment_path: att?.path, attachment_name: att?.name, attachment_type: att?.type });
        setLocal((xs) => xs.filter((m) => m.id !== tempId));
        setQueryData<ConversationData>(key, (prev) => (prev ? { ...prev, messages: [...prev.messages, res.message] } : prev!));
        invalidate("/hub/inbox?");
        // Attachments come back with a signed link on the next read.
        if (att) void refetch().catch(() => {});
      } catch (e) {
        setLocal((xs) => xs.map((m) => (m.id === tempId ? { ...m, pending: false, failed: true } : m)));
        toast.error(e instanceof HubError ? e.message : "The message didn't send.");
      }
    },
    [text, attachment, threadKey, key, toast, refetch],
  );

  async function upload(f: File) {
    if (f.size > 10 * 1024 * 1024) return toast.error("Attachments can be up to 10MB.");
    if (!/^(application\/pdf|image\/(jpeg|png|webp|gif))$/.test(f.type)) return toast.error("Attach a photo or a PDF.");
    const form = new FormData();
    form.append("file", f, f.name);
    setUploading(0);
    try {
      const res = await hubUploadWithProgress<{ attachment_path: string; attachment_name: string; attachment_type: string }>("/messages/attachments", form, setUploading);
      setAttachment({ path: res.attachment_path, name: res.attachment_name, type: res.attachment_type });
    } catch (e) {
      toast.error(e instanceof HubError ? e.message : "The attachment didn't upload.");
    } finally {
      setUploading(null);
      if (file.current) file.current.value = "";
    }
  }

  async function setState(patch: { archived?: boolean; muted?: boolean }) {
    try {
      await hubApi.post(`/hub/inbox/${threadKey}/state`, patch);
      setQueryData<ConversationData>(key, (prev) => (prev ? { ...prev, ...patch } : prev!));
      invalidate("/hub/inbox?");
      invalidate("/hub/counts");
      toast.info(patch.archived !== undefined ? (patch.archived ? "Conversation archived" : "Moved back to your inbox") : patch.muted ? "Muted - you won't get notifications for this conversation" : "Notifications back on");
    } catch (e) {
      toast.error(e instanceof HubError ? e.message : "That didn't save.");
    }
  }

  if (error) {
    return error.status === 404 ? (
      <div className="p-6">
        <EmptyState compact title="Conversation not found" body="It may belong to a different account." />
      </div>
    ) : (
      <div className="p-6">
        <ErrorState message={error.message} offline={error.offline} onRetry={() => void refetch()} />
      </div>
    );
  }
  if (loading || !data) {
    return (
      <div className="flex h-full flex-col gap-4 p-5" aria-busy="true">
        <Skeleton className="h-12 w-2/3" />
        <Skeleton className="h-16 w-1/2 self-start rounded-[18px]" />
        <Skeleton className="h-12 w-1/2 self-end rounded-[18px]" />
      </div>
    );
  }

  const l = data.listing;
  const app = data.context.application;
  const insp = data.context.inspection;
  const firstName = data.other.name.split(" ")[0];
  let lastDay = "";

  return (
    <div className="flex h-full min-h-0 flex-col">
      {/* Header */}
      <header className="flex items-center gap-3 border-b border-[var(--color-line)] px-3 py-3 sm:px-5">
        {onBack && (
          <IconButton label="Back to conversations" size="sm" onClick={onBack} className="lg:hidden">
            <ArrowLeft className="h-5 w-5" strokeWidth={1.75} />
          </IconButton>
        )}
        <Avatar name={data.other.name} src={data.other.avatar_url} size={40} />
        <div className="flex min-w-0 flex-1 flex-col">
          <p className="truncate text-[15.5px] font-semibold text-[color:var(--color-ink)]">
            {data.other.name}
            <span className="ml-2 text-[12.5px] font-medium text-[color:var(--color-ink-3)]">{data.my_side === "owner" ? "Renter" : "Owner"}</span>
          </p>
          {l && <p className="truncate text-[13px] text-[color:var(--color-ink-3)]">{l.unit_label ? `${l.unit_label} · ` : ""}{l.title}</p>}
        </div>
        {data.muted && <BellOff className="h-4 w-4 text-[color:var(--color-ink-4)]" strokeWidth={1.75} aria-label="Muted" />}
        <Menu
          label="Conversation options"
          trigger={(p) => (
            <IconButton {...p} label="Conversation options" size="sm">
              <MoreHorizontal className="h-5 w-5" strokeWidth={1.75} />
            </IconButton>
          )}
          items={[
            ...(l ? [{ label: "View the home", icon: <Home className="h-4 w-4" strokeWidth={1.75} />, onSelect: () => void navigate(data.my_side === "owner" ? `/listings/${l.id}` : `/homes/${l.id}`) }] : []),
            { label: data.archived ? "Move to inbox" : "Archive", icon: <Archive className="h-4 w-4" strokeWidth={1.75} />, onSelect: () => void setState({ archived: !data.archived }) },
            { label: data.muted ? "Turn notifications on" : "Mute notifications", icon: data.muted ? <Bell className="h-4 w-4" strokeWidth={1.75} /> : <BellOff className="h-4 w-4" strokeWidth={1.75} />, onSelect: () => void setState({ muted: !data.muted }) },
            { label: `Report ${firstName}`, icon: <Flag className="h-4 w-4" strokeWidth={1.75} />, danger: true, onSelect: () => setReportOpen(true) },
          ]}
        />
      </header>

      {/* Context: the home, the application, the inspection */}
      {l && (
        <div className="flex flex-wrap items-center gap-3 border-b border-[var(--color-line)] bg-[var(--color-surface-cool)] px-3 py-3 sm:px-5">
          <HubLink to={data.my_side === "owner" ? `/listings/${l.id}` : `/homes/${l.id}`} className="flex min-w-0 flex-1 items-center gap-3 rounded-[12px] hover:opacity-90">
            <HomeImage src={l.image} alt="" className="h-11 w-14 shrink-0" rounded="rounded-[10px]" sizes="56px" />
            <div className="min-w-0">
              <p className="truncate text-[13.5px] font-semibold text-[color:var(--color-ink)]">{l.title}</p>
              <p className="truncate text-[12.5px] text-[color:var(--color-ink-3)]">
                {weekly(l.weekly_price)} · {l.display_address}
              </p>
            </div>
          </HubLink>
          <div className="hub-scroll-x -mx-3 flex w-[calc(100%+24px)] shrink-0 items-center gap-2 overflow-x-auto px-3 sm:mx-0 sm:w-auto sm:flex-wrap sm:overflow-visible sm:px-0 [&>*]:shrink-0">
            {app ? (
              <HubLink to={`/applications/${app.id}`} className="rounded-full">
                <StatusBadge tone={applicationCopy(app.status, data.my_side).tone}>Application: {applicationCopy(app.status, data.my_side).label}</StatusBadge>
              </HubLink>
            ) : data.my_side === "renter" && l.public_state === "published" ? (
              <Button size="sm" variant="secondary" onClick={() => void navigate(`/apply/${l.id}`)}>
                Apply
              </Button>
            ) : null}
            {insp ? (
              <HubLink to="/inspections" className="inline-flex h-7 items-center gap-1.5 rounded-full bg-[var(--color-primary-soft)] px-2.5 text-[12.5px] font-semibold text-[color:var(--color-ink)]">
                <CalendarDays className="h-3.5 w-3.5 text-[color:var(--color-primary)]" strokeWidth={2} aria-hidden />
                {whenLabel(insp.starts_at, l.timezone)}
              </HubLink>
            ) : data.my_side === "renter" && l.public_state === "published" ? (
              <HubLink to={`/homes/${l.id}#inspections`} className="text-[12.5px] font-semibold text-[color:var(--color-primary)] hover:underline">
                Book an inspection
              </HubLink>
            ) : data.my_side === "owner" ? (
              <HubLink to={`/inspections?listing=${l.id}`} className="text-[12.5px] font-semibold text-[color:var(--color-primary)] hover:underline">
                Invite to inspect
              </HubLink>
            ) : null}
          </div>
        </div>
      )}

      {/* Messages */}
      <div ref={scroller} className="min-h-0 flex-1 overflow-y-auto px-3 py-5 sm:px-6" aria-live="polite" aria-relevant="additions">
        {canLoadOlder && (
          <div className="mb-4 flex justify-center">
            <Button size="sm" variant="ghost" loading={loadingOlder} onClick={() => void loadOlder()}>
              Load earlier messages
            </Button>
          </div>
        )}
        {!canLoadOlder && (
          <p className="mx-auto mb-6 flex max-w-[460px] items-start gap-2 rounded-[14px] bg-[var(--color-surface-muted)] px-4 py-3 text-[12.5px] leading-snug text-[color:var(--color-ink-2)]">
            <ShieldAlert className="mt-0.5 h-4 w-4 shrink-0 text-[color:var(--color-ink-3)]" strokeWidth={1.75} aria-hidden />
            Keep the conversation here, so there's a record. Never pay rent or a deposit before you've inspected and signed, and never share bank or ID details in chat.
          </p>
        )}
        <ol className="flex flex-col gap-1.5">
          <AnimatePresence initial={false}>
            {messages.map((m, i) => {
              const d = dayLabel(m.created_at);
              const header = d !== lastDay ? d : null;
              lastDay = d;
              const next = messages[i + 1];
              const grouped = next && next.from_me === m.from_me && new Date(next.created_at).getTime() - new Date(m.created_at).getTime() < 5 * 60_000;
              const isLastMine = m.from_me && !messages.slice(i + 1).some((x) => x.from_me);
              return (
                <motion.li key={m.id} layout={!reduce} initial={reduce ? false : { opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.2 }} className="flex flex-col">
                  {header && <p className="my-4 text-center text-[12px] font-semibold text-[color:var(--color-ink-4)]">{header}</p>}
                  <div className={cn("flex max-w-[82%] flex-col gap-1 sm:max-w-[70%]", m.from_me ? "self-end items-end" : "self-start items-start")}>
                    {m.attachment_type?.startsWith("image/") && m.attachment_url ? (
                      <a href={m.attachment_url} target="_blank" rel="noopener noreferrer" className="block overflow-hidden rounded-[16px]">
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img src={m.attachment_url} alt={m.attachment_name || "Photo"} className="max-h-72 w-auto object-cover" loading="lazy" />
                      </a>
                    ) : m.attachment_name ? (
                      <a
                        href={m.attachment_url || undefined}
                        target="_blank"
                        rel="noopener noreferrer"
                        className={cn("inline-flex items-center gap-2 rounded-[14px] border px-3 py-2 text-[13.5px] font-medium", m.from_me ? "border-transparent bg-[color:color-mix(in_oklab,var(--color-primary)_85%,black)] text-[color:var(--color-primary-fg)]" : "border-[var(--color-line)] bg-[var(--color-surface)] text-[color:var(--color-ink)]")}
                      >
                        <FileText className="h-4 w-4" strokeWidth={1.75} aria-hidden />
                        {m.attachment_name}
                      </a>
                    ) : null}
                    {m.text && m.text !== m.attachment_name && (
                      <p
                        className={cn(
                          "whitespace-pre-wrap break-words px-3.5 py-2.5 text-[14.5px] leading-relaxed",
                          m.from_me ? "rounded-[18px] rounded-br-[6px] bg-[var(--color-primary)] text-[color:var(--color-primary-fg)]" : "rounded-[18px] rounded-bl-[6px] bg-[var(--color-surface-muted)] text-[color:var(--color-ink)]",
                          m.pending && "opacity-70",
                          m.failed && "ring-2 ring-[var(--color-danger-500)]",
                        )}
                      >
                        {m.text}
                      </p>
                    )}
                    {(!grouped || m.failed || isLastMine) && (
                      <p className="flex items-center gap-1.5 px-1 text-[11.5px] text-[color:var(--color-ink-4)]">
                        {m.pending ? (
                          <>
                            <Loader2 className="h-3 w-3 animate-spin" strokeWidth={2} aria-hidden /> Sending
                          </>
                        ) : m.failed ? (
                          <button type="button" onClick={() => void send(m)} className="inline-flex items-center gap-1 font-semibold text-[color:var(--color-danger-500)]">
                            <RotateCw className="h-3 w-3" strokeWidth={2} aria-hidden /> Not sent - retry
                          </button>
                        ) : (
                          <>
                            {clock(m.created_at)}
                            {isLastMine && m.read_at ? " · Seen" : ""}
                          </>
                        )}
                      </p>
                    )}
                  </div>
                </motion.li>
              );
            })}
          </AnimatePresence>
        </ol>
      </div>

      {/* Composer */}
      <form
        className="border-t border-[var(--color-line)] bg-[var(--color-surface)] px-3 pb-[max(12px,env(safe-area-inset-bottom))] pt-3 sm:px-5"
        onSubmit={(e) => {
          e.preventDefault();
          void send();
        }}
      >
        {(attachment || uploading !== null) && (
          <div className="mb-2 flex items-center gap-2">
            <span className="inline-flex items-center gap-2 rounded-full bg-[var(--color-surface-muted)] px-3 py-1.5 text-[13px] text-[color:var(--color-ink)]">
              <Paperclip className="h-3.5 w-3.5" strokeWidth={1.75} aria-hidden />
              {uploading !== null ? `Uploading ${Math.round(uploading * 100)}%` : attachment?.name}
              {attachment && (
                <button type="button" aria-label="Remove attachment" onClick={() => setAttachment(null)} className="text-[color:var(--color-ink-3)] hover:text-[color:var(--color-ink)]">
                  <X className="h-3.5 w-3.5" strokeWidth={2} />
                </button>
              )}
            </span>
          </div>
        )}
        <div className="flex items-end gap-2">
          <input ref={file} type="file" accept="image/jpeg,image/png,image/webp,image/gif,application/pdf" className="sr-only" id="conv-file" onChange={(e) => e.target.files?.[0] && void upload(e.target.files[0])} />
          <IconButton label="Attach a photo or PDF" size="sm" onClick={() => file.current?.click()} disabled={uploading !== null}>
            <Paperclip className="h-5 w-5" strokeWidth={1.75} />
          </IconButton>
          {data.my_side === "owner" && (templates.data?.templates.length ?? 0) > 0 && (
            <Menu
              label="Reply templates"
              align="start"
              trigger={(p) => (
                <IconButton {...p} label="Insert a reply template" size="sm">
                  <Sparkles className="h-5 w-5" strokeWidth={1.75} />
                </IconButton>
              )}
              items={[
                ...(templates.data?.templates ?? []).map((t) => ({
                  label: t.title,
                  onSelect: () => {
                    setText((cur) => (cur.trim() ? `${cur.trim()}\n\n${t.body}` : t.body));
                    window.requestAnimationFrame(() => {
                      autosize();
                      input.current?.focus();
                    });
                  },
                })),
                { label: "Manage templates", icon: <Pencil className="h-4 w-4" strokeWidth={1.75} />, onSelect: () => void navigate("/settings#templates") },
              ]}
            />
          )}
          <label htmlFor="conv-input" className="sr-only">
            Message {firstName}
          </label>
          <textarea
            ref={input}
            id="conv-input"
            rows={1}
            value={text}
            onChange={(e) => {
              setText(e.target.value.slice(0, 5000));
              autosize();
            }}
            onKeyDown={(e) => {
              if (e.key === "Enter" && !e.shiftKey && !e.nativeEvent.isComposing) {
                e.preventDefault();
                void send();
              }
            }}
            placeholder={`Message ${firstName}`}
            className="max-h-[180px] min-h-[44px] flex-1 resize-none rounded-[22px] border border-[var(--color-line-2)] bg-[var(--color-surface)] px-4 py-2.5 text-[15px] leading-snug text-[color:var(--color-ink)] placeholder:text-[color:var(--color-ink-4)] focus:border-[var(--color-primary)] focus:outline-none"
          />
          <Button type="submit" aria-label="Send" disabled={(!text.trim() && !attachment) || uploading !== null} className="h-11 w-11 rounded-full px-0">
            <Send className="h-[18px] w-[18px]" strokeWidth={1.9} aria-hidden />
          </Button>
        </div>
        <p className="mt-1.5 hidden text-[11.5px] text-[color:var(--color-ink-4)] sm:block">Enter to send · Shift+Enter for a new line{data.my_side === "owner" ? " · Templates are yours to edit before sending" : ""}</p>
      </form>

      <ReportDialog open={reportOpen} onClose={() => setReportOpen(false)} itemType="user" itemId={data.other_user_id} subject={firstName} />
    </div>
  );
}
