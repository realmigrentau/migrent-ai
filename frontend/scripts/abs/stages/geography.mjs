/**
 * Stage 1 - who exists, where they are, and which city they belong to.
 *
 * The ABS does not publish "suburb X is in Sydney". It publishes which mesh
 * blocks make up each suburb, and separately which Greater Capital City
 * Statistical Area, SA2 and SA1 each mesh block belongs to. So the mapping is
 * built by joining on mesh blocks and taking the dominant destination, which
 * is what "largest overlap rather than the centroid" means in practice: a
 * suburb straddling the edge of Greater Melbourne is assigned by where most
 * of it actually is, not by where the middle of its bounding box lands.
 *
 * The weight is the suburb's *residential* mesh block count, not its area.
 * Mesh blocks are drawn to hold a target number of dwellings, so counting the
 * residential ones approximates counting the people. Weighting by area would
 * hand a fringe suburb to whichever region owned its biggest paddock.
 */
import { join } from "node:path";
import { readSheet } from "../xlsx.mjs";
import {
  CAPITALS, STATES, capitalForGccsa, isRealSua, isSpecialPurpose,
  makeRegion, regionSlug, STATE_ORDER,
} from "../regions.mjs";

/** Separator for the composite SUA key. Not legal inside an ABS name. */
const SEP = "|#|";

/** Max-weight key of a Map<string, {residential, blocks, area}>. */
function dominant(counts) {
  let best = null;
  for (const [key, w] of counts) {
    if (!best) { best = [key, w]; continue; }
    const b = best[1];
    // residential mesh blocks, then all mesh blocks, then area
    if (w.residential !== b.residential) { if (w.residential > b.residential) best = [key, w]; continue; }
    if (w.blocks !== b.blocks) { if (w.blocks > b.blocks) best = [key, w]; continue; }
    if (w.area > b.area) best = [key, w];
  }
  return best;
}

function bump(map, key, residential, area) {
  let w = map.get(key);
  if (!w) { w = { residential: 0, blocks: 0, area: 0 }; map.set(key, w); }
  if (residential) w.residential++;
  w.blocks++;
  w.area += area;
  return w;
}

/** Share of the suburb's weight that went to the winning destination. */
function share(counts, winner) {
  let totalRes = 0, totalBlocks = 0;
  for (const w of counts.values()) { totalRes += w.residential; totalBlocks += w.blocks; }
  const w = counts.get(winner);
  if (!w) return 0;
  const denom = totalRes > 0 ? totalRes : totalBlocks;
  const num = totalRes > 0 ? w.residential : w.blocks;
  return denom > 0 ? num / denom : 0;
}

