import { useState } from 'react'
import { isIOS } from '../lib/platform.js'

const GOOGLE_IMPORT_URL = 'https://calendar.google.com/calendar/u/0/r/settings/export'

// A quiet, collapsed link by default. It only expands into real guidance for the
// paths that are actually clunky (Google Calendar import; iPhone + Google). For
// Apple/Outlook/Android the .ics just opens, so we don't nag.
export default function CalendarHelp({ className = '', label = 'ⓘ I need help adding these to my calendar' }) {
  const [open, setOpen] = useState(false)
  const ios = isIOS()

  return (
    <div className={`inline-block ${className}`}>
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        aria-expanded={open}
        className="text-xs text-neutral-500 hover:text-accent underline-offset-2 hover:underline"
      >
        {label}
      </button>
      {open && (
        <div className="mt-2 text-xs leading-relaxed text-neutral-600 bg-neutral-50 border border-neutral-200 rounded-lg p-3 space-y-2 max-w-sm">
          {ios ? (
            <>
              <p>
                <span className="font-medium">📱 iPhone:</span> the file opens in Apple
                Calendar — tap <span className="font-medium">“Add All”</span> and you’re done.
              </p>
              <p className="text-neutral-500">
                Using Google Calendar? Bulk import is desktop-only — open this app on a
                computer, or add games one-by-one with the “Add to Google Calendar” button
                on a match.
              </p>
            </>
          ) : (
            <>
              <p>
                <span className="font-medium">✅ Apple Calendar / Outlook:</span> open the
                downloaded <code>.ics</code> — it imports automatically.
              </p>
              <p className="font-medium">Google Calendar (a couple steps):</p>
              <ol className="list-decimal list-inside space-y-1 text-neutral-500">
                <li>
                  <a
                    href={GOOGLE_IMPORT_URL}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-accent hover:underline"
                  >
                    Open Google Calendar import ↗
                  </a>
                </li>
                <li>
                  Choose the <code>.ics</code> you just downloaded → Import.
                </li>
              </ol>
            </>
          )}
        </div>
      )}
    </div>
  )
}
