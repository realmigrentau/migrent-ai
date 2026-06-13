import Link from "next/link";
import { useEffect, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";

/* Apple-style page subnav (design.md · Sand & Ocean).
 * Hidden at the top of the page; once you scroll past the hero it slides
 * in OVER the global MegaNavbar (same 60px height, opaque surface,
 * z-[60] > navbar's z-50) - the Apple product-page takeover pattern:
 * page title on the left, section links + a small pill CTA on the right,
 * with the current section underlined (scroll-spy).
 * Give target sections scroll-mt-[76px]. */

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
  const [active, setActive] = useState<string>("");

  useEffect(() => {
    const onScroll = () => setShown(window.scrollY > threshold);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, [threshold]);

  // Scroll-spy: underline the section currently in view
  useEffect(() => {
    const ids = links.map((l) => l.href.replace("#", ""));
    const sections = ids
      .map((id) => document.getElementById(id))
      .filter((el): el is HTMLElement => el !== null);
    if (sections.length === 0) return;
    const io = new IntersectionObserver(
      (entries) => {
        const visible = entries
          .filter((e) => e.isIntersecting)
          .sort((a, b) => a.boundingClientRect.top - b.boundingClientRect.top);
        if (visible[0]) setActive(`#${visible[0].target.id}`);
      },
      { rootMargin: "-20% 0px -60% 0px" }
    );
    sections.forEach((s) => io.observe(s));
    return () => io.disconnect();
  }, [links]);

  return (
    <AnimatePresence>
      {shown && (
        <motion.div
          initial={{ y: -64, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: -64, opacity: 0 }}
          transition={{ duration: 0.32, ease: [0.2, 0.7, 0.3, 1] }}
          className="fixed top-0 left-0 right-0 z-[60] h-[60px] bg-[var(--color-surface)]/95 backdrop-blur-xl border-b border-[var(--color-line)]"
        >
          <div className="max-w-[1280px] mx-auto h-full px-4 sm:px-6 lg:px-10 flex items-center justify-between gap-6">
            <a
              href="#"
              onClick={(e) => { e.preventDefault(); window.scrollTo({ top: 0, behavior: "smooth" }); }}
              className="font-serif text-[18px] tracking-[-0.015em] text-[var(--color-ink)] whitespace-nowrap hover:opacity-80 transition-opacity"
            >
              {title}
            </a>
            <div className="flex items-center gap-6 lg:gap-8 min-w-0">
              <nav className="hidden md:flex items-center gap-6 lg:gap-7 overflow-x-auto" aria-label={`${title} sections`}>
                {links.map((l) => {
                  const isActive = active === l.href;
                  return (
                    <a
                      key={l.href}
                      href={l.href}
                      className={`relative text-[12.5px] font-medium whitespace-nowrap py-1 transition-colors ${
                        isActive ? "text-[var(--color-ink)]" : "text-[var(--color-ink-2)] hover:text-[var(--color-ink)]"
                      }`}
                    >
                      {l.label}
                      <span
                        className={`absolute left-0 right-0 -bottom-[1px] h-[2px] rounded-full bg-[var(--color-primary)] transition-opacity duration-300 ${
                          isActive ? "opacity-100" : "opacity-0"
                        }`}
                        aria-hidden="true"
                      />
                    </a>
                  );
                })}
              </nav>
              {cta && (
                <Link
                  href={cta.href}
                  className="bg-[var(--color-primary)] text-[var(--color-primary-fg)] hover:bg-[var(--color-primary-500)] transition-colors h-8 px-4 rounded-full text-[12.5px] font-semibold inline-flex items-center whitespace-nowrap shrink-0"
                >
                  {cta.label}
                </Link>
              )}
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
