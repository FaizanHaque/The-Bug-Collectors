#!/usr/bin/env python3
"""
Build a small CSV of CalCOFI surface (shallowest bottle) salinity + pH joined to cast lat/lon.
Run from repo root: python3 dashboard/scripts/build_calcofi_surface.py
Requires: pandas
"""
from pathlib import Path

import pandas as pd

REPO = Path(__file__).resolve().parents[2]
DATA = REPO / "data"
# Bottle + Cast CSVs may live directly under data/ (same filenames as the CalCOFI bundle).
BOTTLE_CSV = DATA / "194903-202105_Bottle.csv"
CAST_CSV = DATA / "194903-202105_Cast.csv"
OUT = REPO / "dashboard/public/data/calcofi_surface.csv"
ENC = "latin-1"

# Geographic overlap with fish survey / Southern California Bight
LAT0, LAT1 = 30.0, 38.5
LON0, LON1 = -128.5, -116.5
YEAR_MIN = 2000  # keeps file size reasonable; raise to 2010 for fewer points


def main():
    print("Loading bottle columns...")
    if not BOTTLE_CSV.is_file():
        raise SystemExit(
            f"Missing {BOTTLE_CSV}\n"
            "Place 194903-202105_Bottle.csv (and Cast) in the repo data/ folder, or restore the CalCOFI export."
        )
    if not CAST_CSV.is_file():
        raise SystemExit(f"Missing {CAST_CSV}")

    bottle = pd.read_csv(
        BOTTLE_CSV,
        usecols=["Cst_Cnt", "Depthm", "Salnty", "pH1", "pH2"],
        encoding=ENC,
        low_memory=False,
    )
    for c in ["Depthm", "Salnty", "pH1", "pH2"]:
        bottle[c] = pd.to_numeric(bottle[c], errors="coerce")

    # Prefer pH1, else pH2
    bottle["ph"] = bottle["pH1"].where(bottle["pH1"].notna(), bottle["pH2"])

    bottle = bottle.sort_values(["Cst_Cnt", "Depthm"])
    surf = bottle.groupby("Cst_Cnt", as_index=False).first()
    surf = surf.rename(columns={"Salnty": "salinity"})

    print("Loading cast...")
    cast = pd.read_csv(
        CAST_CSV,
        usecols=["Cst_Cnt", "Lat_Dec", "Lon_Dec", "Year", "Cruise", "Date"],
        encoding=ENC,
        low_memory=False,
    )
    cast["Lat_Dec"] = pd.to_numeric(cast["Lat_Dec"], errors="coerce")
    cast["Lon_Dec"] = pd.to_numeric(cast["Lon_Dec"], errors="coerce")

    m = surf.merge(cast, on="Cst_Cnt", how="inner")
    m = m.rename(columns={"Lat_Dec": "lat", "Lon_Dec": "lon"})
    m = m[
        (m["lat"] >= LAT0)
        & (m["lat"] <= LAT1)
        & (m["lon"] >= LON0)
        & (m["lon"] <= LON1)
        & (m["Year"] >= YEAR_MIN)
    ]
    m = m[m["salinity"].notna()]

    out = m[["lat", "lon", "Year", "salinity", "ph", "Cruise", "Date", "Cst_Cnt"]].copy()
    out = out.rename(columns={"Year": "year"})
    if len(out) > 4000:
        out = out.sample(n=4000, random_state=42)
        out = out.sort_values(["year", "lat", "lon"])
    OUT.parent.mkdir(parents=True, exist_ok=True)
    out.to_csv(OUT, index=False)
    print(f"Wrote {len(out)} rows to {OUT}")
    print("  salinity range:", out["salinity"].min(), "-", out["salinity"].max())
    print("  pH non-null:", out["ph"].notna().sum())


if __name__ == "__main__":
    main()
