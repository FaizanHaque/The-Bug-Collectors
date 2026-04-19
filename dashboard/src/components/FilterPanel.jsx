import { useMemo, useState } from "react";
import { motion } from "framer-motion";
import { BROAD_GROUPS, speciesInGroup } from "../utils/categories.js";

export default function FilterPanel({
  allCommonNames,
  draftSelected,
  setDraftSelected,
  onApply,
  dirty,
  search,
  setSearch,
  dataset,
  onDatasetChange,
  envOverlay,
  setEnvOverlay,
  chemError,
  chemPhCount,
}) {
  const [fishOpen, setFishOpen] = useState(true);
  const [groupsOpen, setGroupsOpen] = useState(true);
  const [speciesOpen, setSpeciesOpen] = useState(true);
  const [waterOpen, setWaterOpen] = useState(true);

  const isFish = dataset === "fish";
  const isWater = dataset === "water";

  const filteredNames = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return allCommonNames;
    return allCommonNames.filter((n) => n.toLowerCase().includes(q));
  }, [allCommonNames, search]);

  const toggleSpeciesName = (name) => {
    setDraftSelected((prev) => {
      const next = new Set(prev);
      if (next.has(name)) next.delete(name);
      else next.add(name);
      return next;
    });
  };

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
        <p className="filter-rail__hint">Choose one dataset at a time. Fish filters use Apply; water layer updates live.</p>
      </div>

      <div className="dataset-toggle" role="radiogroup" aria-label="Dataset">
        <button
          type="button"
          role="radio"
          aria-checked={isFish}
          className={`dataset-toggle__btn ${isFish ? "dataset-toggle__btn--active" : ""}`}
          onClick={() => onDatasetChange("fish")}
        >
          Fish larvae
        </button>
        <button
          type="button"
          role="radio"
          aria-checked={isWater}
          className={`dataset-toggle__btn ${isWater ? "dataset-toggle__btn--active" : ""}`}
          onClick={() => onDatasetChange("water")}
        >
          CalCOFI water
        </button>
      </div>

      {isFish && (
        <div className="accordion-block">
          <button type="button" className="accordion-trigger" onClick={() => setFishOpen((o) => !o)} aria-expanded={fishOpen}>
            <span className="accordion-chevron">{fishOpen ? "▾" : "▸"}</span>
            Species filters
          </button>
          {fishOpen && (
            <div className="accordion-block__body">
              <div className="accordion-nested">
                <button
                  type="button"
                  className="accordion-trigger accordion-trigger--nested"
                  onClick={() => setGroupsOpen((o) => !o)}
                  aria-expanded={groupsOpen}
                >
                  <span className="accordion-chevron">{groupsOpen ? "▾" : "▸"}</span>
                  Broad groups
                </button>
                {groupsOpen && (
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
                )}
              </div>

              <div className="accordion-nested">
                <button
                  type="button"
                  className="accordion-trigger accordion-trigger--nested"
                  onClick={() => setSpeciesOpen((o) => !o)}
                  aria-expanded={speciesOpen}
                >
                  <span className="accordion-chevron">{speciesOpen ? "▾" : "▸"}</span>
                  Species (common name)
                </button>
                {speciesOpen && (
                  <>
                    <input
                      className="filter-search"
                      type="search"
                      placeholder="Search common names…"
                      value={search}
                      onChange={(e) => setSearch(e.target.value)}
                    />
                    <div className="species-scroller">
                      {filteredNames.map((name) => (
                        <label key={name} className="species-row">
                          <input
                            type="checkbox"
                            checked={draftSelected.has(name)}
                            onChange={() => toggleSpeciesName(name)}
                          />
                          {name}
                        </label>
                      ))}
                    </div>
                  </>
                )}
              </div>
            </div>
          )}
        </div>
      )}

      {isWater && (
        <div className="accordion-block">
          <button type="button" className="accordion-trigger" onClick={() => setWaterOpen((o) => !o)} aria-expanded={waterOpen}>
            <span className="accordion-chevron">{waterOpen ? "▾" : "▸"}</span>
            Water variable
          </button>
          {waterOpen && (
            <div className="accordion-block__body">
              <label className="filter-select-label" htmlFor="env-overlay">
                Patch colormap
              </label>
              <select
                id="env-overlay"
                className="filter-select"
                value={envOverlay === "none" ? "salinity" : envOverlay}
                onChange={(e) => setEnvOverlay(e.target.value)}
              >
                <option value="salinity">Surface salinity (PSU)</option>
                <option value="ph">Surface pH (sparse)</option>
              </select>
              <p className="filter-water-note">
                Shallowest bottle per cast, years ≥ 2000, regional subset. Grid patches show mean salinity or pH per cell. Hover:
                year first, then value. pH is sparse in the CSV ({chemPhCount} points in this extract).
              </p>
              {chemError && <p className="filter-water-error">{chemError}</p>}
            </div>
          )}
        </div>
      )}

      {isFish && (
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
      )}
    </motion.aside>
  );
}
