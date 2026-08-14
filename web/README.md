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

- **Compare all** — table + cards for every itinerary with days/city, teams, miles, budget
- **Trip detail** — map, calendar/timeline, budget breakdown, games list
- **Map zoom & pan** — scroll/drag, +/- buttons, **Fit route** auto-zoom
- **Calendar view** — month grid synced with map/timeline
- **Budget estimates** — travel, hotels, tickets, food (see `data/budget-config.json`)
- **Print / PDF** — printable export with full trip summary
- **Share link** — URL preserves view, itinerary, and selected day

## Data

Imports JSON from `../data/` via the `@data` alias:

- `itinerary-options.json`
- `city-tiers.json`
- `cities.json`

US state outlines load at runtime from [us-atlas](https://github.com/topojson/us-atlas).
