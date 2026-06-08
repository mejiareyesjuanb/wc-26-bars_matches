import { useEffect, useRef } from 'react'
import { isIOS, isAndroid } from '../lib/platform.js'
import { addMatchesToCalendar } from '../lib/addToCalendar.js'
import { useI18n } from '../lib/i18n/react.jsx'

const GOOGLE_IMPORT_URL = 'https://calendar.google.com/calendar/u/0/r/settings/export'

// Platform-adapted instructions for adding a set of matches to the calendar.
// Opens on a bulk "Add … to my calendar" click. The single CTA is "Download",
// which runs the existing addMatchesToCalendar() delivery (iOS → Apple Calendar
// link; desktop/Android → .ics download). Instructions stay visible afterward.
export default function AddToCalendarModal({ matches, all = false, onClose }) {
  const { t, lang } = useI18n()
  const contentRef = useRef(null)
  const count = matches?.length || 0

  useEffect(() => {
    const onKey = (e) => e.key === 'Escape' && onClose()
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [onClose])

  useEffect(() => {
    const prev = document.activeElement
    contentRef.current?.focus()
    return () => { if (prev && typeof prev.focus === 'function') prev.focus() }
  }, [])

  if (!matches || !count) return null

  const ios = isIOS()
  const android = isAndroid()
  const heading = all ? t('addCal.headingAll') : t('addCal.headingThese', { n: count })

  const onDownload = () =>
    addMatchesToCalendar(matches, {
      all,
      lang,
      filename: all ? 'wc2026-all-matches.ics' : 'wc2026-matches.ics',
    })

  return (
    <div
      className="fixed inset-0 z-50 bg-black/40 flex items-end sm:items-center justify-center p-0 sm:p-4"
      onClick={onClose}
      role="dialog"
      aria-modal="true"
      aria-label={heading}
    >
      <div
        ref={contentRef}
        tabIndex={-1}
        className="bg-white w-full sm:max-w-md sm:rounded-2xl rounded-t-2xl max-h-[90vh] overflow-y-auto outline-none"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Mobile drag handle (decorative) */}
        <div className="sm:hidden flex justify-center pt-2">
          <div className="h-1 w-10 rounded-full bg-neutral-300" />
        </div>

        <div className="p-5 border-b border-neutral-100 flex items-start justify-between gap-3">
          <h2 className="text-lg font-semibold">{heading}</h2>
          <button
            onClick={onClose}
            aria-label={t('detail.close')}
            className="text-neutral-400 hover:text-neutral-700 text-xl leading-none"
          >
            ×
          </button>
        </div>

        <div className="p-5 space-y-4">
          <div className="text-sm text-neutral-600 leading-relaxed space-y-2">
            {ios ? (
              <>
                <p>{t('addCal.iosLead')}</p>
                <p className="text-neutral-500">{t('addCal.iosGoogle')}</p>
              </>
            ) : android ? (
              <p>{t('addCal.android')}</p>
            ) : (
              <>
                <p>{t('addCal.desktopLead')}</p>
                <ul className="space-y-1 text-neutral-500">
                  <li>{t('addCal.desktopApple')}</li>
                  <li>
                    {t('addCal.desktopGoogle1')}{' '}
                    <a
                      href={GOOGLE_IMPORT_URL}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-accent hover:underline"
                    >
                      {t('addCal.desktopGoogleLink')}
                    </a>
                    {t('addCal.desktopGoogle2')}
                  </li>
                </ul>
              </>
            )}
          </div>

          <button
            onClick={onDownload}
            className="w-full inline-flex items-center justify-center gap-1 text-sm bg-accent text-white rounded-lg px-4 py-2.5 hover:opacity-90"
          >
            {t('addCal.download')}
          </button>
        </div>
      </div>
    </div>
  )
}
