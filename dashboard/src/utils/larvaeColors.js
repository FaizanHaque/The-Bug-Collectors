/** Larvae density (mean larvae/10m²): pale yellow (sparse) → deep red (dense) */
export function larvaeColor(value, min, max) {
  const span = max - min || 1;
  const t = Math.min(1, Math.max(0, (value - min) / span));
  const r = 255;
  const g = Math.round(255 - t * 200);
  const b = Math.round(50 - t * 50);
  return `rgb(${r},${g},${b})`;
}
