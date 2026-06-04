import { useEffect } from 'react'
import { mapsUrl } from '../lib/venues.js'

function Bar({ sub }) {
  return (
    <div className="h-2 bg-neutral-100 rounded-full overflow-hidden w-full">
      <div className="h-full bg-accent" style={{ width: `${Math.round((sub || 0) * 100)}%` }} />
    </div>
  )
}

export default function VenueModal({ venue, check, onClose }) {
  useEffect(() => {
    const onKey = (e) => e.key === 'Escape' && onClose()
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [onClose])

  if (!venue) return null
  const breakdown = venue.breakdown || []

  return (
    <div
      className="fixed inset-0 z-50 bg-black/40 flex items-end sm:items-center justify-center p-0 sm:p-4"
      onClick={onClose}
    >
      <div
        className="bg-white w-full sm:max-w-lg sm:rounded-2xl rounded-t-2xl max-h-[90vh] overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="p-5 border-b border-neutral-100 flex items-start justify-between gap-3">
          <div>
            <div className="flex items-center gap-2">
              <span className="w-7 h-7 shrink-0 rounded-full bg-accent text-white grid place-items-center text-sm font-bold">
                {venue.rank}
              </span>
              <h2 className="text-lg font-semibold">{venue.name}</h2>
            </div>
            <p className="text-sm text-neutral-500 mt-1">
              {venue.type} · {venue.neighborhood} · {venue.rating?.toFixed?.(1)}★ ({venue.reviewCount})
            </p>
          </div>
          <button onClick={onClose} className="text-neutral-400 hover:text-neutral-700 text-xl leading-none">×</button>
        </div>

        <div className="p-5">
          <div className="flex items-center justify-between mb-1">
            <span className="font-semibold">Watch score</span>
            <span className="font-bold text-accent">{venue.score}/100</span>
          </div>
          <p className="text-sm text-neutral-500 mb-4">How this venue scores on each ranking dimension:</p>

          <div className="space-y-3">
            {breakdown.map((row) => (
              <div key={row.key}>
                <div className="flex items-center justify-between text-sm mb-1">
                  <span className="text-neutral-700">{row.label}</span>
                  <span className="text-neutral-500 tabular-nums">{row.points}/{row.weight}</span>
                </div>
                <Bar sub={row.sub} />
              </div>
            ))}
          </div>

          {check && (check.screens != null || check.worldCup != null) && (
            <div className="mt-5 text-sm bg-neutral-50 border border-neutral-200 rounded-lg p-3">
              <div className="font-medium mb-1">Website check</div>
              <ul className="text-neutral-600 space-y-0.5">
                <li>{check.worldCup ? '📺 Mentions World Cup / soccer viewing' : '— No World Cup mention found'}</li>
                <li>{check.screens ? '✓ Mentions screens / TVs / sports' : '— No screen mention found'}</li>
              </ul>
              {check.evidence && <p className="mt-2 text-xs text-neutral-400 italic">“…{check.evidence}…”</p>}
            </div>
          )}

          <div className="mt-5 flex flex-wrap gap-3">
            <a
              href={mapsUrl(venue)}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1 text-sm bg-accent text-white rounded-lg px-3 py-2 hover:opacity-90"
            >
              Open in Google Maps ↗
            </a>
            {venue.website && (
              <a
                href={venue.website}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1 text-sm border border-neutral-300 rounded-lg px-3 py-2 hover:border-accent"
              >
                Visit website ↗
              </a>
            )}
          </div>
          {venue.address && <p className="mt-3 text-xs text-neutral-400">{venue.address}</p>}
        </div>
      </div>
    </div>
  )
}
