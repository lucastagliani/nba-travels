import { useCallback, useEffect, useMemo, useState } from 'react'
import itineraryData from '@season/itinerary-options.json'
import { MobileBottomNav } from './components/MobileBottomNav'
import { readUrlState } from './lib/print'
import type { ItineraryData } from './types'
import { CompareView } from './views/CompareView'
import { DetailView } from './views/DetailView'

const data = itineraryData as ItineraryData

type AppView = 'compare' | 'detail'

function syncUrl(view: AppView, id: string | null, day: number | null) {
  const url = new URL(window.location.href)
  url.searchParams.set('view', view)
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

export default function App() {
  const defaultId = data.options.find((o) => o.recommended)?.id ?? data.options[0].id
  const initial = readUrlState()

  const [view, setView] = useState<AppView>(initial.view)
  const [selectedId, setSelectedId] = useState(initial.id ?? defaultId)
  const [activeDay, setActiveDay] = useState<number | null>(initial.day)

  const selectedExists = useMemo(
    () => data.options.some((o) => o.id === selectedId),
    [selectedId],
  )

  useEffect(() => {
    if (!selectedExists) setSelectedId(defaultId)
  }, [selectedExists, defaultId])

  useEffect(() => {
    syncUrl(view, selectedId, activeDay)
  }, [view, selectedId, activeDay])

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

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100">
      <header
        className="border-b border-slate-800 px-4 py-4 md:px-6 md:py-5"
        style={{ paddingTop: 'max(1rem, env(safe-area-inset-top))' }}
      >
        <div className="mx-auto flex max-w-7xl flex-wrap items-end justify-between gap-4">
          <div>
            <h1 className="text-xl font-bold tracking-tight md:text-2xl">
              NBA Travels — Route Planner
            </h1>
            <p className="mt-1 text-sm text-slate-400">
              Compare itineraries · calendar · budget · printable export
            </p>
          </div>

          <nav className="hidden rounded-lg border border-slate-700 p-0.5 text-sm md:flex">
            <button
              type="button"
              onClick={goCompare}
              className={`rounded-md px-3 py-1.5 ${view === 'compare' ? 'bg-slate-700 text-white' : 'text-slate-400 hover:text-slate-200'}`}
            >
              Compare all
            </button>
            <button
              type="button"
              onClick={goDetail}
              className={`rounded-md px-3 py-1.5 ${view === 'detail' ? 'bg-slate-700 text-white' : 'text-slate-400 hover:text-slate-200'}`}
            >
              Trip detail
            </button>
          </nav>
        </div>
      </header>

      <main className="mx-auto max-w-7xl px-4 py-4 pb-24 md:p-6 md:pb-6">
        {view === 'compare' ? (
          <CompareView options={data.options} onSelect={openDetail} />
        ) : (
          <DetailView
            options={data.options}
            selectedId={selectedId}
            activeDay={activeDay}
            onSelectId={setSelectedId}
            onActiveDay={setActiveDay}
            onBack={goCompare}
          />
        )}
      </main>

      <MobileBottomNav view={view} onCompare={goCompare} onDetail={goDetail} />
    </div>
  )
}
