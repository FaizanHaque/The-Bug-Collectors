#!/usr/bin/env python3
"""
Build yearly larvae + surface environment grid input used by the dashboard.

Source files:
- dashboard/public/data/larvae.csv
- data/CORC.nc

Output:
- dashboard/public/data/larvae_env_yearly.csv
"""
from pathlib import Path

import numpy as np
import pandas as pd
import xarray as xr


REPO = Path(__file__).resolve().parents[2]
LARVAE_CSV = REPO / "dashboard/public/data/larvae.csv"
CORC_NC = REPO / "data/CORC.nc"
OUT = REPO / "dashboard/public/data/larvae_env_yearly.csv"

LAT0, LAT1 = 30.0, 38.5
LON0, LON1 = -128.5, -116.5
ROUND_DP = 1


def main() -> None:
  if not LARVAE_CSV.is_file():
    raise SystemExit(f"Missing {LARVAE_CSV}")
  if not CORC_NC.is_file():
    raise SystemExit(f"Missing {CORC_NC}")

  larvae = pd.read_csv(LARVAE_CSV, low_memory=False)
  larvae["time"] = pd.to_datetime(larvae["time"], errors="coerce", utc=True)
  larvae["year"] = larvae["time"].dt.year
  larvae["lat"] = pd.to_numeric(larvae["latitude"], errors="coerce")
  larvae["lon"] = pd.to_numeric(larvae["longitude"], errors="coerce")
  larvae["larvae_10m2"] = pd.to_numeric(larvae["larvae_10m2"], errors="coerce")
  larvae = larvae.dropna(subset=["year", "lat", "lon", "larvae_10m2"])
  larvae = larvae[
      (larvae["lat"] >= LAT0)
      & (larvae["lat"] <= LAT1)
      & (larvae["lon"] >= LON0)
      & (larvae["lon"] <= LON1)
  ].copy()
  larvae["lat_r"] = larvae["lat"].round(ROUND_DP)
  larvae["lon_r"] = larvae["lon"].round(ROUND_DP)

  larvae_y = (
      larvae.groupby(["lat_r", "lon_r", "year"], as_index=False)
      .agg(
          larvae_10m2_mean=("larvae_10m2", "mean"),
          larvae_10m2_sum=("larvae_10m2", "sum"),
          larvae_records=("larvae_10m2", "size"),
      )
  )

  corc = xr.open_dataset(CORC_NC, engine="h5netcdf")
  try:
    env = pd.DataFrame(
        {
            "time": pd.to_datetime(corc["time"].values, errors="coerce", utc=True),
            "lat": corc["lat"].values,
            "lon": corc["lon"].values,
            "temperature": corc["temperature"].isel(depth=0).values,
            "salinity": corc["salinity"].isel(depth=0).values,
        }
    )
  finally:
    corc.close()

  env["year"] = env["time"].dt.year
  env["lat"] = pd.to_numeric(env["lat"], errors="coerce")
  env["lon"] = pd.to_numeric(env["lon"], errors="coerce")
  env["temperature"] = pd.to_numeric(env["temperature"], errors="coerce")
  env["salinity"] = pd.to_numeric(env["salinity"], errors="coerce")
  env = env.dropna(subset=["year", "lat", "lon", "temperature", "salinity"])
  env = env[
      (env["lat"] >= LAT0)
      & (env["lat"] <= LAT1)
      & (env["lon"] >= LON0)
      & (env["lon"] <= LON1)
  ].copy()
  env["lat_r"] = env["lat"].round(ROUND_DP)
  env["lon_r"] = env["lon"].round(ROUND_DP)

  env_y = (
      env.groupby(["lat_r", "lon_r", "year"], as_index=False)
      .agg(
          temperature_mean=("temperature", "mean"),
          salinity_mean=("salinity", "mean"),
          env_records=("temperature", "size"),
      )
  )

  merged = env_y.merge(larvae_y, on=["lat_r", "lon_r", "year"], how="inner")
  merged = merged.rename(columns={"lat_r": "lat", "lon_r": "lon"})
  merged = merged.sort_values(["year", "lat", "lon"]).reset_index(drop=True)

  # Keep dashboard payload small.
  if len(merged) > 12000:
    merged = merged.sample(n=12000, random_state=42).sort_values(["year", "lat", "lon"])

  OUT.parent.mkdir(parents=True, exist_ok=True)
  merged.to_csv(OUT, index=False, float_format="%.6f")

  print(f"Wrote {len(merged)} rows to {OUT}")
  if len(merged):
    print(
        "Ranges:",
        "temp",
        f"{merged['temperature_mean'].min():.2f}..{merged['temperature_mean'].max():.2f}",
        "sal",
        f"{merged['salinity_mean'].min():.2f}..{merged['salinity_mean'].max():.2f}",
        "larvae_10m2",
        f"{merged['larvae_10m2_mean'].min():.2f}..{merged['larvae_10m2_mean'].max():.2f}",
    )


if __name__ == "__main__":
  main()
