# NBA Travels — TODO

Track improvements and new features for the 2026–27 trip planner.

---

## Done

- [x] Git repo + GitHub Pages deploy
- [x] Raw schedule → flattened JSON (`scripts/transform_schedule.py`)
- [x] Team & city tier lists
- [x] Game interest scoring (`scripts/score_games.py`)
- [x] Five hand-picked 12-day itineraries
- [x] Season data folder (`data/2026-2027-season/`)
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

- [ ] Extend `cities.json`: timezone, airport codes, arena neighborhood
- [ ] More accurate POA → US city flight estimates (by arrival city)
- [ ] Optional return flight from last city (not always same as arrival)
- [ ] Rental car vs drive cost for Florida legs

---

## UI / UX

- [ ] Mobile layout polish (calendar + map stack, larger tap targets)
- [ ] “Copy link” toast confirmation
- [ ] Compare view: sort/filter columns, highlight best per metric
- [ ] Map: show Porto Alegre as home marker (context only, off-US map inset?)
- [ ] Dark/light theme toggle
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
- [ ] Weather averages by city/month
- [ ] Visa / ESTA reminder for Brazilian travelers

---

## Notes

- Budget assumptions live in `data/budget-config.json` — tune there first.
- Tier preferences live in `data/team-tiers.json` and `data/city-tiers.json`.
- Re-score after tier or scoring changes: `python3 scripts/score_games.py`
