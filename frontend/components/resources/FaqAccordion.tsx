import { useEffect, useState } from "react";

export interface FaqEntry {
  /** Stable across releases: it is derived from the category and the
   *  question's position, never from a render counter, so a link someone
   *  shared last month still lands on the same answer. */
  id: string;
  question: string;
  answer: string;
}

/**
 * One disclosure.
 *
 * The button lives inside the heading, which is what lets a screen reader
 * user walk the questions with the heading shortcut and still operate
 * them. The panel stays in the document when closed - so the answers are
 * in the HTML a crawler receives - but is marked `inert`, which takes it
 * out of the accessibility tree and out of the tab order exactly the way
 * `hidden` would, without giving up the open animation.
 *
 * The animation itself is a grid row going 0fr -> 1fr. Nothing around the
 * item is laid out again, and with reduced motion it simply appears.
 */
function FaqItem({
  entry,
  open,
  onToggle,
}: {
  entry: FaqEntry;
  open: boolean;
  onToggle: () => void;
}) {
  const panelId = `${entry.id}-panel`;
  const buttonId = `${entry.id}-button`;

  return (
    <div className="res-faq" id={entry.id}>
      <h3>
        <button
          type="button"
          id={buttonId}
          className="res-faq__q"
          aria-expanded={open}
          aria-controls={panelId}
          onClick={onToggle}
        >
          <span>{entry.question}</span>
          <span className="res-faq__sign" aria-hidden="true" />
        </button>
      </h3>
      <div className="res-faq__panel" data-open={open ? "true" : "false"}>
        <div>
          <div
            id={panelId}
            role="region"
            aria-labelledby={buttonId}
            inert={!open}
            className="res-faq__a"
          >
            {entry.answer}
          </div>
        </div>
      </div>
    </div>
  );
}

/**
 * A group of questions.
 *
 * Everything starts closed. Forty answers expanded is a wall, and with one
 * pre-opened the first question reads as more important than the rest
 * without being so. The one exception is a linked answer: arrive with
 * #faq-... in the URL and that item opens and scrolls itself into view.
 *
 * Opening an item rewrites the hash with replaceState, so the address bar
 * always holds a link to whatever is currently open. It is replaceState
 * rather than pushState on purpose - reading three answers should not put
 * three entries in the back button.
 */
export default function FaqAccordion({ entries }: { entries: FaqEntry[] }) {
  const [openId, setOpenId] = useState<string | null>(null);

  useEffect(() => {
    const fromHash = () => {
      const hash = window.location.hash.slice(1);
      if (!hash) return;
      if (entries.some((e) => e.id === hash)) {
        setOpenId(hash);
        // Let the panel expand before we scroll, so the heading lands
        // where it will still be once the answer is open.
        requestAnimationFrame(() => {
          document.getElementById(hash)?.scrollIntoView({ block: "start" });
        });
      }
    };
    fromHash();
    window.addEventListener("hashchange", fromHash);
    return () => window.removeEventListener("hashchange", fromHash);
  }, [entries]);

  const toggle = (id: string) => {
    const next = openId === id ? null : id;
    setOpenId(next);
    if (typeof window !== "undefined") {
      const url = next ? `#${next}` : window.location.pathname + window.location.search;
      window.history.replaceState(null, "", url);
    }
  };

  return (
    <div>
      {entries.map((entry) => (
        <FaqItem
          key={entry.id}
          entry={entry}
          open={openId === entry.id}
          onToggle={() => toggle(entry.id)}
        />
      ))}
    </div>
  );
}
