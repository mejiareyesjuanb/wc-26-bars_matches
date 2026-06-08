import { useEffect } from 'react'
import { getActiveCity, cityNeighborhoods, isCityLevel, boroughsFromVenues } from '../lib/city.js'
import NeighborhoodPicker from '../views/NeighborhoodPicker.jsx'
import { useI18n } from '../lib/i18n/react.jsx'

// Shown right after a user explicitly picks a city. Optional: pick neighborhoods
// now or Skip. Waits for the new city's venues; for city-level cities (too few
// neighborhoods/boroughs) it closes itself silently.
export default function NeighborhoodPromptModal({ venues, onSave, onClose }) {
  const { t } = useI18n()
  const city = getActiveCity()
  const ready = venues != null
  const twoLevel = !!city.twoLevel
  const flatList = ready && !twoLevel ? cityNeighborhoods(city, venues) : []
  const cityLevel = ready && (twoLevel ? boroughsFromVenues(venues).length === 0 : isCityLevel(flatList))

  useEffect(() => {
    const onKey = (e) => e.key === 'Escape' && onClose()
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [onClose])

  useEffect(() => {
    if (cityLevel) onClose()
  }, [cityLevel, onClose])

  if (cityLevel) return null

  return (
    <div
      className="fixed inset-0 z-50 bg-black/40 flex items-end sm:items-center justify-center p-0 sm:p-4"
      onClick={onClose}
      role="dialog"
      aria-modal="true"
      aria-label={t('picker.optionalTitle', { city: city.name })}
    >
      <div
        className="bg-white w-full sm:max-w-md sm:rounded-2xl rounded-t-2xl max-h-[90vh] overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="sm:hidden flex justify-center pt-2">
          <div className="h-1 w-10 rounded-full bg-neutral-300" />
        </div>
        <div className="p-5 border-b border-neutral-100 flex items-start justify-between gap-3">
          <h2 className="text-lg font-semibold">{t('picker.optionalTitle', { city: city.name })}</h2>
          <button onClick={onClose} aria-label={t('detail.close')} className="text-neutral-400 hover:text-neutral-700 text-xl leading-none">×</button>
        </div>
        <div className="p-5">
          {!ready ? (
            <p className="text-sm text-neutral-400 py-6 text-center">{t('picker.loading')}</p>
          ) : (
            <NeighborhoodPicker
              compact
              twoLevel={twoLevel}
              venues={venues}
              neighborhoods={flatList}
              onSave={onSave}
              onSkip={onClose}
            />
          )}
        </div>
      </div>
    </div>
  )
}
