import { ExternalLink } from "lucide-react";

export interface OfficialResource {
  label: string;
  url: string;
  region?: string;
}

interface ResourceLinksProps {
  title?: string;
  resources: OfficialResource[];
}

export default function ResourceLinks({ title = "Official resources", resources }: ResourceLinksProps) {
  if (!resources || resources.length === 0) return null;

  const domainOf = (url: string) => {
    try {
      return new URL(url).hostname.replace(/^www\./, "");
    } catch {
      return url;
    }
  };

  return (
    <div className="rounded-2xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 p-5 my-6">
      <h4 className="text-sm font-bold text-slate-900 dark:text-white mb-3 uppercase tracking-wide">
        {title}
      </h4>
      <ul className="space-y-2">
        {resources.map((r, i) => (
          <li key={i}>
            <a
              href={r.url}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-start gap-2 text-sm text-slate-700 dark:text-slate-300 hover:text-blue-600 dark:hover:text-blue-400 transition-colors group"
            >
              <ExternalLink className="w-4 h-4 mt-0.5 shrink-0 text-slate-400 group-hover:text-blue-500 transition-colors" />
              <span className="flex-1">
                <span className="font-medium">{r.label}</span>
                {r.region && (
                  <span className="ml-2 text-[10px] font-semibold uppercase tracking-wider px-1.5 py-0.5 rounded bg-slate-200 dark:bg-slate-700 text-slate-600 dark:text-slate-300">
                    {r.region}
                  </span>
                )}
                <span className="block text-xs text-slate-400 dark:text-slate-500 mt-0.5">
                  {domainOf(r.url)}
                </span>
              </span>
            </a>
          </li>
        ))}
      </ul>
    </div>
  );
}
