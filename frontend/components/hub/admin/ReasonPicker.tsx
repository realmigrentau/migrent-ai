import { useId } from "react";
import { Select } from "../ui/Field";
import { READY_REASONS } from "../../../lib/hub/admin";

/**
 * "Common reasons" for an admin decision: picking one fills the reason box,
 * which can still be edited before sending (MIGRENT_MASTER_AUDIT MIG-024).
 */
export default function ReasonPicker({ kind, onPick }: { kind: keyof typeof READY_REASONS | string; onPick: (text: string) => void }) {
  const id = useId();
  const reasons = READY_REASONS[kind] ?? [];
  if (!reasons.length) return null;
  return (
    <div className="flex flex-col gap-1.5">
      <label htmlFor={id} className="text-[13.5px] font-semibold text-[color:var(--color-ink)]">
        Common reasons
      </label>
      <Select
        id={id}
        value=""
        onChange={(e) => {
          if (e.target.value) onPick(e.target.value);
        }}
      >
        <option value="">Choose one to start from (optional)</option>
        {reasons.map((r) => (
          <option key={r} value={r}>
            {r}
          </option>
        ))}
      </Select>
    </div>
  );
}
