import coverage2d from "../../images/coverage_2d.png";
import coverage3d from "../../images/coverage_3d.png";

export default function CoveragePlotsPanel({ mode = "both" }) {
  return (
    <div className="coverage-panel">
      <h3 className="timeline-chart__title">Coverage Plots</h3>
      <div className="coverage-panel__grid">
        {(mode === "both" || mode === "2d") && (
          <figure className="coverage-panel__card">
            <img src={coverage2d} alt="2D sampling locations coverage plot" />
            <figcaption>2D sampling locations coverage (CalCOFI, Argo, CORC, CCE1, CCE2).</figcaption>
          </figure>
        )}
        {(mode === "both" || mode === "3d") && (
          <figure className="coverage-panel__card">
            <img src={coverage3d} alt="3D sampling coverage with depth plot" />
            <figcaption>3D sampling coverage with depth proxy and pressure color scale.</figcaption>
          </figure>
        )}
      </div>
    </div>
  );
}
