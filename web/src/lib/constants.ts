import type { CityTier } from '../types'

export const TIER_POINTS: Record<CityTier, number> = {
  S: 5,
  A: 3,
  B: 2,
  C: 1,
}

export const TIER_COLORS: Record<CityTier, string> = {
  S: '#f59e0b',
  A: '#3b82f6',
  B: '#22c55e',
  C: '#64748b',
}

export const TIER_LABELS: Record<CityTier, string> = {
  S: 'Tier S',
  A: 'Tier A',
  B: 'Tier B',
  C: 'Tier C',
}

export const MODE_ICONS: Record<string, string> = {
  train: '🚆',
  flight: '✈️',
  drive: '🚗',
}

export const US_TOPOLOGY_URL =
  'https://cdn.jsdelivr.net/npm/us-atlas@3/states-10m.json'

export const ROUTE_COLORS = {
  primary: '#f59e0b',
  compare: '#06b6d4',
} as const

export const ZOOM_EXTENT = { min: 1, max: 8 } as const
