import { motion } from "framer-motion";

export default function MapLegend({ minV, maxV }) {
  const low = "rgb(255, 255, 50)";
  const high = "rgb(255, 0, 0)";

  return (
    <motion.div
      className="map-legend-card"
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35 }}
    >
      <div className="map-legend-card__title">Larvae density</div>
      <div className="map-legend-card__row">
        <span className="map-legend-card__label">Color</span>
        <div className="map-legend-card__gradient" style={{ background: `linear-gradient(90deg, ${low}, ${high})` }} />
      </div>
      <p className="map-legend-card__hint">
        Warmer colors = higher <strong>mean larvae / 10 m²</strong> per grid cell. Range:{" "}
        <strong>{Number.isFinite(minV) ? minV.toFixed(2) : "—"}</strong> –{" "}
        <strong>{Number.isFinite(maxV) ? maxV.toFixed(2) : "—"}</strong>
      </p>
    </motion.div>
  );
}
