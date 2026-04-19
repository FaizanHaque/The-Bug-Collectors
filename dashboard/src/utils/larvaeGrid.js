/**
 * Bin CalCOFI larvae rows into lat/lon grid cells.
 * Each cell reports the mean larvae_10m2 across all tows within it.
 */
export function buildLarvaePatches(rows, cellDeg = 0.2) {
  if (!rows?.length) return [];

  const bins = new Map();
  for (const r of rows) {
    const lat = parseFloat(r.latitude);
    const lon = parseFloat(r.longitude);
    const val = parseFloat(r.larvae_10m2);
    if (!Number.isFinite(lat) || !Number.isFinite(lon) || !Number.isFinite(val)) continue;

    const bi = Math.floor(lat / cellDeg);
    const bj = Math.floor(lon / cellDeg);
    const key = `${bi},${bj}`;
    if (!bins.has(key)) bins.set(key, []);
    bins.get(key).push({
      lat,
      lon,
      val,
      time: r.time,
      common_name: (r.common_name || "").trim(),
    });
  }

  const patches = [];
  for (const pts of bins.values()) {
    const years = pts
      .map((p) => (p.time ? parseInt(p.time.slice(0, 4), 10) : NaN))
      .filter(Number.isFinite);
    const yMin = years.length ? Math.min(...years) : 0;
    const yMax = years.length ? Math.max(...years) : 0;
    const yearLine = !years.length ? "—" : yMin === yMax ? `${yMax}` : `${yMin}–${yMax}`;

    const bi = Math.floor(pts[0].lat / cellDeg);
    const bj = Math.floor(pts[0].lon / cellDeg);
    const south = bi * cellDeg;
    const north = south + cellDeg;
    const west = bj * cellDeg;
    const east = west + cellDeg;

    const vals = pts.map((p) => p.val);
    const mean = vals.reduce((a, b) => a + b, 0) / vals.length;

    const nameCounts = new Map();
    for (const p of pts) {
      if (!p.common_name) continue;
      nameCounts.set(p.common_name, (nameCounts.get(p.common_name) || 0) + 1);
    }
    const topSpecies = [...nameCounts.entries()]
      .sort((a, b) => b[1] - a[1])
      .slice(0, 5)
      .map(([name]) => name);

    patches.push({ south, north, west, east, value: mean, yearLine, n: pts.length, topSpecies });
  }
  return patches;
}

export function larvaeValueRange(patches) {
  if (!patches.length) return null;
  const vals = patches.map((p) => p.value);
  return { min: Math.min(...vals), max: Math.max(...vals) };
}
