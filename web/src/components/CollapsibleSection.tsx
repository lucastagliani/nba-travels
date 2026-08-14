import { useState, type ReactNode } from 'react'

interface CollapsibleSectionProps {
  title: string
  defaultOpen?: boolean
  children: ReactNode
  className?: string
}

export function CollapsibleSection({
  title,
  defaultOpen = false,
  children,
  className = '',
}: CollapsibleSectionProps) {
  const [open, setOpen] = useState(defaultOpen)

  return (
    <div className={`rounded-lg border border-slate-700 bg-slate-900/40 ${className}`}>
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className="flex min-h-[44px] w-full items-center justify-between px-4 py-3 text-left text-sm font-medium text-slate-200"
        aria-expanded={open}
      >
        {title}
        <span className="text-slate-500">{open ? '−' : '+'}</span>
      </button>
      {open && <div className="border-t border-slate-800 px-1 pb-1">{children}</div>}
    </div>
  )
}
