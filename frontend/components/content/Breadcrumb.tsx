import Link from "next/link";

interface BreadcrumbItem {
  label: string;
  href?: string;
}

export default function Breadcrumb({ items }: { items: BreadcrumbItem[] }) {
  return (
    <nav className="flex items-center gap-2 text-xs text-slate-400 dark:text-slate-500 mb-8">
      <Link href="/" className="hover:text-slate-600 dark:hover:text-slate-300 transition-colors">
        Home
      </Link>
      {items.map((item, i) => (
        <span key={i} className="flex items-center gap-2">
          <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
          </svg>
          {item.href ? (
            <Link href={item.href} className="hover:text-slate-600 dark:hover:text-slate-300 transition-colors">
              {item.label}
            </Link>
          ) : (
            <span className="text-slate-600 dark:text-slate-300 font-medium">{item.label}</span>
          )}
        </span>
      ))}
    </nav>
  );
}
