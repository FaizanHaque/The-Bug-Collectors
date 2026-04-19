import WaveHeader from "../components/WaveHeader.jsx";
import beachImage from "../../images/beaches.jpeg";

export default function OceanStatusPage() {
  return (
    <div className="info-page">
      <WaveHeader />
      <main className="info-page__content">
        <img
          className="info-page__hero"
          src={beachImage}
          alt="Long Beach coastline and ocean horizon"
        />
        <h2>Whats Happening to Our Oceans</h2>
        <p>
          The ocean is undergoing linked physical and chemical changes: warming water, shifting oxygen levels, rising sea level,
          and long-term acidification. These are not isolated trends. They interact and can amplify stress on marine ecosystems.
        </p>
        <h3>1) Ocean warming and marine heatwaves</h3>
        <p>
          Global ocean heat content has increased for decades, and coastal systems now experience more frequent marine heatwaves.
          Warm anomalies change growth rates, spawning windows, and migration pathways. In many regions, species track cooler water
          poleward or deeper, disrupting historic food-web relationships and local fisheries planning.
        </p>
        <h3>2) Ocean acidification (pH decline)</h3>
        <p>
          The ocean absorbs atmospheric carbon dioxide. This shifts seawater chemistry and lowers pH over time. Scripps explains
          that acidification reduces carbonate availability used by shell-forming organisms, affecting calcifiers and potentially
          food-web stability. Even where pH changes appear numerically small, they represent meaningful chemical shifts.
        </p>
        <h3>3) Multi-stressor pressure on ecosystems</h3>
        <p>
          Warming, acidity, deoxygenation, and pollution rarely occur one at a time. When stressors overlap, biological responses
          can be nonlinear: reduced larval survival, altered predator-prey timing, and habitat compression. This is one reason
          climate-ready management emphasizes continuous monitoring and adaptive decisions.
        </p>
        <h3>4) Why this matters for California waters</h3>
        <p>
          California Current ecosystems are dynamic even in normal years. Added climate stress increases variability in fish
          recruitment and habitat suitability. Tracking larvae, salinity, pH, and temperature together helps detect ecosystem
          shifts early enough to support better scientific and policy responses.
        </p>
        <h3>Key takeaways</h3>
        <ul>
          <li>Ocean change is ongoing and measurable, not hypothetical.</li>
          <li>pH, temperature, and biology should be interpreted together.</li>
          <li>Long time series are essential to separate normal variability from persistent change.</li>
          <li>Local action and global emissions reductions are both necessary.</li>
        </ul>
        <p className="info-page__sources">
          Sources:{" "}
          <a href="https://scripps.ucsd.edu/research/climate-change-resources/faq-ocean-acidification" target="_blank" rel="noreferrer">
            Scripps Ocean Acidification FAQ
          </a>
          {" · "}
          <a href="https://www.fisheries.noaa.gov/insight/understanding-our-changing-climate" target="_blank" rel="noreferrer">
            NOAA Fisheries Climate Insight
          </a>
          {" · "}
          <a href="https://www.ipcc.ch/report/ar6/wg2/chapter/chapter-3/" target="_blank" rel="noreferrer">
            IPCC AR6 WGII Chapter 3
          </a>
        </p>
      </main>
    </div>
  );
}
