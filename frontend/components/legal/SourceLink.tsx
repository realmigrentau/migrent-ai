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
      <ExternalLink className="w-4 h-4 text-[var(--color-primary)] flex-shrink-0 mt-0.5 group-hover:scale-110 transition-transform" />
      <span>
        <span className="text-[var(--color-primary)] hover:text-[var(--color-primary)] dark:hover:text-[var(--color-primary)] underline underline-offset-2 transition-colors font-medium">
          {label}
        </span>
        {description && (
          <span className="text-[var(--color-ink-3)] ml-1">- {description}</span>
        )}
      </span>
    </a>
  );
}
