import type { ItineraryData } from '../types'
import seasonMeta from '@season/season.json'
import eastItinerary from '@season/trips/east-coast/itinerary-options.json'
import secondaryItinerary from '@season/trips/secondary/itinerary-options.json'
import eastCities from '@season/trips/east-coast/cities.json'
import secondaryCities from '@season/trips/secondary/cities.json'
import eastCityTiers from '@season/trips/east-coast/city-tiers.json'
import eastWeather from '@season/trips/east-coast/weather-normals.json'
import secondaryWeather from '@season/trips/secondary/weather-normals.json'
import type { CityCoords, CityTier } from '../types'

export type TripId = 'east-coast' | 'secondary'

interface CityTiersDoc {
  defaultTier?: CityTier
  tiers: Record<string, { city: string }[]>
}

interface WeatherNormalsDoc {
  entries: Record<string, Record<string, unknown>>
}

export interface TripBundle {
  id: TripId
  name: string
  description: string
  itinerary: ItineraryData
  cities: Record<string, CityCoords>
  cityTiers: CityTiersDoc | null
  weather: WeatherNormalsDoc | null
}

const TRIP_BUNDLES: Record<TripId, TripBundle> = {
  'east-coast': {
    id: 'east-coast',
    name: 'East Coast',
    description: seasonMeta.trips.find((t) => t.id === 'east-coast')?.description ?? '',
    itinerary: eastItinerary as ItineraryData,
    cities: eastCities as Record<string, CityCoords>,
    cityTiers: eastCityTiers as CityTiersDoc,
    weather: eastWeather as WeatherNormalsDoc,
  },
  secondary: {
    id: 'secondary',
    name: 'West Coast 2026',
    description: seasonMeta.trips.find((t) => t.id === 'secondary')?.description ?? '',
    itinerary: secondaryItinerary as ItineraryData,
    cities: secondaryCities as unknown as Record<string, CityCoords>,
    cityTiers: null,
    weather: secondaryWeather as WeatherNormalsDoc,
  },
}

export const DEFAULT_TRIP_ID = (seasonMeta.defaultTrip ?? 'east-coast') as TripId

export function isTripId(value: string | null | undefined): value is TripId {
  return value === 'east-coast' || value === 'secondary'
}

let activeTripId: TripId = DEFAULT_TRIP_ID

export function setActiveTrip(id: TripId) {
  activeTripId = id
}

export function getActiveTripId(): TripId {
  return activeTripId
}

export function getActiveTripBundle(): TripBundle {
  return TRIP_BUNDLES[activeTripId]
}

export function getTripBundle(id: TripId): TripBundle {
  return TRIP_BUNDLES[id]
}

export function listTrips(): TripBundle[] {
  return seasonMeta.trips
    .map((t) => TRIP_BUNDLES[t.id as TripId])
    .filter(Boolean)
}

const tierLookups = new Map<TripId, { lookup: Record<string, CityTier>; defaultTier: CityTier }>()

function getTierLookup(tripId: TripId) {
  const cached = tierLookups.get(tripId)
  if (cached) return cached

  const tiersDoc = TRIP_BUNDLES[tripId].cityTiers
  const lookup: Record<string, CityTier> = {}
  if (tiersDoc) {
    for (const [tier, entries] of Object.entries(tiersDoc.tiers)) {
      for (const entry of entries) {
        lookup[entry.city] = tier as CityTier
      }
    }
  }
  const result = { lookup, defaultTier: (tiersDoc?.defaultTier ?? 'C') as CityTier }
  tierLookups.set(tripId, result)
  return result
}

export function getCityCoords(city: string, tripId: TripId = activeTripId): CityCoords | null {
  return TRIP_BUNDLES[tripId].cities[city] ?? null
}

export function getCityTier(city: string, tripId: TripId = activeTripId): CityTier {
  const { lookup, defaultTier } = getTierLookup(tripId)
  return lookup[city] ?? defaultTier
}

export function getAllMappedCities(tripId: TripId = activeTripId): string[] {
  return Object.keys(TRIP_BUNDLES[tripId].cities)
}

export function getWeatherDoc(tripId: TripId = activeTripId): WeatherNormalsDoc | null {
  return TRIP_BUNDLES[tripId].weather
}
