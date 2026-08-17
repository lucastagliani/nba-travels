import { GITHUB_REPO_URL, LIVE_SITE_URL } from '../lib/site'

interface HowItWorksViewProps {
  onBack: () => void
}

export function HowItWorksView({ onBack }: HowItWorksViewProps) {
  return (
    <article className="mx-auto max-w-3xl space-y-10">
      <div>
        <button
          type="button"
          onClick={onBack}
          className="mb-4 text-sm text-muted-fg hover:text-fg"
        >
          ← Back to planner
        </button>
        <h2 className="text-2xl font-bold tracking-tight md:text-3xl">How it works</h2>
        <p className="mt-3 text-fg-soft">
          NBA Travels helps plan a multi-city NBA road trip: compare hand-built itineraries,
          inspect games on a map, estimate budget, and share a link with travel partners.
        </p>
      </div>

      <section className="space-y-3">
        <h3 className="text-lg font-semibold text-fg">Purpose</h3>
        <p className="text-fg-soft leading-relaxed">
          The site was built for a real 2026–27 season trip originating from Porto Alegre,
          Brazil. Instead of scrolling the full NBA schedule, you pick from curated routes that
          balance great matchups, reasonable travel legs, weather, and cost — then drill into one
          plan to see every day, game, and connection.
        </p>
        <ul className="list-disc space-y-1.5 pl-5 text-fg-soft">
          <li>
            <strong className="font-medium text-fg">East Coast</strong> — primary trip across
            NYC, Philly, Miami, DC, and nearby hubs (Oct 2026 – Mar 2027).
          </li>
          <li>
            <strong className="font-medium text-fg">West Coast 2026</strong> — shorter secondary
            trip in calendar 2026, scored on teams only (Lakers, Warriors, Spurs, etc.).
          </li>
        </ul>
      </section>

      <section className="space-y-3">
        <h3 className="text-lg font-semibold text-fg">How games are scored</h3>
        <p className="text-fg-soft leading-relaxed">
          Every game in the schedule gets an interest score from tier lists you can edit in the
          repo. Teams are ranked S / A / B / C (e.g. 76ers and Lakers at S-tier). Cities can
          matter too — on the east-coast trip, New York and Miami boost a game&apos;s score;
          the secondary trip ignores city tiers and looks at matchups only.
        </p>
        <p className="rounded-lg border border-border bg-muted/40 px-4 py-3 font-mono text-xs text-fg-soft leading-relaxed">
          gameScore = teamWeight × blendedTeamScore + cityWeight × cityTierPoints
          <br />
          NBA Cup games get a ×1.15 multiplier
        </p>
        <p className="text-fg-soft leading-relaxed">
          Itineraries are assembled manually from the scored schedule — rest days, train vs
          flight legs, and marquee anchors (openers, Christmas, Cup games) — then ranked in the
          compare view by games, score, and budget.
        </p>
      </section>

      <section className="space-y-3">
        <h3 className="text-lg font-semibold text-fg">Data pipeline</h3>
        <ol className="list-decimal space-y-2 pl-5 text-fg-soft">
          <li>
            Raw NBA schedule JSON is flattened with{' '}
            <code className="rounded bg-muted px-1 py-0.5 text-xs">scripts/transform_schedule.py</code>
          </li>
          <li>
            Each trip re-scores games with{' '}
            <code className="rounded bg-muted px-1 py-0.5 text-xs">scripts/score_games.py --trip &lt;id&gt;</code>
          </li>
          <li>
            Weather normals come from Open-Meteo historical data via{' '}
            <code className="rounded bg-muted px-1 py-0.5 text-xs">scripts/fetch_weather.py</code>
          </li>
          <li>
            Cities, travel routes, tiers, and itinerary JSON live under{' '}
            <code className="rounded bg-muted px-1 py-0.5 text-xs">data/2026-2027-season/trips/</code>
          </li>
        </ol>
      </section>

      <section className="space-y-3">
        <h3 className="text-lg font-semibold text-fg">What you can do in the app</h3>
        <div className="grid gap-3 sm:grid-cols-2">
          {[
            ['Compare all', 'Side-by-side itineraries with scores, cities, miles, and budget.'],
            ['Trip detail', 'Map, calendar, timeline, games list, and transportation legs.'],
            ['Budget', 'POA flights, domestic travel, hotels, tickets, and food — all configurable.'],
            ['Share & print', 'URL preserves trip, view, and day; print layout for PDF export.'],
            ['Theme toggle', 'Light/dark mode with preference saved locally.'],
            ['Weather', 'Typical highs/lows per city and day (historical averages).'],
          ].map(([title, body]) => (
            <div key={title} className="rounded-lg border border-border bg-card/60 p-4">
              <p className="font-medium text-fg">{title}</p>
              <p className="mt-1 text-sm text-fg-soft">{body}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="space-y-3">
        <h3 className="text-lg font-semibold text-fg">Tech stack</h3>
        <p className="text-fg-soft leading-relaxed">
          The UI is a React + TypeScript SPA built with Vite and Tailwind CSS v4. The US map uses
          D3 (<code className="rounded bg-muted px-1 text-xs">d3-geo</code>,{' '}
          <code className="rounded bg-muted px-1 text-xs">d3-zoom</code>) and TopoJSON state
          outlines from{' '}
          <a
            href="https://github.com/topojson/us-atlas"
            target="_blank"
            rel="noopener noreferrer"
            className="text-amber-500/90 underline-offset-2 hover:underline"
          >
            us-atlas
          </a>
          . Trip data is imported at build time — no backend required.
        </p>
        <p className="text-fg-soft leading-relaxed">
          Pushes to <code className="rounded bg-muted px-1 text-xs">main</code> deploy automatically
          to GitHub Pages via GitHub Actions (
          <code className="rounded bg-muted px-1 text-xs">.github/workflows/deploy-web.yml</code>
          ).
        </p>
      </section>

      <section className="rounded-lg border border-border bg-muted/30 p-5">
        <h3 className="text-lg font-semibold text-fg">Source & live site</h3>
        <p className="mt-2 text-sm text-fg-soft">
          All code and data are open in the repository. Budget numbers and tier lists are starting
          points — fork it and tune for your own trip.
        </p>
        <div className="mt-4 flex flex-wrap gap-3">
          <a
            href={GITHUB_REPO_URL}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex min-h-[44px] items-center rounded-md border border-strong bg-muted px-4 py-2 text-sm text-fg hover:bg-elevated"
          >
            View on GitHub
          </a>
          <a
            href={LIVE_SITE_URL}
            className="inline-flex min-h-[44px] items-center rounded-md border border-border px-4 py-2 text-sm text-muted-fg hover:text-fg"
          >
            Live site
          </a>
        </div>
      </section>
    </article>
  )
}
