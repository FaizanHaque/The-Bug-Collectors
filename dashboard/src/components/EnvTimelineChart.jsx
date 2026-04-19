import { useMemo } from "react";

function linePath(points, w, h, pad, yMin, yMax) {
  if (!points.length) return "";
  const xs = points.map((p) => p.x);
  const xMin = Math.min(...xs);
  const xMax = Math.max(...xs);
  const xSpan = xMax - xMin || 1;
  const ySpan = yMax - yMin || 1;
  const toX = (x) => pad + ((x - xMin) / xSpan) * (w - pad * 2);
  const toY = (y) => h - pad - ((y - yMin) / ySpan) * (h - pad * 2);
  return points.map((p, i) => `${i === 0 ? "M" : "L"} ${toX(p.x).toFixed(2)} ${toY(p.y).toFixed(2)}`).join(" ");
}

export default function EnvTimelineChart({ rows, metric, selectedYear, yDomain }) {
  const data = useMemo(() => {
    const perYear = new Map();
    for (const r of rows) {
      if (!r.year) continue;
      const v =
        metric === "temperature"
          ? r.temperature
          : metric === "ph"
            ? r.ph
          : metric === "salinity"
            ? r.salinity
            : metric === "fish"
              ? r.metric
              : r.salinity;
      if (!Number.isFinite(v)) continue;
      if (!perYear.has(r.year)) perYear.set(r.year, { metric: 0, n: 0 });
      const item = perYear.get(r.year);
      item.metric += v;
      item.n += 1;
    }
    return [...perYear.entries()]
      .sort((a, b) => a[0] - b[0])
      .map(([year, v]) => ({
        year,
        metric: v.metric / v.n,
      }));
  }, [rows, metric]);

  if (!data.length) return null;
  const plotWidth = 640;
  const plotHeight = 250;
  const pad = 34;
  const yMin = 0;
  const yMax = Math.max(yDomain?.max ?? Math.max(...data.map((d) => d.metric)), 1);
  const metricPath = linePath(
    data.map((d) => ({ x: d.year, y: d.metric })),
    plotWidth,
    plotHeight,
    pad,
    yMin,
    yMax
  );

  const years = data.map((d) => d.year);
  const minYear = Math.min(...years);
  const maxYear = Math.max(...years);
  const xSpan = maxYear - minYear || 1;
  const markerX = pad + (((selectedYear ?? minYear) - minYear) / xSpan) * (plotWidth - pad * 2);
  const yTicks = [0, 0.25, 0.5, 0.75, 1].map((t) => ({ value: yMin + t * (yMax - yMin) }));
  const unit = metric === "temperature" ? "°C" : metric === "ph" ? "pH" : "PSU";

  return (
    <div className="timeline-chart">
      <h3 className="timeline-chart__title">
        {metric === "temperature"
          ? "Temperature timeline graph"
          : metric === "ph"
            ? "Ocean pH timeline graph"
          : metric === "salinity"
            ? "Larvae salinity timeline graph"
            : "Fish larvae count timeline graph"}
      </h3>
      <svg viewBox={`0 0 ${plotWidth} ${plotHeight}`} className="timeline-chart__svg" role="img" aria-label="Timeline chart">
        <rect x="0" y="0" width={plotWidth} height={plotHeight} fill="rgba(15, 23, 42, 0.5)" />
        {yTicks.map((tick) => {
          const y = plotHeight - pad - ((tick.value - yMin) / (yMax - yMin || 1)) * (plotHeight - pad * 2);
          return (
            <g key={tick.value}>
              <line x1={pad} y1={y} x2={plotWidth - pad} y2={y} stroke="rgba(148,163,184,0.25)" />
              <text x={pad - 6} y={y + 4} textAnchor="end" fill="#cbd5e1" fontSize="10">
                {tick.value.toFixed(metric === "ph" ? 2 : 1)}
              </text>
            </g>
          );
        })}
        <line x1={pad} y1={plotHeight - pad} x2={plotWidth - pad} y2={plotHeight - pad} stroke="rgba(148,163,184,0.7)" />
        <line x1={pad} y1={pad} x2={pad} y2={plotHeight - pad} stroke="rgba(148,163,184,0.7)" />
        <line x1={markerX} y1={pad} x2={markerX} y2={plotHeight - pad} stroke="#f59e0b" strokeDasharray="4 4" />
        <path d={metricPath} fill="none" stroke="#38bdf8" strokeWidth="3" />
        {Array.from({ length: maxYear - minYear + 1 }, (_, i) => minYear + i).map((year) => {
          const x = pad + ((year - minYear) / xSpan) * (plotWidth - pad * 2);
          return (
            <text key={year} x={x} y={plotHeight - 12} textAnchor="middle" fill="#cbd5e1" fontSize="9">
              {year}
            </text>
          );
        })}
        <text x={pad + 4} y={pad - 8} fill="#cbd5e1" fontSize="10">
          Unit: {unit}
        </text>
      </svg>
      <p className="timeline-chart__note">Blue line is yearly mean. Dashed marker shows the selected year on the map.</p>
    </div>
  );
}
