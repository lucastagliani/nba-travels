# NBA Travels — TODO

Track improvements and new features for the 2026–27 trip planner.

---

## Done

- [x] Git repo + GitHub Pages deploy
- [x] Raw schedule → flattened JSON (`scripts/transform_schedule.py`)
- [x] Team & city tier lists
- [x] Game interest scoring (`scripts/score_games.py`)
- [x] Five hand-picked 12-day itineraries
## Data layout

```
data/
  budget-config.json              # global budget assumptions
  2026-2027-season/               # season
    season.json                   # season metadata + trip list
    team-tiers.json               # shared across trips
    scoring-config.json
    nba-schedule-*.json
    trips/
      east-coast/                 # primary trip (active in web app)
        trip.json
        city-tiers.json
        cities.json
        itinerary-options.json
        travel-routes.json
        weather-normals.json
      secondary/                  # West Coast 2026 (team-only scoring)
        trip.json
        scoring-config.json
        cities.json
        itinerary-options.json
        travel-routes.json
        weather-normals.json
        nba-schedule-scored.json
```
- [x] Interactive map UI (zoom, pan, fit route)
- [x] Compare all itineraries screen
- [x] Trip detail view (timeline, games list, travel stats)
- [x] Expanded calendar view
- [x] Budget estimates (2 travelers, POA round-trip flights)
- [x] NBA Cup games weighted ×1.15 in scoring
- [x] Print / PDF export
- [x] Shareable URLs (`?view=detail&id=...&day=...`)

---

## Next up

- [ ] **Auto-generate itineraries** — input date window, must-see teams/cities, max games, rest days; output ranked 12-day plans
- [ ] **Feasibility warnings** — flag tight same-day travel, back-to-back city hops, conflicting marquee games (e.g. Jan 30 PHI@MIA vs LAL@NYK)
- [ ] **Build-your-own itinerary** — pick games from scored schedule; draw route + warn if unrealistic
- [ ] **Preseason discount** — optional score multiplier or filter (regular season only)

---

## Data & scoring

- [ ] Default `seasonType: "Regular Season"` when source `gameLabel` is empty
- [ ] Rivalry / star-matchup bonuses (e.g. PHI–LAL, PHI–NYK)
- [ ] Playoffs / special event weights (Mexico City, Paris, etc.)
- [ ] Live schedule sync script (re-fetch NBA API, re-run transform + score)
- [ ] JSON Schema validation for schedule, tiers, itineraries
- [ ] Single pipeline command (`npm run data:build` or `make data`)

---

## City & travel metadata

- [x] Extend `cities.json`: timezone, airport codes, arena neighborhood
- [x] `travel-routes.json` with preferred train/flight modes (no driving legs)
- [x] More accurate POA → US city flight estimates (by arrival city)
- [x] Open-jaw return pricing when last city ≠ arrival city
- [ ] Rental car vs drive cost for Florida legs (N/A — Florida legs use flight/train)

---

## UI / UX

- [x] Mobile layout polish (calendar + map stack, larger tap targets)
- [x] “Copy link” toast confirmation
- [ ] Compare view: sort/filter columns, highlight best per metric
- [ ] Map: show Porto Alegre as home marker (context only, off-US map inset?)
- [x] Dark/light theme toggle
- [ ] i18n (EN / PT-BR) for UI labels

---

## Technical

- [ ] Unit tests: scoring formula, route parsing, budget math, game extraction
- [ ] CI: run tests + build web on PR
- [ ] Document data layout in root README
- [ ] Support multiple seasons (picker for `2027-2028-season`, etc.)

---

## Ideas / backlog

- [ ] Ticket price ranges by city/team (StubHub-style placeholders)
- [ ] Hotel cost tiers (budget / mid / nice)
- [ ] Export itinerary to Google Calendar (.ics)
- [x] Weather averages by city/day (`weather-normals.json` + `scripts/fetch_weather.py`)
- [ ] Visa / ESTA reminder for Brazilian travelers

---

## Notes

- Budget assumptions live in `data/budget-config.json` — tune there first.
- **Season** (`data/2026-2027-season/`): schedule, team tiers, scoring config.
- **Trip** (`data/2026-2027-season/trips/<id>/`): cities, itineraries, weather, routes, optional city tiers, per-trip scored schedule.
- Switch trips in the web app header or `?trip=secondary` in the URL.
- Re-score per trip: `python3 scripts/score_games.py --trip east-coast` (or `--trip secondary`)
