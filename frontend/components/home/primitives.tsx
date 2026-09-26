import { motion, useReducedMotion } from "framer-motion";
import type { ElementType, ReactNode } from "react";
import type { LucideIcon } from "lucide-react";

const MOTION_TAGS = {
  div: motion.div,
  section: motion.section,
  article: motion.article,
  li: motion.li,
  header: motion.header,
};

type RevealTag = keyof typeof MOTION_TAGS;

/**
 * Shared pieces for the homepage sections.
 *
 * The visual language lives in styles/home.css; this file only holds the
 * markup shapes that more than one section needs, so a spacing or reveal
 * decision is made once rather than pasted into a dozen places.
 */

/** The hero's own entrance: a weighted rise on expo.out, once, on enter. */
export function Reveal({
  children,
  delay = 0,
  as = "div",
  className,
}: {
  children: ReactNode;
  delay?: number;
  as?: RevealTag;
  className?: string;
}) {
  const reduced = useReducedMotion();
  const Tag = MOTION_TAGS[as] as ElementType;

  // Reduced motion gets no entrance at all - not a shorter one. A reveal that
  // depends on an intersection to become visible can leave content at zero
  // opacity if the observer never fires, and that is a worse failure than a
  // missing flourish.
  if (reduced) {
    const Plain = as;
    return <Plain className={className}>{children}</Plain>;
  }

  return (
    <Tag
      className={className}
      initial={{ opacity: 0, y: 26 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-70px" }}
      transition={{ duration: 0.8, delay, ease: [0.16, 1, 0.3, 1] }}
    >
      {children}
    </Tag>
  );
}

/**
 * Eyebrow above heading, same column - never the tag-left / heading-right
 * split. `emphasis` is the one word the heading carries in bold, which is
 * how the hero's editorial line marks emphasis.
 */
export function SectionHead({
  eyebrow,
  heading,
  emphasis,
  lead,
  align = "start",
  size = "h2",
  aside,
  className = "",
  headingId,
}: {
  eyebrow: string;
  heading: string;
  emphasis?: string;
  lead?: string;
  align?: "start" | "center";
  size?: "h2" | "display";
  aside?: ReactNode;
  className?: string;
  headingId?: string;
}) {
  const centered = align === "center";
  return (
    <div
      className={[
        "flex flex-col gap-4",
        centered ? "items-center text-center" : "",
        aside ? "md:flex-row md:items-end md:justify-between md:gap-10" : "",
        className,
      ]
        .filter(Boolean)
        .join(" ")}
    >
      {/* The measure belongs on the heading itself: a ch on this wrapper would
          resolve against the inherited 15px body size, not the display size,
          and squeeze a one-line heading into three. */}
      <div className={`min-w-0 ${centered ? "w-full" : ""}`}>
        <p className={`mg-eyebrow ${centered ? "" : "mg-eyebrow--ruled"} mb-4`}>{eyebrow}</p>
        <h2
          id={headingId}
          className={`${size === "display" ? "mg-display" : "mg-h2"} max-w-[18ch] ${centered ? "mx-auto" : ""}`}
        >
          {heading}
          {emphasis ? (
            <>
              {" "}
              <strong>{emphasis}</strong>
            </>
          ) : null}
        </h2>
        {lead ? <p className={`mg-lead mt-5 ${centered ? "max-w-[52ch] mx-auto" : "max-w-[46ch]"}`}>{lead}</p> : null}
      </div>
      {aside ? <div className="shrink-0">{aside}</div> : null}
    </div>
  );
}

/**
 * Icon + title + body in one hairline row - the page's answer to a card grid.
 * Vertical rhythm belongs to the .mg-rows container that holds it, so the
 * first and last rows can close up against the section's own padding.
 */
export function FeatureRow({
  icon: Icon,
  title,
  body,
  tone = "primary",
}: {
  icon: LucideIcon;
  title: string;
  body: string;
  tone?: "primary" | "trust";
}) {
  return (
    <div className="flex gap-4 sm:gap-6">
      <span className={`mg-icon${tone === "trust" ? " mg-icon--trust" : ""}`} aria-hidden="true">
        <Icon className="w-5 h-5" strokeWidth={1.75} />
      </span>
      <div className="min-w-0">
        <h3 className="mg-h3">{title}</h3>
        <p className="mg-body mt-1.5">{body}</p>
      </div>
    </div>
  );
}
