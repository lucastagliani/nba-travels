import { useEffect } from 'react'

interface ToastProps {
  message: string
  visible: boolean
  onHide: () => void
}

export function Toast({ message, visible, onHide }: ToastProps) {
  useEffect(() => {
    if (!visible) return
    const timer = window.setTimeout(onHide, 2500)
    return () => window.clearTimeout(timer)
  }, [visible, onHide])

  if (!visible) return null

  return (
    <div
      className="fixed bottom-20 left-1/2 z-50 -translate-x-1/2 rounded-full border border-slate-600 bg-slate-800 px-4 py-2.5 text-sm text-slate-100 shadow-lg md:bottom-6"
      role="status"
    >
      {message}
    </div>
  )
}
