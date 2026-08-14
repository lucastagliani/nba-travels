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
