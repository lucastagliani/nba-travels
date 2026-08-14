import { useMemo } from 'react'
import type { Day } from '../types'

interface CalendarViewProps {
  days: Day[]
  activeDay: number | null
  onSelectDay: (day: number | null) => void
  expanded?: boolean
}

interface CalendarCell {
  date: string
  dayNum: number
  weekday: string
  tripDay: Day | null
  inRange: boolean
}

function parseDate(dateStr: string): Date {
  const [y, m, d] = dateStr.split('-').map(Number)
  return new Date(y, m - 1, d)
}

function formatIso(date: Date): string {
  const y = date.getFullYear()
  const m = String(date.getMonth() + 1).padStart(2, '0')
  const d = String(date.getDate()).padStart(2, '0')
  return `${y}-${m}-${d}`
}

const WEEKDAYS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']
const WEEKDAYS_SHORT = ['S', 'M', 'T', 'W', 'T', 'F', 'S']

function buildWeeks(days: Day[], dayByDate: Map<string, Day>) {
  if (days.length === 0) {
    return { monthLabel: '', weeks: [] as CalendarCell[][] }
  }

  const start = parseDate(days[0].date)
  const end = parseDate(days[days.length - 1].date)

  const gridStart = new Date(start)
  gridStart.setDate(gridStart.getDate() - gridStart.getDay())

  const gridEnd = new Date(end)
  gridEnd.setDate(gridEnd.getDate() + (6 - gridEnd.getDay()))

  const weeks: CalendarCell[][] = []
  const current = new Date(gridStart)

  while (current <= gridEnd) {
    const week: CalendarCell[] = []
    for (let i = 0; i < 7; i += 1) {
      const iso = formatIso(current)
      week.push({
        date: iso,
        dayNum: current.getDate(),
        weekday: WEEKDAYS[current.getDay()],
        tripDay: dayByDate.get(iso) ?? null,
        inRange: current >= start && current <= end,
      })
      current.setDate(current.getDate() + 1)
    }
    weeks.push(week)
  }

  const monthLabel =
    start.getMonth() === end.getMonth()
      ? start.toLocaleDateString('en-US', { month: 'long', year: 'numeric' })
      : `${start.toLocaleDateString('en-US', { month: 'short' })} – ${end.toLocaleDateString('en-US', { month: 'short', year: 'numeric' })}`

  return { monthLabel, weeks }
}

function cellIndicators(trip: Day) {
  const hasGame = Boolean(trip.game && !trip.game.optional)
  const hasTravel = Boolean(trip.travel?.from && trip.travel?.to)
  if (hasGame) return { dot: 'bg-amber-400', title: `${trip.game!.matchup} · ${trip.location}` }
  if (hasTravel) return { dot: 'bg-cyan-400', title: `Travel · ${trip.location}` }
  return { dot: 'bg-slate-500', title: trip.notes ?? trip.location }
}

