import { useState } from "react";
import { motion } from "framer-motion";
import { BROAD_GROUPS, speciesInGroup } from "../utils/categories.js";

function YearSlider({ dataMin, dataMax, value, onChange }) {
  const span = dataMax - dataMin || 1;
  const pct = ((value - dataMin) / span) * 100;

  return (
    <div className="year-slider-block">
      <div className="year-slider-values">
        <span>{dataMin}</span>
        <span className="year-slider-current">{value}</span>
        <span>{dataMax}</span>
      </div>
      <div className="single-slider">
        <div className="single-slider__track" />
        <div className="single-slider__fill" style={{ width: `${pct}%` }} />
        <input
          type="range"
          className="single-slider__input"
          min={dataMin}
          max={dataMax}
          value={value}
          onChange={(e) => onChange(Number(e.target.value))}
        />
      </div>
    </div>
  );
}

export default function FilterPanel({
  allCommonNames,
  draftSelected,
  setDraftSelected,
  onApply,
  dirty,
  selectedYear,
  setSelectedYear,
  yearOptions,
  dataset,
  onDatasetChange,
  oceanVariable,
  setOceanVariable,
  coverageView,
  setCoverageView,
  chemError,
  chemPhCount,
}) {
  const [fishOpen, setFishOpen] = useState(true);
  const [yearOpen, setYearOpen] = useState(true);
  const [oceanOpen, setOceanOpen] = useState(true);

  const isFish = dataset === "fish";
  const isOcean = dataset === "ocean";
  const isCoverage = dataset === "coverage";

  const toggleGroup = (groupId) => {
    const names = speciesInGroup(groupId, allCommonNames);
    setDraftSelected((prev) => {
      const next = new Set(prev);
      const allOn = names.length > 0 && names.every((n) => next.has(n));
      if (allOn) names.forEach((n) => next.delete(n));
      else names.forEach((n) => next.add(n));
      return next;
    });
  };

  const groupAllSelected = (groupId) => {
    const names = speciesInGroup(groupId, allCommonNames);
    if (names.length === 0) return false;
    return names.every((n) => draftSelected.has(n));
  };

  const groupSomeSelected = (groupId) => {
    const names = speciesInGroup(groupId, allCommonNames);
    const some = names.filter((n) => draftSelected.has(n)).length;
    return some > 0 && some < names.length;
  };

  return (
    <motion.aside
      className="filter-rail"
      initial={{ x: 28, opacity: 0 }}
      animate={{ x: 0, opacity: 1 }}
      transition={{ duration: 0.45, ease: [0.4, 0, 0.2, 1] }}
    >
      <div className="filter-rail__head">
        <h2 className="filter-rail__title">Map data</h2>
        <p className="filter-rail__hint">Choose one dataset at a time. Each tab uses a draggable year timeline and a fixed color scale.</p>
      </div>

      <div className="dataset-toggle" role="radiogroup" aria-label="Dataset">
        <button
          type="button"
          role="radio"
          aria-checked={isFish}
          className={`dataset-toggle__btn ${isFish ? "dataset-toggle__btn--active" : ""}`}
          onClick={() => onDatasetChange("fish")}
        >
          Fish Larvae Count
        </button>
        <button
          type="button"
          role="radio"
          aria-checked={dataset === "larvae_salinity"}
          className={`dataset-toggle__btn ${dataset === "larvae_salinity" ? "dataset-toggle__btn--active" : ""}`}
          onClick={() => onDatasetChange("larvae_salinity")}
        >
          Larvae Salinity
        </button>
        <button
          type="button"
          role="radio"
          aria-checked={isOcean}
          className={`dataset-toggle__btn ${isOcean ? "dataset-toggle__btn--active" : ""}`}
          onClick={() => onDatasetChange("ocean")}
        >
          Ocean Data
        </button>
        <button
          type="button"
          role="radio"
          aria-checked={isCoverage}
          className={`dataset-toggle__btn ${isCoverage ? "dataset-toggle__btn--active" : ""}`}
          onClick={() => onDatasetChange("coverage")}
        >
          Coverage
        </button>
      </div>

      {dataset !== "coverage" && (
        <div className="accordion-block">
          <button type="button" className="accordion-trigger" onClick={() => setYearOpen((o) => !o)} aria-expanded={yearOpen}>
            <span className="accordion-chevron">{yearOpen ? "▾" : "▸"}</span>
            Timeline year
          </button>
          {yearOpen && yearOptions.length > 1 && (
            <div className="accordion-block__body">
              <YearSlider
                dataMin={yearOptions[0]}
                dataMax={yearOptions[yearOptions.length - 1]}
                value={selectedYear ?? yearOptions[0]}
                onChange={setSelectedYear}
              />
            </div>
          )}
        </div>
      )}

      {isFish && (
        <>
          <div className="accordion-block">
            <button type="button" className="accordion-trigger" onClick={() => setFishOpen((o) => !o)} aria-expanded={fishOpen}>
              <span className="accordion-chevron">{fishOpen ? "▾" : "▸"}</span>
              Fish Filters
            </button>
            {fishOpen && (
              <div className="accordion-block__body">
                <div className="broad-groups">
                  {BROAD_GROUPS.map((g) => {
                    const count = speciesInGroup(g.id, allCommonNames).length;
                    if (count === 0) return null;
                    const allOn = groupAllSelected(g.id);
                    const some = groupSomeSelected(g.id);
                    return (
                      <label key={g.id} className="broad-group-row">
                        <input
                          type="checkbox"
                          checked={allOn}
                          ref={(el) => {
                            if (el) el.indeterminate = some;
                          }}
                          onChange={() => toggleGroup(g.id)}
                        />
                        <span>
                          {g.label}
                          <span className="broad-group-count"> ({count})</span>
                        </span>
                      </label>
                    );
                  })}
                </div>
              </div>
            )}
          </div>

          <div className="filter-actions">
            <motion.button
              type="button"
              className={`btn btn-apply ${dirty ? "btn-apply--dirty" : ""}`}
              onClick={onApply}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
            >
              Apply
            </motion.button>
          </div>
        </>
      )}

      {isOcean && (
        <div className="accordion-block">
          <button type="button" className="accordion-trigger" onClick={() => setOceanOpen((o) => !o)} aria-expanded={oceanOpen}>
            <span className="accordion-chevron">{oceanOpen ? "▾" : "▸"}</span>
            Ocean variable
          </button>
          {oceanOpen && (
            <div className="accordion-block__body">
              <label className="filter-select-label" htmlFor="env-overlay">
                Patch colormap
              </label>
              <select
                id="env-overlay"
                className="filter-select"
                value={oceanVariable}
                onChange={(e) => setOceanVariable(e.target.value)}
              >
                <option value="salinity">Surface salinity (PSU)</option>
                <option value="ph">Surface pH (sparse)</option>
                <option value="temperature">Surface temperature (°C)</option>
              </select>
              <p className="filter-water-note">
                Ocean Data includes salinity, pH, and temperature with fixed gradients. Timeline selects a single year. pH is
                sparse ({chemPhCount} points in this extract).
              </p>
              {chemError && <p className="filter-water-error">{chemError}</p>}
            </div>
          )}
        </div>
      )}

      {isCoverage && (
        <div className="accordion-block">
          <button type="button" className="accordion-trigger">
            <span className="accordion-chevron">▾</span>
            Coverage graph overlay
          </button>
          <div className="accordion-block__body">
            <label className="filter-select-label" htmlFor="coverage-view">
              Graph selection
            </label>
            <select
              id="coverage-view"
              className="filter-select"
              value={coverageView}
              onChange={(e) => setCoverageView(e.target.value)}
            >
              <option value="2d">Map: coverage data as colored dots</option>
              <option value="3d">Show 3D coverage plot below map</option>
            </select>
          </div>
        </div>
      )}
    </motion.aside>
  );
}
