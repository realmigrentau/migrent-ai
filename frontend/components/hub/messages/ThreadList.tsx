import { useEffect, useState } from "react";
import { Inbox, Search } from "lucide-react";
import { useHubQuery } from "../../../lib/hub/query";
import type { Thread } from "../../../lib/hub/types";
import { ThreadRow } from "../cards";
import { EmptyState, ErrorState, RowSkeleton } from "../ui/Feedback";
import { Segmented } from "../ui/Field";

/** The conversation list, with its own search and Unread/Archived filters. */
export default function ThreadList({ activeKey }: { activeKey?: string }) {
  const [filter, setFilter] = useState<"all" | "unread" | "archived">("all");
  const [q, setQ] = useState("");
  const [debounced, setDebounced] = useState("");
  useEffect(() => {
    const t = window.setTimeout(() => setDebounced(q.trim()), 250);
    return () => window.clearTimeout(t);
  }, [q]);
  const key = `/hub/inbox?filter=${filter}${debounced ? `&q=${encodeURIComponent(debounced)}` : ""}`;
  const { data, error, loading, refetch } = useHubQuery<{ threads: Thread[]; unread_total: number }>(key);

  // New messages arrive while the list is open.
  useEffect(() => {
    const id = window.setInterval(() => {
      if (document.visibilityState === "visible") void refetch().catch(() => {});
    }, 15000);
    return () => window.clearInterval(id);
  }, [refetch]);

  return (
    <div className="flex h-full min-h-0 flex-col">
      <div className="flex flex-col gap-3 px-3 pb-3 pt-1">
        <div className="relative">
          <label htmlFor="inbox-q" className="sr-only">
            Search conversations
          </label>
          <Search className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-[color:var(--color-ink-3)]" strokeWidth={1.9} aria-hidden />
          <input
            id="inbox-q"
            type="search"
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="Search conversations"
            className="h-10 w-full rounded-full border border-[var(--color-line-2)] bg-[var(--color-surface)] pl-10 pr-4 text-[14.5px] text-[color:var(--color-ink)] placeholder:text-[color:var(--color-ink-4)] focus:border-[var(--color-primary)] focus:outline-none"
          />
        </div>
        <Segmented
          size="sm"
          label="Show"
          value={filter}
          onChange={setFilter}
          options={[
            { value: "all", label: "All" },
            { value: "unread", label: "Unread" },
            { value: "archived", label: "Archived" },
          ]}
          className="w-fit"
        />
      </div>
      <div className="min-h-0 flex-1 overflow-y-auto px-2 pb-3">
        {error ? (
          <ErrorState message={error.message} offline={error.offline} onRetry={() => void refetch()} />
        ) : loading || !data ? (
          <div className="p-2">
            <RowSkeleton rows={5} />
          </div>
        ) : data.threads.length === 0 ? (
          <EmptyState
            compact
            icon={<Inbox className="h-6 w-6" strokeWidth={1.75} />}
            title={debounced ? "No matches" : filter === "archived" ? "Nothing archived" : filter === "unread" ? "All caught up" : "No messages yet"}
            body={debounced ? "Try a name, a suburb or a word from the message." : filter === "all" ? "Message an owner from any home's page. Each conversation stays with the home it's about." : undefined}
          />
        ) : (
          <ul className="flex flex-col gap-0.5">
            {data.threads.map((t) => (
              <li key={t.key}>
                <ThreadRow thread={t} active={t.key === activeKey} />
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}
