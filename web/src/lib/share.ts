import { buildShareUrl } from './print'
import { DEFAULT_TRIP_ID, getActiveTripId } from './tripData'

export interface ShareResult {
  method: 'share' | 'copy' | 'prompt'
}

export async function shareItinerary(
  optionName: string,
  optionId: string,
  activeDay?: number | null,
): Promise<ShareResult> {
  const trip = getActiveTripId()
  const url = buildShareUrl(optionId, activeDay, trip !== DEFAULT_TRIP_ID ? trip : null)
  const title = `NBA Travels — ${optionName}`
  const text = `Check out this NBA trip itinerary: ${optionName}`

  if (typeof navigator.share === 'function') {
    try {
      await navigator.share({ title, text, url })
      return { method: 'share' }
    } catch (err) {
      if (err instanceof Error && err.name === 'AbortError') {
        throw err
      }
    }
  }

  try {
    await navigator.clipboard.writeText(url)
    return { method: 'copy' }
  } catch {
    window.prompt('Copy this link:', url)
    return { method: 'prompt' }
  }
}
