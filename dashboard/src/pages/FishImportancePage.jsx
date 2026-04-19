import WaveHeader from "../components/WaveHeader.jsx";
import fishClusterImage from "../../images/fish_cluster.jpeg";

export default function FishImportancePage() {
  return (
    <div className="info-page">
      <WaveHeader />
      <main className="info-page__content">
        <img
          className="info-page__hero"
          src={fishClusterImage}
          alt="Cluster of schooling fish swimming together"
        />
        <h2>Why Fish Matter to Our Ecosystem</h2>
        <p>
          Fish support ecosystem balance, nutrient cycling, coastal food webs, and human nutrition. Changes in larvae survival,
          habitat temperature, and acidity can cascade into adult populations and fisheries.
        </p>
        <h3>Food-web stability</h3>
        <p>
          Fish transfer energy between plankton, invertebrates, birds, mammals, and humans. If key forage fish decline, predator
          populations and ecosystem functions can destabilize quickly.
        </p>
        <h3>Ecosystem engineering and nutrient cycling</h3>
        <p>
          Many fish move nutrients across habitats (nearshore, kelp forests, reefs, deeper waters). Their feeding and migration
          behavior supports productivity and biodiversity at multiple trophic levels.
        </p>
        <h3>Why larvae monitoring is crucial</h3>
        <p>
          Larval stages are often the most climate-sensitive life stage. Changes in early survival can forecast future stock
          strength years before those fish enter fisheries, making larvae data a leading indicator for management.
        </p>
        <ul>
          <li>Larvae and juvenile stages are highly sensitive to temperature and chemistry shifts.</li>
          <li>Many predators, seabirds, and marine mammals depend on stable fish populations.</li>
          <li>Coastal communities rely on fish for jobs, food security, and cultural livelihoods.</li>
        </ul>
        <p>
          Monitoring fish larvae alongside ocean variables helps detect stress early and supports adaptive fisheries management.
        </p>
        <p className="info-page__sources">
          Sources:{" "}
          <a href="https://www.fisheries.noaa.gov/insight/understanding-our-changing-climate" target="_blank" rel="noreferrer">
            NOAA Fisheries
          </a>
          {" · "}
          <a href="https://www.fao.org/fishery/en/home" target="_blank" rel="noreferrer">
            FAO Fisheries and Aquaculture
          </a>
          {" · "}
          <a href="https://scripps.ucsd.edu/" target="_blank" rel="noreferrer">
            Scripps Institution of Oceanography
          </a>
        </p>
      </main>
    </div>
  );
}
