import { useCallback, useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { parseCsv, rowYear } from "./utils/parseCsv.js";
import { aggregateStations } from "./utils/aggregate.js";
import { parseChemCsv } from "./utils/normalizeChem.js";
import WaveHeader from "./components/WaveHeader.jsx";
import FishMap from "./components/FishMap.jsx";
import FilterPanel from "./components/FilterPanel.jsx";
import { motion } from "framer-motion";

function uniqueCommonNames(rows) {
  const s = new Set();
  for (const r of rows) {
    const n = (r.common_name || "").trim();
    if (n) s.add(n);
  }
  return [...s].sort((a, b) => a.localeCompare(b));
}

export default function Dashboard() {
  const [rawRows, setRawRows] = useState([]);
  const [fishError, setFishError] = useState(null);
  const [fishLoading, setFishLoading] = useState(true);

  const [draftSelected, setDraftSelected] = useState(() => new Set());
  const [appliedSelected, setAppliedSelected] = useState(() => new Set());
  const [search, setSearch] = useState("");
  const [mapKey, setMapKey] = useState(0);

  const [chemRows, setChemRows] = useState([]);
  const [chemError, setChemError] = useState(null);
  const [chemLoading, setChemLoading] = useState(true);
  const [envOverlay, setEnvOverlay] = useState("salinity");
  const [dataset, setDataset] = useState("fish");

  useEffect(() => {
    const url = `${import.meta.env.BASE_URL}data/fish.csv`;
    setFishLoading(true);
    fetch(url)
      .then((r) => {
        if (!r.ok) throw new Error(`Could not load fish.csv (${r.status}). Is public/data/fish.csv present?`);
        return r.text();
      })
      .then((t) => {
        const rows = parseCsv(t);
        setRawRows(rows);
        setFishError(null);
        const names = uniqueCommonNames(rows);
        setDraftSelected(new Set(names));
        setAppliedSelected(new Set(names));
      })
      .catch((e) => {
        setFishError(String(e.message || e));
        setRawRows([]);
      })
      .finally(() => setFishLoading(false));
  }, []);

  useEffect(() => {
    const url = `${import.meta.env.BASE_URL}data/calcofi_surface.csv`;
    setChemLoading(true);
    fetch(url)
      .then((r) => {
        if (!r.ok) throw new Error(`Could not load CalCOFI file (${r.status})`);
        return r.text();
      })
      .then((t) => {
        setChemRows(parseChemCsv(t));
        setChemError(null);
      })
      .catch((e) => {
        setChemError(String(e.message || e));
        setChemRows([]);
      })
      .finally(() => setChemLoading(false));
  }, []);

  const allNames = useMemo(() => uniqueCommonNames(rawRows), [rawRows]);

  const chemPhCount = useMemo(() => chemRows.filter((p) => p.ph != null).length, [chemRows]);

  const chemForMap = useMemo(() => {
    if (dataset !== "water") return [];
    if (envOverlay === "ph") return chemRows.filter((p) => p.ph != null);
    return chemRows;
  }, [dataset, chemRows, envOverlay]);

  const dirty = useMemo(() => {
    if (draftSelected.size !== appliedSelected.size) return true;
    for (const n of draftSelected) {
      if (!appliedSelected.has(n)) return true;
    }
    return false;
  }, [draftSelected, appliedSelected]);

  const filteredRows = useMemo(() => {
    if (appliedSelected.size === 0) return [];
    if (appliedSelected.size === allNames.length) return rawRows;
    const set = appliedSelected;
    return rawRows.filter((r) => set.has((r.common_name || "").trim()));
  }, [rawRows, appliedSelected, allNames.length]);

  const stations = useMemo(() => aggregateStations(filteredRows), [filteredRows]);

  const onApply = useCallback(() => {
    setAppliedSelected(new Set(draftSelected));
    setMapKey((k) => k + 1);
  }, [draftSelected]);

  const onDatasetChange = useCallback((next) => {
    setDataset(next);
    if (next === "water") {
      setEnvOverlay((e) => (e === "none" ? "salinity" : e));
    }
    setMapKey((k) => k + 1);
  }, []);

  const statusText = useMemo(() => {
    if (fishLoading) return "Loading fish data…";
    if (fishError) return `Fish data error: ${fishError}`;
    if (dataset === "water") {
      const layer = envOverlay === "ph" ? "pH patches" : "salinity patches";
      if (chemLoading) return "Loading CalCOFI…";
      if (chemError) return `CalCOFI · ${layer} · failed: ${chemError}`;
      return `CalCOFI · ${layer} · ${chemRows.length} surface samples (${chemPhCount} with pH). Toggle to Fish larvae for the species map.`;
    }
    if (appliedSelected.size === 0) return "Select at least one species, then Apply.";
    const years = new Set();
    for (const r of filteredRows) {
      const y = rowYear(r.time);
      if (y) years.add(y);
    }
    const yStr = [...years].sort((a, b) => b - a).join(", ");
    return `${filteredRows.length} rows · ${stations.length} stations · years: ${yStr || "—"}`;
  }, [
    fishLoading,
    fishError,
    dataset,
    envOverlay,
    chemLoading,
    chemRows.length,
    chemPhCount,
    chemError,
    filteredRows,
    stations.length,
    appliedSelected.size,
  ]);

  if (fishLoading) {
    return (
      <div className="app app--loading">
        <WaveHeader />
        <p className="app-loading-msg">Loading dashboard data…</p>
      </div>
    );
  }

  if (fishError && rawRows.length === 0) {
    return (
      <div className="app app--loading">
        <WaveHeader />
        <div className="app-error-panel">
          <h2>Could not load fish data</h2>
          <p>{fishError}</p>
          <p className="app-error-hint">
            Ensure <code>dashboard/public/data/fish.csv</code> exists (copy from <code>data/fish.csv</code> in the repo root),
            then run <code>npm run dev</code> from the <code>dashboard</code> folder.
          </p>
          <Link to="/test">Health check page</Link>
        </div>
      </div>
    );
  }

  return (
    <div className="app">
      <WaveHeader />

      <p className="dev-nav">
        <Link to="/test">Health check</Link>
        {" · "}
        <Link to="/blue">React blue bar (#/blue)</Link>
        {" · "}
        <a href={`${import.meta.env.BASE_URL}blue-bar-test.html`}>Static blue bar (no React)</a>
      </p>

      <motion.main
        className="main-layout"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.4, delay: 0.15 }}
      >
        <div className="main-layout__map">
          <FishMap
            stations={dataset === "fish" ? stations : []}
            mapKey={mapKey}
            envOverlay={dataset === "water" ? envOverlay : "none"}
            chemPoints={chemForMap}
          />
          <p
            className={`status-bar ${dataset === "fish" && appliedSelected.size === 0 ? "status-bar--error" : ""}`}
          >
            {statusText}
          </p>
        </div>
        <FilterPanel
          allCommonNames={allNames}
          draftSelected={draftSelected}
          setDraftSelected={setDraftSelected}
          onApply={onApply}
          dirty={dirty}
          search={search}
          setSearch={setSearch}
          dataset={dataset}
          onDatasetChange={onDatasetChange}
          envOverlay={envOverlay}
          setEnvOverlay={setEnvOverlay}
          chemError={chemError}
          chemPhCount={chemPhCount}
        />
      </motion.main>

      <motion.footer
        className="future-row"
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.35, duration: 0.45 }}
      >
        <div className="placeholder-card">
          <div className="shimmer" />
          <h3>CalCOFI water chemistry</h3>
          <p>
            Surface salinity and pH come from the CalCOFI bottle file (shallowest sample per station cast). Use the sidebar
            toggle to switch between the fish map and the water-chemistry map—they are not shown together.
          </p>
        </div>
        <div className="placeholder-card">
          <div className="shimmer" />
          <h3>Data notes</h3>
          <p>
            pH fields in the public 1949–2021 bottle CSV are almost entirely empty; the dashboard still offers a pH overlay
            for the few reported values. Salinity is measured as practical salinity (PSU).
          </p>
        </div>
      </motion.footer>
    </div>
  );
}
