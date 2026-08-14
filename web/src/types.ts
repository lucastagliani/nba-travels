export interface Game {
  matchup: string
  timeLocal: string | null
  arenaCity: string
  interestScore: number
  marquee?: boolean
  optional?: boolean
  notes?: string
}

export interface Travel {
  from?: string
  to?: string
  hours?: number
  mode?: 'train' | 'flight' | 'drive'
  description?: string
  notes?: string
}

export interface Day {
  day: number
  date: string
  weekday: string
  location: string
  travel: Travel | null
  game: Game | null
  notes?: string
}

export interface ItineraryOption {
  id: string
  name: string
  parentOption?: string
  recommended?: boolean
  recommendedFor: string
  startDate: string
  endDate: string
  cities: string[]
  gameCount: number
  totalInterestScore: number
  averageInterestScore: number
  marqueeGames: string[]
  conflictNote?: string
  days: Day[]
}

export interface ItineraryData {
  options: ItineraryOption[]
}

export interface CityCoords {
  lat: number
  lng: number
  arena: string
  state: string
  neighborhood?: string
  timezone?: string
  airport?: string
  airports?: string[]
  trainStation?: string
}

export type CityTier = 'S' | 'A' | 'B' | 'C'

export interface RouteStop {
  city: string
  stopIndex: number
  firstDay: number
  lastDay: number
  games: Game[]
  tier: CityTier
}

export interface RouteLeg {
  from: string
  to: string
  mode?: string
  hours?: number
  day: number
  distanceMiles?: number | null
}

export interface ParsedRoute {
  stops: RouteStop[]
  legs: RouteLeg[]
  allCities: string[]
  totalDistanceMiles: number
}

export interface MapRouteLayer {
  id: string
  label: string
  color: string
  route: ParsedRoute
  activeDay?: number | null
  activeLegs?: RouteLeg[]
  primary?: boolean
}
