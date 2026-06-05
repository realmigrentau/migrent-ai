interface ContentTimestampProps {
  created?: string;
  updated: string;
  version?: string;
}

export default function ContentTimestamp({ created, updated, version }: ContentTimestampProps) {
  return (
    <div className="flex flex-wrap gap-3 text-xs text-slate-400 dark:text-slate-500">
      {created && <span>Created: {created}</span>}
      <span>Updated: {updated}</span>
      {version && <span>v{version}</span>}
    </div>
  );
}
