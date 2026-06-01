import { useMemo } from 'react'
import { rankBars } from '../lib/scoring.js'
import { getTeam } from '../data/teams.js'
import { formatKickoff } from '../lib/time.js'
import BarCard from '../components/BarCard.jsx'

export default function MatchDetail({ match, prefs, venues, source, onBack }) {
  const ranked = useMemo(
    () => (venues ? rankBars(venues, match, prefs) : []),
    [venues, match, prefs],
  )
  const home = getTeam(match.homeTeam)
  const away = getTeam(match.awayTeam)

  return (
    <div className="max-w-3xl mx-auto p-6">
      <button onClick={onBack} className="text-sm text-accent underline mb-4">← All matches</button>
      <div className="bg-white rounded-xl border border-neutral-200 p-5 mb-6">
        <div className="text-xs font-medium text-accent">{match.stage}{match.group ? ` · Group ${match.group}` : ''}</div>
        <div className="text-xl font-bold mt-1">{home.flag ? `${home.flag} ` : ''}{home.name} vs {away.flag ? `${away.flag} ` : ''}{away.name}</div>
        <div className="text-sm text-neutral-500 mt-1">{formatKickoff(match.datetime)} · {match.venueCity}</div>
        {match.venueCity === 'Seattle' && (
          <div className="mt-3 text-sm bg-accent/10 text-accent rounded-lg px-3 py-2">
            🏟️ Played here at Lumen Field — venues near the stadium get an extra matchday-ambiance boost.
          </div>
        )}
      </div>

      <div className="flex items-center justify-between mb-3">
        <h2 className="font-semibold">Best Seattle venues for this match</h2>
        {venues && (
          <span className="text-xs text-neutral-400">
            {source === 'google' ? 'Live · Google' : 'Curated list'}
          </span>
        )}
      </div>

      {!venues ? (
        <p className="text-center text-neutral-400 py-12">Finding venues…</p>
      ) : (
        <div className="grid gap-3">
          {ranked.map((bar) => <BarCard key={bar.id} bar={bar} />)}
        </div>
      )}
    </div>
  )
}