export function buildGeography(cacheDir, log = console.log) {
  // -- SA2 -> Significant Urban Area, SA1 -> Section of State -------------
  log("  reading SUA allocation");
  const sa2ToSua = new Map();
  readSheet(join(cacheDir, "SUA_2021_AUST.xlsx"), {
    columns: ["SA2_CODE_2021", "SUA_CODE_2021", "SUA_NAME_2021"],
    onRow: (r) => sa2ToSua.set(r.SA2_CODE_2021, [r.SUA_CODE_2021, r.SUA_NAME_2021]),
  });

  log("  reading UCL / Section of State allocation");
  const sa1ToSos = new Map();
  readSheet(join(cacheDir, "UCL_SOSR_SOS_2021_AUST.xlsx"), {
    columns: ["SA1_CODE_2021", "UCL_NAME_2021", "SOS_NAME_2021"],
    onRow: (r) => sa1ToSos.set(r.SA1_CODE_2021, [r.SOS_NAME_2021, r.UCL_NAME_2021]),
  });

  // -- Mesh block -> everything the mapping needs -------------------------
  log("  reading mesh block allocation (368k rows)");
  const mb = new Map();
  readSheet(join(cacheDir, "MB_2021_AUST.xlsx"), {
    columns: ["MB_CODE_2021", "MB_CATEGORY_2021", "SA1_CODE_2021", "SA2_CODE_2021", "GCCSA_CODE_2021", "AREA_ALBERS_SQKM"],
    onRow: (r) => {
      mb.set(r.MB_CODE_2021, [
        r.GCCSA_CODE_2021,
        r.SA2_CODE_2021,
        r.SA1_CODE_2021,
        r.MB_CATEGORY_2021 === "Residential" ? 1 : 0,
        Number(r.AREA_ALBERS_SQKM) || 0,
      ]);
    },
  });
  log(`  ${mb.size.toLocaleString()} mesh blocks`);

  // -- Suburb and locality allocation, aggregated per SAL -----------------
  log("  reading SAL allocation and aggregating");
  const places = new Map();
  const mbToSal = new Map();
  let rawRows = 0;

  readSheet(join(cacheDir, "SAL_2021_AUST.xlsx"), {
    columns: ["MB_CODE_2021", "SAL_CODE_2021", "SAL_NAME_2021", "STATE_CODE_2021", "STATE_NAME_2021", "AREA_ALBERS_SQKM"],
    onRow: (r) => {
      rawRows++;
      const code = r.SAL_CODE_2021;
      let p = places.get(code);
      if (!p) {
        p = {
          salCode: code,
          name: r.SAL_NAME_2021,
          stateCode: r.STATE_CODE_2021,
          stateName: r.STATE_NAME_2021,
          blocks: 0,
          residentialBlocks: 0,
          areaSqKm: 0,
          gccsa: new Map(),
          sua: new Map(),
          sos: new Map(),
          poa: new Map(),
        };
        places.set(code, p);
      }
      mbToSal.set(r.MB_CODE_2021, code);

      const info = mb.get(r.MB_CODE_2021);
      const area = Number(r.AREA_ALBERS_SQKM) || 0;
      p.blocks++;
      p.areaSqKm += area;
      if (!info) return;
      const [gccsa, sa2, sa1, residential] = info;
      if (residential) p.residentialBlocks++;

      bump(p.gccsa, gccsa, residential, area);
      const sua = sa2ToSua.get(sa2);
      if (sua && isRealSua(sua[1])) bump(p.sua, `${sua[0]}${SEP}${sua[1]}`, residential, area);
      const sos = sa1ToSos.get(sa1);
      if (sos) bump(p.sos, sos[0], residential, area);
    },
  });
  mb.clear();
  log(`  ${rawRows.toLocaleString()} SAL allocation rows -> ${places.size.toLocaleString()} SAL records`);

  // -- Postal areas, which are an approximation and labelled as one -------
  log("  reading postal area allocation");
  readSheet(join(cacheDir, "POA_2021_AUST.xlsx"), {
    columns: ["MB_CODE_2021", "POA_CODE_2021", "AREA_ALBERS_SQKM"],
    onRow: (r) => {
      const salCode = mbToSal.get(r.MB_CODE_2021);
      if (!salCode) return;
      const p = places.get(salCode);
      if (!p || !/^\d{3,4}$/.test(String(r.POA_CODE_2021))) return;
      bump(p.poa, String(r.POA_CODE_2021), 1, Number(r.AREA_ALBERS_SQKM) || 0);
    },
  });
  mbToSal.clear();

  // -- Turn the aggregates into records and regions -----------------------
  const regions = new Map();
  const out = [];
  const counts = {
    raw: places.size,
    specialPurpose: 0,
    public: 0,
    byCapital: 0,
    byUrbanArea: 0,
    byStateRemainder: 0,
    failedValidation: 0,
  };
  const excluded = [];
  const failures = [];

  for (const p of places.values()) {
    if (isSpecialPurpose(p.salCode, p.name)) {
      counts.specialPurpose++;
      excluded.push({ salCode: p.salCode, name: p.name, reason: "ABS special-purpose code" });
      continue;
    }

    const state = STATES[Number(p.stateCode)] || null;
    if (!state) {
      counts.failedValidation++;
      failures.push({ salCode: p.salCode, name: p.name, reason: `unknown state code ${p.stateCode}` });
      continue;
    }

    // 1. capital city, 2. significant urban area, 3. rest of state
    const topGccsa = dominant(p.gccsa);
    const capital = topGccsa ? capitalForGccsa(topGccsa[0]) : null;
    const topSua = dominant(p.sua);

    // A handful of fringe localities sit outside a capital's GCCSA but inside
    // the same capital's Significant Urban Area - Nyora is in the Melbourne
    // urban area but in "Rest of Vic.", and there are six more like it. Left
    // alone they mint a second region also called "Melbourne" holding one
    // suburb, which is worse than useless on the page. They belong with the
    // capital whose urban area they are part of.
    const suaCapital = topSua
      ? CAPITALS.find((c) => c.name === topSua[0].split(SEP)[1]) || null
      : null;

    let region, method, methodShare;
    if (capital) {
      region = makeRegion({
        kind: "capital", id: capital.id, name: capital.name,
        state: capital.state, order: capital.order, gccsaCode: capital.gccsa,
      });
      method = "dominant-mesh-block-gccsa";
      methodShare = share(p.gccsa, topGccsa[0]);
      counts.byCapital++;
    } else if (suaCapital) {
      region = makeRegion({
        kind: "capital", id: suaCapital.id, name: suaCapital.name,
        state: suaCapital.state, order: suaCapital.order, gccsaCode: suaCapital.gccsa,
      });
      method = "dominant-mesh-block-sua-capital";
      methodShare = share(p.sua, topSua[0]);
      counts.byCapital++;
    } else if (topSua) {
      const [suaCode, suaName] = topSua[0].split(SEP);
      region = makeRegion({
        kind: "urban", id: `${regionSlug(suaName)}-${state.abbr.toLowerCase()}`,
        name: suaName, state: state.abbr, order: 0, suaCode,
      });
      method = "dominant-mesh-block-sua";
      methodShare = share(p.sua, topSua[0]);
      counts.byUrbanArea++;
    } else {
      region = makeRegion({
        kind: "rest", id: `rest-${state.abbr.toLowerCase()}`,
        name: state.abbr === "OT" ? "Australian external territories" : `Regional and remote ${state.name}`,
        state: state.abbr, order: 0,
      });
      method = "state-remainder";
      methodShare = 1;
      counts.byStateRemainder++;
    }

    if (!regions.has(region.id)) regions.set(region.id, { ...region, placeCount: 0 });
    regions.get(region.id).placeCount++;

    // Postcodes, most-overlapping first. These are ABS Postal Areas, which
    // approximate postcodes from mesh blocks - not Australia Post's list.
    const postcodes = [...p.poa.entries()]
      .sort((a, b) => b[1].area - a[1].area)
      .map(([code]) => code);

    const topSos = dominant(p.sos);

    out.push({
      salCode: p.salCode,
      name: p.name,
      state: state.abbr,
      stateName: state.name,
      regionId: region.id,
      meshBlocks: p.blocks,
      residentialMeshBlocks: p.residentialBlocks,
      areaSqKm: Math.round(p.areaSqKm * 1000) / 1000,
      postcodes,
      sectionOfState: topSos ? topSos[0] : null,
      mapping: {
        method,
        share: Math.round(methodShare * 1000) / 1000,
        gccsaCode: topGccsa ? topGccsa[0] : null,
        suaCode: region.suaCode,
        sourceGeography: "ASGS Edition 3 mesh blocks (2021)",
      },
    });
    counts.public++;
  }

  // Four Significant Urban Areas straddle a state border: Albury - Wodonga,
  // Echuca - Moama, Mildura - Buronga and Gold Coast - Tweed Heads. Each one
  // therefore becomes two regions here, because the page groups regional
  // cities under their state and filters by it. Two headings reading
  // "Albury - Wodonga" is useless, so each says which side it is.
  const byName = new Map();
  for (const r of regions.values()) {
    if (!byName.has(r.name)) byName.set(r.name, []);
    byName.get(r.name).push(r);
  }
  for (const group of byName.values()) {
    if (group.length < 2) continue;
    for (const r of group) r.name = `${r.name} (${r.state})`;
  }

  // Regional cities and rest-of-state groups sort inside their state.
  const regionList = [...regions.values()].sort((a, b) => {
    const rank = (r) => (r.kind === "capital" ? 0 : r.kind === "urban" ? 1 : 2);
    if (rank(a) !== rank(b)) return rank(a) - rank(b);
    if (a.kind === "capital") return a.order - b.order;
    const sa = STATE_ORDER.indexOf(a.state), sb = STATE_ORDER.indexOf(b.state);
    if (sa !== sb) return sa - sb;
    return a.name.localeCompare(b.name);
  });

  return { places: out, regions: regionList, counts, excluded, failures };
}
