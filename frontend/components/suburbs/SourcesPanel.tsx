import { FIELDS } from "../../lib/suburbs/fields";
import { formatDate } from "../../lib/suburbs/format";
import type { PlaceDetail, SourceRecord } from "../../lib/suburbs/types";

/**
 * Sources and methodology.
 *
 * Everything a reader would need to check our work or disagree with it: which
 * organisation published each dataset, which edition, what period it covers,
 * when we downloaded it, what licence it carries, how we calculated anything
 * we calculated, and what each figure cannot be used for.
 *
 * Collapsed by default because most visitors want a room rather than a
 * bibliography, but present on every page and in the HTML whether it is open
 * or not.
 */
export default function SourcesPanel({
  sources,
  detail,
  generatedAt,
}: {
  sources: SourceRecord[];
  detail: PlaceDetail;
  generatedAt: string;
}) {
  // Only the sources this page actually drew on.
  const used = new Set<string>();
  if (detail.census) used.add("abs-census-2021-gcp-sal");
  used.add("abs-asgs-sal");
  used.add("abs-asgs-mb");
  if (detail.postcodes.length) used.add("abs-asgs-poa");
  if (detail.centre) used.add("abs-asgs-sal-boundaries");
  if (detail.amenities) used.add("osm-amenities");
  used.add("migrent-listings");

  const shown = sources.filter((s) => used.has(s.id));
  const derived = Object.values(FIELDS).filter((f) => f.methodology && used.has(f.sourceId));

  return (
    <details className="sub-sources">
      <summary className="sub-sources__summary">
        <span>Sources and methodology</span>
        <span className="sub-sources__hint">
          {shown.length} datasets · data built {formatDate(generatedAt)}
        </span>
      </summary>

      <div className="sub-sources__body">
        <p className="sub-sources__intro">
          Every figure on this page comes from one of the datasets below. Where we calculated
          something rather than copying a published number, the calculation is described. Where a
          figure is missing, it is because no source we trust publishes it for {detail.name} - not
          because it is zero.
        </p>

        <h3 className="sub-sources__h">Datasets</h3>
        <ul className="sub-sources__list">
          {shown.map((s) => (
            <li key={s.id} className="sub-source">
              <p className="sub-source__title">{s.dataset}</p>
              <dl className="sub-source__meta">
                <div>
                  <dt>Published by</dt>
                  <dd>{s.organisation}</dd>
                </div>
                <div>
                  <dt>Edition</dt>
                  <dd>{s.edition}</dd>
                </div>
                <div>
                  <dt>Reference period</dt>
                  <dd>{s.referencePeriod}</dd>
                </div>
                <div>
                  <dt>Geography</dt>
                  <dd>{s.geographyLevel}</dd>
                </div>
                {s.downloadedAt && (
                  <div>
                    <dt>Imported</dt>
                    <dd>{formatDate(s.downloadedAt)}</dd>
                  </div>
                )}
                <div>
                  <dt>Licence</dt>
                  <dd>
                    {s.licence.url ? (
                      <a href={s.licence.url} rel="noopener noreferrer nofollow" target="_blank">
                        {s.licence.name}
                      </a>
                    ) : (
                      s.licence.name
                    )}
                  </dd>
                </div>
              </dl>
              {s.limitations && <p className="sub-source__limit">{s.limitations}</p>}
              {s.landingUrl && s.landingUrl.startsWith("http") && (
                <p className="sub-source__link">
                  <a href={s.landingUrl} rel="noopener noreferrer nofollow" target="_blank">
                    Source page
                  </a>
                </p>
              )}
            </li>
          ))}
        </ul>

        <h3 className="sub-sources__h">How this suburb was assigned to a region</h3>
        <p className="sub-sources__para">
          {detail.name} is grouped under its region by{" "}
          {detail.mapping.method === "dominant-mesh-block-gccsa"
            ? "which Greater Capital City Statistical Area most of its mesh blocks belong to"
            : detail.mapping.method === "dominant-mesh-block-sua"
              ? "which Significant Urban Area most of its mesh blocks belong to"
              : "falling outside every capital city and significant urban area, so it is grouped with the rest of its state"}
          {detail.mapping.method !== "state-remainder" && (
            <> - {Math.round(detail.mapping.share * 100)}% of them</>
          )}
          . The source geography is {detail.mapping.sourceGeography}. We never assign a suburb to a
          city because of its name.
        </p>

        <h3 className="sub-sources__h">Calculated figures</h3>
        <ul className="sub-sources__methods">
          {derived.map((f) => (
            <li key={f.key}>
              <strong>{f.label}.</strong> {f.methodology}
              {f.limitation && <span className="sub-sources__limit-inline"> {f.limitation}</span>}
            </li>
          ))}
        </ul>

        <h3 className="sub-sources__h">What we do not publish</h3>
        <ul className="sub-sources__methods">
          <li>
            <strong>Safety or crime scores.</strong> There is no nationally standardised suburb-level
            crime measure in Australia, and offence categories and counting rules differ by state.
            The unexplained score this page used to show has been removed rather than recalculated.
          </li>
          <li>
            <strong>Walkability scores.</strong> No free national dataset supports one. We publish
            counts of what is actually mapped nearby instead.
          </li>
          <li>
            <strong>Commute times and walking times.</strong> We have no licensed routing engine, so
            distances here are straight-line and labelled as such.
          </li>
          <li>
            <strong>Vacancy rates.</strong> We know how many rooms are advertised on MigRent. That is
            not the same measure and is never presented as one.
          </li>
        </ul>
      </div>
    </details>
  );
}
