import type { Day } from '../types'
import { extractGames, type GameEntry } from '../lib/games'

export type { GameEntry }

interface GameListProps {
  days: Day[]
  title?: string
  label?: string
  color?: string
  activeDay?: number | null
  onSelectDay?: (day: number | null) => void
}

export function GameList({
  days,
  title = 'Games',
  label,
  color,
  activeDay = null,
  onSelectDay,
}: GameListProps) {
  const games = extractGames(days)
  const optionalCount = days.filter((d) => d.game?.optional).length

  if (games.length === 0) {
    return (
      <div className="rounded-lg border border-border bg-card p-4">
        <h3 className="mb-2 text-sm font-semibold text-fg">{title}</h3>
        <p className="text-sm text-subtle">No games in this itinerary.</p>
      </div>
    )
  }

  const coreGames = games.filter((g) => !g.game.optional)
  const optionalGames = games.filter((g) => g.game.optional)
  const totalScore = coreGames.reduce((sum, g) => sum + g.game.interestScore, 0)

  return (
    <div className="rounded-lg border border-border bg-card p-4">
      <div className="mb-3 flex flex-wrap items-center justify-between gap-2">
        <div className="flex items-center gap-2">
          {color && (
            <span className="inline-block h-2.5 w-5 rounded-sm" style={{ background: color }} />
          )}
          <h3 className="text-sm font-semibold text-fg">{title}</h3>
          {label && <span className="text-xs text-subtle">· {label}</span>}
        </div>
        <p className="text-xs text-subtle">
          {coreGames.length} games · total score{' '}
          <span className="text-amber-300">{totalScore.toFixed(2)}</span>
          {optionalCount > 0 && ` · ${optionalCount} optional`}
        </p>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-left text-xs">
          <thead>
            <tr className="border-b border-border text-subtle">
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
            <p className="mb-2 mt-4 text-[11px] font-medium uppercase tracking-wide text-subtle">
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
      className={`border-b border-border/80 ${
        highlighted ? 'bg-amber-500/10' : optional ? 'opacity-70' : ''
      } ${clickable ? 'cursor-pointer hover:bg-muted/60' : ''}`}
      onClick={() => onSelect?.(highlighted ? null : day)}
    >
      <td className="py-2.5 pr-3 text-muted-fg">{day}</td>
      <td className="py-2.5 pr-3 text-fg-soft">
        {weekday} {date}
      </td>
      <td className="py-2.5 pr-3 font-medium text-fg">
        {game.marquee && <span className="mr-1">⭐</span>}
        {game.matchup}
        {optional && <span className="ml-1.5 text-subtle">(optional)</span>}
      </td>
      <td className="py-2.5 pr-3 text-fg-soft">{location}</td>
      <td className="py-2.5 pr-3 text-muted-fg">{game.timeLocal ?? '—'}</td>
      <td className="py-2.5 text-amber-300/90">{game.interestScore.toFixed(2)}</td>
    </tr>
  )
}
