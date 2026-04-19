import { useEffect, useMemo, useRef } from "react";
import L from "leaflet";
import { motion } from "framer-motion";
import { colorSalinity, colorPh, colorTemperature } from "../utils/chemColors.js";
import { buildChemPatches, patchValueRange } from "../utils/chemGrid.js";
import { larvaeColor } from "../utils/larvaeColors.js";
import MapLegend from "./MapLegend.jsx";
import ChemLegend from "./ChemLegend.jsx";

function patchTooltipHtml(patch) {
  if (patch.mode === "salinity") {
    return `<div class="chem-tip"><strong>Year</strong> ${patch.yearLine}<br/><strong>Salinity</strong> ${patch.value.toFixed(2)} PSU</div>`;
  }
  if (patch.mode === "temperature") {
    return `<div class="chem-tip"><strong>Year</strong> ${patch.yearLine}<br/><strong>Temperature</strong> ${patch.value.toFixed(2)} °C</div>`;
  }
  return `<div class="chem-tip"><strong>Year</strong> ${patch.yearLine}<br/><strong>pH</strong> ${patch.value.toFixed(3)}</div>`;
}

function larvaePatchTooltipHtml(patch) {
  const topThree = patch.topSpecies?.slice(0, 3) ?? [];
  const speciesLine =
    topThree.length > 0
      ? `<br/><strong>Fish larvae present</strong><br/>${topThree.join("<br/>")}`
      : "";
  return `<div class="larvae-tip"><strong>Year</strong> ${patch.yearLine}<br/><strong>Mean larvae</strong> ${patch.value.toFixed(2)} / 10m²<br/><strong>Samples</strong> ${patch.n}${speciesLine}</div>`;
}

export default function FishMap({ larvaePatches, larvaeRange, patchMode, points, valueRange }) {
  const mapRef = useRef(null);
  const mapInstanceRef = useRef(null);
  const layerRef = useRef(null);
  const chemLayerRef = useRef(null);

  const patches = useMemo(() => buildChemPatches(points, patchMode, 0.38), [points, patchMode]);

  const patchRange = useMemo(() => {
    if (patchMode === "none") return null;
    if (valueRange) return valueRange;
    return patchValueRange(patches);
  }, [patchMode, patches, valueRange]);

  useEffect(() => {
    if (!mapRef.current || mapInstanceRef.current) return;
    const map = L.map(mapRef.current, { scrollWheelZoom: true }).setView([33.5, -119.0], 7);
    L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
      attribution: "&copy; OpenStreetMap",
      maxZoom: 18,
    }).addTo(map);
    chemLayerRef.current = L.featureGroup().addTo(map);
    layerRef.current = L.featureGroup().addTo(map);
    mapInstanceRef.current = map;
    return () => {
      map.remove();
      mapInstanceRef.current = null;
      layerRef.current = null;
      chemLayerRef.current = null;
      if (mapRef.current) {
        mapRef.current.replaceChildren();
      }
    };
  }, []);

  useEffect(() => {
    const layer = layerRef.current;
    if (!layer) return;

    layer.clearLayers();
    if (!larvaePatches?.length || !larvaeRange) return;

    const { min: lmin, max: lmax } = larvaeRange;

    for (const patch of larvaePatches) {
      const fill = larvaeColor(patch.value, lmin, lmax);
      const bounds = [
        [patch.south, patch.west],
        [patch.north, patch.east],
      ];
      const rect = L.rectangle(bounds, {
        stroke: true,
        color: "rgba(15, 23, 42, 0.45)",
        weight: 0.75,
        fillColor: fill,
        fillOpacity: 0.65,
      });
      rect.bindTooltip(larvaePatchTooltipHtml(patch), {
        sticky: true,
        direction: "auto",
        opacity: 1,
        className: "larvae-tooltip-shell",
      });
      layer.addLayer(rect);
    }
  }, [larvaePatches, larvaeRange]);

  useEffect(() => {
    const chemLayer = chemLayerRef.current;
    if (!chemLayer) return;

    chemLayer.clearLayers();
    if (patchMode === "none" || !patches.length || !patchRange) return;

    const { min: cmin, max: cmax } = patchRange;

    for (const patch of patches) {
      const fill =
        patch.mode === "salinity"
          ? colorSalinity(patch.value, cmin, cmax)
          : patch.mode === "temperature"
            ? colorTemperature(patch.value, cmin, cmax)
            : colorPh(patch.value, cmin, cmax);

      const bounds = [
        [patch.south, patch.west],
        [patch.north, patch.east],
      ];

      const rect = L.rectangle(bounds, {
        stroke: true,
        color: "rgba(15, 23, 42, 0.45)",
        weight: 0.75,
        fillColor: fill,
        fillOpacity: 0.52,
      });

      rect.bindTooltip(patchTooltipHtml(patch), {
        sticky: true,
        direction: "auto",
        opacity: 1,
        className: "chem-tooltip-shell",
      });

      chemLayer.addLayer(rect);
    }
  }, [patchMode, patches, patchRange]);

  // Keep viewport stable while dragging timeline (no auto fit on data updates).

  return (
    <motion.div
      className="map-zone"
      layout
      initial={{ opacity: 0.88, scale: 0.992 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.45, ease: [0.4, 0, 0.2, 1] }}
    >
      <div className="map-shell">
        <div ref={mapRef} className="fish-map" />
        {larvaePatches?.length > 0 && larvaeRange && (
          <MapLegend minV={larvaeRange.min} maxV={larvaeRange.max} />
        )}
        {patchMode !== "none" && patchRange && (
          <ChemLegend mode={patchMode} minV={patchRange.min} maxV={patchRange.max} />
        )}
      </div>
    </motion.div>
  );
}
