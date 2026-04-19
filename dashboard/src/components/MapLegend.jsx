import { motion } from "framer-motion";

export default function MapLegend({ minTotal, maxTotal }) {
  const low = "rgb(255, 245, 200)";
  const high = "rgb(185, 0, 40)";

  return (
    <motion.div
      className="map-legend-card"
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35 }}
    >
      <div className="map-legend-card__title">Map legend</div>
      <div className="map-legend-card__row">
        <span className="map-legend-card__label">Color</span>
        <div className="map-legend-card__gradient" style={{ background: `linear-gradient(90deg, ${low}, ${high})` }} />
      </div>
      <p className="map-legend-card__hint">
        Warmer colors = higher <strong>total larvae</strong> at that station (among filtered species). Range in view:{" "}
        <strong>{Number.isFinite(minTotal) ? minTotal : "—"}</strong> –{" "}
        <strong>{Number.isFinite(maxTotal) ? maxTotal : "—"}</strong>.
      </p>
      <div className="map-legend-card__row map-legend-card__row--sizes">
        <span className="map-legend-card__label">Size</span>
        <div className="map-legend-card__circles">
          <span className="map-legend-card__c map-legend-card__c--sm" />
          <span className="map-legend-card__c map-legend-card__c--md" />
          <span className="map-legend-card__c map-legend-card__c--lg" />
        </div>
      </div>
      <p className="map-legend-card__hint">
        Larger circles = more total larvae at that location (same color scale). Radius grows with √larvae for readability.
      </p>
    </motion.div>
  );
}