export function CalendarView({
  days,
  activeDay,
  onSelectDay,
  expanded = false,
}: CalendarViewProps) {
  const dayByDate = useMemo(() => {
    const map = new Map<string, Day>()
    for (const day of days) {
      map.set(day.date, day)
    }
    return map
  }, [days])

  const { monthLabel, weeks } = useMemo(
    () => buildWeeks(days, dayByDate),
    [days, dayByDate],
  )

  if (!expanded) {
    return (
      <div className="rounded-xl border border-slate-700 bg-slate-900/50 p-3">
        <div className="mb-2">
          <h3 className="text-sm font-semibold text-slate-100">Trip calendar</h3>
          <p className="text-[10px] text-slate-500">{monthLabel}</p>
        </div>

        <div className="grid grid-cols-7 gap-0.5 text-center text-[9px] font-medium text-slate-500">
          {WEEKDAYS_SHORT.map((d, i) => (
            <div key={`${d}-${i}`} className="py-0.5">
              {d}
            </div>
          ))}
        </div>

        <div className="mt-1 space-y-0.5">
          {weeks.map((week) => (
            <div key={week[0].date} className="grid grid-cols-7 gap-0.5">
              {week.map((cell) => {
                const trip = cell.tripDay
                const selected = trip && activeDay === trip.day

                if (!cell.inRange) {
                  return <div key={cell.date} className="aspect-square min-w-0" />
                }

                if (!trip) {
                  return (
                    <div
                      key={cell.date}
                      className="flex aspect-square min-w-0 items-center justify-center text-[10px] text-slate-600"
                    >
                      {cell.dayNum}
                    </div>
                  )
                }

                const { dot, title } = cellIndicators(trip)

                return (
                  <button
                    key={cell.date}
                    type="button"
                    title={title}
                    onClick={() => onSelectDay(selected ? null : trip.day)}
                    className={`flex aspect-square min-w-0 flex-col items-center justify-center rounded-md border text-[10px] transition ${
                      selected
                        ? 'border-amber-500/70 bg-amber-500/20 text-amber-100'
                        : 'border-slate-700 bg-slate-800/60 text-slate-300 hover:border-slate-500'
                    }`}
                  >
                    <span className="font-semibold leading-none">{cell.dayNum}</span>
                    <span className={`mt-0.5 h-1.5 w-1.5 shrink-0 rounded-full ${dot}`} />
                    <span className="mt-0.5 text-[8px] leading-none text-slate-500">D{trip.day}</span>
                  </button>
                )
              })}
            </div>
          ))}
        </div>

        <div className="mt-2 flex flex-wrap gap-x-3 gap-y-1 text-[9px] text-slate-500">
          <span className="flex items-center gap-1">
            <span className="h-1.5 w-1.5 rounded-full bg-amber-400" /> Game
          </span>
          <span className="flex items-center gap-1">
            <span className="h-1.5 w-1.5 rounded-full bg-cyan-400" /> Travel
          </span>
          <span className="flex items-center gap-1">
            <span className="h-1.5 w-1.5 rounded-full bg-slate-500" /> Rest
          </span>
        </div>
      </div>
    )
  }

  return (
    <div className="rounded-xl border border-slate-700 bg-slate-900/50 p-6">
      <div className="mb-4 flex flex-wrap items-end justify-between gap-2">
        <div>
          <h3 className="text-lg font-semibold text-slate-100">Trip calendar</h3>
          <p className="text-sm text-slate-400">{monthLabel}</p>
        </div>
        <p className="text-xs text-slate-500">
          Click a trip day to highlight it on the map · 🏀 game · ✈️/🚆 travel
        </p>
      </div>

      <div className="grid grid-cols-7 gap-2 text-center text-sm font-medium text-slate-500">
        {WEEKDAYS.map((d) => (
          <div key={d} className="rounded-md bg-slate-800/50 py-2">
            {d}
          </div>
        ))}
      </div>

      <div className="mt-2 space-y-2">
        {weeks.map((week) => (
          <div key={week[0].date} className="grid grid-cols-7 gap-2">
            {week.map((cell) => {
              const trip = cell.tripDay
              const selected = trip && activeDay === trip.day
              const hasGame = Boolean(trip?.game && !trip.game.optional)
              const hasTravel = Boolean(trip?.travel?.from && trip?.travel?.to)

              if (!cell.inRange) {
                return (
                  <div
                    key={cell.date}
                    className="min-h-[120px] min-w-0 rounded-lg bg-slate-950/30 p-2 opacity-30"
                  />
                )
              }

              return (
                <button
                  key={cell.date}
                  type="button"
                  onClick={() => onSelectDay(trip ? (selected ? null : trip.day) : null)}
                  disabled={!trip}
                  className={`min-h-[120px] min-w-0 rounded-lg border p-2 text-left transition ${
                    selected
                      ? 'border-amber-500/70 bg-amber-500/15 ring-1 ring-amber-500/30'
                      : trip
                        ? 'border-slate-700 bg-slate-800/50 hover:border-slate-500 hover:bg-slate-800/80'
                        : 'border-transparent bg-slate-900/20'
                  } ${!trip ? 'cursor-default' : ''}`}
                >
                  <div className="flex items-start justify-between gap-1">
                    <span className="text-base font-bold text-slate-200">{cell.dayNum}</span>
                    {trip && (
                      <span className="shrink-0 rounded bg-slate-700/80 px-1.5 py-0.5 text-xs text-slate-400">
                        D{trip.day}
                      </span>
                    )}
                  </div>

                  {trip && (
                    <div className="mt-2 space-y-1 text-xs">
                      <div className="truncate font-medium text-slate-300">{trip.location}</div>

                      {hasGame && (
                        <div
                          className={`rounded-md px-2 py-1 ${
                            trip.game!.marquee
                              ? 'bg-amber-500/20 text-amber-100'
                              : 'bg-slate-700/60 text-slate-200'
                          }`}
                        >
                          {trip.game!.marquee && '⭐ '}
                          <span className="break-words">{trip.game!.matchup}</span>
                          {trip.game!.timeLocal && (
                            <span className="block text-slate-400">{trip.game!.timeLocal} local</span>
                          )}
                          <span className="block text-slate-500">
                            score {trip.game!.interestScore.toFixed(2)}
                          </span>
                        </div>
                      )}

                      {!hasGame && hasTravel && (
                        <div className="break-words text-cyan-400/90">
                          {trip.travel!.from} → {trip.travel!.to}
                          {trip.travel!.mode && ` · ${trip.travel!.mode}`}
                        </div>
                      )}

                      {!hasGame && !hasTravel && trip.notes && (
                        <div className="italic text-slate-500">{trip.notes}</div>
                      )}

                      {!hasGame && !hasTravel && !trip.notes && (
                        <div className="text-slate-500">Rest / explore</div>
                      )}
                    </div>
                  )}
                </button>
              )
            })}
          </div>
        ))}
      </div>
    </div>
  )
}
