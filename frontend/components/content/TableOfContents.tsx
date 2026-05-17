import { useEffect, useState } from "react";

interface TOCItem {
  id: string;
  title: string;
}

export default function TableOfContents({ items }: { items: TOCItem[] }) {
  const [activeId, setActiveId] = useState<string>("");

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting) {
            setActiveId(entry.target.id);
          }
        }
      },
      { rootMargin: "-80px 0px -60% 0px", threshold: 0.1 }
    );

    for (const item of items) {
      const el = document.getElementById(item.id);
      if (el) observer.observe(el);
    }

    return () => observer.disconnect();
  }, [items]);

  return (
    <nav className="sticky top-24">
      <div className="text-xs font-semibold uppercase tracking-wider text-slate-400 dark:text-slate-500 mb-3">
        On this page
      </div>
      <ul className="space-y-1 border-l-2 border-slate-100 dark:border-slate-800">
        {items.map((item) => (
          <li key={item.id}>
            <a
              href={`#${item.id}`}
              className={`block pl-4 py-1.5 text-sm transition-all ${
                activeId === item.id
                  ? "text-[var(--color-primary)] dark:text-[var(--color-primary)] font-medium border-l-2 border-[var(--color-primary)] -ml-[2px]"
                  : "text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-300"
              }`}
            >
              {item.title}
            </a>
          </li>
        ))}
      </ul>
    </nav>
  );
}
