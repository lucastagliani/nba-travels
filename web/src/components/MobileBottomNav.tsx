interface MobileBottomNavProps {
  view: 'compare' | 'detail'
  onCompare: () => void
  onDetail: () => void
}

export function MobileBottomNav({ view, onCompare, onDetail }: MobileBottomNavProps) {
  return (
    <nav
      className="fixed inset-x-0 bottom-0 z-40 border-t border-slate-800 bg-slate-950/95 backdrop-blur-md md:hidden"
      style={{ paddingBottom: 'env(safe-area-inset-bottom, 0px)' }}
      aria-label="Main navigation"
    >
      <div className="mx-auto flex max-w-lg">
        <button
          type="button"
          onClick={onCompare}
          className={`flex min-h-[52px] flex-1 flex-col items-center justify-center gap-0.5 text-xs font-medium ${
            view === 'compare' ? 'text-amber-400' : 'text-slate-400'
          }`}
        >
          <span className="text-lg" aria-hidden>
            ≡
          </span>
          Compare
        </button>
        <button
          type="button"
          onClick={onDetail}
          className={`flex min-h-[52px] flex-1 flex-col items-center justify-center gap-0.5 text-xs font-medium ${
            view === 'detail' ? 'text-amber-400' : 'text-slate-400'
          }`}
        >
          <span className="text-lg" aria-hidden>
            🗺
          </span>
          Trip
        </button>
      </div>
    </nav>
  )
}
