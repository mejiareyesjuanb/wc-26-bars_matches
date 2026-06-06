import { useEffect } from 'react'
import { getTeam } from '../data/teams.js'
import { formatKickoff } from '../lib/time.js'
import { googleCalendarUrl, icsForMatch, ICS_FILENAME } from '../lib/calendar.js'
import { stakesFor } from '../lib/stakes.js'
import { MATCHES } from '../data/matches.js'

function downloadIcs(match) {
  const blob = new Blob([icsForMatch(match)], { type: 'text/calendar;charset=utf-8' })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = ICS_FILENAME(match)
  document.body.appendChild(a)
  a.click()
  a.remove()
  URL.revokeObjectURL(url)
}

function TeamName({ team }) {
  return (
    <span>
      {team.flag ? `${team.flag} ` : ''}{team.name}
    </span>
  )
}

export default function MatchDetailModal({ match, onClose }) {
  useEffect(() => {
    const onKey = (e) => e.key === 'Escape' && onClose()
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [onClose])

  if (!match) return null
  const home = getTeam(match.homeTeam)
  const away = getTeam(match.awayTeam)
  const stakes = stakesFor(match, MATCHES)

  return (
    <div
      className="fixed inset-0 z-50 bg-black/40 flex items-end sm:items-center justify-center p-0 sm:p-4"
      onClick={onClose}
      role="dialog"
      aria-modal="true"
    >
      <div
        className="bg-white w-full sm:max-w-lg sm:rounded-2xl rounded-t-2xl max-h-[90vh] overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header — renders instantly from the match data */}
        <div className="p-5 border-b border-neutral-100 flex items-start justify-between gap-3">
          <div>
            <div className="text-xs font-medium text-accent">
              {match.stage}{match.group ? ` · Group ${match.group}` : ''}
            </div>
            <h2 className="text-lg font-semibold mt-1">
              <TeamName team={home} /> <span className="text-neutral-400 font-normal">vs</span> <TeamName team={away} />
            </h2>
            <p className="text-sm text-neutral-500 mt-1">{formatKickoff(match.datetime)} · {match.venueCity}</p>
          </div>
          <button onClick={onClose} aria-label="Close" className="text-neutral-400 hover:text-neutral-700 text-xl leading-none">×</button>
        </div>

        <div className="p-5 space-y-6">
          {/* Add to calendar (the .ics includes a 1-hour reminder alarm) */}
          <section>
            <h3 className="text-sm font-semibold mb-2">Add to calendar</h3>
            <div className="flex flex-col sm:flex-row gap-2">
              <a
                href={googleCalendarUrl(match)}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center justify-center gap-1 text-sm bg-accent text-white rounded-lg px-3 py-2 hover:opacity-90"
              >
                Add to Google Calendar ↗
              </a>
              <button
                onClick={() => downloadIcs(match)}
                className="inline-flex items-center justify-center gap-1 text-sm border border-neutral-300 rounded-lg px-3 py-2 hover:border-accent"
              >
                Download .ics (Apple/Outlook)
              </button>
            </div>
            <p className="mt-2 text-xs text-neutral-400">Includes a reminder 1 hour before kickoff.</p>
          </section>

          {stakes && (
            <section className="text-sm bg-accent/10 text-accent rounded-lg px-3 py-2">
              ⚡ {stakes}
            </section>
          )}
        </div>
      </div>
    </div>
  )
}
