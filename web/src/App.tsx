import { useMemo, useState } from 'react'
import itineraryData from '@data/itinerary-options.json'
import { DayTimeline } from './components/DayTimeline'
import { GameList } from './components/GameList'
import { ItinerarySelector } from './components/ItinerarySelector'
import { RouteStats } from './components/RouteStats'
import { USMap } from './components/USMap'
import { ROUTE_COLORS } from './lib/constants'
import { getLegsForDay, parseItineraryRoute } from './lib/routeParser'
import type { ItineraryData, ItineraryOption, MapRouteLayer } from './types'

const data = itineraryData as ItineraryData

function StatsBar({
  primary,
  compare,
}: {
  primary: ItineraryOption
  compare: ItineraryOption | null
}) {
  return (
    <div className="flex flex-wrap gap-x-6 gap-y-2 text-sm text-slate-300">
      <div>
        <span className="text-slate-500">Primary · </span>
        <strong className="text-slate-100">{primary.gameCount}</strong> games · score{' '}
        <strong className="text-amber-300">{primary.totalInterestScore.toFixed(2)}</strong>
      </div>
      {compare && (
        <div>
          <span className="text-slate-500">Compare · </span>
          <strong className="text-slate-100">{compare.gameCount}</strong> games · score{' '}
          <strong className="text-cyan-300">{compare.totalInterestScore.toFixed(2)}</strong>
        </div>
      )}
      <span className="text-slate-500">
        {primary.startDate} → {primary.endDate}
      </span>
    </div>
  )
}

export default function App() {
  const defaultId = data.options.find((o) => o.recommended)?.id ?? data.options[0].id
  const [selectedId, setSelectedId] = useState(defaultId)
  const [compareEnabled, setCompareEnabled] = useState(false)
  const [compareId, setCompareId] = useState(
    data.options.find((o) => o.id === 'opening-tip-off')?.id ?? data.options[1]?.id,
  )
  const [activeDay, setActiveDay] = useState<number | null>(null)

  const selected = useMemo(
    () => data.options.find((o) => o.id === selectedId) ?? data.options[0],
    [selectedId],
  )

  const compareOption = useMemo(
    () => data.options.find((o) => o.id === compareId) ?? null,
    [compareId],
  )

  const primaryRoute = useMemo(() => parseItineraryRoute(selected.days), [selected])
  const compareRoute = useMemo(
    () => (compareOption ? parseItineraryRoute(compareOption.days) : null),
    [compareOption],
  )

  const activeLegs = useMemo(
    () => (activeDay === null ? [] : getLegsForDay(primaryRoute.legs, activeDay)),
    [activeDay, primaryRoute.legs],
  )

  const mapLayers = useMemo((): MapRouteLayer[] => {
    const layers: MapRouteLayer[] = [
      {
        id: selected.id,
        label: selected.name,
        color: ROUTE_COLORS.primary,
        route: primaryRoute,
        activeDay,
        activeLegs,
        primary: true,
      },
    ]

    if (compareEnabled && compareOption && compareRoute && compareOption.id !== selected.id) {
      layers.push({
        id: compareOption.id,
        label: compareOption.name,
        color: ROUTE_COLORS.compare,
        route: compareRoute,
        primary: false,
      })
    }

    return layers
  }, [
    selected,
    primaryRoute,
    activeDay,
    activeLegs,
    compareEnabled,
    compareOption,
    compareRoute,
  ])

  const compareCandidates = data.options.filter((o) => o.id !== selectedId)

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100">
      <header className="border-b border-slate-800 px-6 py-5">
        <h1 className="text-2xl font-bold tracking-tight">NBA Travels — Route Planner</h1>
        <p className="mt-1 text-sm text-slate-400">
          2026–27 east coast itineraries · compare routes · zoom & pan the map
        </p>
      </header>

      <main className="mx-auto grid max-w-7xl gap-6 p-6 lg:grid-cols-[280px_1fr]">
        <aside className="space-y-6">
          <ItinerarySelector
            options={data.options}
            selectedId={selectedId}
            onSelect={(id) => {
              setSelectedId(id)
              setActiveDay(null)
              if (id === compareId) {
                setCompareId(compareCandidates[0]?.id ?? id)
              }
            }}
          />

          <div className="rounded-lg border border-slate-700 bg-slate-800/30 p-3">
            <label className="flex cursor-pointer items-center gap-2 text-sm text-slate-200">
              <input
                type="checkbox"
                checked={compareEnabled}
                onChange={(e) => {
                  setCompareEnabled(e.target.checked)
                  setActiveDay(null)
                }}
                className="rounded border-slate-600 bg-slate-900"
              />
              Compare two itineraries
            </label>

            {compareEnabled && (
              <select
                value={compareId}
                onChange={(e) => setCompareId(e.target.value)}
                className="mt-2 w-full rounded-md border border-slate-600 bg-slate-900 px-2 py-1.5 text-sm text-slate-200"
              >
                {compareCandidates.map((option) => (
                  <option key={option.id} value={option.id}>
                    {option.name}
                  </option>
                ))}
              </select>
            )}
          </div>

          <DayTimeline
            days={selected.days}
            legs={primaryRoute.legs}
            activeDay={activeDay}
            onSelectDay={setActiveDay}
          />
        </aside>

        <section className="flex min-h-[640px] flex-col gap-4">
          <div>
            <h2 className="text-xl font-semibold text-slate-100">{selected.name}</h2>
            <p className="mt-1 text-sm text-slate-400">{selected.recommendedFor}</p>
            {selected.conflictNote && (
              <p className="mt-2 rounded-md bg-slate-800 px-3 py-2 text-xs text-amber-200/90">
                {selected.conflictNote}
              </p>
            )}
          </div>

          <StatsBar primary={selected} compare={compareEnabled ? compareOption : null} />

          <div className="min-h-[520px] flex-1">
            <USMap layers={mapLayers} />
          </div>

          <RouteStats
            route={primaryRoute}
            label={selected.name}
            color={ROUTE_COLORS.primary}
            activeLegs={activeLegs}
          />

          {compareEnabled && compareOption && compareRoute && (
            <RouteStats
              route={compareRoute}
              label={compareOption.name}
              color={ROUTE_COLORS.compare}
            />
          )}

          <GameList
            days={selected.days}
            label={selected.name}
            color={ROUTE_COLORS.primary}
            activeDay={activeDay}
            onSelectDay={setActiveDay}
          />

          {compareEnabled && compareOption && (
            <GameList
              days={compareOption.days}
              label={compareOption.name}
              color={ROUTE_COLORS.compare}
            />
          )}
        </section>
      </main>
    </div>
  )
}
