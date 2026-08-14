import { MODE_ICONS } from '../lib/constants'
import { formatMiles } from '../lib/distance'
import type { ParsedRoute, RouteLeg } from '../types'

interface RouteStatsProps {
  route: ParsedRoute
  label?: string
  color?: string
  activeLegs?: RouteLeg[]
}

export function RouteStats({ route, label, color, activeLegs = [] }: RouteStatsProps) {
  const activeKey = (leg: RouteLeg) => `${leg.from}-${leg.to}-${leg.day}`
  const activeSet = new Set(activeLegs.map(activeKey))

  if (route.legs.length === 0) {
    return (
      <p className="text-sm text-slate-500">No inter-city travel legs in this itinerary.</p>
    )
  }

  return (
    <div className="rounded-lg border border-slate-700 bg-slate-900/50 p-4">
      {label && (
        <div className="mb-3 flex items-center gap-2">
          {color && (
            <span className="inline-block h-2.5 w-5 rounded-sm" style={{ background: color }} />
          )}
          <h3 className="text-sm font-semibold text-slate-200">{label}</h3>
        </div>
      )}

      <div className="mb-3 text-sm text-slate-300">
        Total travel:{' '}
        <strong className="text-amber-300">{formatMiles(route.totalDistanceMiles)}</strong>
        {' · '}
        {route.legs.length} legs
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-left text-xs text-slate-400">
          <thead>
            <tr className="border-b border-slate-700 text-slate-500">
              <th className="pb-2 pr-3 font-medium">Day</th>
              <th className="pb-2 pr-3 font-medium">Route</th>
              <th className="pb-2 pr-3 font-medium">Mode</th>
              <th className="pb-2 pr-3 font-medium">Hours</th>
              <th className="pb-2 font-medium">Distance</th>
            </tr>
          </thead>
          <tbody>
            {route.legs.map((leg) => {
              const highlighted = activeSet.has(activeKey(leg))
              return (
                <tr
                  key={activeKey(leg)}
                  className={`border-b border-slate-800/80 ${highlighted ? 'bg-amber-500/10 text-amber-100' : ''}`}
                >
                  <td className="py-2 pr-3">{leg.day}</td>
                  <td className="py-2 pr-3 text-slate-200">
                    {leg.from} → {leg.to}
                  </td>
                  <td className="py-2 pr-3">
                    {leg.mode ? `${MODE_ICONS[leg.mode] ?? ''} ${leg.mode}` : '—'}
                  </td>
                  <td className="py-2 pr-3">{leg.hours ?? '—'}</td>
                  <td className="py-2">
                    {leg.distanceMiles != null ? formatMiles(leg.distanceMiles) : '—'}
                  </td>
                </tr>
              )
            })}
          </tbody>
        </table>
      </div>
    </div>
  )
}
