import { MODE_ICONS } from '../lib/constants'
import { formatMiles } from '../lib/distance'
import type { ParsedRoute, RouteLeg } from '../types'

interface RouteStatsProps {
  route: ParsedRoute
  title?: string
  label?: string
  color?: string
  activeLegs?: RouteLeg[]
}

export function RouteStats({
  route,
  title = 'Transportation',
  label,
  color,
  activeLegs = [],
}: RouteStatsProps) {
  const activeKey = (leg: RouteLeg) => `${leg.from}-${leg.to}-${leg.day}`
  const activeSet = new Set(activeLegs.map(activeKey))

  if (route.legs.length === 0) {
    return (
      <p className="text-sm text-subtle">No inter-city travel legs in this itinerary.</p>
    )
  }

  return (
    <div className="rounded-lg border border-border bg-card p-4">
      <div className="mb-3 flex flex-wrap items-center gap-2">
        {color && (
          <span className="inline-block h-2.5 w-5 rounded-sm" style={{ background: color }} />
        )}
        <h3 className="text-sm font-semibold text-fg">{title}</h3>
        {label && <span className="text-xs text-subtle">· {label}</span>}
      </div>

      <div className="mb-3 text-sm text-fg-soft">
        Total travel:{' '}
        <strong className="text-amber-300">{formatMiles(route.totalDistanceMiles)}</strong>
        {' · '}
        {route.legs.length} legs
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-left text-xs text-muted-fg">
          <thead>
            <tr className="border-b border-border text-subtle">
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
                  className={`border-b border-border/80 ${highlighted ? 'bg-amber-500/10 text-amber-100' : ''}`}
                >
                  <td className="py-2 pr-3">{leg.day}</td>
                  <td className="py-2 pr-3 text-fg">
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
