import { useState } from "react";

interface CodeBlockProps {
  code: string;
  language?: string;
}

export default function CodeBlock({ code, language = "json" }: CodeBlockProps) {
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    await navigator.clipboard.writeText(code);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="relative group rounded-xl bg-[var(--color-ink)] dark:bg-[var(--color-bg)] overflow-hidden">
      <div className="flex items-center justify-between px-4 py-2 bg-[var(--color-surface-muted)] border-b border-[var(--color-line)]">
        <span className="text-[10px] font-medium text-[var(--color-ink-3)] uppercase tracking-wider">{language}</span>
        <button
          onClick={handleCopy}
          className="text-[10px] font-medium text-[var(--color-ink-3)] hover:text-white transition-colors px-2 py-1 rounded hover:bg-white/10"
        >
          {copied ? "Copied!" : "Copy"}
        </button>
      </div>
      <pre className="p-4 overflow-x-auto text-sm leading-relaxed">
        <code className="text-[var(--color-ink-4)]">{code}</code>
      </pre>
    </div>
  );
}
