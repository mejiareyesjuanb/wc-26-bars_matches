import { useEffect, useMemo, useState } from 'react'
import { rankBars } from '../lib/scoring.js'
import { confirmScreens, FALLBACK_MESSAGES } from '../lib/venues.js'
import BarCard from '../components/BarCard.jsx'
import VenueMap from '../components/VenueMap.jsx'
import VenueModal from '../components/VenueModal.jsx'
import NeighborhoodPicker from './NeighborhoodPicker.jsx'

const PER_HOOD = 5 // bars shown per neighborhood before "show all"

// Bar-style Google categories (vs. restaurants/cafes) — prioritized for the
// website check, but we still check everything with a website to find any venue
// that confirms World Cup viewing.
const BAR_CATEGORIES = new Set(['sports bar', 'bar', 'pub', 'brewery', 'wine bar', 'beer hall', 'night club'])
const isBarish = (v) => BAR_CATEGORIES.has(v.type)

export default function Bars({ prefs, onSavePrefs, venues, source, reason }) {
  const [editing, setEditing] = useState(false)
  const [tab, setTab] = useState('list')
  const [selected, setSelected] = useState(null)
  const [checks, setChecks] = useState({})
  const [expanded, setExpanded] = useState({})

  const hoods = prefs.neighborhoods || []

  // Rank venues within each chosen neighborhood (1..N per neighborhood).
  const rankHood = (h, withChecks) =>
    venues ? rankBars(venues.filter((v) => v.neighborhood === h), withChecks ? checks : {}) : []

  const baseByHood = useMemo(() => {
    const m = {}
    for (const h of hoods) m[h] = rankHood(h, false)
    return m
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [venues, hoods.join(',')])

  const byHood = useMemo(() => {
    const m = {}
    for (const h of hoods) m[h] = rankHood(h, true)
    return m
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [venues, hoods.join(','), checks])

  // Website-check every venue with a website in the chosen neighborhoods, so we
  // can find which actually confirm World Cup viewing. Bars are checked first so
  // they survive the server-side cap.
  const candidates = useMemo(() => {
    const all = []
    for (const h of hoods) all.push(...(baseByHood[h] || []).filter((v) => v.website))
    return [...all.filter(isBarish), ...all.filter((v) => !isBarish(v))]
  }, [baseByHood, hoods])

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

  if (hoods.length === 0 || editing) {
    return (
      <NeighborhoodPicker
        initial={hoods}
        onSave={(h) => { onSavePrefs({ ...prefs, neighborhoods: h }); setEditing(false) }}
      />
    )
  }

  const mapVenues = hoods.flatMap((h) => (byHood[h] || []).slice(0, expanded[h] ? Infinity : PER_HOOD))

  return (
    <div className="max-w-3xl mx-auto p-6">
      <div className="flex items-center justify-between mb-1">
        <h1 className="text-2xl font-bold">Best bars by neighborhood</h1>
        <div className="flex items-center gap-3">
          <button onClick={() => setEditing(true)} className="text-sm text-accent underline">Edit neighborhoods</button>
          <div className="flex rounded-lg border border-neutral-300 overflow-hidden text-sm">
            <button onClick={() => setTab('list')} className={`px-3 py-1 ${tab === 'list' ? 'bg-accent text-white' : 'bg-white text-neutral-600'}`}>List</button>
            <button onClick={() => setTab('map')} className={`px-3 py-1 ${tab === 'map' ? 'bg-accent text-white' : 'bg-white text-neutral-600'}`}>Map</button>
          </div>
        </div>
      </div>
      <p className="text-sm text-neutral-500 mb-4">
        Ranked by World Cup viewing, screens, your neighborhoods, and reviews.
        {venues && <span className="ml-1 text-neutral-400">{source === 'google' ? 'Live · Google' : 'Curated'}</span>}
      </p>

      {source === 'curated' && (
        <div className="mb-4 text-sm bg-amber-50 border border-amber-200 text-amber-800 rounded-lg px-3 py-2">
          {FALLBACK_MESSAGES[reason] || 'Showing the curated venue list.'}
        </div>
      )}

      {!venues ? (
        <p className="text-center text-neutral-400 py-12">Finding bars…</p>
      ) : tab === 'map' ? (
        <VenueMap venues={mapVenues} onSelect={setSelected} />
      ) : (
        <div className="space-y-8">
          {hoods.map((h) => {
            const list = byHood[h] || []
            const shown = list.slice(0, expanded[h] ? Infinity : PER_HOOD)
            return (
              <section key={h}>
                <h2 className="font-semibold mb-3">
                  {h} <span className="text-neutral-400 font-normal">({list.length})</span>
                </h2>
                {list.length === 0 ? (
                  <p className="text-neutral-400 text-sm">No bars found in {h}.</p>
                ) : (
                  <div className="grid gap-3">
                    {shown.map((bar) => (
                      <BarCard key={bar.id} bar={bar} check={checks[bar.id]} onClick={() => setSelected(bar)} />
                    ))}
                  </div>
                )}
                {list.length > PER_HOOD && !expanded[h] && (
                  <button
                    onClick={() => setExpanded((e) => ({ ...e, [h]: true }))}
                    className="mt-3 text-sm text-accent hover:underline"
                  >
                    Show all {list.length} in {h}
                  </button>
                )}
              </section>
            )
          })}
        </div>
      )}

      {selected && <VenueModal venue={selected} check={checks[selected.id]} onClose={() => setSelected(null)} />}
    </div>
  )
}
