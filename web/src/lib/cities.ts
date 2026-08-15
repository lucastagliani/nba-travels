import type { CityTier } from '../types'
import {
  getActiveTripId,
  getAllMappedCities as getAllMappedCitiesForTrip,
  getCityCoords as getCityCoordsForTrip,
  getCityTier as getCityTierForTrip,
} from './tripData'

export function getCityCoords(city: string) {
  return getCityCoordsForTrip(city, getActiveTripId())
}

export function getCityTier(city: string): CityTier {
  return getCityTierForTrip(city, getActiveTripId())
}

export function getAllMappedCities(): string[] {
  return getAllMappedCitiesForTrip(getActiveTripId())
}

export function projectCoord(
  lng: number,
  lat: number,
  project: (coords: [number, number]) => [number, number] | null,
): [number, number] | null {
  return project([lng, lat])
}
