import { GITHUB_REPO_URL } from '../lib/site'

interface FooterProps {
  onHowItWorks: () => void
  compactBottom?: boolean
}

export function Footer({ onHowItWorks, compactBottom = false }: FooterProps) {
  return (
    <footer
      className={`border-t border-border bg-card/40 px-4 py-6 md:px-6 ${
        compactBottom ? 'pb-6' : 'pb-24 md:pb-6'
      }`}
    >
      <div className="mx-auto flex max-w-7xl flex-col gap-4 text-sm text-muted-fg sm:flex-row sm:items-center sm:justify-between">
        <p>
          NBA Travels — a personal route planner for live NBA road trips from Brazil.
        </p>
        <nav className="flex flex-wrap items-center gap-x-4 gap-y-2" aria-label="Site links">
          <button
            type="button"
            onClick={onHowItWorks}
            className="text-fg-soft hover:text-fg underline-offset-2 hover:underline"
          >
            How it works
          </button>
          <a
            href={GITHUB_REPO_URL}
            target="_blank"
            rel="noopener noreferrer"
            className="text-fg-soft hover:text-fg underline-offset-2 hover:underline"
          >
            Source on GitHub
          </a>
        </nav>
      </div>
    </footer>
  )
}
