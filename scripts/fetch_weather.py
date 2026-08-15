#!/usr/bin/env python3
"""Fetch historical climate normals for itinerary cities and months only."""

from __future__ import annotations

import json
import urllib.parse
import urllib.request
from collections import defaultdict
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
SEASON_DIR = ROOT / "data" / "2026-2027-season"
DEFAULT_TRIP = "east-coast"

HISTORY_YEARS = (2019, 2020, 2021, 2022, 2023, 2024)

MONTH_NAMES = (
    "",
    "January",
    "February",
    "March",
    "April",
    "May",
    "June",
    "July",
    "August",
    "September",
    "October",
    "November",
    "December",
)

WMO_LABELS: dict[int, str] = {
    0: "Clear",
    1: "Mainly clear",
    2: "Partly cloudy",
    3: "Overcast",
    45: "Fog",
    48: "Fog",
    51: "Light drizzle",
    53: "Drizzle",
    55: "Heavy drizzle",
    61: "Light rain",
    63: "Rain",
    65: "Heavy rain",
    71: "Light snow",
    73: "Snow",
    75: "Heavy snow",
    80: "Rain showers",
    81: "Rain showers",
    82: "Heavy rain showers",
    95: "Thunderstorm",
}


def wmo_label(code: int) -> str:
    if code in WMO_LABELS:
        return WMO_LABELS[code]
    if 56 <= code <= 67:
        return "Rain"
    if 77 <= code <= 86:
        return "Snow"
    return "Mixed"


def fetch_range(lat: float, lng: float, start: str, end: str, timezone: str) -> dict | None:
    params = urllib.parse.urlencode(
        {
            "latitude": lat,
            "longitude": lng,
            "start_date": start,
            "end_date": end,
            "daily": "temperature_2m_max,temperature_2m_min,precipitation_sum,weathercode",
            "timezone": timezone,
        }
    )
    url = f"https://archive-api.open-meteo.com/v1/archive?{params}"
    try:
        with urllib.request.urlopen(url, timeout=60) as resp:
            return json.loads(resp.read().decode())
    except Exception as exc:  # noqa: BLE001
        print(f"  warn: {start}..{end} failed — {exc}", flush=True)
        return None


def parse_month_day(iso: str) -> tuple[int, int, str]:
    """Return (month, day, MM-DD key)."""
    _, month, day = iso.split("-")
    return int(month), int(day), f"{month}-{day}"


def collect_itinerary_scope(
    itineraries_path: Path,
) -> tuple[
    set[str],
    set[int],
    dict[str, dict[int, set[str]]],
]:
    """Cities, calendar months, and city → month → MM-DD keys used in itineraries."""
    data = json.loads(itineraries_path.read_text())
    cities: set[str] = set()
    months: set[int] = set()
    by_city_month: dict[str, dict[int, set[str]]] = defaultdict(lambda: defaultdict(set))

    for option in data["options"]:
        for day in option["days"]:
            city = day["location"]
            month_num, _, md_key = parse_month_day(day["date"])
            cities.add(city)
            months.add(month_num)
            by_city_month[city][month_num].add(md_key)

    return cities, months, by_city_month


def month_window(md_keys: set[str]) -> tuple[str, str]:
    """Min/max MM-DD within a single calendar month."""
    sorted_keys = sorted(md_keys)
    return sorted_keys[0], sorted_keys[-1]


def main() -> None:
    import argparse

    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument(
        "--trip",
        default=DEFAULT_TRIP,
        help="Trip id under season/trips/ (default: east-coast)",
    )
    args = parser.parse_args()

    trip_dir = SEASON_DIR / "trips" / args.trip
    cities_path = trip_dir / "cities.json"
    itineraries_path = trip_dir / "itinerary-options.json"
    output_path = trip_dir / "weather-normals.json"

    cities_meta = json.loads(cities_path.read_text())
    itinerary_cities, itinerary_months, by_city_month = collect_itinerary_scope(itineraries_path)

    # city → MM-DD → list of daily samples across history years
    samples: dict[str, dict[str, list[dict]]] = defaultdict(lambda: defaultdict(list))

    month_labels = [MONTH_NAMES[m] for m in sorted(itinerary_months)]
    print(
        f"Scope: {len(itinerary_cities)} cities · months {sorted(itinerary_months)} "
        f"({', '.join(month_labels)})",
        flush=True,
    )

    for city in sorted(itinerary_cities):
        meta = cities_meta.get(city)
        if not meta:
            print(f"skip unknown city: {city}", flush=True)
            continue

        lat = meta["lat"]
        lng = meta["lng"]
        tz = meta.get("timezone", "America/New_York")
        month_map = by_city_month[city]

        for month_num in sorted(month_map):
            md_keys = month_map[month_num]
            md_start, md_end = month_window(md_keys)
            month_name = MONTH_NAMES[month_num]

            print(
                f"  {city} · {month_name}: {len(md_keys)} days "
                f"({md_start}→{md_end}) × {len(HISTORY_YEARS)} yrs",
                flush=True,
            )

            for year in HISTORY_YEARS:
                start = f"{year}-{md_start}"
                end = f"{year}-{md_end}"
                payload = fetch_range(lat, lng, start, end, tz)
                if not payload or "daily" not in payload:
                    continue

                daily = payload["daily"]
                index_by_md = {d[5:]: i for i, d in enumerate(daily["time"])}

                for md_key in md_keys:
                    idx = index_by_md.get(md_key)
                    if idx is None:
                        continue
                    samples[city][md_key].append(
                        {
                            "highC": daily["temperature_2m_max"][idx],
                            "lowC": daily["temperature_2m_min"][idx],
                            "precipMm": daily["precipitation_sum"][idx] or 0,
                            "weathercode": daily["weathercode"][idx],
                        }
                    )

    output_entries: dict[str, dict[str, dict]] = {}
    for city in sorted(itinerary_cities):
        by_md = samples.get(city)
        if not by_md:
            continue
        output_entries[city] = {}
        for md_key, rows in sorted(by_md.items()):
            if not rows:
                continue
            avg_high = sum(r["highC"] for r in rows) / len(rows)
            avg_low = sum(r["lowC"] for r in rows) / len(rows)
            avg_precip = sum(r["precipMm"] for r in rows) / len(rows)
            code_counts: dict[int, int] = defaultdict(int)
            for r in rows:
                code_counts[r["weathercode"]] += 1
            mode_code = max(code_counts, key=code_counts.get)
            precip_days = sum(1 for r in rows if r["precipMm"] >= 1.0)
            precip_prob = round(100 * precip_days / len(rows))

            output_entries[city][md_key] = {
                "highC": round(avg_high),
                "lowC": round(avg_low),
                "precipMm": round(avg_precip, 1),
                "precipProb": precip_prob,
                "condition": wmo_label(mode_code),
                "sampleYears": len(rows),
            }

    doc = {
        "description": "Historical climate normals (2019–2024 average) for itinerary cities and months only.",
        "source": "Open-Meteo Historical Weather API",
        "tripId": args.trip,
        "units": {"temperature": "C", "precipitation": "mm"},
        "scope": {
            "cities": sorted(itinerary_cities),
            "months": sorted(itinerary_months),
            "monthLabels": month_labels,
        },
        "entries": output_entries,
    }

    output_path.write_text(json.dumps(doc, indent=2) + "\n")
    total = sum(len(v) for v in output_entries.values())
    print(f"Wrote {total} city×month-day records → {output_path}", flush=True)


if __name__ == "__main__":
    main()
