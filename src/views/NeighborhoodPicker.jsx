import { useState } from 'react'
import Chip from '../components/Chip.jsx'
import { getActiveCity } from '../lib/city.js'
import { useI18n } from '../lib/i18n/react.jsx'

// `compact` renders an embeddable version (no full-page wrapper / heading) for
// use inside the match-detail modal or the post-city prompt. `neighborhoods`
// overrides the active city's list (e.g. a venue-discovered list). `onSkip`, when
// provided, renders a Skip action (optional-selection flows).
export default function NeighborhoodPicker({ initial, onSave, onSkip, neighborhoods, compact = false }) {
  const { t } = useI18n()
  const NEIGHBORHOODS = neighborhoods || getActiveCity().neighborhoods
  const [hoods, setHoods] = useState(initial || [])

  const toggle = (h) =>
    setHoods((prev) =>
      prev.includes(h) ? prev.filter((x) => x !== h) : prev.length < 5 ? [...prev, h] : prev,
    )

  return (
    <div className={compact ? '' : 'max-w-2xl mx-auto p-6'}>
      {compact ? (
        <p className="text-sm text-neutral-500 mb-3">{t('picker.compactPrompt')}</p>
      ) : (
        <>
          <h1 className="text-2xl font-bold">{t('picker.title')}</h1>
          <p className="text-neutral-500 mt-2">{t('picker.blurb')}</p>
        </>
      )}

      <div className={`flex flex-wrap gap-2 ${compact ? '' : 'mt-6'}`}>
        {NEIGHBORHOODS.map((h) => (
          <Chip
            key={h}
            active={hoods.includes(h)}
            disabled={!hoods.includes(h) && hoods.length >= 5}
            onClick={() => toggle(h)}
          >
            {hoods.includes(h) ? `${hoods.indexOf(h) + 1}. ${h}` : h}
          </Chip>
        ))}
      </div>

      <button
        onClick={() => onSave(hoods)}
        disabled={!hoods.length}
        className={`${compact ? 'mt-4' : 'mt-8'} w-full bg-accent text-white rounded-lg py-3 font-semibold hover:opacity-90 disabled:opacity-40 disabled:cursor-not-allowed`}
      >
        {hoods.length ? t('picker.see') : t('picker.pickAtLeast')}
      </button>

      {onSkip && (
        <button
          onClick={onSkip}
          className="mt-3 w-full text-sm text-neutral-500 hover:text-accent"
        >
          {t('picker.skip')}
        </button>
      )}
    </div>
  )
}
