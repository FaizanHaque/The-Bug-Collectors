import { parseCsv } from "./parseCsv.js";

export function parseChemCsv(text) {
  return normalizeChemRows(parseCsv(text));
}

export function normalizeChemRows(rows) {
  const out = [];
  for (const r of rows) {
    const lat = parseFloat(r.lat);
    const lon = parseFloat(r.lon);
    if (Number.isNaN(lat) || Number.isNaN(lon)) continue;
    const salinity = parseFloat(r.salinity);
    const rawPh = r.ph;
    const ph =
      rawPh === "" || rawPh === undefined || rawPh == null ? null : parseFloat(rawPh);
    out.push({
      lat,
      lon,
      year: parseInt(r.year, 10) || 0,
      salinity: Number.isFinite(salinity) ? salinity : NaN,
      ph: Number.isFinite(ph) ? ph : null,
      cruise: r.Cruise ?? "",
      date: r.Date ?? "",
    });
  }
  return out;
}
