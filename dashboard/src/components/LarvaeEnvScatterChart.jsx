import { useMemo, useRef, useState } from "react";

function scale(v, min, max, outMin, outMax) {
  const span = max - min || 1;
  const t = Math.max(0, Math.min(1, (v - min) / span));
  return outMin + t * (outMax - outMin);
}

export default function LarvaeEnvScatterChart({ rows }) {
  const svgRef = useRef(null);
  const [hover, setHover] = useState(null);
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
  const legendStops = [0, 0.33, 0.66, 1].map((t) => {
    const v = lMin + t * (lMax - lMin);
    const g = Math.round(scale(v, lMin, lMax, 60, 240));
    return { t, v, color: `rgb(40, ${g}, 180)` };
  });

  return (
    <div className="timeline-chart">
      <h3 className="timeline-chart__title">Temperature vs Salinity with Larvae Count</h3>
      <svg
        ref={svgRef}
        viewBox={`0 0 ${w} ${h}`}
        className="timeline-chart__svg timeline-chart__svg--tall"
        role="img"
        aria-label="Temperature salinity larvae scatter"
      >
        <rect x="0" y="0" width={w} height={h} fill="rgba(15,23,42,0.78)" />
        <line x1={p} y1={h - p} x2={w - p} y2={h - p} stroke="#94a3b8" />
        <line x1={p} y1={p} x2={p} y2={h - p} stroke="#94a3b8" />
        <defs>
          <linearGradient id="larvaeScale" x1="0%" y1="100%" x2="0%" y2="0%">
            <stop offset="0%" stopColor="rgb(40, 60, 180)" />
            <stop offset="100%" stopColor="rgb(40, 240, 180)" />
          </linearGradient>
        </defs>
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
              stroke="rgba(15, 23, 42, 0.55)"
              strokeWidth="0.6"
              onMouseMove={(e) => {
                const rect = svgRef.current?.getBoundingClientRect();
                if (!rect) return;
                setHover({
                  x: e.clientX - rect.left + 10,
                  y: e.clientY - rect.top + 10,
                  text: `Year ${r.year} | Temp ${r.temperature.toFixed(2)} °C | Sal ${r.salinity.toFixed(3)} PSU | Larvae ${r.larvae10m2.toFixed(2)} /10m²`,
                });
              }}
              onMouseLeave={() => setHover(null)}
            >
              <title>
                {`Year: ${r.year}
Temperature: ${r.temperature.toFixed(2)} °C
Salinity: ${r.salinity.toFixed(3)} PSU
Larvae count: ${r.larvae10m2.toFixed(2)} / 10m²`}
              </title>
            </circle>
          );
        })}
        <text x={w / 2} y={h - 10} textAnchor="middle" fill="#bfdbfe" fontSize="11">
          Temperature at Depth 0 (°C)
        </text>
        <text x="14" y={h / 2} textAnchor="middle" fill="#bfdbfe" fontSize="11" transform={`rotate(-90 14 ${h / 2})`}>
          Salinity at Depth 0 (PSU)
        </text>
        <g transform={`translate(${w - 132}, ${p + 6})`}>
          <rect x="0" y="0" width="120" height="128" rx="8" ry="8" fill="rgba(15,23,42,0.8)" stroke="#94a3b8" />
          <text x="8" y="16" fontSize="10" fill="#bfdbfe" fontWeight="600">
            Larvae scale
          </text>
          <rect x="10" y="24" width="12" height="72" fill="url(#larvaeScale)" stroke="#94a3b8" />
          {legendStops.map((s, idx) => (
            <g key={idx}>
              <line x1="24" y1={24 + (1 - s.t) * 72} x2="28" y2={24 + (1 - s.t) * 72} stroke="#94a3b8" />
              <text x="32" y={27 + (1 - s.t) * 72} fontSize="9" fill="#bfdbfe">
                {s.v.toFixed(0)} / 10m²
              </text>
            </g>
          ))}
          <text x="8" y="112" fontSize="9" fill="#bfdbfe">
            Marker size = larvae
          </text>
        </g>
      </svg>
      {hover && (
        <div className="chart-tooltip" style={{ left: `${hover.x}px`, top: `${hover.y}px` }}>
          {hover.text}
        </div>
      )}
      <p className="timeline-chart__note">
        Hover a point to inspect Year, Temperature (°C), Salinity (PSU), and larvae count (/ 10m²).
      </p>
    </div>
  );
}
