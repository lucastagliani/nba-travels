import { useEffect, useMemo, useRef, useState } from 'react'
import { geoAlbersUsa, geoPath } from 'd3-geo'
import { select } from 'd3-selection'
import 'd3-transition'
import { zoom, zoomIdentity, type ZoomBehavior } from 'd3-zoom'
import { feature } from 'topojson-client'
import type { FeatureCollection } from 'geojson'
import type { Topology } from 'topojson-specification'
import { getAllMappedCities, getCityCoords, projectCoord } from '../lib/cities'
import { MODE_ICONS, TIER_COLORS, US_TOPOLOGY_URL, ZOOM_EXTENT } from '../lib/constants'
import { cityDistanceMiles, formatMiles } from '../lib/distance'
import type { MapRouteLayer, RouteLeg } from '../types'

interface USMapProps {
  layers: MapRouteLayer[]
}

const WIDTH = 960
const HEIGHT = 600

interface StopPoint {
  city: string
  stopIndex: number
  tier: string
  x: number
  y: number
  games: { marquee?: boolean }[]
}

interface RouteSegment {
  from: StopPoint
  to: StopPoint
  leg?: RouteLeg
  distanceMiles: number | null
  key: string
}

function buildStopPoints(
  layer: MapRouteLayer,
  project: (coords: [number, number]) => [number, number] | null,
): StopPoint[] {
  return layer.route.stops
    .map((stop) => {
      const coords = getCityCoords(stop.city)
      if (!coords) return null
      const point = projectCoord(coords.lng, coords.lat, project)
      if (!point) return null
      return {
        city: stop.city,
        stopIndex: stop.stopIndex,
        tier: stop.tier,
        x: point[0],
        y: point[1],
        games: stop.games,
      }
    })
    .filter(Boolean) as StopPoint[]
}

function buildSegments(
  stopPoints: StopPoint[],
  legs: RouteLeg[],
  layerId: string,
): RouteSegment[] {
  const segments: RouteSegment[] = []
  for (let i = 0; i < stopPoints.length - 1; i += 1) {
    const from = stopPoints[i]
    const to = stopPoints[i + 1]
    const leg = legs.find((l) => l.from === from.city && l.to === to.city)
    segments.push({
      from,
      to,
      leg,
      distanceMiles: cityDistanceMiles(from.city, to.city),
      key: `${layerId}-${from.city}-${to.city}`,
    })
  }
  return segments
}

