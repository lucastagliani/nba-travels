import type { Day, Game } from '../types'

export interface GameEntry {
  day: number
  date: string
  weekday: string
  location: string
  game: Game
}

export function extractGames(days: Day[], includeOptional = true): GameEntry[] {
  return days
    .filter((d) => d.game && (includeOptional || !d.game.optional))
    .map((d) => ({
      day: d.day,
      date: d.date,
      weekday: d.weekday,
      location: d.location,
      game: d.game as Game,
    }))
}

interface GameListProps {
  days: Day[]
  label?: string
  color?: string
  activeDay?: number | null
  onSelectDay?: (day: number | null) => void
}

export function GameList({
  days,
  label,
  color,
  activeDay = null,
  onSelectDay,
}: GameListProps) {
  const games = extractGames(days)
  const optionalCount = days.filter((d) => d.game?.optional).length

  if (games.length === 0) {
    return (
      <div className="rounded-lg border border-slate-700 bg-slate-900/50 p-4">
        {label && <h3 className="mb-2 text-sm font-semibold text-slate-200">{label}</h3>}
        <p className="text-sm text-slate-500">No games in this itinerary.</p>
      </div>
    )
  }

  const coreGames = games.filter((g) => !g.game.optional)
  const optionalGames = games.filter((g) => g.game.optional)
  const totalScore = coreGames.reduce((sum, g) => sum + g.game.interestScore, 0)

  return (
    <div className="rounded-lg border border-slate-700 bg-slate-900/50 p-4">
      {label && (
        <div className="mb-3 flex flex-wrap items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            {color && (
              <span className="inline-block h-2.5 w-5 rounded-sm" style={{ background: color }} />
            )}
            <h3 className="text-sm font-semibold text-slate-200">Games · {label}</h3>
          </div>
          <p className="text-xs text-slate-500">
            {coreGames.length} games · total score{' '}
            <span className="text-amber-300">{totalScore.toFixed(2)}</span>
            {optionalCount > 0 && ` · ${optionalCount} optional`}
          </p>
        </div>
      )}

      <div className="overflow-x-auto">
        <table className="w-full text-left text-xs">
          <thead>
            <tr className="border-b border-slate-700 text-slate-500">
              <th className="pb-2 pr-3 font-medium">Day</th>
              <th className="pb-2 pr-3 font-medium">Date</th>
              <th className="pb-2 pr-3 font-medium">Matchup</th>
              <th className="pb-2 pr-3 font-medium">City</th>
              <th className="pb-2 pr-3 font-medium">Time</th>
              <th className="pb-2 font-medium">Score</th>
            </tr>
          </thead>
          <tbody>
            {coreGames.map((entry) => (
              <GameRow
                key={`${entry.day}-${entry.game.matchup}`}
                entry={entry}
                highlighted={activeDay === entry.day}
                onSelect={onSelectDay}
              />
            ))}
          </tbody>
        </table>

        {optionalGames.length > 0 && (
          <>
            <p className="mb-2 mt-4 text-[11px] font-medium uppercase tracking-wide text-slate-500">
              Optional
            </p>
            <table className="w-full text-left text-xs">
              <tbody>
                {optionalGames.map((entry) => (
                  <GameRow
                    key={`opt-${entry.day}-${entry.game.matchup}`}
                    entry={entry}
                    highlighted={activeDay === entry.day}
                    onSelect={onSelectDay}
                    optional
                  />
                ))}
              </tbody>
            </table>
          </>
        )}
      </div>
    </div>
  )
}

function GameRow({
  entry,
  highlighted,
  onSelect,
  optional = false,
}: {
  entry: GameEntry
  highlighted: boolean
  onSelect?: (day: number | null) => void
  optional?: boolean
}) {
  const { day, date, weekday, location, game } = entry
  const clickable = Boolean(onSelect)

  return (
    <tr
      className={`border-b border-slate-800/80 ${
        highlighted ? 'bg-amber-500/10' : optional ? 'opacity-70' : ''
      } ${clickable ? 'cursor-pointer hover:bg-slate-800/60' : ''}`}
      onClick={() => onSelect?.(highlighted ? null : day)}
    >
      <td className="py-2.5 pr-3 text-slate-400">{day}</td>
      <td className="py-2.5 pr-3 text-slate-300">
        {weekday} {date}
      </td>
      <td className="py-2.5 pr-3 font-medium text-slate-100">
        {game.marquee && <span className="mr-1">⭐</span>}
        {game.matchup}
        {optional && <span className="ml-1.5 text-slate-500">(optional)</span>}
      </td>
      <td className="py-2.5 pr-3 text-slate-300">{location}</td>
      <td className="py-2.5 pr-3 text-slate-400">{game.timeLocal ?? '—'}</td>
      <td className="py-2.5 text-amber-300/90">{game.interestScore.toFixed(2)}</td>
    </tr>
  )
}
