import { useMemo, useState } from 'react'
import type { ItineraryOption } from '../types'
import { BudgetBreakdown } from '../components/BudgetBreakdown'
import { CalendarView } from '../components/CalendarView'
import { CollapsibleSection } from '../components/CollapsibleSection'
import { DayTimeline } from '../components/DayTimeline'
import { GameList } from '../components/GameList'
import { ItineraryPicker } from '../components/ItineraryPicker'
import { ItinerarySelector } from '../components/ItinerarySelector'
import { RouteStats } from '../components/RouteStats'
import { Toast } from '../components/Toast'
import { USMap } from '../components/USMap'
import { ROUTE_COLORS } from '../lib/constants'
import { analyzeItinerary } from '../lib/itineraryStats'
import { printItinerary } from '../lib/print'
import { shareItinerary } from '../lib/share'
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
  const [toast, setToast] = useState<string | null>(null)

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

  const handleSelectId = (id: string) => {
    onSelectId(id)
    onActiveDay(null)
    if (id === compareId) {
      setCompareId(compareCandidates[0]?.id ?? id)
    }
  }

  const handleShare = async () => {
    try {
      const result = await shareItinerary(selected.name, selected.id, activeDay)
      if (result.method === 'share') {
        setToast('Shared!')
      } else if (result.method === 'copy') {
        setToast('Link copied to clipboard')
      }
    } catch (err) {
      if (err instanceof Error && err.name === 'AbortError') return
    }
  }

  return (
    <>
      <div className="grid gap-6 lg:grid-cols-[260px_1fr]">
        <aside className="hidden space-y-5 lg:block">
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
            onSelect={handleSelectId}
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
          <ItineraryPicker options={options} selectedId={selectedId} onSelect={handleSelectId} />

          <div className="flex flex-wrap items-start justify-between gap-3">
            <div>
              <button
                type="button"
                onClick={onBack}
                className="mb-2 text-sm text-slate-400 hover:text-slate-200 lg:hidden"
              >
                ← All itineraries
              </button>
              <h2 className="text-xl font-semibold text-slate-100">{selected.name}</h2>
              <p className="mt-1 text-sm text-slate-400">{selected.recommendedFor}</p>
            </div>
            <div className="flex flex-wrap gap-2">
              <button
                type="button"
                onClick={handleShare}
                className="min-h-[44px] rounded-md border border-slate-600 bg-slate-800 px-4 py-2 text-xs text-slate-200 hover:bg-slate-700"
              >
                Share
              </button>
              <button
                type="button"
                onClick={() => printItinerary(selected)}
                className="hidden min-h-[44px] rounded-md border border-slate-600 bg-slate-800 px-4 py-2 text-xs text-slate-200 hover:bg-slate-700 md:inline-block"
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

          <div className="hidden grid-cols-2 gap-3 lg:grid lg:grid-cols-4">
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

          <div className="order-1 lg:order-none">
            <CalendarView
              days={selected.days}
              activeDay={activeDay}
              onSelectDay={onActiveDay}
              expanded
            />
          </div>

          <div className="order-2 lg:order-last">
            <GameList
              days={selected.days}
              label={selected.name}
              color={ROUTE_COLORS.primary}
              activeDay={activeDay}
              onSelectDay={onActiveDay}
            />
          </div>

          <div className="order-3 min-h-[320px] md:min-h-[420px] lg:order-none">
            <USMap layers={mapLayers} />
          </div>

          <div className="order-4 space-y-3 lg:order-none">
            <div className="lg:hidden">
              <CollapsibleSection title="Budget & route stats" defaultOpen={false}>
                <div className="space-y-3 p-3">
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
                </div>
              </CollapsibleSection>
            </div>

            <div className="hidden lg:block lg:space-y-5">
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
            </div>
          </div>

          <div className="order-5 lg:hidden">
            <CollapsibleSection title="Map compare overlay" defaultOpen={false}>
              <div className="space-y-3 p-3">
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
                    className="min-h-[44px] w-full rounded-md border border-slate-600 bg-slate-900 px-3 py-2 text-sm text-slate-200"
                  >
                    {compareCandidates.map((option) => (
                      <option key={option.id} value={option.id}>
                        {option.name}
                      </option>
                    ))}
                  </select>
                )}
              </div>
            </CollapsibleSection>
          </div>
        </section>
      </div>

      <Toast message={toast ?? ''} visible={toast != null} onHide={() => setToast(null)} />
    </>
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
