import weatherData from '@trip/weather-normals.json'
import { getCityCoords } from './cities'

interface WeatherRecord {
  highC?: number
  lowC?: number
  highF?: number
  lowF?: number
  precipMm: number
  precipProb: number
  condition: string
  sampleYears: number
}

interface WeatherNormalsDoc {
  scope?: {
    cities: string[]
    months: number[]
    monthLabels: string[]
  }
  entries: Record<string, Record<string, WeatherRecord>>
}

const doc = weatherData as WeatherNormalsDoc

export interface DayWeather {
  city: string
  date: string
  highC: number
  lowC: number
  precipProb: number
  condition: string
  icon: string
  sampleYears?: number
}

const CONDITION_ICONS: Record<string, string> = {
  Clear: '☀️',
  'Mainly clear': '🌤',
  'Partly cloudy': '⛅',
  Overcast: '☁️',
  Fog: '🌫',
  'Light drizzle': '🌦',
  Drizzle: '🌦',
  'Heavy drizzle': '🌧',
  'Light rain': '🌧',
  Rain: '🌧',
  'Heavy rain': '🌧',
  'Light snow': '🌨',
  Snow: '🌨',
  'Heavy snow': '❄️',
  'Rain showers': '🌦',
  'Heavy rain showers': '🌧',
  Thunderstorm: '⛈',
  Mixed: '🌡',
}

function weatherKey(date: string): string {
  return date.length >= 10 ? date.slice(5) : date
}

function toCelsius(record: WeatherRecord, kind: 'high' | 'low'): number {
  if (kind === 'high' && record.highC != null) return record.highC
  if (kind === 'low' && record.lowC != null) return record.lowC
  const f = kind === 'high' ? record.highF : record.lowF
  if (f == null) return 0
  return Math.round((f - 32) * (5 / 9))
}

export function getWeatherForDay(city: string, date: string): DayWeather | null {
  const key = weatherKey(date)
  const cityEntries = doc.entries[city]
  if (!cityEntries) return null
  const record = cityEntries[key] ?? cityEntries[date]
  if (!record) return null

  return {
    city,
    date,
    highC: toCelsius(record, 'high'),
    lowC: toCelsius(record, 'low'),
    precipProb: record.precipProb,
    condition: record.condition,
    icon: CONDITION_ICONS[record.condition] ?? '🌡',
    sampleYears: record.sampleYears,
  }
}

export function formatWeatherShort(weather: DayWeather): string {
  return `${weather.icon} ${weather.highC}° / ${weather.lowC}°C`
}

export function formatWeatherDetail(weather: DayWeather): string {
  const rain =
    weather.precipProb >= 40
      ? ` · ${weather.precipProb}% rain`
      : weather.precipProb >= 20
        ? ` · ${weather.precipProb}% rain chance`
        : ''
  return `${weather.condition} · ${weather.highC}° / ${weather.lowC}°C${rain}`
}

export function getCityMetaLabel(city: string): string | null {
  const meta = getCityCoords(city)
  if (!meta) return null
  const parts: string[] = []
  if (meta.airport) parts.push(meta.airport)
  if (meta.neighborhood) parts.push(meta.neighborhood)
  if (meta.trainStation) parts.push(meta.trainStation)
  return parts.length ? parts.join(' · ') : null
}
