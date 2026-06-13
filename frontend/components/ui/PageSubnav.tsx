import Link from "next/link";
import { useEffect, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";

/* Apple-style page subnav (design.md · Sand & Ocean).
 * Hidden at the top of the page; once you scroll past the hero it slides
 * in OVER the global MegaNavbar (same 60px height, opaque surface,
 * z-[60] > navbar's z-50) - the "iPhone 17 Pro" takeover pattern.
 * Section links jump to anchor ids; give target sections scroll-mt-[76px]. */

type SubnavLink = { label: string; href: string };

export default function PageSubnav({
  title,
  links,
  cta,
  threshold = 480,
}: {
  title: string;
  links: SubnavLink[];
  cta?: { label: string; href: string };
  threshold?: number;
}) {
  const [shown, setShown] = useState(false);

  useEffect(() => {
    const onScroll = () => setShown(window.scrollY > threshold);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, [threshold]);

  return (
    <AnimatePresence>
      {shown && (
        <motion.div
          initial={{ y: -64, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: -64, opacity: 0 }}
          transition={{ duration: 0.32, ease: [0.2, 0.7, 0.3, 1] }}
          className="fixed top-0 left-0 right-0 z-[60] h-[60px] bg-[var(--color-surface)]/94 backdrop-blur-md border-b border-[var(--color-line)]"
        >
          <div className="max-w-[1280px] mx-auto h-full px-4 sm:px-6 lg:px-10 flex items-center justify-between gap-4">
            <span className="font-serif text-[19px] tracking-[-0.015em] text-[var(--color-ink)] whitespace-nowrap">
              {title}
            </span>
            <nav className="hidden md:flex items-center gap-6 overflow-x-auto" aria-label={`${title} sections`}>
              {links.map((l) => (
                <a
                  key={l.href}
                  href={l.href}
                  className="text-[13px] font-medium text-[var(--color-ink-2)] hover:text-[var(--color-primary)] transition-colors whitespace-nowrap"
                >
                  {l.label}
                </a>
              ))}
            </nav>
            {cta && (
              <Link href={cta.href} className="btn-primary h-9 px-4 text-[13px] whitespace-nowrap shrink-0">
                {cta.label}
              </Link>
            )}
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
