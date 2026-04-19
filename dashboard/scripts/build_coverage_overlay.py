#!/usr/bin/env python3
"""
Build sampling coverage overlay points for dashboard Coverage tab.
"""
from pathlib import Path

import pandas as pd
import xarray as xr

REPO = Path(__file__).resolve().parents[2]
OUT = REPO / "dashboard/public/data/coverage_overlay.csv"
ARGO = REPO / "data/argo_all_platforms_merged.csv"
CALCOFI = REPO / "dashboard/public/data/calcofi_surface.csv"
CORC = REPO / "data/CORC.nc"

LAT0, LAT1 = 32.0, 35.0
LON0, LON1 = -121.0, -117.0


def in_bounds(df: pd.DataFrame, lat_col: str, lon_col: str) -> pd.DataFrame:
    return df[(df[lat_col] >= LAT0) & (df[lat_col] <= LAT1) & (df[lon_col] >= LON0) & (df[lon_col] <= LON1)].copy()


def main() -> None:
    rows = []

    if CALCOFI.is_file():
        c = pd.read_csv(CALCOFI)
        c["lat"] = pd.to_numeric(c["lat"], errors="coerce")
        c["lon"] = pd.to_numeric(c["lon"], errors="coerce")
        c["year"] = pd.to_numeric(c["year"], errors="coerce").fillna(0).astype(int)
        c = in_bounds(c.dropna(subset=["lat", "lon"]), "lat", "lon")
        c = c.sample(n=min(1500, len(c)), random_state=42)
        for _, r in c.iterrows():
            rows.append({"lat": r["lat"], "lon": r["lon"], "year": int(r["year"]), "coverage": 1.0, "source": "calcofi"})

    if ARGO.is_file():
        a = pd.read_csv(ARGO, low_memory=False)
        a["lat"] = pd.to_numeric(a.get("profile_latitude"), errors="coerce")
        a["lon"] = pd.to_numeric(a.get("profile_longitude"), errors="coerce")
        a["pressure"] = pd.to_numeric(a.get("pressure (decibar)"), errors="coerce")
        tcol = "time" if "time" in a.columns else ("profile_datetime" if "profile_datetime" in a.columns else None)
        if tcol:
            a["year"] = pd.to_datetime(a[tcol], errors="coerce").dt.year.fillna(0).astype(int)
        else:
            a["year"] = 0
        a = in_bounds(a.dropna(subset=["lat", "lon"]), "lat", "lon")
        a = a.sample(n=min(2000, len(a)), random_state=42)
        a["coverage"] = 1.0 + (a["pressure"].fillna(0) / 6000.0) * 4.0
        for _, r in a.iterrows():
            rows.append({"lat": r["lat"], "lon": r["lon"], "year": int(r["year"]), "coverage": float(r["coverage"]), "source": "argo"})

    if CORC.is_file():
        ds = xr.open_dataset(CORC, engine="h5netcdf")
        try:
            d = pd.DataFrame(
                {
                    "time": pd.to_datetime(ds["time"].values, errors="coerce"),
                    "lat": ds["lat"].values,
                    "lon": ds["lon"].values,
                    "temp0": ds["temperature"].isel(depth=0).values,
                }
            )
        finally:
            ds.close()
        d["year"] = d["time"].dt.year.fillna(0).astype(int)
        d["lat"] = pd.to_numeric(d["lat"], errors="coerce")
        d["lon"] = pd.to_numeric(d["lon"], errors="coerce")
        d["temp0"] = pd.to_numeric(d["temp0"], errors="coerce")
        d = in_bounds(d.dropna(subset=["lat", "lon", "temp0"]), "lat", "lon")
        d = d.sample(n=min(2500, len(d)), random_state=42)
        tmin = d["temp0"].min() if len(d) else 0
        tmax = d["temp0"].max() if len(d) else 1
        span = (tmax - tmin) or 1
        d["coverage"] = 1.0 + ((d["temp0"] - tmin) / span) * 3.0
        for _, r in d.iterrows():
            rows.append({"lat": r["lat"], "lon": r["lon"], "year": int(r["year"]), "coverage": float(r["coverage"]), "source": "corc"})

    # CCE anchors used in notebook
    rows.extend(
        [
            {"lat": 34.33, "lon": -120.85, "year": 2020, "coverage": 6.0, "source": "cce1"},
            {"lat": 33.48, "lon": -122.56, "year": 2020, "coverage": 6.0, "source": "cce2"},
        ]
    )

    out = pd.DataFrame(rows)
    out = out.dropna(subset=["lat", "lon", "coverage"])
    out = out.sort_values(["year", "source", "lat", "lon"]).reset_index(drop=True)
    OUT.parent.mkdir(parents=True, exist_ok=True)
    out.to_csv(OUT, index=False, float_format="%.6f")
    print(f"Wrote {len(out)} rows to {OUT}")


if __name__ == "__main__":
    main()
