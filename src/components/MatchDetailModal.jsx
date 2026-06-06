import { useEffect } from 'react'
import { getTeam } from '../data/teams.js'
import { formatKickoff } from '../lib/time.js'

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
      </div>
    </div>
  )
}
