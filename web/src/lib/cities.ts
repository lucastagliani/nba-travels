import citiesData from '@data/cities.json'
import cityTiersData from '@data/city-tiers.json'
import type { CityCoords, CityTier } from '../types'

const cities = citiesData as Record<string, CityCoords>

const tierLookup: Record<string, CityTier> = {}
for (const [tier, entries] of Object.entries(cityTiersData.tiers)) {
  for (const entry of entries as { city: string }[]) {
    tierLookup[entry.city] = tier as CityTier
  }
}

const defaultTier = (cityTiersData.defaultTier ?? 'C') as CityTier

export function getCityCoords(city: string): CityCoords | null {
  return cities[city] ?? null
}

export function getCityTier(city: string): CityTier {
  return tierLookup[city] ?? defaultTier
}

export function getAllMappedCities(): string[] {
  return Object.keys(cities)
}

export function projectCoord(
  lng: number,
  lat: number,
  project: (coords: [number, number]) => [number, number] | null,
): [number, number] | null {
  return project([lng, lat])
}
