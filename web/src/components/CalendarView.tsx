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

  const { monthLabel, weeks } = useMemo(() => {
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
        const tripDay = dayByDate.get(iso) ?? null
        week.push({
          date: iso,
          dayNum: current.getDate(),
          weekday: WEEKDAYS[current.getDay()],
          tripDay,
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
  }, [days, dayByDate])

  const cellMinH = expanded ? 'min-h-[120px]' : 'min-h-[52px]'
  const headerSize = expanded ? 'text-sm' : 'text-[10px]'
  const dayNumSize = expanded ? 'text-base' : 'text-[11px]'
  const bodySize = expanded ? 'text-xs' : 'text-[9px]'

  return (
    <div
      className={`rounded-xl border border-slate-700 bg-slate-900/50 ${expanded ? 'p-6' : 'p-4'}`}
    >
      <div className="mb-4 flex flex-wrap items-end justify-between gap-2">
        <div>
          <h3 className={`font-semibold text-slate-100 ${expanded ? 'text-lg' : 'text-sm'}`}>
            Trip calendar
          </h3>
          <p className={`text-slate-400 ${expanded ? 'text-sm' : 'text-xs'}`}>{monthLabel}</p>
        </div>
        {expanded && (
          <p className="text-xs text-slate-500">
            Click a trip day to highlight it on the map · 🏀 game · ✈️/🚆 travel
          </p>
        )}
      </div>

      <div
        className={`grid grid-cols-7 text-center font-medium text-slate-500 ${headerSize} ${expanded ? 'gap-2' : 'gap-1'}`}
      >
        {WEEKDAYS.map((d) => (
          <div key={d} className={`py-2 ${expanded ? 'rounded-md bg-slate-800/50' : 'py-1'}`}>
            {d}
          </div>
        ))}
      </div>

      <div className={`mt-2 ${expanded ? 'space-y-2' : 'space-y-1'}`}>
        {weeks.map((week) => (
          <div key={week[0].date} className={`grid grid-cols-7 ${expanded ? 'gap-2' : 'gap-1'}`}>
            {week.map((cell) => {
              const trip = cell.tripDay
              const selected = trip && activeDay === trip.day
              const hasGame = Boolean(trip?.game && !trip.game.optional)
              const hasTravel = Boolean(trip?.travel?.from && trip?.travel?.to)

              if (!cell.inRange) {
                return (
                  <div
                    key={cell.date}
                    className={`${cellMinH} rounded-lg bg-slate-950/30 p-2 opacity-30`}
                  />
                )
              }

              return (
                <button
                  key={cell.date}
                  type="button"
                  onClick={() => onSelectDay(trip ? (selected ? null : trip.day) : null)}
                  disabled={!trip}
                  className={`${cellMinH} rounded-lg border p-2 text-left transition ${
                    selected
                      ? 'border-amber-500/70 bg-amber-500/15 ring-1 ring-amber-500/30'
                      : trip
                        ? 'border-slate-700 bg-slate-800/50 hover:border-slate-500 hover:bg-slate-800/80'
                        : 'border-transparent bg-slate-900/20'
                  } ${!trip ? 'cursor-default' : ''}`}
                >
                  <div className="flex items-start justify-between gap-1">
                    <span className={`font-bold text-slate-200 ${dayNumSize}`}>{cell.dayNum}</span>
                    {trip && (
                      <span className={`rounded bg-slate-700/80 px-1.5 py-0.5 ${bodySize} text-slate-400`}>
                        D{trip.day}
                      </span>
                    )}
                  </div>

                  {trip && (
                    <div className={`mt-2 space-y-1 ${bodySize}`}>
                      <div className="font-medium text-slate-300">{trip.location}</div>

                      {hasGame && (
                        <div
                          className={`rounded-md px-2 py-1 ${
                            trip.game!.marquee
                              ? 'bg-amber-500/20 text-amber-100'
                              : 'bg-slate-700/60 text-slate-200'
                          }`}
                        >
                          {trip.game!.marquee && '⭐ '}
                          {trip.game!.matchup}
                          {trip.game!.timeLocal && (
                            <span className="block text-slate-400">{trip.game!.timeLocal} local</span>
                          )}
                          {expanded && (
                            <span className="block text-slate-500">
                              score {trip.game!.interestScore.toFixed(2)}
                            </span>
                          )}
                        </div>
                      )}

                      {!hasGame && hasTravel && (
                        <div className="text-cyan-400/90">
                          {trip.travel!.from} → {trip.travel!.to}
                          {trip.travel!.mode && ` · ${trip.travel!.mode}`}
                        </div>
                      )}

                      {!hasGame && !hasTravel && trip.notes && (
                        <div className="italic text-slate-500">{trip.notes}</div>
                      )}

                      {!hasGame && !hasTravel && !trip.notes && expanded && (
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
