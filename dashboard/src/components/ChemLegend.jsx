import { motion } from "framer-motion";

export default function ChemLegend({ mode, minV, maxV }) {
  if (mode === "none") return null;

  const isPh = mode === "ph";
  const low = isPh ? "rgb(200, 40, 200)" : "rgb(30, 80, 200)";
  const high = isPh ? "rgb(200, 220, 80)" : "rgb(250, 250, 60)";
  const unit = isPh ? "pH" : "PSU (practical salinity)";
  const title = isPh ? "Surface pH (CalCOFI)" : "Surface salinity (CalCOFI)";

  return (
    <motion.div
      className="chem-legend-card"
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
    >
      <div className="chem-legend-card__title">{title}</div>
      <p className="chem-legend-card__subtitle">Grid patches · mean value per cell · hover shows year first, then reading</p>
      <div className="chem-legend-card__gradient" style={{ background: `linear-gradient(90deg, ${low}, ${high})` }} />
      <p className="chem-legend-card__range">
        {minV.toFixed(isPh ? 2 : 2)} – {maxV.toFixed(isPh ? 2 : 2)} {unit}
      </p>
      {isPh && (
        <p className="chem-legend-card__note">Sparse: pH is reported for very few bottle samples in this extract.</p>
      )}
    </motion.div>
  );
}
