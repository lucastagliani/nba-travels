import { useCallback, useEffect, useMemo, useState } from 'react'
import { Footer } from './components/Footer'
import { MobileBottomNav } from './components/MobileBottomNav'
import { ThemeToggle } from './components/ThemeToggle'
import { sortItinerariesByDate } from './lib/itineraryStats'
import { readUrlState } from './lib/print'
import {
  DEFAULT_TRIP_ID,
  getTripBundle,
  isTripId,
  listTrips,
  setActiveTrip,
  type TripId,
} from './lib/tripData'
import { CompareView } from './views/CompareView'
import { DetailView } from './views/DetailView'
import { HowItWorksView } from './views/HowItWorksView'

type AppView = 'compare' | 'detail' | 'how-it-works'

function syncUrl(view: AppView, tripId: TripId, id: string | null, day: number | null) {
  const url = new URL(window.location.href)
  url.searchParams.set('view', view)
  if (tripId !== DEFAULT_TRIP_ID) url.searchParams.set('trip', tripId)
  else url.searchParams.delete('trip')
  if (view === 'detail' && id) {
    url.searchParams.set('id', id)
    if (day != null) url.searchParams.set('day', String(day))
    else url.searchParams.delete('day')
  } else {
    url.searchParams.delete('id')
    url.searchParams.delete('day')
  }
  window.history.replaceState(null, '', url.toString())
}

function defaultOptionId(tripId: TripId) {
  const options = sortItinerariesByDate(getTripBundle(tripId).itinerary.options)
  return options.find((o) => o.recommended)?.id ?? options[0]?.id ?? ''
}

export default function App() {
  const initial = readUrlState()
  const initialTrip: TripId = isTripId(initial.trip) ? initial.trip : DEFAULT_TRIP_ID
  setActiveTrip(initialTrip)

  const [tripId, setTripId] = useState<TripId>(initialTrip)
  const [view, setView] = useState<AppView>(initial.view)
  const [selectedId, setSelectedId] = useState(initial.id ?? defaultOptionId(initialTrip))
  const [activeDay, setActiveDay] = useState<number | null>(initial.day)

  const trip = useMemo(() => getTripBundle(tripId), [tripId])
  const options = useMemo(
    () => sortItinerariesByDate(trip.itinerary.options),
    [trip],
  )
  const defaultId = useMemo(() => defaultOptionId(tripId), [tripId])
  const showPlanner = view !== 'how-it-works'

  const selectedExists = useMemo(
    () => options.some((o) => o.id === selectedId),
    [options, selectedId],
  )

  useEffect(() => {
    setActiveTrip(tripId)
  }, [tripId])

  useEffect(() => {
    if (!selectedExists) setSelectedId(defaultId)
  }, [selectedExists, defaultId])

  useEffect(() => {
    syncUrl(view, tripId, selectedId, activeDay)
  }, [view, tripId, selectedId, activeDay])

  const changeTrip = useCallback((next: TripId) => {
    setActiveTrip(next)
    setTripId(next)
    setSelectedId(defaultOptionId(next))
    setActiveDay(null)
    setView('compare')
  }, [])

  const openDetail = useCallback((id: string) => {
    setSelectedId(id)
    setActiveDay(null)
    setView('detail')
  }, [])

  const goCompare = useCallback(() => {
    setView('compare')
    setActiveDay(null)
  }, [])

  const goDetail = useCallback(() => {
    setView('detail')
  }, [])

  const goHowItWorks = useCallback(() => {
    setView('how-it-works')
    setActiveDay(null)
  }, [])

  return (
    <div className="flex min-h-screen flex-col bg-bg text-fg">
      <header
        className="border-b border-border px-4 py-4 md:px-6 md:py-5"
        style={{ paddingTop: 'max(1rem, env(safe-area-inset-top))' }}
      >
        <div className="mx-auto flex max-w-7xl flex-wrap items-end justify-between gap-4">
          <div>
            <h1 className="text-xl font-bold tracking-tight md:text-2xl">
              NBA Travels — Route Planner
            </h1>
            <p className="mt-1 text-sm text-muted-fg">
              {showPlanner
                ? `${trip.name} · compare itineraries · calendar · budget`
                : 'How the planner works'}
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            {showPlanner && (
              <>
                <label className="sr-only" htmlFor="trip-select">
                  Trip
                </label>
                <select
                  id="trip-select"
                  value={tripId}
                  onChange={(e) => changeTrip(e.target.value as TripId)}
                  className="min-h-[36px] rounded-md border border-border bg-muted px-3 py-1.5 text-xs text-fg"
                >
                  {listTrips().map((t) => (
                    <option key={t.id} value={t.id}>
                      {t.name}
                    </option>
                  ))}
                </select>
              </>
            )}
            <ThemeToggle />
            <nav className="hidden rounded-lg border border-border p-0.5 text-sm md:flex">
              {showPlanner && (
                <>
                  <button
                    type="button"
                    onClick={goCompare}
                    className={`rounded-md px-3 py-1.5 ${view === 'compare' ? 'bg-elevated text-fg' : 'text-muted-fg hover:text-fg'}`}
                  >
                    Compare all
                  </button>
                  <button
                    type="button"
                    onClick={goDetail}
                    className={`rounded-md px-3 py-1.5 ${view === 'detail' ? 'bg-elevated text-fg' : 'text-muted-fg hover:text-fg'}`}
                  >
                    Trip detail
                  </button>
                </>
              )}
              <button
                type="button"
                onClick={goHowItWorks}
                className={`rounded-md px-3 py-1.5 ${view === 'how-it-works' ? 'bg-elevated text-fg' : 'text-muted-fg hover:text-fg'}`}
              >
                How it works
              </button>
            </nav>
          </div>
        </div>
      </header>

      <main
        className={`mx-auto w-full max-w-7xl flex-1 px-4 py-4 md:p-6 ${
          showPlanner ? 'pb-4 md:pb-6' : 'pb-6'
        }`}
      >
        {view === 'how-it-works' ? (
          <HowItWorksView onBack={goCompare} />
        ) : view === 'compare' ? (
          <CompareView options={options} onSelect={openDetail} />
        ) : (
          <DetailView
            options={options}
            selectedId={selectedId}
            activeDay={activeDay}
            onSelectId={setSelectedId}
            onActiveDay={setActiveDay}
            onBack={goCompare}
          />
        )}
      </main>

      <Footer onHowItWorks={goHowItWorks} compactBottom={!showPlanner} />

      {showPlanner && (
        <MobileBottomNav view={view} onCompare={goCompare} onDetail={goDetail} />
      )}
    </div>
  )
}
