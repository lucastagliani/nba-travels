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
    <div className={`rounded-lg border border-border bg-card/80 ${className}`}>
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className="flex min-h-[44px] w-full items-center justify-between px-4 py-3 text-left text-sm font-medium text-fg"
        aria-expanded={open}
      >
        {title}
        <span className="text-subtle">{open ? '−' : '+'}</span>
      </button>
      {open && <div className="border-t border-border px-1 pb-1">{children}</div>}
    </div>
  )
}
