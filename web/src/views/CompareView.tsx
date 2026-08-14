import { useMemo } from 'react'
import type { ItineraryOption } from '../types'
import { formatMiles } from '../lib/distance'
import { analyzeItinerary, formatCurrency, type ItineraryAnalysis } from '../lib/itineraryStats'

interface CompareViewProps {
  options: ItineraryOption[]
  onSelect: (id: string) => void
}

function CityDaysCell({ analysis }: { analysis: ItineraryAnalysis }) {
  return (
    <div className="flex flex-wrap gap-1">
      {analysis.daysPerCity.map(({ city, days }) => (
        <span
          key={city}
          className="rounded bg-slate-800 px-1.5 py-0.5 text-[10px] text-slate-300"
        >
          {city} {days}d
        </span>
      ))}
    </div>
  )
}

function TeamGamesCell({ analysis }: { analysis: ItineraryAnalysis }) {
  const top = analysis.gamesPerTeam.slice(0, 5)
  return (
    <div className="flex flex-wrap gap-1">
      {top.map(({ tricode, count }) => (
        <span
          key={tricode}
          className="rounded bg-slate-800 px-1.5 py-0.5 text-[10px] text-slate-300"
        >
          {tricode}×{count}
        </span>
      ))}
      {analysis.gamesPerTeam.length > 5 && (
        <span className="text-[10px] text-slate-500">+{analysis.gamesPerTeam.length - 5}</span>
      )}
    </div>
  )
}

export function CompareView({ options, onSelect }: CompareViewProps) {
  const analyses = useMemo(() => options.map(analyzeItinerary), [options])

  return (
    <div className="space-y-4">
      <div>
        <h2 className="text-xl font-semibold text-slate-100">Compare all itineraries</h2>
        <p className="mt-1 text-sm text-slate-400">
          Side-by-side stats for every saved trip option · budgets for 2 travelers from Porto Alegre
        </p>
      </div>

      <div className="hidden overflow-x-auto rounded-xl border border-slate-700 md:block">
        <table className="w-full min-w-[960px] text-left text-xs">
          <thead>
            <tr className="border-b border-slate-700 bg-slate-900/80 text-slate-500">
              <th className="px-3 py-3 font-medium">Itinerary</th>
              <th className="px-3 py-3 font-medium">Dates</th>
              <th className="px-3 py-3 font-medium">Games</th>
              <th className="px-3 py-3 font-medium">Score</th>
              <th className="px-3 py-3 font-medium">Miles</th>
              <th className="px-3 py-3 font-medium">Budget</th>
              <th className="px-3 py-3 font-medium">Days / city</th>
              <th className="px-3 py-3 font-medium">Teams seen</th>
              <th className="px-3 py-3 font-medium"></th>
            </tr>
          </thead>
          <tbody>
            {analyses.map((analysis) => {
              const { option, route, budget } = analysis
              return (
                <tr
                  key={option.id}
                  className="border-b border-slate-800/80 hover:bg-slate-800/30"
                >
                  <td className="px-3 py-3">
                    <div className="font-medium text-slate-100">
                      {option.name}
                      {option.recommended && (
                        <span className="ml-1.5 rounded bg-amber-500/20 px-1 py-0.5 text-[9px] uppercase text-amber-300">
                          Pick
                        </span>
                      )}
                    </div>
                    <p className="mt-0.5 max-w-[200px] text-[10px] text-slate-500">
                      {option.recommendedFor}
                    </p>
                  </td>
                  <td className="px-3 py-3 whitespace-nowrap text-slate-400">
                    {option.startDate.slice(5)} → {option.endDate.slice(5)}
                  </td>
                  <td className="px-3 py-3 text-slate-200">{option.gameCount}</td>
                  <td className="px-3 py-3 font-medium text-amber-300">
                    {option.totalInterestScore.toFixed(2)}
                  </td>
                  <td className="px-3 py-3 text-slate-300">
                    {formatMiles(route.totalDistanceMiles)}
                  </td>
                  <td className="px-3 py-3 font-medium text-slate-200">
                    {formatCurrency(budget.total, budget.currency)}
                  </td>
                  <td className="px-3 py-3">
                    <CityDaysCell analysis={analysis} />
                  </td>
                  <td className="px-3 py-3">
                    <TeamGamesCell analysis={analysis} />
                  </td>
                  <td className="px-3 py-3">
                    <button
                      type="button"
                      onClick={() => onSelect(option.id)}
                      className="rounded-md border border-amber-500/40 bg-amber-500/10 px-2.5 py-1 text-[11px] font-medium text-amber-200 hover:bg-amber-500/20"
                    >
                      Open
                    </button>
                  </td>
                </tr>
              )
            })}
          </tbody>
        </table>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        {analyses.map((analysis) => {
          const { option, route, budget } = analysis
          return (
            <div
              key={analysis.option.id}
              className="rounded-lg border border-slate-700 bg-slate-900/40 p-4"
            >
              <div className="flex items-start justify-between gap-2">
                <div>
                  <h3 className="font-semibold text-slate-100">
                    {option.name}
                    {option.recommended && (
                      <span className="ml-1.5 rounded bg-amber-500/20 px-1 py-0.5 text-[9px] uppercase text-amber-300">
                        Pick
                      </span>
                    )}
                  </h3>
                  <p className="mt-0.5 text-[11px] text-slate-500">{option.recommendedFor}</p>
                </div>
                <span className="shrink-0 text-sm text-amber-300">
                  {formatCurrency(budget.total, budget.currency)}
                </span>
              </div>

              <div className="mt-3 flex flex-wrap gap-x-4 gap-y-1 text-[11px] text-slate-400">
                <span>{option.gameCount} games</span>
                <span>Score {option.totalInterestScore.toFixed(2)}</span>
                <span>{formatMiles(route.totalDistanceMiles)}</span>
                <span>
                  {option.startDate.slice(5)} → {option.endDate.slice(5)}
                </span>
              </div>

              <div className="mt-3 grid grid-cols-2 gap-3 text-[11px]">
                <div>
                  <p className="mb-1 font-medium uppercase tracking-wide text-slate-500">
                    Days per city
                  </p>
                  <ul className="space-y-0.5 text-slate-300">
                    {analysis.daysPerCity.map(({ city, days }) => (
                      <li key={city}>
                        {city}: {days} day{days === 1 ? '' : 's'}
                      </li>
                    ))}
                  </ul>
                </div>
                <div>
                  <p className="mb-1 font-medium uppercase tracking-wide text-slate-500">
                    Games per team
                  </p>
                  <ul className="space-y-0.5 text-slate-300">
                    {analysis.gamesPerTeam.map(({ tricode, name, count }) => (
                      <li key={tricode}>
                        {tricode} ({name}): {count}
                      </li>
                    ))}
                  </ul>
                </div>
              </div>

              <button
                type="button"
                onClick={() => onSelect(option.id)}
                className="mt-4 min-h-[44px] w-full rounded-md border border-amber-500/40 bg-amber-500/10 px-3 py-2.5 text-sm font-medium text-amber-200 hover:bg-amber-500/20"
              >
                Open itinerary
              </button>
            </div>
          )
        })}
      </div>
    </div>
  )
}
