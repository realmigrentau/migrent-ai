import { useState } from "react";
import { Sparkles } from "lucide-react";
import { Button } from "../ui/Button";
import { InlineAlert } from "../ui/Feedback";
import { Field, Input, Segmented } from "../ui/Field";
import { Dialog } from "../ui/Overlay";
import { hubApi, HubError } from "../../../lib/hub/api";
import type { DraftData } from "../../../lib/hub/listingDraft";

type Tone = "warm" | "concise" | "detailed";

/**
 * Optional writing help for the title and description. It only suggests:
 * nothing changes until the owner chooses to use it, and they review it
 * before the listing goes anywhere. The street address is never sent.
 */
export default function AiAssist({ data, onUse }: { data: DraftData; onUse: (patch: Partial<DraftData>) => void }) {
  const [open, setOpen] = useState(false);
  const [tone, setTone] = useState<Tone>("warm");
  const [focus, setFocus] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [suggestion, setSuggestion] = useState<{ title: string; description: string } | null>(null);

  async function generate() {
    setBusy(true);
    setError(null);
    const { street_address: _street, nickname: _nick, images: _images, ...rest } = data;
    void _street;
    void _nick;
    void _images;
    try {
      const res = await hubApi.post<{ suggestion: { title: string; description: string } }>("/hub/ai/listing-copy", {
        facts: { ...rest, existing_description: data.description || undefined },
        tone,
        focus: focus.trim() || undefined,
      });
      setSuggestion(res.suggestion);
    } catch (e) {
      setError(e instanceof HubError ? e.message : "The writing assistant isn't available right now.");
    } finally {
      setBusy(false);
    }
  }

  return (
    <>
      <Button variant="soft" size="sm" icon={<Sparkles className="h-4 w-4" strokeWidth={1.75} />} onClick={() => setOpen(true)}>
        Help me write this
      </Button>
      <Dialog
        open={open}
        onClose={() => setOpen(false)}
        size="lg"
        title="Draft a title and description"
        description="Written from the details you've entered. Read it carefully: you're responsible for what the listing says, and nothing is used until you choose to."
        footer={
          suggestion ? (
            <>
              <Button variant="ghost" onClick={() => void generate()} loading={busy}>
                Try again
              </Button>
              <Button
                variant="secondary"
                onClick={() => {
                  onUse({ description: suggestion.description });
                  setOpen(false);
                }}
              >
                Use the description
              </Button>
              <Button
                onClick={() => {
                  onUse({ title: suggestion.title, description: suggestion.description });
                  setOpen(false);
                }}
              >
                Use both
              </Button>
            </>
          ) : (
            <>
              <Button variant="ghost" onClick={() => setOpen(false)}>
                Cancel
              </Button>
              <Button loading={busy} onClick={() => void generate()} icon={<Sparkles className="h-4 w-4" strokeWidth={1.75} />}>
                Write a draft
              </Button>
            </>
          )
        }
      >
        <div className="flex flex-col gap-5">
          <Segmented
            label="Style"
            value={tone}
            onChange={setTone}
            options={[
              { value: "warm", label: "Warm" },
              { value: "concise", label: "Short" },
              { value: "detailed", label: "Detailed" },
            ]}
            className="w-fit"
          />
          <Field label="Anything to mention?" optional hint="For example: great for a student, five minutes to the station.">
            {({ id, describedBy }) => <Input id={id} value={focus} maxLength={300} onChange={(e) => setFocus(e.target.value)} aria-describedby={describedBy} />}
          </Field>
          {error && <InlineAlert tone="danger">{error}</InlineAlert>}
          {suggestion && (
            <div className="flex flex-col gap-3 rounded-[18px] border border-[var(--color-line)] bg-[var(--color-surface-muted)] p-4 sm:p-5" aria-live="polite">
              <p className="text-[17px] font-semibold text-[color:var(--color-ink)]">{suggestion.title}</p>
              <p className="whitespace-pre-wrap text-[14.5px] leading-relaxed text-[color:var(--color-ink-2)]">{suggestion.description}</p>
              <p className="text-[12.5px] text-[color:var(--color-ink-3)]">Suggested by AI. Check every detail is true before you send the listing for review.</p>
            </div>
          )}
        </div>
      </Dialog>
    </>
  );
}
