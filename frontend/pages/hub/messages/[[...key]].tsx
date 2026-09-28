import { useRouter } from "next/router";
import { MessagesSquare } from "lucide-react";
import HubShell from "../../../components/hub/HubShell";
import { useHubNavigate } from "../../../components/hub/HubLink";
import Conversation from "../../../components/hub/messages/Conversation";
import ThreadList from "../../../components/hub/messages/ThreadList";
import { EmptyState } from "../../../components/hub/ui/Feedback";
import { cn } from "../../../lib/cn";

/**
 * The inbox. One page for the list and the open conversation, so the list
 * stays put on desktop while conversations change beside it. Phones show
 * one or the other, and an open conversation takes the whole screen.
 */
export default function MessagesPage() {
  const router = useRouter();
  const navigate = useHubNavigate();
  const raw = router.query.key;
  const activeKey = Array.isArray(raw) ? raw[0] : raw;

  return (
    <HubShell title={activeKey ? "Conversation" : "Messages"} fullBleed fitDesktop immersive={!!activeKey}>
      <div className={cn("lg:h-[100dvh] lg:py-4 lg:pr-4", activeKey && "h-[100dvh]")}>
        <div className="grid h-full lg:grid-cols-[minmax(300px,380px)_minmax(0,1fr)] lg:overflow-hidden lg:rounded-[24px] lg:border lg:border-[var(--color-line)] lg:bg-[var(--color-surface)] lg:shadow-[var(--shadow-card)]">
          <section aria-labelledby="inbox-title" className={cn("min-h-0 flex-col lg:flex lg:border-r lg:border-[var(--color-line)]", activeKey ? "hidden" : "flex")}>
            <div className="px-4 pb-3 pt-6 sm:px-6 lg:px-5 lg:pt-6">
              <h1 id="inbox-title" className="hub-title text-[26px] font-semibold leading-[1.15] tracking-[-0.022em] text-[color:var(--color-ink)] lg:text-[22px]">
                Messages
              </h1>
            </div>
            <div className="min-h-0 flex-1 sm:px-3 lg:px-0">
              <ThreadList activeKey={activeKey} />
            </div>
          </section>
          <section aria-label="Conversation" className={cn("min-h-0 bg-[var(--color-surface)] lg:block", activeKey ? "block" : "hidden")}>
            {activeKey ? (
              <Conversation key={activeKey} threadKey={activeKey} onBack={() => void navigate("/messages")} />
            ) : (
              <div className="flex h-full items-center justify-center p-8">
                <EmptyState
                  compact
                  icon={<MessagesSquare className="h-6 w-6" strokeWidth={1.75} />}
                  title="Pick a conversation"
                  body="Every conversation is tied to a home, with the application and any inspection shown alongside."
                />
              </div>
            )}
          </section>
        </div>
      </div>
    </HubShell>
  );
}
