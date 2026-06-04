import { useEffect, useMemo, useState } from 'react'
import { rankBars } from '../lib/scoring.js'
import { getTeam } from '../data/teams.js'
import { formatKickoff } from '../lib/time.js'
import { confirmScreens, FALLBACK_MESSAGES } from '../lib/venues.js'
import BarCard from '../components/BarCard.jsx'
import VenueMap from '../components/VenueMap.jsx'
import VenueModal from '../components/VenueModal.jsx'

const PAGE = 10
const ENRICH = 30 // confirm websites for this many top candidates (feeds ranking)

export default function MatchDetail({ match, prefs, venues, source, reason, onBack }) {
  const [visible, setVisible] = useState(PAGE)
  const [tab, setTab] = useState('list')
  const [selected, setSelected] = useState(null)
  const [checks, setChecks] = useState({})

  // Base ranking (no website checks) decides which venues are worth checking.
  const baseRanked = useMemo(
    () => (venues ? rankBars(venues, match, prefs) : []),
    [venues, match, prefs],
  )
  // Final ranking folds in website confirmations (World Cup viewing / screens),
  // so a confirmed venue can climb above unconfirmed peers.
  const ranked = useMemo(
    () => (venues ? rankBars(venues, match, prefs, checks) : []),
    [venues, match, prefs, checks],
  )

  // Reset paging when the match changes.
  useEffect(() => setVisible(PAGE), [match.id])

  const shown = ranked.slice(0, visible)

  // Confirm websites for the top candidates (to inform ranking) plus anything
  // currently shown (for badges) — whichever we haven't checked yet.
  useEffect(() => {
    const pool = [...baseRanked.slice(0, ENRICH), ...shown]
    const seen = new Set()
    const need = pool.filter((v) => {
      if (!v.website || checks[v.id] !== undefined || seen.has(v.id)) return false
      seen.add(v.id)
      return true
    })
    if (!need.length) return
    let cancelled = false
    confirmScreens(need).then((res) => {
      if (!cancelled && res && Object.keys(res).length) setChecks((c) => ({ ...c, ...res }))
    })
    return () => { cancelled = true }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [baseRanked.slice(0, ENRICH).map((v) => v.id).join(','), shown.map((v) => v.id).join(',')])

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

      {source === 'curated' && (
        <div className="mb-4 text-sm bg-amber-50 border border-amber-200 text-amber-800 rounded-lg px-3 py-2">
          {FALLBACK_MESSAGES[reason] || 'Showing the curated venue list.'}
        </div>
      )}

      <div className="flex items-center justify-between mb-3">
        <h2 className="font-semibold">Best Seattle venues for this match</h2>
        <div className="flex items-center gap-3">
          {venues && (
            <span className="text-xs text-neutral-400">{source === 'google' ? 'Live · Google' : 'Curated'}</span>
          )}
          <div className="flex rounded-lg border border-neutral-300 overflow-hidden text-sm">
            <button
              onClick={() => setTab('list')}
              className={`px-3 py-1 ${tab === 'list' ? 'bg-accent text-white' : 'bg-white text-neutral-600'}`}
            >List</button>
            <button
              onClick={() => setTab('map')}
              className={`px-3 py-1 ${tab === 'map' ? 'bg-accent text-white' : 'bg-white text-neutral-600'}`}
            >Map</button>
          </div>
        </div>
      </div>

      {!venues ? (
        <p className="text-center text-neutral-400 py-12">Finding venues…</p>
      ) : tab === 'map' ? (
        <VenueMap venues={shown} onSelect={setSelected} />
      ) : (
        <>
          <div className="grid gap-3">
            {shown.map((bar) => (
              <BarCard key={bar.id} bar={bar} check={checks[bar.id]} onClick={() => setSelected(bar)} />
            ))}
          </div>
          {visible < ranked.length && (
            <button
              onClick={() => setVisible((v) => v + PAGE)}
              className="mt-4 w-full border border-neutral-300 rounded-lg py-2.5 text-sm font-medium hover:border-accent hover:text-accent"
            >
              Show more results ({ranked.length - visible} more)
            </button>
          )}
        </>
      )}

      {selected && (
        <VenueModal venue={selected} check={checks[selected.id]} onClose={() => setSelected(null)} />
      )}
    </div>
  )
}
