import { rowYear } from "./parseCsv.js";

/**
 * @typedef {Object} Station
 * @property {number} lat
 * @property {number} lng
 * @property {number} totalLarvae
 * @property {Map<string, Map<number, number>>} speciesYearCounts - commonName -> year -> larvae sum
 */

/**
 * @param {Record<string,string>[]} rows filtered rows
 * @returns {Station[]}
 */
export function aggregateStations(rows) {
  /** @type {Map<string, { lat: number, lng: number, speciesYearCounts: Map<string, Map<number, number>> }>} */
  const byKey = new Map();

  for (const r of rows) {
    const lat = parseFloat(r.latitude);
    const lng = parseFloat(r.longitude);
    if (Number.isNaN(lat) || Number.isNaN(lng)) continue;
    const key = `${lat},${lng}`;
    const common = (r.common_name || "").trim() || "—";
    const y = rowYear(r.time) ?? 0;
    const larvae = parseInt(r.larvae_count, 10) || 0;

    if (!byKey.has(key)) {
      byKey.set(key, {
        lat,
        lng,
        speciesYearCounts: new Map(),
      });
    }
    const st = byKey.get(key);
    if (!st.speciesYearCounts.has(common)) {
      st.speciesYearCounts.set(common, new Map());
    }
    const ym = st.speciesYearCounts.get(common);
    ym.set(y, (ym.get(y) || 0) + larvae);
  }

  const stations = [];
  for (const st of byKey.values()) {
    let total = 0;
    for (const ym of st.speciesYearCounts.values()) {
      for (const c of ym.values()) total += c;
    }
    stations.push({
      lat: st.lat,
      lng: st.lng,
      totalLarvae: total,
      speciesYearCounts: st.speciesYearCounts,
    });
  }
  return stations;
}

export function escapeHtml(s) {
  return String(s)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

/**
 * Multi-column tooltip: one column per species, year boxes descending.
 */
export function buildStationTooltipHtml(station) {
  const speciesSorted = [...station.speciesYearCounts.keys()].sort((a, b) => a.localeCompare(b));
  let html = '<div class="station-tooltip-inner">';
  html += '<div class="station-tooltip-cols">';
  for (const species of speciesSorted) {
    const yearMap = station.speciesYearCounts.get(species);
    const years = [...yearMap.entries()]
      .filter(([y]) => y > 0)
      .sort((a, b) => b[0] - a[0]);
    const yearsDisplay = years.length ? years : [...yearMap.entries()].sort((a, b) => b[0] - a[0]);

    html += '<div class="station-tooltip-col">';
    html += `<div class="station-tooltip-species">${escapeHtml(species)}</div>`;
    for (const [year, count] of yearsDisplay) {
      const yLabel = year > 0 ? String(year) : "Undated";
      html += `<div class="station-tooltip-yearbox"><span class="st-y">${escapeHtml(yLabel)}</span><span class="st-n">${count} larvae</span></div>`;
    }
    html += "</div>";
  }
  html += "</div></div>";
  return html;
}
