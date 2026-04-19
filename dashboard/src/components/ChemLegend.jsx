import { motion } from "framer-motion";

export default function ChemLegend({ mode, minV, maxV }) {
  if (mode === "none") return null;

  const isPh = mode === "ph";
  const isTemp = mode === "temperature";
  const isCoverage = mode === "coverage";
  const low = isPh ? "rgb(200, 40, 200)" : isTemp ? "rgb(40, 170, 235)" : isCoverage ? "rgb(25, 70, 220)" : "rgb(30, 80, 200)";
  const high = isPh ? "rgb(200, 220, 80)" : isTemp ? "rgb(255, 40, 35)" : isCoverage ? "rgb(255, 250, 40)" : "rgb(250, 250, 60)";
  const unit = isPh ? "pH" : isTemp ? "°C" : isCoverage ? "coverage index" : "PSU (practical salinity)";
  const title = isPh ? "Surface pH (Ocean Data)" : isTemp ? "Surface temperature" : isCoverage ? "Sampling coverage intensity" : "Surface salinity";

  return (
    <motion.div
      className="chem-legend-card"
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
    >
      <div className="chem-legend-card__title">{title}</div>
      <p className="chem-legend-card__subtitle">
        {isCoverage
          ? "Each dot is one station · color = coverage index · hover for year, value, and source"
          : "Grid patches · mean value per cell · hover shows year first, then reading"}
      </p>
      <div className="chem-legend-card__gradient" style={{ background: `linear-gradient(90deg, ${low}, ${high})` }} />
      <p className="chem-legend-card__range">
        {minV.toFixed(2)} – {maxV.toFixed(2)} {unit}
      </p>
      {isPh && (
        <p className="chem-legend-card__note">Sparse: pH is reported for very few bottle samples in this extract.</p>
      )}
    </motion.div>
  );
}
