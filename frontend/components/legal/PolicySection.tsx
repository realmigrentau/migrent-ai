import { ReactNode } from "react";

interface PolicySectionProps {
  title: string;
  children: ReactNode;
  accentColor?: string;
}

export default function PolicySection({
  title,
  children,
  accentColor,
}: PolicySectionProps) {
  return (
    <section
      className={`card p-6 rounded-2xl space-y-3 ${accentColor ? `border-l-4 ${accentColor}` : ""}`}
    >
      <h2 className="text-lg font-bold text-[var(--color-ink)]">{title}</h2>
      <div className="text-sm text-[var(--color-ink-2)] leading-relaxed space-y-3">
        {children}
      </div>
    </section>
  );
}
