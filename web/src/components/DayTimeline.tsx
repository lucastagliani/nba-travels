import { MODE_ICONS } from '../lib/constants'
import { getLegsForDay } from '../lib/routeParser'
import { getCityMetaLabel, getWeatherForDay } from '../lib/weather'
import type { Day, RouteLeg } from '../types'
import { WeatherBadge } from './WeatherBadge'

interface DayTimelineProps {
  days: Day[]
  legs: RouteLeg[]
  activeDay: number | null
  onSelectDay: (day: number | null) => void
}

export function DayTimeline({ days, legs, activeDay, onSelectDay }: DayTimelineProps) {
  return (
    <div className="flex flex-col gap-2">
      <div className="flex items-center justify-between">
        <h2 className="text-sm font-semibold uppercase tracking-wide text-slate-400">
          Day by day
        </h2>
        {activeDay !== null && (
          <button
            type="button"
            onClick={() => onSelectDay(null)}
            className="text-xs text-amber-400 hover:text-amber-300"
          >
            Clear highlight
          </button>
        )}
      </div>

      <div className="max-h-[420px] space-y-2 overflow-y-auto pr-1">
        {days.map((day) => {
          const selected = activeDay === day.day
          const dayLegs = getLegsForDay(legs, day.day)
          const cityMeta = getCityMetaLabel(day.location)

          return (
            <button
              key={day.day}
              type="button"
              onClick={() => onSelectDay(selected ? null : day.day)}
              className={`w-full rounded-lg border px-3 py-2.5 text-left transition ${
                selected
                  ? 'border-amber-500/60 bg-amber-500/10'
                  : 'border-slate-700/80 bg-slate-800/30 hover:border-slate-600'
              }`}
            >
              <div className="flex items-center justify-between gap-2">
                <span className="text-sm font-semibold text-slate-100">
                  Day {day.day}
                  <span className="ml-2 font-normal text-slate-400">
                    {day.weekday} · {day.date}
                  </span>
                </span>
                <span className="text-xs font-medium text-slate-300">{day.location}</span>
              </div>

              <WeatherBadge
                weather={getWeatherForDay(day.location, day.date)}
                className="mt-1 block text-[11px]"
              />

              {cityMeta && (
                <p className="mt-0.5 text-[10px] text-slate-600">{cityMeta}</p>
              )}

              {dayLegs.length > 0 && (
                <div className="mt-1.5 text-xs text-slate-400">
                  {dayLegs.map((leg) => (
                    <span key={`${leg.from}-${leg.to}`} className="mr-2">
                      {MODE_ICONS[leg.mode ?? ''] ?? '→'} {leg.from} → {leg.to}
                      {leg.hours ? ` (${leg.hours}h)` : ''}
                    </span>
                  ))}
                </div>
              )}

              {day.travel?.description && !dayLegs.length && (
                <p className="mt-1 text-xs text-slate-500">{day.travel.description}</p>
              )}

              {day.game && (
                <div
                  className={`mt-2 rounded-md px-2 py-1.5 text-xs ${
                    day.game.marquee
                      ? 'bg-amber-500/15 text-amber-100'
                      : 'bg-slate-700/50 text-slate-200'
                  }`}
                >
                  {day.game.marquee && '⭐ '}
                  🏀 {day.game.matchup}
                  {day.game.timeLocal ? ` · ${day.game.timeLocal}` : ''}
                  {' · '}
                  score {day.game.interestScore.toFixed(2)}
                  {day.game.optional ? ' (optional)' : ''}
                </div>
              )}

              {!day.game && day.notes && (
                <p className="mt-1.5 text-xs italic text-slate-500">{day.notes}</p>
              )}
            </button>
          )
        })}
      </div>
    </div>
  )
}
