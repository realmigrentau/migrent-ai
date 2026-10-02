import { useId, useState } from "react";
import { Star } from "lucide-react";
import { hubApi, HubError } from "../../../lib/hub/api";
import { invalidate } from "../../../lib/hub/query";
import { cn } from "../../../lib/cn";
import { useToast } from "../../ui/Toast";
import { Button } from "../ui/Button";
import { Field, Textarea } from "../ui/Field";
import { Dialog } from "../ui/Overlay";
import type { PendingReview } from "./PendingReviews";

const WORDS = ["", "Poor", "Not great", "OK", "Good", "Excellent"];

/** Five stars as a radio group: arrow keys move, the label says the word. */
function Stars({ label, value, onChange, optional }: { label: string; value: number; onChange: (v: number) => void; optional?: boolean }) {
  const id = useId();
  return (
    <div role="radiogroup" aria-labelledby={id} className="flex flex-col gap-1.5">
      <p id={id} className="text-[13.5px] font-semibold text-[color:var(--color-ink)]">
        {label}
        {optional && <span className="ml-1.5 font-medium text-[color:var(--color-ink-3)]">Optional</span>}
      </p>
      <div className="flex items-center gap-1">
        {[1, 2, 3, 4, 5].map((n) => (
          <button
            key={n}
            type="button"
            role="radio"
            aria-checked={value === n}
            aria-label={`${n} out of 5, ${WORDS[n].toLowerCase()}`}
            tabIndex={value === n || (value === 0 && n === 1) ? 0 : -1}
            onClick={() => onChange(n)}
            onKeyDown={(e) => {
              if (e.key === "ArrowRight" || e.key === "ArrowUp") {
                e.preventDefault();
                onChange(Math.min(5, (value || 0) + 1));
              }
              if (e.key === "ArrowLeft" || e.key === "ArrowDown") {
                e.preventDefault();
                onChange(Math.max(1, (value || 2) - 1));
              }
            }}
            className="flex h-11 w-11 items-center justify-center rounded-full hover:bg-[var(--color-surface-muted)]"
          >
            <Star className={cn("h-7 w-7", n <= value ? "fill-[var(--color-warn-500)] text-[color:var(--color-warn-500)]" : "text-[color:var(--color-ink-4)]")} strokeWidth={1.75} aria-hidden />
          </button>
        ))}
        {value > 0 && <span className="ml-2 text-[13.5px] font-medium text-[color:var(--color-ink-2)]">{WORDS[value]}</span>}
      </div>
    </div>
  );
}

/**
 * Write a review of a tenancy or a stay (backend/routes_hub_reviews.py).
 * A renter reviews the home and host, publicly; a host reviews the renter,
 * for other hosts only. Neither sees the other's until both have written
 * one, or 14 days pass.
 */
export default function ReviewDialog({ item, open, onClose, onDone }: { item: PendingReview | null; open: boolean; onClose: () => void; onDone?: () => void }) {
  const toast = useToast();
  const [rating, setRating] = useState(0);
  const [text, setText] = useState("");
  const [welcome, setWelcome] = useState(0);
  const [clean, setClean] = useState(0);
  const [paid, setPaid] = useState(0);
  const [sending, setSending] = useState(false);
  const [error, setError] = useState<string | null>(null);
  if (!item) return null;
  const asRenter = item.direction === "seeker_to_owner";
  const name = item.other.name.split(" ")[0];
  const home = item.listing?.title || "the home";

  async function send() {
    if (!item) return;
    if (!rating) return setError("Choose a star rating.");
    setSending(true);
    setError(null);
    try {
      await hubApi.post("/hub/reviews", {
        kind: item.kind,
        id: item.id,
        rating,
        text: text.trim() || undefined,
        ...(asRenter ? { migrant_friendliness: welcome || undefined } : { cleanliness_rating: clean || undefined, payment_rating: paid || undefined }),
      });
      invalidate("/hub/reviews/pending");
      toast.success("Thanks for your review", { description: `It appears once ${name} has written theirs, or in 14 days.` });
      setRating(0);
      setText("");
      setWelcome(0);
      setClean(0);
      setPaid(0);
      onDone?.();
      onClose();
    } catch (e) {
      setError(e instanceof HubError ? e.message : "Your review didn't send. Please try again.");
    } finally {
      setSending(false);
    }
  }

  return (
    <Dialog
      open={open}
      onClose={onClose}
      title={asRenter ? `How was ${home}?` : `How was ${name} as a renter?`}
      description={
        asRenter
          ? "Your review helps the next person who is new to Australia. It shows your first name only."
          : `Only hosts that ${name} applies to later will see this. It is never public.`
      }
      footer={
        <>
          <Button variant="ghost" onClick={onClose}>
            Not now
          </Button>
          <Button loading={sending} onClick={() => void send()}>
            Send review
          </Button>
        </>
      }
    >
      <div className="flex flex-col gap-5">
        <Stars label={asRenter ? "Overall" : `Overall, as a renter`} value={rating} onChange={setRating} />
        {asRenter ? (
          <Stars label={`How welcoming was ${name} to someone new to Australia?`} value={welcome} onChange={setWelcome} optional />
        ) : (
          <>
            <Stars label="Paid rent on time" value={paid} onChange={setPaid} optional />
            <Stars label="Looked after the home" value={clean} onChange={setClean} optional />
          </>
        )}
        <Field label={asRenter ? "What should the next renter know?" : "Anything other hosts should know?"} optional hint="Stick to what happened. No phone numbers, addresses or other private details.">
          {({ id, describedBy }) => <Textarea id={id} value={text} maxLength={2000} onChange={(e) => setText(e.target.value)} aria-describedby={describedBy} />}
        </Field>
        {error && (
          <p role="alert" className="text-[13.5px] font-medium text-[color:var(--color-danger-500)]">
            {error}
          </p>
        )}
      </div>
    </Dialog>
  );
}
