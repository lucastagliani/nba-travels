import type { DayWeather } from '../lib/weather'
import { formatWeatherDetail, formatWeatherShort } from '../lib/weather'

interface WeatherBadgeProps {
  weather: DayWeather | null
  compact?: boolean
  className?: string
}

export function WeatherBadge({ weather, compact = false, className = '' }: WeatherBadgeProps) {
  if (!weather) return null

  const text = compact ? formatWeatherShort(weather) : formatWeatherDetail(weather)

  return (
    <span
      className={`inline-flex items-center gap-1 text-slate-400 ${className}`}
      title={`Typical weather (${weather.sampleYears ?? 6}yr avg): ${formatWeatherDetail(weather)}`}
    >
      {text}
    </span>
  )
}
