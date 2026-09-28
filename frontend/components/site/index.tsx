import { useCallback, useEffect, useRef, useState, type ElementType, type ReactNode } from "react";
import Link from "next/link";
import { motion, useReducedMotion } from "framer-motion";
import { ArrowLeft, ArrowRight } from "lucide-react";

/**
 * The public site's kit: the handful of shapes every page is built from.
 * Styles live in styles/site.css; nothing here restates a colour or a size.
 */

const MOTION_TAGS = {
  div: motion.div,
  section: motion.section,
  article: motion.article,
  li: motion.li,
  header: motion.header,
};

/** A weighted rise on first view. Reduced motion gets the content, plain. */
export function Reveal({
  children,
  delay = 0,
  as = "div",
  className,
}: {
  children: ReactNode;
  delay?: number;
  as?: keyof typeof MOTION_TAGS;
  className?: string;
}) {
  const reduced = useReducedMotion();
  if (reduced) {
    const Plain = as as ElementType;
    return <Plain className={className}>{children}</Plain>;
  }
  const Tag = MOTION_TAGS[as] as ElementType;
  return (
    <Tag
      className={className}
      initial={{ opacity: 0, y: 22 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-60px" }}
      transition={{ duration: 0.75, delay, ease: [0.16, 1, 0.3, 1] }}
    >
      {children}
    </Tag>
  );
}

/**
 * Eyebrow above heading, same column - never tag-left / heading-right.
 * `heading` can carry one <strong> word (bold) or one .type-script word.
 */
export function SectionHead({
  eyebrow,
  heading,
  lead,
  id,
  align = "start",
  as: H = "h2",
  size = "h2",
  aside,
  className = "",
}: {
  eyebrow?: string;
  heading: ReactNode;
  lead?: ReactNode;
  id?: string;
  align?: "start" | "center";
  as?: "h1" | "h2";
  size?: "h2" | "display";
  aside?: ReactNode;
  className?: string;
}) {
  const centred = align === "center";
  return (
    <div
      className={[
        "flex flex-col gap-5",
        centred ? "items-center text-center" : "",
        aside ? "md:flex-row md:items-end md:justify-between md:gap-10" : "",
        className,
      ]
        .filter(Boolean)
        .join(" ")}
    >
      <div className={`min-w-0 ${centred ? "flex flex-col items-center" : ""}`}>
        {eyebrow && <p className="eyebrow mb-4">{eyebrow}</p>}
        <H id={id} className={`${size === "display" ? "site-display" : "site-h2"} ${centred ? "max-w-[20ch]" : "max-w-[18ch]"}`}>
          {heading}
        </H>
        {lead && <p className={`site-lead mt-5 ${centred ? "max-w-[54ch]" : "max-w-[50ch]"}`}>{lead}</p>}
      </div>
      {aside && <div className="shrink-0">{aside}</div>}
    </div>
  );
}

export type Crumb = { label: string; href?: string };

/** The top of every inner page: the same sky the homepage ends on. */
export function PageHero({
  eyebrow,
  title,
  lead,
  crumbs,
  actions,
  children,
  narrow = false,
}: {
  eyebrow?: string;
  title: ReactNode;
  lead?: ReactNode;
  crumbs?: Crumb[];
  actions?: ReactNode;
  children?: ReactNode;
  narrow?: boolean;
}) {
  return (
    <header className="page-hero">
      <div className={`site-shell ${narrow ? "site-shell--narrow" : ""}`}>
        {crumbs && crumbs.length > 0 && (
          <nav aria-label="Breadcrumb">
            <ol className="page-hero__crumbs">
              {crumbs.map((c, i) => (
                <li key={`${c.label}-${i}`}>
                  {c.href && i < crumbs.length - 1 ? <Link href={c.href}>{c.label}</Link> : <span aria-current={i === crumbs.length - 1 ? "page" : undefined}>{c.label}</span>}
                </li>
              ))}
            </ol>
          </nav>
        )}
        {eyebrow && <p className="eyebrow mb-4">{eyebrow}</p>}
        <h1 className="site-display max-w-[18ch]">{title}</h1>
        {lead && <p className="site-lead mt-5 max-w-[56ch]">{lead}</p>}
        {actions && <div className="mt-8 flex flex-wrap items-center gap-3">{actions}</div>}
        {children}
      </div>
    </header>
  );
}

/** The card every page closes on, just above the footer. */
export function CloseCard({
  heading,
  lead,
  primary,
  secondary,
}: {
  heading: ReactNode;
  lead?: ReactNode;
  primary: { label: string; href: string };
  secondary?: { label: string; href: string };
}) {
  return (
    <section className="site-section site-section--tight" aria-labelledby="close-heading">
      <div className="site-shell">
        <Reveal className="site-close">
          <h2 id="close-heading" className="site-h2 max-w-[18ch]">
            {heading}
          </h2>
          {lead && <p className="site-lead mt-4 max-w-[48ch]">{lead}</p>}
          <div className="mt-8 flex flex-wrap gap-3">
            <Link href={primary.href} className="btn-primary btn-lg">
              {primary.label}
              <ArrowRight className="btn-arrow h-4 w-4" strokeWidth={2.2} aria-hidden="true" />
            </Link>
            {secondary && (
              <Link href={secondary.href} className="btn-secondary btn-lg">
                {secondary.label}
              </Link>
            )}
          </div>
        </Reveal>
      </div>
    </section>
  );
}

export type FaqEntry = { q: string; a: ReactNode };

export function Faq({ items, openFirst = true }: { items: FaqEntry[]; openFirst?: boolean }) {
  return (
    <div>
      {items.map((f, i) => (
        <details key={f.q} className="site-faq__item" open={openFirst && i === 0}>
          <summary className="site-faq__q">
            {f.q}
            <span className="site-faq__sign" aria-hidden="true" />
          </summary>
          <div className="site-body site-faq__a">{f.a}</div>
        </details>
      ))}
    </div>
  );
}

/**
 * A sideways strip with arrow buttons. Drag, swipe, scroll or use the
 * arrows; with reduced motion it becomes an ordinary grid.
 */
export function Strip({ label, children, head }: { label: string; children: ReactNode; head?: ReactNode }) {
  const ref = useRef<HTMLUListElement>(null);
  const [edges, setEdges] = useState({ start: true, end: false });

  const measure = useCallback(() => {
    const el = ref.current;
    if (!el) return;
    setEdges({ start: el.scrollLeft <= 4, end: el.scrollLeft + el.clientWidth >= el.scrollWidth - 4 });
  }, []);

  useEffect(() => {
    measure();
    const el = ref.current;
    if (!el) return;
    el.addEventListener("scroll", measure, { passive: true });
    window.addEventListener("resize", measure);
    return () => {
      el.removeEventListener("scroll", measure);
      window.removeEventListener("resize", measure);
    };
  }, [measure]);

  const step = (dir: 1 | -1) => {
    const el = ref.current;
    if (!el) return;
    const card = el.querySelector("li");
    const amount = card ? card.getBoundingClientRect().width + 16 : el.clientWidth * 0.8;
    el.scrollBy({ left: dir * amount, behavior: "smooth" });
  };

  return (
    <div>
      <div className="site-shell flex items-end justify-between gap-6">
        <div className="min-w-0 flex-1">{head}</div>
        <div className="site-arrows">
          <button type="button" className="site-arrow" onClick={() => step(-1)} disabled={edges.start} aria-label={`Previous: ${label}`}>
            <ArrowLeft className="h-4 w-4" strokeWidth={2} aria-hidden="true" />
          </button>
          <button type="button" className="site-arrow" onClick={() => step(1)} disabled={edges.end} aria-label={`Next: ${label}`}>
            <ArrowRight className="h-4 w-4" strokeWidth={2} aria-hidden="true" />
          </button>
        </div>
      </div>
      {/* data-lenis-prevent: horizontal wheel and trackpad scrolling belong
          to the strip, not to the page's smooth scroll. */}
      <ul ref={ref} className="site-strip mt-8" aria-label={label} data-lenis-prevent-wheel="">
        {children}
      </ul>
    </div>
  );
}

export type DocLink = { href: string; label: string };

/**
 * A long document with its own side menu: the legal centre and the
 * renting guide. On a phone the menu sits above the text as a list.
 */
export function DocLayout({
  nav,
  navLabel,
  current,
  children,
}: {
  nav: DocLink[];
  navLabel: string;
  current?: string;
  children: ReactNode;
}) {
  return (
    <div className="site-section site-section--flush">
      <div className="site-shell site-doc">
        <nav className="site-doc__nav" aria-label={navLabel}>
          <ul className="site-doc__navlist">
            {nav.map((l) => (
              <li key={l.href}>
                <Link href={l.href} className="site-doc__navlink" aria-current={current === l.href ? "page" : undefined}>
                  {l.label}
                </Link>
              </li>
            ))}
          </ul>
        </nav>
        <div className="min-w-0">{children}</div>
      </div>
    </div>
  );
}
