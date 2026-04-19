import { useMemo } from "react";

function scale(v, min, max, outMin, outMax) {
  const span = max - min || 1;
  const t = Math.max(0, Math.min(1, (v - min) / span));
  return outMin + t * (outMax - outMin);
}

export default function LarvaeEnvScatterChart({ rows }) {
  const points = useMemo(() => {
    const clean = rows.filter(
      (r) => Number.isFinite(r.temperature) && Number.isFinite(r.salinity) && Number.isFinite(r.larvae10m2)
    );
    if (!clean.length) return null;
    const tMin = Math.min(...clean.map((r) => r.temperature));
    const tMax = Math.max(...clean.map((r) => r.temperature));
    const sMin = Math.min(...clean.map((r) => r.salinity));
    const sMax = Math.max(...clean.map((r) => r.salinity));
    const lMin = 0;
    const lMax = Math.max(...clean.map((r) => r.larvae10m2));
    return { clean, tMin, tMax, sMin, sMax, lMin, lMax };
  }, [rows]);

  if (!points) return null;
  const w = 680;
  const h = 420;
  const p = 46;
  const { clean, tMin, tMax, sMin, sMax, lMin, lMax } = points;

  return (
    <div className="timeline-chart">
      <h3 className="timeline-chart__title">Temperature vs Salinity with Larvae Count</h3>
      <svg viewBox={`0 0 ${w} ${h}`} className="timeline-chart__svg timeline-chart__svg--tall" role="img" aria-label="Temperature salinity larvae scatter">
        <rect x="0" y="0" width={w} height={h} fill="rgba(15, 23, 42, 0.5)" />
        <line x1={p} y1={h - p} x2={w - p} y2={h - p} stroke="rgba(148,163,184,0.7)" />
        <line x1={p} y1={p} x2={p} y2={h - p} stroke="rgba(148,163,184,0.7)" />
        {clean.map((r, i) => {
          const x = scale(r.temperature, tMin, tMax, p, w - p);
          const y = scale(r.salinity, sMin, sMax, h - p, p);
          const radius = scale(r.larvae10m2, lMin, lMax, 2, 11);
          const g = Math.round(scale(r.larvae10m2, lMin, lMax, 60, 240));
          return (
            <circle
              key={`${r.year}-${i}`}
              cx={x}
              cy={y}
              r={radius}
              fill={`rgba(40, ${g}, 180, 0.35)`}
              stroke="rgba(226, 232, 240, 0.6)"
              strokeWidth="0.6"
            />
          );
        })}
        <text x={w / 2} y={h - 10} textAnchor="middle" fill="#cbd5e1" fontSize="11">
          Temperature at Depth 0 (°C)
        </text>
        <text x="14" y={h / 2} textAnchor="middle" fill="#cbd5e1" fontSize="11" transform={`rotate(-90 14 ${h / 2})`}>
          Salinity at Depth 0 (PSU)
        </text>
      </svg>
      <p className="timeline-chart__note">Point size and color intensity represent larvae count (higher = larger/brighter).</p>
    </div>
  );
}
