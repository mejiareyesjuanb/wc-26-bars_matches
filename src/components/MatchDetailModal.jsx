import { useEffect, useMemo, useState } from 'react'
import { getTeam, isPlaceholder } from '../data/teams.js'
import { formatKickoff } from '../lib/time.js'
import { googleCalendarUrl, icsForMatch, ICS_FILENAME } from '../lib/calendar.js'
import { stakesFor } from '../lib/stakes.js'
import { rankBars } from '../lib/scoring.js'
import { confirmScreens } from '../lib/venues.js'
import { MATCHES } from '../data/matches.js'
import BarCard from './BarCard.jsx'
import NeighborhoodPicker from '../views/NeighborhoodPicker.jsx'

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
  return <span>{team.flag ? `${team.flag} ` : ''}{team.name}</span>
}

// Tappable when the team is known (group stage); plain text for knockout slots.
function TeamLabel({ team, onPick }) {
  if (isPlaceholder(team) || !onPick) return <TeamName team={team} />
  return (
    <button
      onClick={() => onPick(team.code)}
      aria-label={`See ${team.name}'s schedule`}
      className="hover:text-accent underline-offset-2 hover:underline"
    >
      <TeamName team={team} />
    </button>
  )
}

export default function MatchDetailModal({ match, venues, prefs, onSavePrefs, onClose, onSeeAllBars, onPickTeam }) {
  const [checks, setChecks] = useState({})

  useEffect(() => {
    const onKey = (e) => e.key === 'Escape' && onClose()
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [onClose])

  const hoods = prefs?.neighborhoods || []
  const hoodKey = hoods.join(',')

  // Base ranking (no website checks) picks which venues are worth checking.
  const baseRanked = useMemo(
    () => (venues ? rankBars(venues.filter((v) => hoods.includes(v.neighborhood))) : []),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [venues, hoodKey],
  )
  // Final ranking folds in confirmations and keeps only sports bars / confirmed.
  const ranked = useMemo(
    () => (venues ? rankBars(venues.filter((v) => hoods.includes(v.neighborhood)), checks).filter((v) => v.included) : []),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [venues, hoodKey, checks],
  )
  const candidates = useMemo(() => baseRanked.filter((v) => v.website).slice(0, 20), [baseRanked])

  useEffect(() => {
    const need = candidates.filter((v) => checks[v.id] === undefined)
    if (!need.length) return
    let cancelled = false
    confirmScreens(need).then((res) => {
      if (!cancelled && res && Object.keys(res).length) setChecks((c) => ({ ...c, ...res }))
    })
    return () => { cancelled = true }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [candidates.map((v) => v.id).join(',')])

  if (!match) return null
  const home = getTeam(match.homeTeam)
  const away = getTeam(match.awayTeam)
  const stakes = stakesFor(match, MATCHES)
  const top = ranked.slice(0, 3)
  const enriching = candidates.some((v) => checks[v.id] === undefined)

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
              <TeamLabel team={home} onPick={onPickTeam} /> <span className="text-neutral-400 font-normal">vs</span> <TeamLabel team={away} onPick={onPickTeam} />
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

          {/* Where to watch — top bars in the user's neighborhoods */}
          <section>
            <h3 className="text-sm font-semibold mb-2">Where to watch</h3>
            {hoods.length === 0 ? (
              <NeighborhoodPicker
                initial={hoods}
                compact
                onSave={(h) => onSavePrefs?.({ ...prefs, neighborhoods: h })}
              />
            ) : !venues || (top.length === 0 && enriching) ? (
              <div className="space-y-2">
                <div className="h-16 bg-neutral-100 rounded-xl animate-pulse" />
                <div className="h-16 bg-neutral-100 rounded-xl animate-pulse" />
              </div>
            ) : top.length === 0 ? (
              <p className="text-sm text-neutral-400">No sports bars or confirmed World Cup venues in your areas yet.</p>
            ) : (
              <div className="space-y-3">
                {top.map((bar) => (
                  <BarCard key={bar.id} bar={bar} check={checks[bar.id]} />
                ))}
                <button onClick={onSeeAllBars} className="text-sm text-accent hover:underline">See all bars →</button>
              </div>
            )}
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
