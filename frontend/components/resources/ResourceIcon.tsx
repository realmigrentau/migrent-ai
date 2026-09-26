import { RESOURCE_ICON, type ResourceIconName } from "../../data/resources";

/**
 * One glyph table, drawn at one stroke weight.
 *
 * The navbar dropdown, the landing tiles and the hub heroes all render
 * this component, so the Guides icon in the header and the Guides icon on
 * the page are the same 24x24 path at the same 1.5 weight rather than two
 * near-matches from two different sets.
 *
 * Always decorative: the title beside it is the accessible name, so the
 * svg is hidden from screen readers rather than labelled twice.
 */
export default function ResourceIcon({
  name,
  className = "w-[19px] h-[19px]",
}: {
  name: ResourceIconName;
  className?: string;
}) {
  return (
    <svg
      className={className}
      fill="none"
      viewBox="0 0 24 24"
      stroke="currentColor"
      strokeWidth={1.5}
      aria-hidden="true"
      focusable="false"
    >
      <path strokeLinecap="round" strokeLinejoin="round" d={RESOURCE_ICON[name]} />
    </svg>
  );
}
