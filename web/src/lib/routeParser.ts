import type { Day, Game, ParsedRoute, RouteLeg, RouteStop } from '../types'
import { getCityTier } from './cities'
import { cityDistanceMiles } from './distance'

export function parseItineraryRoute(days: Day[]): ParsedRoute {
  const stops: RouteStop[] = []
  const legs: RouteLeg[] = []

  for (const day of days) {
    const city = day.location
    const lastStop = stops[stops.length - 1]

    if (day.travel?.from && day.travel?.to) {
      legs.push({
        from: day.travel.from,
        to: day.travel.to,
        mode: day.travel.mode,
        hours: day.travel.hours,
        day: day.day,
        distanceMiles: cityDistanceMiles(day.travel.from, day.travel.to),
      })
    }

    if (!lastStop || lastStop.city !== city) {
      stops.push({
        city,
        stopIndex: stops.length + 1,
        firstDay: day.day,
        lastDay: day.day,
        games: day.game ? [day.game] : [],
        tier: getCityTier(city),
      })
    } else {
      lastStop.lastDay = day.day
      if (day.game) {
        lastStop.games.push(day.game)
      }
    }
  }

  const allCities = [...new Set(days.map((d) => d.location))]
  const totalDistanceMiles = legs.reduce((sum, leg) => sum + (leg.distanceMiles ?? 0), 0)

  return { stops, legs, allCities, totalDistanceMiles }
}

export function getLegsForDay(legs: RouteLeg[], day: number): RouteLeg[] {
  return legs.filter((leg) => leg.day === day)
}

export function formatGameLabel(game: Game): string {
  return game.matchup
}

export function countGames(days: Day[]): number {
  return days.filter((d) => d.game && !d.game.optional).length
}
