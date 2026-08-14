import type { BudgetEstimate } from '../lib/itineraryStats'
import { budgetHomeLabel, formatCurrency } from '../lib/itineraryStats'

interface BudgetBreakdownProps {
  budget: BudgetEstimate
  compact?: boolean
}

export function BudgetBreakdown({ budget, compact = false }: BudgetBreakdownProps) {
  if (compact) {
    return (
      <span className="text-amber-300">{formatCurrency(budget.total, budget.currency)}</span>
    )
  }

  const flightLabel = budget.openJaw
    ? `Flights ${budgetHomeLabel()} → ${budget.arrivalCity}, return ${budget.departureCity}`
    : `Flights ${budgetHomeLabel()} ↔ ${budget.arrivalCity}`

  const rows = [
    {
      label: flightLabel,
      value: budget.internationalFlights,
      note: budget.openJaw
        ? `Open-jaw × ${budget.travelers}`
        : `Round trip × ${budget.travelers}`,
    },
    {
      label: 'US domestic travel',
      value: budget.domesticTravel,
      note: `× ${budget.travelers} where per-person`,
    },
    { label: 'Hotels', value: budget.hotels, note: '1 room · couple' },
    {
      label: 'Game tickets',
      value: budget.tickets,
      note: `× ${budget.travelers}`,
    },
    {
      label: 'Food',
      value: budget.food,
      note: `${budget.tripDays} days × ${budget.travelers}`,
    },
  ]

  return (
    <div className="rounded-lg border border-slate-700 bg-slate-900/50 p-4">
      <div className="mb-3 flex flex-wrap items-center justify-between gap-2">
        <h3 className="text-sm font-semibold text-slate-200">
          Budget estimate · {budget.travelers} travelers
        </h3>
        <p className="text-xs text-slate-500">
          {budget.tripDays} days · {budget.gameCount} games
        </p>
      </div>

      <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
        {rows.map((row) => (
          <div key={row.label} className="rounded-md bg-slate-800/60 px-3 py-2.5">
            <p className="text-[10px] uppercase tracking-wide text-slate-500">{row.label}</p>
            <p className="text-sm font-medium text-slate-200">
              {formatCurrency(row.value, budget.currency)}
            </p>
            <p className="text-[10px] text-slate-600">{row.note}</p>
          </div>
        ))}
        <div className="rounded-md border border-amber-500/30 bg-amber-500/10 px-3 py-2.5 sm:col-span-2 lg:col-span-1">
          <p className="text-[10px] uppercase tracking-wide text-amber-400/80">Total</p>
          <p className="text-lg font-semibold text-amber-300">
            {formatCurrency(budget.total, budget.currency)}
          </p>
          <p className="text-[10px] text-slate-600">Approximate · see budget-config.json</p>
        </div>
      </div>
    </div>
  )
}
