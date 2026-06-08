import { useMemo, useState } from 'react'
import { MATCHES } from '../data/matches.js'
import { filterMatches } from '../lib/filters.js'
import { dateKey } from '../lib/time.js'
import FilterBar from '../components/FilterBar.jsx'
import MatchCard from '../components/MatchCard.jsx'
import MatchTable from '../components/MatchTable.jsx'
import MatchDetailModal from '../components/MatchDetailModal.jsx'
import AddToCalendarModal from '../components/AddToCalendarModal.jsx'

export default function Matches({ venues, prefs, onSavePrefs, onGoToBars }) {
  const [filters, setFilters] = useState({})
  const [view, setView] = useState('cards') // 'cards' | 'list'
  const [selected, setSelected] = useState(null)
  const [calendarOpen, setCalendarOpen] = useState(false)
  const dates = useMemo(
    () => [...new Set(MATCHES.map((m) => dateKey(m.datetime)))].sort(),
    [],
  )
  const cities = useMemo(
    () => [...new Set(MATCHES.map((m) => m.venueCity))].sort(),
    [],
  )
  const results = useMemo(() => filterMatches(MATCHES, filters), [filters])
  const filtered = results.length !== MATCHES.length
  // Bulk add shows for >1 result (unfiltered = all 104, or a filtered set of 2+).
  // A 1-result filter has no bulk button — that match is added via its card → modal.
  const showBulk = results.length > 1

  const pickTeam = (code) => {
    setFilters((f) => ({ ...f, team: code }))
    setSelected(null)
  }

  return (
    <div className="max-w-5xl mx-auto p-6">
      <div className="flex items-start justify-between gap-3">
        <h1 className="text-2xl font-bold">World Cup 2026 matches</h1>
        <div className="flex rounded-lg border border-neutral-300 overflow-hidden text-sm shrink-0">
          <button onClick={() => setView('cards')} className={`px-3 py-1 ${view === 'cards' ? 'bg-accent text-white' : 'bg-white text-neutral-600'}`}>Cards</button>
          <button onClick={() => setView('list')} className={`px-3 py-1 ${view === 'list' ? 'bg-accent text-white' : 'bg-white text-neutral-600'}`}>List</button>
        </div>
      </div>
      <p className="text-sm text-neutral-500 mt-1 mb-4">
        Every match, in Pacific (Seattle) time. Tap a match to add it to your calendar and find where to watch.
      </p>
      <FilterBar filters={filters} setFilters={setFilters} dates={dates} cities={cities} />

      <div className="flex flex-wrap items-center justify-between gap-2 mb-3">
        <p className="text-sm text-neutral-500">{results.length} matches</p>
        {showBulk && (
          <button
            onClick={() => setCalendarOpen(true)}
            className="text-sm rounded-lg px-3 py-1.5 border border-neutral-300 hover:border-accent"
          >
            {filtered
              ? `📅 Add these ${results.length} matches to my calendar`
              : '📅 Add all matches to my calendar'}
          </button>
        )}
      </div>

      {results.length === 0 ? (
        <p className="text-center text-neutral-400 py-12">No matches fit these filters.</p>
      ) : view === 'list' ? (
        <MatchTable matches={results} onSelect={setSelected} />
      ) : (
        <div className="grid gap-3 sm:grid-cols-2">
          {results.map((m) => (
            <MatchCard key={m.id} match={m} onSelect={setSelected} />
          ))}
        </div>
      )}

      {selected && (
        <MatchDetailModal
          match={selected}
          venues={venues}
          prefs={prefs}
          onSavePrefs={onSavePrefs}
          onClose={() => setSelected(null)}
          onSeeAllBars={onGoToBars}
          onPickTeam={pickTeam}
        />
      )}

      {calendarOpen && (
        <AddToCalendarModal
          matches={filtered ? results : MATCHES}
          all={!filtered}
          onClose={() => setCalendarOpen(false)}
        />
      )}
    </div>
  )
}
