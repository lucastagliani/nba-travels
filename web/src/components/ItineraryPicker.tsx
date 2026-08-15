import type { ItineraryOption } from '../types'

interface ItineraryPickerProps {
  options: ItineraryOption[]
  selectedId: string
  onSelect: (id: string) => void
}

/** Compact dropdown for mobile; full cards remain on desktop sidebar. */
export function ItineraryPicker({ options, selectedId, onSelect }: ItineraryPickerProps) {
  return (
    <label className="block lg:hidden">
      <span className="mb-1.5 block text-xs font-medium text-subtle">Itinerary</span>
      <select
        value={selectedId}
        onChange={(e) => onSelect(e.target.value)}
        className="min-h-[44px] w-full rounded-lg border border-strong bg-input px-3 py-2.5 text-sm text-fg"
      >
        {options.map((option) => (
          <option key={option.id} value={option.id}>
            {option.startDate.slice(5)} · {option.name}
            {option.recommended ? ' ★' : ''}
          </option>
        ))}
      </select>
    </label>
  )
}
