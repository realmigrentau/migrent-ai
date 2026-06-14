import { Phone, AlertCircle } from "lucide-react";

interface EmergencyCalloutProps {
  title?: string;
  contacts: { label: string; number: string }[];
  note?: string;
}

export default function EmergencyCallout({
  title = "Need Urgent Help?",
  contacts,
  note,
}: EmergencyCalloutProps) {
  return (
    <div className="card p-5 rounded-2xl border-l-4 border-l-red-500 bg-[var(--color-danger-50)]/50 dark:bg-[var(--color-danger-50)]0/5 space-y-3">
      <div className="flex items-center gap-2">
        <AlertCircle className="w-5 h-5 text-[var(--color-danger-500)]" />
        <h3 className="text-sm font-bold text-[var(--color-ink)]">{title}</h3>
      </div>
      <div className="space-y-2">
        {contacts.map((contact) => (
          <div key={contact.number} className="flex items-center gap-2">
            <Phone className="w-4 h-4 text-[var(--color-danger-500)] flex-shrink-0" />
            <span className="text-sm text-[var(--color-ink-2)]">
              <span className="font-medium">{contact.label}:</span>{" "}
              <a
                href={`tel:${contact.number.replace(/\s/g, "")}`}
                className="text-[var(--color-danger-500)] dark:text-[var(--color-danger-500)] font-semibold hover:underline"
              >
                {contact.number}
              </a>
            </span>
          </div>
        ))}
      </div>
      {note && (
        <p className="text-xs text-[var(--color-ink-3)] pt-1">{note}</p>
      )}
    </div>
  );
}
