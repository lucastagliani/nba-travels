import budgetConfig from '@data/budget-config.json'
import teamTiersData from '@season/team-tiers.json'
import type { Day, Game, ItineraryOption, ParsedRoute } from '../types'
import { extractGames } from './games'
import { parseItineraryRoute } from './routeParser'

const config = budgetConfig as {
  currency: string
  travelers: number
  travelersNote?: string
  home: { city: string; country: string; airport: string }
  internationalRoundTripPerPerson: number
  internationalRoundTripByCity?: Record<string, number>
  internationalOpenJawPremiumPerPerson?: number
  travel: { trainPerMile: number; flightFlat: number; drivePerMile: number }
  hotelPerNight: number
  ticketDefault: number
  ticketMarquee: number
  dailyFood: number
}

const travelers = config.travelers ?? 1

const tricodeToName: Record<string, string> = {}
for (const tiers of Object.values(teamTiersData.tiers)) {
  for (const team of tiers as { tricode: string; name: string }[]) {
    tricodeToName[team.tricode] = team.name
  }
}

export interface CityDayCount {
  city: string
  days: number
}

export interface TeamGameCount {
  tricode: string
  name: string
  count: number
}

export interface BudgetEstimate {
  currency: string
  travelers: number
  arrivalCity: string
  departureCity: string
  internationalFlights: number
  domesticTravel: number
  travel: number
  hotels: number
  tickets: number
  food: number
  total: number
  tripDays: number
  gameCount: number
  openJaw: boolean
}

export interface ItineraryAnalysis {
  option: ItineraryOption
  route: ParsedRoute
  daysPerCity: CityDayCount[]
  gamesPerTeam: TeamGameCount[]
  budget: BudgetEstimate
}

/** Chronological order by trip start date (then name for same-day trips). */
export function sortItinerariesByDate(options: ItineraryOption[]): ItineraryOption[] {
  return [...options].sort((a, b) => {
    const byDate = a.startDate.localeCompare(b.startDate)
    if (byDate !== 0) return byDate
    return a.name.localeCompare(b.name)
  })
}

export function parseMatchupTeams(matchup: string): { away: string; home: string } | null {
  const match = matchup.match(/^([A-Z]{3})\s+@\s+([A-Z]{3})$/)
  if (!match) return null
  return { away: match[1], home: match[2] }
}

export function countDaysPerCity(days: Day[]): CityDayCount[] {
  const counts = new Map<string, number>()
  for (const day of days) {
    counts.set(day.location, (counts.get(day.location) ?? 0) + 1)
  }
  return [...counts.entries()]
    .map(([city, dayCount]) => ({ city, days: dayCount }))
    .sort((a, b) => b.days - a.days)
}

export function countGamesPerTeam(days: Day[]): TeamGameCount[] {
  const counts = new Map<string, number>()

  for (const entry of extractGames(days, true)) {
    const teams = parseMatchupTeams(entry.game.matchup)
    if (!teams) continue
    counts.set(teams.away, (counts.get(teams.away) ?? 0) + 1)
    counts.set(teams.home, (counts.get(teams.home) ?? 0) + 1)
  }

  return [...counts.entries()]
    .map(([tricode, count]) => ({
      tricode,
      name: tricodeToName[tricode] ?? tricode,
      count,
    }))
    .sort((a, b) => b.count - a.count)
}

function domesticLegCost(mode: string | undefined, miles: number | null | undefined): number {
  let base = 0
  if (mode === 'flight') base = config.travel.flightFlat
  else if (mode === 'train' && miles != null) base = miles * config.travel.trainPerMile
  else if (mode === 'drive' && miles != null) base = miles * config.travel.drivePerMile
  else if (miles != null) base = miles * config.travel.drivePerMile
  else base = config.travel.flightFlat

  if (mode === 'drive') return base
  return base * travelers
}

function ticketCost(game: Game): number {
  const perPerson = game.marquee ? config.ticketMarquee : config.ticketDefault
  return perPerson * travelers
}

function getArrivalCity(days: Day[]): string {
  return days[0]?.location ?? 'United States'
}

function getDepartureCity(days: Day[]): string {
  return days[days.length - 1]?.location ?? getArrivalCity(days)
}

function internationalFlightsCost(arrivalCity: string, departureCity: string): number {
  const byCity = config.internationalRoundTripByCity ?? {}
  const defaultRate = config.internationalRoundTripPerPerson
  const arrivalRate = byCity[arrivalCity] ?? defaultRate
  const departureRate = byCity[departureCity] ?? defaultRate
  const openJawPremium = config.internationalOpenJawPremiumPerPerson ?? 0

  let perPerson = arrivalRate
  if (arrivalCity !== departureCity) {
    perPerson = Math.round((arrivalRate + departureRate) / 2 + openJawPremium)
  }

  return perPerson * travelers
}

export function estimateBudget(days: Day[], route: ParsedRoute): BudgetEstimate {
  const games = extractGames(days, false)
  const tripDays = days.length
  const arrivalCity = getArrivalCity(days)
  const departureCity = getDepartureCity(days)
  const openJaw = arrivalCity !== departureCity

  const internationalFlights = internationalFlightsCost(arrivalCity, departureCity)

  const domesticTravel = route.legs.reduce(
    (sum, leg) => sum + domesticLegCost(leg.mode, leg.distanceMiles),
    0,
  )

  const travel = internationalFlights + domesticTravel

  const cityDays = countDaysPerCity(days)
  const hotels = cityDays.reduce((sum, { days: d }) => sum + d * config.hotelPerNight, 0)

  const tickets = games.reduce((sum, { game }) => sum + ticketCost(game), 0)
  const food = tripDays * config.dailyFood * travelers
  const total = travel + hotels + tickets + food

  return {
    currency: config.currency,
    travelers,
    arrivalCity,
    departureCity,
    internationalFlights: Math.round(internationalFlights),
    domesticTravel: Math.round(domesticTravel),
    travel: Math.round(travel),
    hotels: Math.round(hotels),
    tickets: Math.round(tickets),
    food: Math.round(food),
    total: Math.round(total),
    tripDays,
    gameCount: games.length,
    openJaw,
  }
}

export function analyzeItinerary(option: ItineraryOption): ItineraryAnalysis {
  const route = parseItineraryRoute(option.days)
  return {
    option,
    route,
    daysPerCity: countDaysPerCity(option.days),
    gamesPerTeam: countGamesPerTeam(option.days),
    budget: estimateBudget(option.days, route),
  }
}

export function formatCurrency(amount: number, currency = 'USD'): string {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency,
    maximumFractionDigits: 0,
  }).format(amount)
}

export function budgetHomeLabel(): string {
  return `${config.home.city}, ${config.home.country} (${config.home.airport})`
}