export function USMap({ layers }: USMapProps) {
  const svgRef = useRef<SVGSVGElement>(null)
  const zoomRef = useRef<ZoomBehavior<SVGSVGElement, unknown> | null>(null)
  const [states, setStates] = useState<FeatureCollection | null>(null)
  const [transform, setTransform] = useState(zoomIdentity)

  useEffect(() => {
    fetch(US_TOPOLOGY_URL)
      .then((res) => res.json())
      .then((topology: Topology) => {
        const geo = feature(
          topology,
          topology.objects.states as never,
        ) as unknown as FeatureCollection
        setStates(geo)
      })
      .catch(console.error)
  }, [])

  useEffect(() => {
    const svgEl = svgRef.current
    if (!svgEl) return

    const svg = select(svgEl)
    const zoomBehavior = zoom<SVGSVGElement, unknown>()
      .scaleExtent([ZOOM_EXTENT.min, ZOOM_EXTENT.max])
      .on('zoom', (event) => setTransform(event.transform))

    zoomRef.current = zoomBehavior
    svg.call(zoomBehavior)

    return () => {
      svg.on('.zoom', null)
    }
  }, [])

  const projection = useMemo(
    () => geoAlbersUsa().scale(1200).translate([WIDTH / 2, HEIGHT / 2]),
    [],
  )

  const pathGenerator = useMemo(() => geoPath(projection), [projection])
  const project = useMemo(() => (coords: [number, number]) => projection(coords), [projection])

  const allCitiesOnMap = useMemo(
    () => new Set(layers.flatMap((l) => l.route.allCities)),
    [layers],
  )

  const backgroundCities = useMemo(() => {
    return getAllMappedCities()
      .filter((city) => !allCitiesOnMap.has(city))
      .map((city) => {
        const coords = getCityCoords(city)
        if (!coords) return null
        const point = projectCoord(coords.lng, coords.lat, project)
        if (!point) return null
        return { city, x: point[0], y: point[1] }
      })
      .filter(Boolean) as Array<{ city: string; x: number; y: number }>
  }, [allCitiesOnMap, project])

  const layerGraphics = useMemo(
    () =>
      layers.map((layer) => ({
        layer,
        stopPoints: buildStopPoints(layer, project),
        segments: buildSegments(
          buildStopPoints(layer, project),
          layer.route.legs,
          layer.id,
        ),
      })),
    [layers, project],
  )

  const zoomIn = () => {
    const svgEl = svgRef.current
    const z = zoomRef.current
    if (!svgEl || !z) return
    select(svgEl).transition().duration(250).call(z.scaleBy, 1.35)
  }

  const zoomOut = () => {
    const svgEl = svgRef.current
    const z = zoomRef.current
    if (!svgEl || !z) return
    select(svgEl).transition().duration(250).call(z.scaleBy, 0.75)
  }

  const resetZoom = () => {
    const svgEl = svgRef.current
    const z = zoomRef.current
    if (!svgEl || !z) return
    select(svgEl).transition().duration(300).call(z.transform, zoomIdentity)
  }

  return (
    <div className="relative h-full w-full overflow-hidden rounded-xl border border-slate-700 bg-slate-900">
      <div className="absolute right-3 top-3 z-10 flex flex-col gap-1.5">
        <button
          type="button"
          onClick={zoomIn}
          className="flex h-8 w-8 items-center justify-center rounded-md border border-slate-600 bg-slate-950/90 text-lg text-slate-100 hover:bg-slate-800"
          aria-label="Zoom in"
        >
          +
        </button>
        <button
          type="button"
          onClick={zoomOut}
          className="flex h-8 w-8 items-center justify-center rounded-md border border-slate-600 bg-slate-950/90 text-lg text-slate-100 hover:bg-slate-800"
          aria-label="Zoom out"
        >
          −
        </button>
        <button
          type="button"
          onClick={resetZoom}
          className="rounded-md border border-slate-600 bg-slate-950/90 px-2 py-1 text-[10px] font-medium text-slate-300 hover:bg-slate-800"
        >
          Reset
        </button>
      </div>

      <div className="absolute left-3 top-3 z-10 rounded-md bg-slate-950/80 px-2 py-1 text-[10px] text-slate-400">
        Scroll to zoom · drag to pan · {Math.round(transform.k * 100)}%
      </div>

      <svg
        ref={svgRef}
        viewBox={`0 0 ${WIDTH} ${HEIGHT}`}
        className="h-full w-full cursor-grab touch-none active:cursor-grabbing"
      >
        <rect width={WIDTH} height={HEIGHT} fill="transparent" />

        <g transform={transform.toString()}>
          {states && (
            <g>
              {states.features.map((state) => (
                <path
                  key={state.id as string}
                  d={pathGenerator(state as never) ?? undefined}
                  fill="#1e293b"
                  stroke="#334155"
                  strokeWidth={0.75 / transform.k}
                />
              ))}
            </g>
          )}

          {backgroundCities.map(({ city, x, y }) => (
            <circle
              key={city}
              cx={x}
              cy={y}
              r={3 / transform.k}
              fill="#334155"
              opacity={0.5}
            />
          ))}

          {layerGraphics.map(({ layer, segments, stopPoints }) => {
            const activeDay = layer.activeDay ?? null
            const activeLegs = layer.activeLegs ?? []
            const activeCities = new Set<string>()

            if (activeDay !== null && layer.primary) {
              const dayStop = layer.route.stops.find(
                (s) => activeDay >= s.firstDay && activeDay <= s.lastDay,
              )
              if (dayStop) activeCities.add(dayStop.city)
              for (const leg of activeLegs) {
                activeCities.add(leg.from)
                activeCities.add(leg.to)
              }
            }

            const isLegActive = (from: string, to: string) =>
              activeLegs.some((leg) => leg.from === from && leg.to === to)

            return (
              <g key={layer.id} opacity={layer.primary ? 1 : 0.85}>
                {segments.map(({ from, to, leg, distanceMiles, key }) => {
                  const active = layer.primary && isLegActive(from.city, to.city)
                  const midX = (from.x + to.x) / 2
                  const midY = (from.y + to.y) / 2
                  const dimmed = layer.primary && activeDay !== null && !active

                  return (
                    <g key={key}>
                      <line
                        x1={from.x}
                        y1={from.y}
                        x2={to.x}
                        y2={to.y}
                        stroke={active ? '#fbbf24' : layer.color}
                        strokeWidth={(active ? 3 : layer.primary ? 2.5 : 2) / transform.k}
                        strokeDasharray={
                          active ? undefined : layer.primary ? '8 6' : '5 5'
                        }
                        opacity={dimmed ? 0.25 : 1}
                      />
                      {!dimmed && leg?.mode && (
                        <text
                          x={midX}
                          y={midY - 10 / transform.k}
                          textAnchor="middle"
                          fontSize={14 / transform.k}
                        >
                          {MODE_ICONS[leg.mode] ?? '→'}
                        </text>
                      )}
                      {!dimmed && distanceMiles !== null && transform.k >= 1.2 && (
                        <text
                          x={midX}
                          y={midY + 14 / transform.k}
                          textAnchor="middle"
                          fill="#94a3b8"
                          fontSize={10 / transform.k}
                        >
                          {formatMiles(distanceMiles)}
                        </text>
                      )}
                    </g>
                  )
                })}

                {stopPoints.map((stop) => {
                  const isActive = layer.primary && activeCities.has(stop.city)
                  const dimmed = layer.primary && activeDay !== null && !isActive
                  const color = layer.primary ? TIER_COLORS[stop.tier as keyof typeof TIER_COLORS] : layer.color
                  const hasMarquee = stop.games.some((g) => g.marquee)
                  const radius = (stop.tier === 'S' ? 10 : stop.tier === 'A' ? 9 : 8) / transform.k

                  return (
                    <g
                      key={`${layer.id}-${stop.city}`}
                      transform={`translate(${stop.x}, ${stop.y})`}
                      opacity={dimmed ? 0.35 : 1}
                    >
                      {isActive && (
                        <circle
                          r={radius + 6 / transform.k}
                          fill="none"
                          stroke="#fbbf24"
                          strokeWidth={2 / transform.k}
                          opacity={0.8}
                        />
                      )}
                      <circle
                        r={radius}
                        fill={color}
                        stroke="#0f172a"
                        strokeWidth={2 / transform.k}
                      />
                      <text
                        y={4 / transform.k}
                        textAnchor="middle"
                        fill="#0f172a"
                        fontSize={11 / transform.k}
                        fontWeight={700}
                      >
                        {stop.stopIndex}
                      </text>
                      {hasMarquee && layer.primary && (
                        <text y={-radius - 6 / transform.k} textAnchor="middle" fontSize={14 / transform.k}>
                          ⭐
                        </text>
                      )}
                      {transform.k >= 1 && (
                        <text
                          y={radius + 14 / transform.k}
                          textAnchor="middle"
                          fill="#e2e8f0"
                          fontSize={11 / transform.k}
                          fontWeight={600}
                        >
                          {stop.city}
                        </text>
                      )}
                    </g>
                  )
                })}
              </g>
            )
          })}
        </g>
      </svg>

      <div className="absolute bottom-3 left-3 flex flex-wrap gap-3 rounded-lg bg-slate-950/80 px-3 py-2 text-xs text-slate-300">
        {layers.map((layer) => (
          <span key={layer.id} className="flex items-center gap-1.5">
            <span
              className="inline-block h-2.5 w-5 rounded-sm"
              style={{ background: layer.color }}
            />
            {layer.label}
          </span>
        ))}
        <span className="text-slate-600">|</span>
        {Object.entries(TIER_COLORS).map(([tier, color]) => (
          <span key={tier} className="flex items-center gap-1.5">
            <span className="inline-block h-2.5 w-2.5 rounded-full" style={{ background: color }} />
            Tier {tier}
          </span>
        ))}
      </div>
    </div>
  )
}
