import { useCallback, useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { parseCsv, rowYear } from "./utils/parseCsv.js";
import { parseChemCsv } from "./utils/normalizeChem.js";
import { buildLarvaePatches, larvaeValueRange } from "./utils/larvaeGrid.js";
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

function uniqueYears(rows) {
  const s = new Set();
  for (const r of rows) {
    const y = rowYear(r.time);
    if (y) s.add(y);
  }
  return [...s].sort((a, b) => a - b);
}

export default function Dashboard() {
  const [larvaeRows, setLarvaeRows] = useState([]);
  const [larvaeError, setLarvaeError] = useState(null);
  const [larvaeLoading, setLarvaeLoading] = useState(true);

  const [draftSelected, setDraftSelected] = useState(() => new Set());
  const [appliedSelected, setAppliedSelected] = useState(() => new Set());
  const [search, setSearch] = useState("");

  const [filterYearMin, setFilterYearMin] = useState(null);
  const [filterYearMax, setFilterYearMax] = useState(null);

  const [mapKey, setMapKey] = useState(0);

  const [chemRows, setChemRows] = useState([]);
  const [chemError, setChemError] = useState(null);
  const [chemLoading, setChemLoading] = useState(true);
  const [envOverlay, setEnvOverlay] = useState("salinity");
  const [dataset, setDataset] = useState("fish");

  useEffect(() => {
    const url = `${import.meta.env.BASE_URL}data/larvae.csv`;
    setLarvaeLoading(true);
    fetch(url)
      .then((r) => {
        if (!r.ok) throw new Error(`Could not load larvae.csv (${r.status}). Run dashboard/scripts/download_larvae.py first.`);
        return r.text();
      })
      .then((t) => {
        const rows = parseCsv(t);
        setLarvaeRows(rows);
        setLarvaeError(null);
        const names = uniqueCommonNames(rows);
        setDraftSelected(new Set(names));
        setAppliedSelected(new Set(names));
        const years = uniqueYears(rows);
        if (years.length) {
          setFilterYearMin(years[0]);
          setFilterYearMax(years[years.length - 1]);
        }
      })
      .catch((e) => {
        setLarvaeError(String(e.message || e));
        setLarvaeRows([]);
      })
      .finally(() => setLarvaeLoading(false));
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

  const allNames = useMemo(() => uniqueCommonNames(larvaeRows), [larvaeRows]);
  const allYears = useMemo(() => uniqueYears(larvaeRows), [larvaeRows]);

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
    return larvaeRows.filter((r) => {
      if (!appliedSelected.has((r.common_name || "").trim())) return false;
      if (filterYearMin != null || filterYearMax != null) {
        const y = rowYear(r.time);
        if (y == null) return false;
        if (filterYearMin != null && y < filterYearMin) return false;
        if (filterYearMax != null && y > filterYearMax) return false;
      }
      return true;
    });
  }, [larvaeRows, appliedSelected, filterYearMin, filterYearMax]);

  const larvaePatches = useMemo(
    () => (dataset === "fish" ? buildLarvaePatches(filteredRows) : []),
    [dataset, filteredRows]
  );

  const larvaeRange = useMemo(() => larvaeValueRange(larvaePatches), [larvaePatches]);

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
    if (larvaeLoading) return "Loading larvae data…";
    if (larvaeError) return `Larvae data error: ${larvaeError}`;
    if (dataset === "water") {
      const layer = envOverlay === "ph" ? "pH patches" : "salinity patches";
      if (chemLoading) return "Loading CalCOFI…";
      if (chemError) return `CalCOFI · ${layer} · failed: ${chemError}`;
      return `CalCOFI · ${layer} · ${chemRows.length} surface samples (${chemPhCount} with pH). Toggle to Fish larvae for the density grid.`;
    }
    return `${filteredRows.length.toLocaleString()} records · ${larvaePatches.length} grid cells`;
  }, [
    larvaeLoading,
    larvaeError,
    dataset,
    envOverlay,
    chemLoading,
    chemRows.length,
    chemPhCount,
    chemError,
    filteredRows.length,
    larvaePatches.length,
  ]);

  if (larvaeLoading) {
    return (
      <div className="app app--loading">
        <WaveHeader />
        <p className="app-loading-msg">Loading dashboard data…</p>
      </div>
    );
  }

  if (larvaeError && larvaeRows.length === 0) {
    return (
      <div className="app app--loading">
        <WaveHeader />
        <div className="app-error-panel">
          <h2>Could not load larvae data</h2>
          <p>{larvaeError}</p>
          <p className="app-error-hint">
            Run <code>python3 dashboard/scripts/download_larvae.py</code> from the repo root to fetch and save the data,
            then restart <code>npm run dev</code>.
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
            larvaePatches={dataset === "fish" ? larvaePatches : []}
            larvaeRange={larvaeRange}
            mapKey={mapKey}
            envOverlay={dataset === "water" ? envOverlay : "none"}
            chemPoints={chemForMap}
          />
          <p className={`status-bar ${dataset === "fish" && appliedSelected.size === 0 ? "status-bar--error" : ""}`}>
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
          allYears={allYears}
          filterYearMin={filterYearMin}
          filterYearMax={filterYearMax}
          setFilterYearMin={setFilterYearMin}
          setFilterYearMax={setFilterYearMax}
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
            toggle to switch between the larvae density grid and the water-chemistry map.
          </p>
        </div>
        <div className="placeholder-card">
          <div className="shimmer" />
          <h3>Data notes</h3>
          <p>
            Larvae data sourced from ERDDAP (erdCalCOFIlrvcnt), 1999–present, bounded to the Southern California Bight
            (lat 32–35°N, lon 121–117°W). Grid patches show mean larvae per 10 m² per cell.
          </p>
        </div>
      </motion.footer>
    </div>
  );
}
