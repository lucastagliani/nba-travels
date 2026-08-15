export type Theme = 'light' | 'dark'

const STORAGE_KEY = 'nba-travels-theme'

export function getStoredTheme(): Theme | null {
  const value = localStorage.getItem(STORAGE_KEY)
  return value === 'light' || value === 'dark' ? value : null
}

export function getPreferredTheme(): Theme {
  const stored = getStoredTheme()
  if (stored) return stored
  return window.matchMedia('(prefers-color-scheme: light)').matches ? 'light' : 'dark'
}

export function applyTheme(theme: Theme) {
  document.documentElement.classList.toggle('dark', theme === 'dark')
  const meta = document.querySelector('meta[name="theme-color"]')
  if (meta) {
    meta.setAttribute('content', getComputedStyle(document.documentElement).getPropertyValue('--theme-meta').trim())
  }
}

export function setTheme(theme: Theme) {
  localStorage.setItem(STORAGE_KEY, theme)
  applyTheme(theme)
}

export function initTheme() {
  applyTheme(getPreferredTheme())
}

export function readMapColors() {
  const style = getComputedStyle(document.documentElement)
  return {
    land: style.getPropertyValue('--map-land').trim(),
    stroke: style.getPropertyValue('--map-stroke').trim(),
    city: style.getPropertyValue('--map-city').trim(),
    label: style.getPropertyValue('--map-label').trim(),
  }
}
