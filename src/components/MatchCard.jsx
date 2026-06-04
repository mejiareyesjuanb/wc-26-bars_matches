import { getTeam } from '../data/teams.js'
import { formatKickoff } from '../lib/time.js'

export default function MatchCard({ match }) {
  const home = getTeam(match.homeTeam)
  const away = getTeam(match.awayTeam)
  return (
    <div className="bg-white rounded-xl border border-neutral-200 p-4">
      <div className="flex items-center justify-between mb-2">
        <span className="text-xs font-medium text-accent">
          {match.stage}{match.group ? ` · Group ${match.group}` : ''}
        </span>
        <span className="text-xs text-neutral-500">{match.venueCity}</span>
      </div>
      <div className="flex items-center gap-2 text-base sm:text-lg font-semibold">
        <span>{home.flag ? `${home.flag} ` : ''}{home.name}</span>
        <span className="text-neutral-400 text-sm">vs</span>
        <span>{away.flag ? `${away.flag} ` : ''}{away.name}</span>
      </div>
      <div className="mt-2 text-sm text-neutral-500">{formatKickoff(match.datetime)}</div>
    </div>
  )
}
