#!/usr/bin/env python3
"""
Download CalCOFI larvae count data from ERDDAP, filter to the SCB bounding box,
and save locally for the dashboard.
Run from repo root: python3 dashboard/scripts/download_larvae.py
Requires: pandas, requests
"""
import io
from pathlib import Path

import pandas as pd
import requests

URL = (
    "https://oceanview.pfeg.noaa.gov/erddap/tabledap/erdCalCOFIlrvcnt.csv"
    "?cruise%2Cship%2Cship_code%2Corder_occupied%2Ctow_type%2Ctow_number"
    "%2Cnet_location%2Ctime%2Clatitude%2Clongitude%2Cline%2Cstation"
    "%2Cstandard_haul_factor%2Cvolume_sampled%2Cproportion_sorted"
    "%2Cscientific_name%2Ccommon_name%2Citis_tsn%2Ccalcofi_species_code"
    "%2Clarvae_count%2Clarvae_10m2%2Clarvae_100m3&time%3E=1999-07-01"
)

LAT0, LAT1 = 32.0, 35.0
LON0, LON1 = -121.0, -117.0

REPO = Path(__file__).resolve().parents[2]
OUT = REPO / "dashboard/public/data/larvae.csv"


def main():
    print("Downloading CalCOFI larvae data from ERDDAP…")
    resp = requests.get(URL, timeout=300)
    resp.raise_for_status()

    # ERDDAP CSVs: row 0 = column names, row 1 = units — skip the units row
    df = pd.read_csv(io.StringIO(resp.text), skiprows=[1], low_memory=False)
    print(f"  Raw rows: {len(df)}")

    df["latitude"] = pd.to_numeric(df["latitude"], errors="coerce")
    df["longitude"] = pd.to_numeric(df["longitude"], errors="coerce")
    df["larvae_10m2"] = pd.to_numeric(df["larvae_10m2"], errors="coerce")

    df = df[
        (df["latitude"] >= LAT0)
        & (df["latitude"] <= LAT1)
        & (df["longitude"] >= LON0)
        & (df["longitude"] <= LON1)
        & df["larvae_10m2"].notna()
    ]
    print(f"  Filtered rows (bounds + larvae_10m2 valid): {len(df)}")

    OUT.parent.mkdir(parents=True, exist_ok=True)
    df.to_csv(OUT, index=False)
    print(f"Wrote {len(df)} rows → {OUT}")


if __name__ == "__main__":
    main()
