import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { parseCsv, rowYear } from "./utils/parseCsv.js";
import { parseChemCsv } from "./utils/normalizeChem.js";
import { buildLarvaePatches } from "./utils/larvaeGrid.js";
import WaveHeader from "./components/WaveHeader.jsx";
import FishMap from "./components/FishMap.jsx";
import FilterPanel from "./components/FilterPanel.jsx";
import EnvTimelineChart from "./components/EnvTimelineChart.jsx";
import LarvaeEnvScatterChart from "./components/LarvaeEnvScatterChart.jsx";
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
  const [selectedYear, setSelectedYear] = useState(null);

  const [chemRows, setChemRows] = useState([]);
  const [chemError, setChemError] = useState(null);
  const [chemLoading, setChemLoading] = useState(true);
  const [oceanVariable, setOceanVariable] = useState("salinity");

  const [envRows, setEnvRows] = useState([]);
  const [envError, setEnvError] = useState(null);
  const [envLoading, setEnvLoading] = useState(true);

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
          setSelectedYear(years[0]);
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
        if (!r.ok) throw new Error(`Could not load Ocean Data file (${r.status})`);
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

  useEffect(() => {
    const url = `${import.meta.env.BASE_URL}data/larvae_env_yearly.csv`;
    setEnvLoading(true);
    fetch(url)
      .then((r) => {
        if (!r.ok) {
          throw new Error(`Could not load larvae_env_yearly.csv (${r.status}). Run dashboard/scripts/build_larvae_env_yearly.py.`);
        }
        return r.text();
      })
      .then((t) => {
        const rows = parseCsv(t)
          .map((r) => ({
            year: parseInt(r.year, 10) || 0,
            lat: parseFloat(r.lat),
            lon: parseFloat(r.lon),
            salinity: parseFloat(r.salinity_mean),
            temperature: parseFloat(r.temperature_mean),
            larvae10m2: parseFloat(r.larvae_10m2_mean),
          }))
          .filter((r) => Number.isFinite(r.lat) && Number.isFinite(r.lon) && Number.isFinite(r.salinity) && Number.isFinite(r.temperature));
        setEnvRows(rows);
        setEnvError(null);
      })
      .catch((e) => {
        setEnvError(String(e.message || e));
        setEnvRows([]);
      })
      .finally(() => setEnvLoading(false));
  }, []);

  const allNames = useMemo(() => uniqueCommonNames(larvaeRows), [larvaeRows]);
  const allYears = useMemo(() => uniqueYears(larvaeRows), [larvaeRows]);

  const chemPhCount = useMemo(() => chemRows.filter((p) => p.ph != null).length, [chemRows]);

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
      const y = rowYear(r.time);
      if (y == null) return false;
      if (selectedYear != null && y !== selectedYear) return false;
      return true;
    });
  }, [larvaeRows, appliedSelected, selectedYear]);

  const oceanYears = useMemo(() => {
    const years = new Set();
    for (const row of chemRows) if (row.year) years.add(row.year);
    return [...years].sort((a, b) => a - b);
  }, [chemRows]);

  const envYears = useMemo(() => {
    const years = new Set();
    for (const row of envRows) if (row.year) years.add(row.year);
    return [...years].sort((a, b) => a - b);
  }, [envRows]);

  useEffect(() => {
    const years = dataset === "fish" ? allYears : dataset === "ocean" ? oceanYears : envYears;
    if (!years.length) return;
    setSelectedYear((prev) => (prev && years.includes(prev) ? prev : years[0]));
  }, [dataset, allYears, oceanYears, envYears]);

  const filteredChemRows = useMemo(() => {
    return chemRows.filter((r) => {
      if (selectedYear != null && r.year !== selectedYear) return false;
      return true;
    });
  }, [chemRows, selectedYear]);

  const filteredEnvRows = useMemo(() => {
    return envRows.filter((r) => {
      if (selectedYear != null && r.year !== selectedYear) return false;
      return true;
    });
  }, [envRows, selectedYear]);

  const larvaePatches = useMemo(() => (dataset === "fish" ? buildLarvaePatches(filteredRows) : []), [dataset, filteredRows]);

  const fullLarvaeRange = useMemo(() => ({ min: 1, max: 2660 }), []);

  const fullOceanRanges = useMemo(() => {
    const salVals = chemRows.map((r) => r.salinity).filter(Number.isFinite);
    const phVals = chemRows.map((r) => r.ph).filter(Number.isFinite);
    return {
      salinity: salVals.length ? { min: Math.min(...salVals), max: Math.max(...salVals) } : { min: 0, max: 1 },
      ph: phVals.length ? { min: Math.min(...phVals), max: Math.max(...phVals) } : { min: 7.7, max: 8.3 },
    };
  }, [chemRows]);

  const fullEnvRanges = useMemo(() => {
    const salVals = envRows.map((r) => r.salinity).filter(Number.isFinite);
    const tempVals = envRows.map((r) => r.temperature).filter(Number.isFinite);
    return {
      salinity: salVals.length ? { min: Math.min(...salVals), max: Math.max(...salVals) } : { min: 30, max: 35 },
      temperature: tempVals.length ? { min: Math.min(...tempVals), max: Math.max(...tempVals) } : { min: 10, max: 22 },
    };
  }, [envRows]);

  const activePatchMode =
    dataset === "fish" ? "none" : dataset === "ocean" ? oceanVariable : "salinity";

  const activePoints = useMemo(() => {
    if (dataset === "ocean") {
      if (oceanVariable === "temperature") return filteredEnvRows;
      return oceanVariable === "ph" ? filteredChemRows.filter((r) => r.ph != null) : filteredChemRows;
    }
    if (dataset === "larvae_salinity") return filteredEnvRows;
    return [];
  }, [dataset, oceanVariable, filteredChemRows, filteredEnvRows]);

  const activeRange =
    dataset === "fish"
      ? fullLarvaeRange
      : dataset === "ocean"
        ? oceanVariable === "temperature"
          ? fullEnvRanges.temperature
          : fullOceanRanges[oceanVariable]
        : fullEnvRanges.salinity;

  const statusText = useMemo(() => {
    if (larvaeLoading) return "Loading larvae data…";
    if (larvaeError) return `Larvae data error: ${larvaeError}`;
    if (dataset === "ocean") {
      const layer =
        oceanVariable === "ph" ? "pH patches" : oceanVariable === "temperature" ? "temperature patches" : "salinity patches";
      if (oceanVariable === "temperature" && envLoading) return "Loading Ocean Data…";
      if (chemLoading && oceanVariable !== "temperature") return "Loading Ocean Data…";
      if (chemError) return `Ocean Data · ${layer} · failed: ${chemError}`;
      if (envError && oceanVariable === "temperature") return `Ocean Data · ${layer} · failed: ${envError}`;
      const n = oceanVariable === "temperature" ? filteredEnvRows.length : filteredChemRows.length;
      return `Ocean Data · ${layer} · ${n} samples in selected year (${chemPhCount} with pH overall).`;
    }
    if (dataset === "larvae_salinity") {
      if (envLoading) return "Loading larvae salinity dataset…";
      if (envError) return `Larvae salinity error: ${envError}`;
      return `Larvae salinity · ${filteredEnvRows.length} station-years · fixed gradient scale`;
    }
    return `${filteredRows.length.toLocaleString()} records · ${larvaePatches.length} grid cells · fixed gradient scale`;
  }, [
    larvaeLoading,
    larvaeError,
    dataset,
    oceanVariable,
    chemLoading,
    chemPhCount,
    chemError,
    filteredChemRows.length,
    filteredRows.length,
    larvaePatches.length,
    envLoading,
    envError,
    filteredEnvRows.length,
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

      <motion.main
        className="main-layout"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.4, delay: 0.15 }}
      >
        <div className="main-layout__map">
          <FishMap
            larvaePatches={larvaePatches}
            larvaeRange={fullLarvaeRange}
            patchMode={activePatchMode}
            points={activePoints}
            valueRange={activeRange}
          />
          <p className={`status-bar ${dataset === "fish" && appliedSelected.size === 0 ? "status-bar--error" : ""}`}>
            {statusText}
          </p>
          {dataset === "larvae_salinity" && (
            <>
              <EnvTimelineChart rows={envRows} metric="salinity" selectedYear={selectedYear} yDomain={fullEnvRanges.salinity} />
              <LarvaeEnvScatterChart rows={envRows} />
            </>
          )}
          {dataset === "ocean" && (
            <EnvTimelineChart
              rows={oceanVariable === "temperature" ? envRows : chemRows.map((r) => ({ ...r, larvae10m2: 0 }))}
              metric={oceanVariable === "temperature" ? "temperature" : oceanVariable === "ph" ? "ph" : "salinity"}
              selectedYear={selectedYear}
              yDomain={
                oceanVariable === "temperature"
                  ? fullEnvRanges.temperature
                  : oceanVariable === "ph"
                    ? fullOceanRanges.ph
                    : fullOceanRanges.salinity
              }
            />
          )}
        </div>
        <FilterPanel
          allCommonNames={allNames}
          draftSelected={draftSelected}
          setDraftSelected={setDraftSelected}
          onApply={() => setAppliedSelected(new Set(draftSelected))}
          dirty={dirty}
          selectedYear={selectedYear}
          setSelectedYear={setSelectedYear}
          dataset={dataset}
          onDatasetChange={setDataset}
          oceanVariable={oceanVariable}
          setOceanVariable={setOceanVariable}
          chemError={chemError}
          chemPhCount={chemPhCount}
          yearOptions={dataset === "fish" ? allYears : dataset === "ocean" ? (oceanVariable === "temperature" ? envYears : oceanYears) : envYears}
        />
      </motion.main>
    </div>
  );
}
