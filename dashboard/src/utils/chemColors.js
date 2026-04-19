/** Salinity (PSU): cool blue (low) → warm yellow (high) */
export function colorSalinity(value, min, max) {
  const span = max - min || 1;
  const t = Math.min(1, Math.max(0, (value - min) / span));
  const r = Math.round(30 + t * 220);
  const g = Math.round(80 + t * 170);
  const b = Math.round(200 - t * 160);
  return `rgb(${r},${g},${b})`;
}

/** pH: purple (acidic) → green (basic) */
export function colorPh(value, min, max) {
  const span = max - min || 1;
  const t = Math.min(1, Math.max(0, (value - min) / span));
  const r = Math.round(120 + t * 80);
  const g = Math.round(40 + t * 180);
  const b = Math.round(200 - t * 120);
  return `rgb(${r},${g},${b})`;
}

/** Temperature (°C): cool cyan (low) -> warm red (high) */
export function colorTemperature(value, min, max) {
  const span = max - min || 1;
  const t = Math.min(1, Math.max(0, (value - min) / span));
  const r = Math.round(40 + t * 215);
  const g = Math.round(170 - t * 130);
  const b = Math.round(235 - t * 200);
  return `rgb(${r},${g},${b})`;
}

/** Coverage index: deep blue (low) -> warm yellow (high) */
export function colorCoverage(value, min, max) {
  const span = max - min || 1;
  const t = Math.min(1, Math.max(0, (value - min) / span));
  const r = Math.round(25 + t * 230);
  const g = Math.round(70 + t * 180);
  const b = Math.round(220 - t * 180);
  return `rgb(${r},${g},${b})`;
}
