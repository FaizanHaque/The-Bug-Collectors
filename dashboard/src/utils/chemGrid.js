/**
 * Aggregate CalCOFI points into lat/lon grid cells as colored "patches"
 * (rectangles) for a field-like view instead of individual circles.
 */
export function buildChemPatches(points, mode, cellDeg = 0.38) {
  if (mode === "none" || !points?.length) return [];

  const bins = new Map();
  for (const p of points) {
    if (mode === "salinity" && !Number.isFinite(p.salinity)) continue;
    if (mode === "ph" && !Number.isFinite(p.ph)) continue;

    const bi = Math.floor(p.lat / cellDeg);
    const bj = Math.floor(p.lon / cellDeg);
    const key = `${bi},${bj}`;
    if (!bins.has(key)) bins.set(key, []);
    bins.get(key).push(p);
  }

  const patches = [];
  for (const pts of bins.values()) {
    const years = pts.map((p) => p.year).filter((y) => y > 0);
    const yMin = years.length ? Math.min(...years) : 0;
    const yMax = years.length ? Math.max(...years) : 0;
    const yearLine = !years.length ? "—" : yMin === yMax ? `${yMax}` : `${yMin}–${yMax}`;

    const bi = Math.floor(pts[0].lat / cellDeg);
    const bj = Math.floor(pts[0].lon / cellDeg);
    const south = bi * cellDeg;
    const north = south + cellDeg;
    const west = bj * cellDeg;
    const east = west + cellDeg;

    if (mode === "salinity") {
      const vals = pts.map((p) => p.salinity).filter(Number.isFinite);
      if (!vals.length) continue;
      const mean = vals.reduce((a, b) => a + b, 0) / vals.length;
      patches.push({
        south,
        west,
        north,
        east,
        value: mean,
        yearLine,
        n: pts.length,
        mode: "salinity",
      });
    } else {
      const vals = pts.map((p) => p.ph).filter(Number.isFinite);
      if (!vals.length) continue;
      const mean = vals.reduce((a, b) => a + b, 0) / vals.length;
      patches.push({
        south,
        west,
        north,
        east,
        value: mean,
        yearLine,
        n: pts.length,
        mode: "ph",
      });
    }
  }
  return patches;
}

export function patchValueRange(patches) {
  if (!patches.length) return null;
  const vals = patches.map((p) => p.value);
  return { min: Math.min(...vals), max: Math.max(...vals) };
}
