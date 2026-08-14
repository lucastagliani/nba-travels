import { zoomIdentity, type ZoomTransform } from 'd3-zoom'
import { ZOOM_EXTENT } from './constants'

export function computeFitTransform(
  points: [number, number][],
  width: number,
  height: number,
  padding = 80,
): ZoomTransform {
  if (points.length === 0) return zoomIdentity

  if (points.length === 1) {
    const [x, y] = points[0]
    const scale = 3
    return zoomIdentity.translate(width / 2 - x * scale, height / 2 - y * scale).scale(scale)
  }

  const xs = points.map((p) => p[0])
  const ys = points.map((p) => p[1])
  const minX = Math.min(...xs)
  const maxX = Math.max(...xs)
  const minY = Math.min(...ys)
  const maxY = Math.max(...ys)

  const dx = Math.max(maxX - minX, 1)
  const dy = Math.max(maxY - minY, 1)

  const scale = Math.min(
    (width - padding * 2) / dx,
    (height - padding * 2) / dy,
    ZOOM_EXTENT.max,
  )

  const clampedScale = Math.max(scale, ZOOM_EXTENT.min)
  const cx = (minX + maxX) / 2
  const cy = (minY + maxY) / 2

  return zoomIdentity
    .translate(width / 2, height / 2)
    .scale(clampedScale)
    .translate(-cx, -cy)
}
