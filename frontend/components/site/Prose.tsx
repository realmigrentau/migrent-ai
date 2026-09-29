import { Fragment, type ReactNode } from "react";
import Link from "next/link";

/**
 * A deliberately small Markdown subset for the site's own written content
 * (help articles). Headings (##, ###), paragraphs, bulleted and numbered
 * lists, **bold** and [links](/path). Nothing else, and never raw HTML:
 * every piece becomes a React element, so text can only ever be text.
 *
 * Links starting with "/" become client-side links; anything else opens as
 * an ordinary external link.
 */

const INLINE = /(\*\*[^*]+\*\*|\[[^\]]+\]\([^)\s]+\))/g;

function inline(text: string): ReactNode[] {
  const out: ReactNode[] = [];
  let last = 0;
  let key = 0;
  for (const m of text.matchAll(INLINE)) {
    const at = m.index ?? 0;
    if (at > last) out.push(text.slice(last, at));
    const token = m[0];
    if (token.startsWith("**")) {
      out.push(<strong key={key++}>{token.slice(2, -2)}</strong>);
    } else {
      const label = token.slice(1, token.indexOf("]"));
      const href = token.slice(token.indexOf("(") + 1, -1);
      out.push(
        href.startsWith("/") ? (
          <Link key={key++} href={href}>
            {label}
          </Link>
        ) : (
          <a key={key++} href={href} rel="noopener noreferrer" target="_blank">
            {label}
          </a>
        ),
      );
    }
    last = at + token.length;
  }
  if (last < text.length) out.push(text.slice(last));
  return out;
}

export default function Prose({ source, className = "" }: { source: string; className?: string }) {
  const blocks = source.trim().split(/\n{2,}/);
  return (
    <div className={`site-prose ${className}`}>
      {blocks.map((block, i) => {
        const lines = block.split("\n");
        if (block.startsWith("### ")) return <h3 key={i}>{inline(block.slice(4))}</h3>;
        if (block.startsWith("## ")) return <h2 key={i}>{inline(block.slice(3))}</h2>;
        if (lines.every((l) => /^- /.test(l))) {
          return (
            <ul key={i}>
              {lines.map((l, j) => (
                <li key={j}>{inline(l.slice(2))}</li>
              ))}
            </ul>
          );
        }
        if (lines.every((l) => /^\d+\. /.test(l))) {
          return (
            <ol key={i}>
              {lines.map((l, j) => (
                <li key={j}>{inline(l.replace(/^\d+\. /, ""))}</li>
              ))}
            </ol>
          );
        }
        return (
          <p key={i}>
            {lines.map((l, j) => (
              <Fragment key={j}>
                {j > 0 && <br />}
                {inline(l)}
              </Fragment>
            ))}
          </p>
        );
      })}
    </div>
  );
}
