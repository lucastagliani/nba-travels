import { getCityCoords } from './cities'

const EARTH_RADIUS_MILES = 3958.8

function toRadians(degrees: number): number {
  return (degrees * Math.PI) / 180
}

export function haversineMiles(
  lat1: number,
  lng1: number,
  lat2: number,
  lng2: number,
): number {
  const dLat = toRadians(lat2 - lat1)
  const dLng = toRadians(lng2 - lng1)
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(toRadians(lat1)) * Math.cos(toRadians(lat2)) * Math.sin(dLng / 2) ** 2
  return 2 * EARTH_RADIUS_MILES * Math.asin(Math.sqrt(a))
}

export function cityDistanceMiles(fromCity: string, toCity: string): number | null {
  const from = getCityCoords(fromCity)
  const to = getCityCoords(toCity)
  if (!from || !to) return null
  return haversineMiles(from.lat, from.lng, to.lat, to.lng)
}

export function formatMiles(miles: number): string {
  if (miles < 100) return `${Math.round(miles)} mi`
  return `${Math.round(miles).toLocaleString()} mi`
}
