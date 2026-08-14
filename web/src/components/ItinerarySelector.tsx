import type { ItineraryOption } from '../types'

interface ItinerarySelectorProps {
  options: ItineraryOption[]
  selectedId: string
  onSelect: (id: string) => void
}

export function ItinerarySelector({ options, selectedId, onSelect }: ItinerarySelectorProps) {
  return (
    <div className="flex flex-col gap-2">
      <h2 className="text-sm font-semibold uppercase tracking-wide text-slate-400">
        Itineraries
      </h2>
      <div className="flex flex-col gap-2">
        {options.map((option) => {
          const selected = option.id === selectedId
          return (
            <button
              key={option.id}
              type="button"
              onClick={() => onSelect(option.id)}
              className={`rounded-lg border px-3 py-3 text-left transition ${
                selected
                  ? 'border-amber-500/60 bg-amber-500/10'
                  : 'border-slate-700 bg-slate-800/50 hover:border-slate-500'
              }`}
            >
              <div className="flex items-start justify-between gap-2">
                <span className="font-medium text-slate-100">{option.name}</span>
                {option.recommended && (
                  <span className="shrink-0 rounded bg-amber-500/20 px-1.5 py-0.5 text-[10px] font-semibold uppercase text-amber-300">
                    Pick
                  </span>
                )}
              </div>
              <p className="mt-1 text-xs text-slate-400">{option.recommendedFor}</p>
              <div className="mt-2 flex flex-wrap gap-2 text-[11px] text-slate-500">
                <span>{option.startDate.slice(5)} → {option.endDate.slice(5)}</span>
                <span>·</span>
                <span>{option.gameCount} games</span>
                <span>·</span>
                <span>avg {option.averageInterestScore.toFixed(2)}</span>
              </div>
            </button>
          )
        })}
      </div>
    </div>
  )
}
