import { useState } from 'react'
import Chip from '../components/Chip.jsx'
import { getActiveCity, boroughsFromVenues, neighborhoodsInBorough } from '../lib/city.js'
import { useI18n } from '../lib/i18n/react.jsx'

// Flat picker by default. For two-level cities (e.g. New York) pass `twoLevel`
// + `venues`: the user picks a borough first, then neighborhoods within it.
// `neighborhoods` overrides the flat list; `onSkip` adds a Skip action.
export default function NeighborhoodPicker({ initial, onSave, onSkip, neighborhoods, twoLevel, venues, compact = false }) {
  const { t } = useI18n()
  const [hoods, setHoods] = useState(initial || [])
  const [borough, setBorough] = useState(null)

  const toggle = (h) =>
    setHoods((prev) => (prev.includes(h) ? prev.filter((x) => x !== h) : [...prev, h]))

  const flatList = neighborhoods || getActiveCity().neighborhoods

  const Wrapper = ({ children }) => (
    <div className={compact ? '' : 'max-w-2xl mx-auto p-6'}>
      {compact ? (
        <p className="text-sm text-neutral-500 mb-3">{t('picker.compactPrompt')}</p>
      ) : (
        <>
          <h1 className="text-2xl font-bold">{t('picker.title')}</h1>
          <p className="text-neutral-500 mt-2">{t('picker.blurb')}</p>
        </>
      )}
      {children}
      <button
        onClick={() => onSave(hoods)}
        className={`${compact ? 'mt-4' : 'mt-8'} w-full bg-accent text-white rounded-lg py-3 font-semibold hover:opacity-90`}
      >
        {hoods.length ? t('picker.see') : t('picker.seeAll')}
      </button>
      <button
        onClick={() => onSave([])}
        className="mt-3 w-full text-sm text-neutral-500 hover:text-accent"
      >
        {t('picker.allNeighborhoods')}
      </button>
      {onSkip && (
        <button onClick={onSkip} className="mt-3 w-full text-sm text-neutral-500 hover:text-accent">
          {t('picker.skip')}
        </button>
      )}
    </div>
  )

  // --- Two-level (borough → neighborhood) ---
  if (twoLevel) {
    const boroughs = boroughsFromVenues(venues)
    const fine = borough ? neighborhoodsInBorough(venues, borough) : []
    const options = borough ? (fine.length ? fine : [borough]) : []
    return (
      <Wrapper>
        {!borough ? (
          <>
            <p className="text-sm font-medium text-neutral-600 mt-1 mb-2">{t('picker.chooseBorough')}</p>
            <div className="flex flex-wrap gap-2">
              {boroughs.map((b) => (
                <Chip key={b} active={false} onClick={() => setBorough(b)}>{b}</Chip>
              ))}
            </div>
          </>
        ) : (
          <>
            <div className="flex items-center justify-between mt-1 mb-2">
              <p className="text-sm font-medium text-neutral-600">{t('picker.inBorough', { borough })}</p>
              <button onClick={() => setBorough(null)} className="text-xs text-accent hover:underline">{t('picker.back')}</button>
            </div>
            <div className="flex flex-wrap gap-2">
              {options.map((h) => (
                <Chip key={h} active={hoods.includes(h)} onClick={() => toggle(h)}>
                  {h}
                </Chip>
              ))}
            </div>
          </>
        )}
      </Wrapper>
    )
  }

  // --- Flat ---
  return (
    <Wrapper>
      <div className={`flex flex-wrap gap-2 ${compact ? '' : 'mt-6'}`}>
        {flatList.map((h) => (
          <Chip key={h} active={hoods.includes(h)} onClick={() => toggle(h)}>
            {h}
          </Chip>
        ))}
      </div>
    </Wrapper>
  )
}
