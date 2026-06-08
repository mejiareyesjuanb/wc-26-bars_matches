import { useEffect } from 'react'
import { mapsUrl } from '../lib/venues.js'
import { useScrollLock } from '../lib/useScrollLock.js'
import { useI18n } from '../lib/i18n/react.jsx'

const TIER_STYLE = {
  A: 'bg-green-100 text-green-700',
  B: 'bg-sky-100 text-sky-700',
  C: 'bg-neutral-100 text-neutral-500',
}

export default function VenueModal({ venue, check, onClose }) {
  const { t } = useI18n()
  useScrollLock()
  useEffect(() => {
    const onKey = (e) => e.key === 'Escape' && onClose()
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [onClose])

  if (!venue) return null
  const bd = venue.breakdown || {}

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
          <div className="flex items-center justify-between mb-2">
            <span className="font-semibold">{t('venue.watchScore')}</span>
            <span className="font-bold text-accent">{venue.score}/100</span>
          </div>

          {bd.tierKey && (
            <span className={`inline-block text-xs font-medium rounded-full px-2.5 py-1 mb-4 ${TIER_STYLE[bd.tier] || ''}`}>
              {t(`venue.${bd.tierKey}`)}
            </span>
          )}

          <p className="text-sm text-neutral-500 mb-2">{t('venue.why')}</p>
          <ul className="space-y-1.5 text-sm">
            {(bd.criteria || []).map((c, i) => (
              <li key={i} className="flex items-start gap-2">
                <span className={c.met ? 'text-green-600' : 'text-neutral-300'}>{c.met ? '✓' : '○'}</span>
                <span className={c.met ? 'text-neutral-700' : 'text-neutral-400'}>{t(`venue.${c.key}`, c.vars)}</span>
              </li>
            ))}
            <li className="flex items-start gap-2">
              <span className="text-neutral-400">★</span>
              <span className="text-neutral-700">
                {t('venue.reviewsTiebreak', { rating: bd.rating?.toFixed?.(1), count: bd.reviewCount })}
              </span>
            </li>
          </ul>

          {check?.evidence && (
            <p className="mt-4 text-xs text-neutral-400 italic">{t('venue.websiteEvidence', { evidence: check.evidence })}</p>
          )}

          <div className="mt-5 flex flex-wrap gap-3">
            <a
              href={mapsUrl(venue)}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1 text-sm bg-accent text-white rounded-lg px-3 py-2 hover:opacity-90"
            >
              {t('venue.openMaps')}
            </a>
            {venue.website && (
              <a
                href={venue.website}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1 text-sm border border-neutral-300 rounded-lg px-3 py-2 hover:border-accent"
              >
                {t('venue.visitWebsite')}
              </a>
            )}
          </div>
          {venue.address && <p className="mt-3 text-xs text-neutral-400">{venue.address}</p>}
        </div>
      </div>
    </div>
  )
}
