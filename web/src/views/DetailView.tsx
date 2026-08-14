import { useMemo, useState } from 'react'
import type { ItineraryOption } from '../types'
import { BudgetBreakdown } from '../components/BudgetBreakdown'
import { CalendarView } from '../components/CalendarView'
import { DayTimeline } from '../components/DayTimeline'
import { GameList } from '../components/GameList'
import { ItinerarySelector } from '../components/ItinerarySelector'
import { RouteStats } from '../components/RouteStats'
import { USMap } from '../components/USMap'
import { ROUTE_COLORS } from '../lib/constants'
import { analyzeItinerary } from '../lib/itineraryStats'
import { buildShareUrl, printItinerary } from '../lib/print'
import { getLegsForDay, parseItineraryRoute } from '../lib/routeParser'
import type { MapRouteLayer } from '../types'

interface DetailViewProps {
  options: ItineraryOption[]
  selectedId: string
  activeDay: number | null
  onSelectId: (id: string) => void
  onActiveDay: (day: number | null) => void
  onBack: () => void
}

export function DetailView({
  options,
  selectedId,
  activeDay,
  onSelectId,
  onActiveDay,
  onBack,
}: DetailViewProps) {
  const [compareEnabled, setCompareEnabled] = useState(false)
  const [compareId, setCompareId] = useState(
    options.find((o) => o.id === 'opening-tip-off')?.id ?? options[1]?.id,
  )
  const [sidebarTab, setSidebarTab] = useState<'timeline' | 'compact-calendar'>('timeline')

  const selected = useMemo(
    () => options.find((o) => o.id === selectedId) ?? options[0],
    [options, selectedId],
  )

  const compareOption = useMemo(
    () => options.find((o) => o.id === compareId) ?? null,
    [options, compareId],
  )

  const analysis = useMemo(() => analyzeItinerary(selected), [selected])
  const primaryRoute = analysis.route
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
  }, [selected, primaryRoute, activeDay, activeLegs, compareEnabled, compareOption, compareRoute])

  const compareCandidates = options.filter((o) => o.id !== selectedId)

  const handleShare = async () => {
    const url = buildShareUrl(selected.id, activeDay)
    try {
      await navigator.clipboard.writeText(url)
    } catch {
      window.prompt('Copy this link:', url)
    }
  }

  return (
    <div className="grid gap-6 lg:grid-cols-[260px_1fr]">
      <aside className="space-y-5">
        <button
          type="button"
          onClick={onBack}
          className="text-sm text-slate-400 hover:text-slate-200"
        >
          ← All itineraries
        </button>

        <ItinerarySelector
          options={options}
          selectedId={selectedId}
          onSelect={(id) => {
            onSelectId(id)
            onActiveDay(null)
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
                onActiveDay(null)
              }}
              className="rounded border-slate-600 bg-slate-900"
            />
            Overlay compare route on map
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

        <div className="flex rounded-lg border border-slate-700 p-0.5 text-xs">
          <button
            type="button"
            onClick={() => setSidebarTab('timeline')}
            className={`flex-1 rounded-md px-2 py-1.5 ${sidebarTab === 'timeline' ? 'bg-slate-700 text-slate-100' : 'text-slate-400'}`}
          >
            Timeline
          </button>
          <button
            type="button"
            onClick={() => setSidebarTab('compact-calendar')}
            className={`flex-1 rounded-md px-2 py-1.5 ${sidebarTab === 'compact-calendar' ? 'bg-slate-700 text-slate-100' : 'text-slate-400'}`}
          >
            Mini cal
          </button>
        </div>

        {sidebarTab === 'timeline' ? (
          <DayTimeline
            days={selected.days}
            legs={primaryRoute.legs}
            activeDay={activeDay}
            onSelectDay={onActiveDay}
          />
        ) : (
          <CalendarView
            days={selected.days}
            activeDay={activeDay}
            onSelectDay={onActiveDay}
            expanded={false}
          />
        )}
      </aside>

      <section className="flex flex-col gap-5">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <h2 className="text-xl font-semibold text-slate-100">{selected.name}</h2>
            <p className="mt-1 text-sm text-slate-400">{selected.recommendedFor}</p>
          </div>
          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              onClick={handleShare}
              className="rounded-md border border-slate-600 bg-slate-800 px-3 py-1.5 text-xs text-slate-200 hover:bg-slate-700"
            >
              Copy link
            </button>
            <button
              type="button"
              onClick={() => printItinerary(selected)}
              className="rounded-md border border-slate-600 bg-slate-800 px-3 py-1.5 text-xs text-slate-200 hover:bg-slate-700"
            >
              Print / PDF
            </button>
          </div>
        </div>

        {selected.conflictNote && (
          <p className="rounded-md bg-slate-800 px-3 py-2 text-xs text-amber-200/90">
            {selected.conflictNote}
          </p>
        )}

        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          <StatCard label="Games" value={String(selected.gameCount)} />
          <StatCard label="Score" value={selected.totalInterestScore.toFixed(2)} accent />
          <StatCard
            label="Days per city"
            value={analysis.daysPerCity.map((c) => `${c.city} ${c.days}d`).join(', ')}
            small
          />
          <StatCard
            label="Top teams"
            value={analysis.gamesPerTeam
              .slice(0, 3)
              .map((t) => `${t.tricode}×${t.count}`)
              .join(', ')}
            small
          />
        </div>

        <CalendarView
          days={selected.days}
          activeDay={activeDay}
          onSelectDay={onActiveDay}
          expanded
        />

        <div className="min-h-[420px]">
          <USMap layers={mapLayers} />
        </div>

        <BudgetBreakdown budget={analysis.budget} />

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
          onSelectDay={onActiveDay}
        />
      </section>
    </div>
  )
}

function StatCard({
  label,
  value,
  accent = false,
  small = false,
}: {
  label: string
  value: string
  accent?: boolean
  small?: boolean
}) {
  return (
    <div className="rounded-lg border border-slate-700 bg-slate-900/50 px-3 py-2">
      <p className="text-[10px] uppercase tracking-wide text-slate-500">{label}</p>
      <p
        className={`mt-0.5 font-medium ${accent ? 'text-amber-300' : 'text-slate-200'} ${small ? 'text-[11px]' : 'text-sm'}`}
      >
        {value}
      </p>
    </div>
  )
}
