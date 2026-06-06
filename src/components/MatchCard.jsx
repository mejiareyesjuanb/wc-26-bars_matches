import { getTeam } from '../data/teams.js'
import { teamInfo } from '../data/teamInfo.js'
import { formatKickoff } from '../lib/time.js'

function Rank({ code }) {
  const rank = teamInfo(code)?.fifaRank
  if (!rank) return null
  return <span className="ml-1 align-middle text-xs font-normal text-neutral-400">#{rank}</span>
}

export default function MatchCard({ match, onSelect }) {
  const home = getTeam(match.homeTeam)
  const away = getTeam(match.awayTeam)
  return (
    <div
      onClick={() => onSelect?.(match)}
      className="bg-white rounded-xl border border-neutral-200 p-4 cursor-pointer hover:shadow-md hover:border-accent transition"
    >
      <div className="flex items-center justify-between mb-2">
        <span className="text-xs font-medium text-accent">
          {match.stage}{match.group ? ` · Group ${match.group}` : ''}
        </span>
        <span className="text-xs text-neutral-500">{match.venueCity}</span>
      </div>
      <div className="flex items-center gap-2 text-base sm:text-lg font-semibold">
        <span>{home.flag ? `${home.flag} ` : ''}{home.name}<Rank code={match.homeTeam} /></span>
        <span className="text-neutral-400 text-sm">vs</span>
        <span>{away.flag ? `${away.flag} ` : ''}{away.name}<Rank code={match.awayTeam} /></span>
      </div>
      <div className="mt-2 text-sm text-neutral-500">{formatKickoff(match.datetime)}</div>
    </div>
  )
}
