# NBA Travels — Map UI

React app that visualizes itinerary options on a US map with day-by-day timeline sync.

## Run locally

```bash
cd web
npm install
npm run dev
```

Open http://localhost:5173

## Build

```bash
npm run build          # local / root deploy
npm run build:pages    # GitHub Pages (/nba-travels/)
npm run preview
```

## GitHub Pages

Pushes to `main` deploy automatically via `.github/workflows/deploy-web.yml`.

**One-time setup** in the repo on GitHub:

1. Settings → Pages → Source: **GitHub Actions**
2. After the first workflow run, the site will be at:
   **https://lucastagliani.github.io/nba-travels/**

## Features

- **Map zoom & pan** — scroll to zoom, drag to pan, +/- buttons, reset
- **Compare mode** — overlay two itineraries (amber + cyan)
- **Distance table** — miles per travel leg with mode and hours
- **Timeline sync** — click a day to highlight that leg on the map
- **Tier-colored cities** — S/A/B/C markers with numbered stops
- **Marquee games** — ⭐ on map and timeline

## Data

Imports JSON from `../data/` via the `@data` alias:

- `itinerary-options.json`
- `city-tiers.json`
- `cities.json`

US state outlines load at runtime from [us-atlas](https://github.com/topojson/us-atlas).
