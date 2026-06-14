interface ContentTimestampProps {
  created?: string;
  updated: string;
  version?: string;
}

export default function ContentTimestamp({ created, updated, version }: ContentTimestampProps) {
  return (
    <div className="flex flex-wrap gap-3 text-xs text-[var(--color-ink-3)]">
      {created && <span>Created: {created}</span>}
      <span>Updated: {updated}</span>
      {version && <span>v{version}</span>}
    </div>
  );
}
