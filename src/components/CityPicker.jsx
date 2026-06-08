import { useEffect, useRef } from 'react'
import { CITY_LIST } from '../lib/city.js'
import { useScrollLock } from '../lib/useScrollLock.js'
import { useI18n } from '../lib/i18n/react.jsx'

// City sheet (bottom-sheet on mobile, centered card on desktop). The short,
// alphabetical city list scrolls — no search needed. `nearestId` (if known) is
// starred in place.
export default function CityPicker({ currentId, nearestId, onPick, onClose }) {
  const { t } = useI18n()
  const contentRef = useRef(null)
  useScrollLock()

  useEffect(() => {
    const onKey = (e) => e.key === 'Escape' && onClose()
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [onClose])

  // Focus the dialog on open (search input that used to autofocus is gone).
  useEffect(() => { contentRef.current?.focus() }, [])

  // Strictly alphabetical (CITY_LIST is pre-sorted); the nearest city is just
  // starred in place, not pinned to the top.
  const list = CITY_LIST

  return (
    <div
      className="fixed inset-0 z-50 bg-black/40 flex items-end sm:items-center justify-center p-0 sm:p-4"
      onClick={onClose}
      role="dialog"
      aria-modal="true"
      aria-label={t('city.pickTitle')}
    >
      <div
        ref={contentRef}
        tabIndex={-1}
        className="bg-white w-full sm:max-w-md sm:rounded-2xl rounded-t-2xl max-h-[85vh] flex flex-col overflow-hidden outline-none"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="sm:hidden flex justify-center pt-2">
          <div className="h-1 w-10 rounded-full bg-neutral-300" />
        </div>
        <div className="p-4 border-b border-neutral-100 flex items-center justify-between gap-3">
          <h2 className="text-lg font-semibold">{t('city.pickTitle')}</h2>
          <button onClick={onClose} aria-label={t('detail.close')} className="text-neutral-400 hover:text-neutral-700 text-xl leading-none">×</button>
        </div>
        <ul className="overflow-y-auto px-2 py-3">
          {list.map((c) => (
            <li key={c.id}>
              <button
                onClick={() => onPick(c.id)}
                className={`w-full text-left px-3 py-2.5 rounded-lg flex items-center justify-between gap-2 hover:bg-neutral-100 ${c.id === currentId ? 'text-accent font-medium' : 'text-neutral-700'}`}
              >
                <span>
                  {c.id === nearestId ? '★ ' : ''}{c.name}
                  <span className="text-neutral-400 text-xs"> · {c.country}</span>
                </span>
                {c.id === nearestId && <span className="text-xs text-neutral-400">{t('city.closest')}</span>}
              </button>
            </li>
          ))}
        </ul>
      </div>
    </div>
  )
}
