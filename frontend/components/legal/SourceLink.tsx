import { ExternalLink } from "lucide-react";

interface SourceLinkProps {
  href: string;
  label: string;
  description?: string;
}

export default function SourceLink({ href, label, description }: SourceLinkProps) {
  return (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      className="group flex items-start gap-2 text-sm"
    >
      <ExternalLink className="w-4 h-4 text-rose-500 flex-shrink-0 mt-0.5 group-hover:scale-110 transition-transform" />
      <span>
        <span className="text-rose-500 hover:text-rose-600 dark:hover:text-rose-400 underline underline-offset-2 transition-colors font-medium">
          {label}
        </span>
        {description && (
          <span className="text-slate-500 dark:text-slate-400 ml-1">- {description}</span>
        )}
      </span>
    </a>
  );
}
