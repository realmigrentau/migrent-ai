import { fieldMeta, QUALITY_LABELS } from "../../lib/suburbs/fields";
import type { DataQuality, SourceRecord } from "../../lib/suburbs/types";

/**
 * One statistic, with its source visible rather than buried.
 *
 * The source line is always rendered. It is not a tooltip and not behind a
 * hover, because a figure whose provenance you have to go looking for is the
 * thing this rebuild was commissioned to remove - the old pages printed
 * "Safety 6.9/10" with nothing attached and no way to ask where it came from.
 *
 * A missing value never renders as "N/A" or as a zero. It renders as a short
 * sentence saying what is not available and why, or the caller omits the
 * block entirely.
 */
export default function StatBlock({
  fieldKey,
  value,
  sources,
  note,
  emphasis = false,
}: {
  fieldKey: string;
  /** Already formatted. null means "we do not have this". */
  value: string | null;
  sources: SourceRecord[];
  /** Overrides the default explanation shown when `value` is null. */
  note?: string;
  emphasis?: boolean;
}) {
  const meta = fieldMeta(fieldKey);
  const source = sources.find((s) => s.id === meta.sourceId);
  const quality: DataQuality = value == null ? "unavailable" : meta.quality;

  return (
    <div className={`sub-stat${emphasis ? " sub-stat--lead" : ""}`} data-quality={quality}>
      <dt className="sub-stat__label">{meta.label}</dt>
      <dd className="sub-stat__body">
        {value == null ? (
          <p className="sub-stat__none">{note || "Data not currently available for this locality."}</p>
        ) : (
          <p className="sub-stat__value">{value}</p>
        )}
        <p className="sub-stat__source">
          {value == null ? (
            <span className="sub-stat__quality">{QUALITY_LABELS[quality]}</span>
          ) : (
            <>
              <span className="sub-stat__quality">{QUALITY_LABELS[quality]}</span>
              {source && (
                <>
                  {" · "}
                  {source.organisation}, {source.referencePeriod}
                </>
              )}
            </>
          )}
        </p>
      </dd>
    </div>
  );
}

/**
 * The same contract for a value that is a list rather than a number, such as
 * the most common countries of birth.
 */
export function StatList({
  fieldKey,
  items,
  sources,
  note,
}: {
  fieldKey: string;
  items: { name: string; pct: number | null }[] | null;
  sources: SourceRecord[];
  note?: string;
}) {
  const meta = fieldMeta(fieldKey);
  const source = sources.find((s) => s.id === meta.sourceId);
  const empty = !items || items.length === 0;

  return (
    <div className="sub-stat sub-stat--list" data-quality={empty ? "unavailable" : meta.quality}>
      <dt className="sub-stat__label">{meta.label}</dt>
      <dd className="sub-stat__body">
        {empty ? (
          <p className="sub-stat__none">{note || "Data not currently available for this locality."}</p>
        ) : (
          <ul className="sub-stat__items">
            {items.map((item) => (
              <li key={item.name}>
                <span className="sub-stat__item-name">{item.name}</span>
                {item.pct != null && <span className="sub-stat__item-pct">{item.pct}%</span>}
                {item.pct != null && (
                  <span
                    className="sub-stat__bar"
                    aria-hidden="true"
                    // Scaled against 40%, above which the bars stop being
                    // comparable rather than continuing to grow off the card.
                    style={{ ["--w" as string]: `${Math.min(item.pct / 40, 1) * 100}%` }}
                  />
                )}
              </li>
            ))}
          </ul>
        )}
        <p className="sub-stat__source">
          <span className="sub-stat__quality">{QUALITY_LABELS[empty ? "unavailable" : meta.quality]}</span>
          {!empty && source && (
            <>
              {" · "}
              {source.organisation}, {source.referencePeriod}
            </>
          )}
        </p>
      </dd>
    </div>
  );
}
