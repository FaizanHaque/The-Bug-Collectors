import WaveHeader from "../components/WaveHeader.jsx";
import divingImage from "../../images/diving.jpeg";

export default function WhatWeCanDoPage() {
  return (
    <div className="info-page">
      <WaveHeader />
      <main className="info-page__content">
        <img
          className="info-page__hero info-page__hero--divers"
          src={divingImage}
          alt="Divers swimming in the ocean"
        />
        <h2>What We Can Do</h2>
        <p>Individual and community actions can reduce pressure on ocean ecosystems right now.</p>
        <h3>At home and in daily choices</h3>
        <ul>
          <li>Lower carbon emissions (transport, energy use, efficiency) to limit warming and acidification drivers.</li>
          <li>Choose sustainably managed seafood and support science-based fisheries policy.</li>
          <li>Reduce nutrient/plastic runoff from homes and neighborhoods into coastal watersheds.</li>
        </ul>
        <h3>In local communities</h3>
        <ul>
          <li>Support marine protected areas, habitat restoration, and long-term monitoring programs.</li>
          <li>Engage locally: cleanup efforts, citizen science, and ocean education initiatives.</li>
          <li>Advocate for resilient coastal planning that protects wetlands, estuaries, and nursery habitats.</li>
        </ul>
        <h3>Through policy and institutions</h3>
        <p>
          The fastest long-term gains come from combined action: emissions reductions, effective fisheries governance, pollution
          controls, and investment in ocean observing systems. Individual behavior matters, but durable improvement also requires
          institutional change.
        </p>
        <p className="info-page__sources">
          Sources:{" "}
          <a href="https://www.noaa.gov/education/resource-collections/ocean-coasts/ocean-pollution" target="_blank" rel="noreferrer">
            NOAA Ocean Pollution
          </a>
          {" · "}
          <a href="https://www.unep.org/explore-topics/oceans-seas" target="_blank" rel="noreferrer">
            UNEP Oceans and Seas
          </a>
          {" · "}
          <a href="https://www.nature.org/en-us/what-we-do/our-insights/perspectives/how-to-help-ocean/" target="_blank" rel="noreferrer">
            The Nature Conservancy
          </a>
        </p>
      </main>
    </div>
  );
}
