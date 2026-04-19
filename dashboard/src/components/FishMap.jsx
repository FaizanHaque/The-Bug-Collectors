import { useEffect, useMemo, useRef } from "react";
import L from "leaflet";
import { motion } from "framer-motion";
import { buildStationTooltipHtml } from "../utils/aggregate.js";
import { colorSalinity, colorPh } from "../utils/chemColors.js";
import { buildChemPatches, patchValueRange } from "../utils/chemGrid.js";
import MapLegend from "./MapLegend.jsx";
import ChemLegend from "./ChemLegend.jsx";

function ylOrRd(t) {
  const r = 255;
  const g = Math.round(255 - t * 200);
  const b = Math.round(100 - t * 100);
  return `rgb(${r},${g},${b})`;
}

function patchTooltipHtml(patch) {
  if (patch.mode === "salinity") {
    return `<div class="chem-tip"><strong>Year</strong> ${patch.yearLine}<br/><strong>Salinity</strong> ${patch.value.toFixed(2)} PSU</div>`;
  }
  return `<div class="chem-tip"><strong>Year</strong> ${patch.yearLine}<br/><strong>pH</strong> ${patch.value.toFixed(3)}</div>`;
}

export default function FishMap({ stations, mapKey, envOverlay, chemPoints }) {
  const mapRef = useRef(null);
  const mapInstanceRef = useRef(null);
  const layerRef = useRef(null);
  const chemLayerRef = useRef(null);

  const totals = stations.length ? stations.map((s) => s.totalLarvae) : [0, 1];
  const minT = Math.min(...totals);
  const maxT = Math.max(...totals);

  const chemPatches = useMemo(() => buildChemPatches(chemPoints, envOverlay, 0.38), [chemPoints, envOverlay]);

  const chemRange = useMemo(() => {
    if (envOverlay === "none" || !chemPatches.length) return null;
    return patchValueRange(chemPatches);
  }, [chemPatches, envOverlay]);

  useEffect(() => {
    if (!mapRef.current || mapInstanceRef.current) return;
    const map = L.map(mapRef.current, { scrollWheelZoom: true }).setView([33.5, -122.5], 6);
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
    const map = mapInstanceRef.current;
    const layer = layerRef.current;
    if (!map || !layer) return;

    layer.clearLayers();

    const span = maxT - minT || 1;

    for (const st of stations) {
      const t = (st.totalLarvae - minT) / span;
      const fill = ylOrRd(t);
      const r = Math.min(32, 5 + Math.sqrt(st.totalLarvae) * 1.35);

      const circle = L.circleMarker([st.lat, st.lng], {
        radius: r,
        color: "#0f172a",
        weight: 1.5,
        fillColor: fill,
        fillOpacity: 0.88,
      });

      const html = buildStationTooltipHtml(st);
      circle.bindTooltip(html, {
        sticky: true,
        direction: "top",
        opacity: 1,
        maxWidth: 560,
        className: "station-tooltip-shell",
      });

      layer.addLayer(circle);
    }
  }, [stations, mapKey, minT, maxT]);

  useEffect(() => {
    const chemLayer = chemLayerRef.current;
    if (!chemLayer) return;

    chemLayer.clearLayers();
    if (envOverlay === "none" || !chemPatches.length || !chemRange) return;

    const { min: cmin, max: cmax } = chemRange;

    for (const patch of chemPatches) {
      const fill =
        patch.mode === "salinity"
          ? colorSalinity(patch.value, cmin, cmax)
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
  }, [envOverlay, chemPatches, chemRange]);

  useEffect(() => {
    const map = mapInstanceRef.current;
    const fishLayer = layerRef.current;
    const chemLayer = chemLayerRef.current;
    if (!map) return;

    const b1 = fishLayer?.getBounds();
    const b2 = chemLayer?.getBounds();
    let b = null;
    if (b1?.isValid()) b = b1;
    if (b2?.isValid()) {
      b = b ? b.extend(b2) : b2;
    }
    if (b?.isValid()) {
      map.fitBounds(b.pad(0.12));
    }
  }, [stations, mapKey, envOverlay, chemPatches]);

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
        {stations.length > 0 && <MapLegend minTotal={minT} maxTotal={maxT} />}
        {envOverlay !== "none" && chemRange && (
          <ChemLegend mode={envOverlay} minV={chemRange.min} maxV={chemRange.max} />
        )}
      </div>
    </motion.div>
  );
}
