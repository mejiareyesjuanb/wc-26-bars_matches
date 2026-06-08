import { useMemo, useState } from 'react'
import { MATCHES } from '../data/matches.js'
import { filterMatches } from '../lib/filters.js'
import { dateKey } from '../lib/time.js'
import { icsForMatches } from '../lib/calendar.js'
import FilterBar from '../components/FilterBar.jsx'
import MatchCard from '../components/MatchCard.jsx'
import MatchTable from '../components/MatchTable.jsx'
import MatchDetailModal from '../components/MatchDetailModal.jsx'

function downloadIcs(matches, filename) {
  const blob = new Blob([icsForMatches(matches)], { type: 'text/calendar;charset=utf-8' })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = filename
  document.body.appendChild(a)
  a.click()
  a.remove()
  URL.revokeObjectURL(url)
}

export default function Matches({ venues, prefs, onSavePrefs, onGoToBars }) {
  const [filters, setFilters] = useState({})
  const [view, setView] = useState('cards') // 'cards' | 'list'
  const [selected, setSelected] = useState(null)
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

      <div className="flex flex-wrap items-center gap-2 mb-3">
        <p className="text-sm text-neutral-500 mr-auto">{results.length} matches</p>
        {filtered && results.length > 0 && (
          <button
            onClick={() => downloadIcs(results, 'wc2026-matches.ics')}
            className="text-sm bg-accent text-white rounded-lg px-3 py-1.5 hover:opacity-90"
          >
            📅 Add these {results.length} to calendar
          </button>
        )}
        <button
          onClick={() => downloadIcs(MATCHES, 'wc2026-all-matches.ics')}
          className={`text-sm rounded-lg px-3 py-1.5 ${filtered ? 'border border-neutral-300 hover:border-accent' : 'bg-accent text-white hover:opacity-90'}`}
        >
          📅 Add all 104 to calendar
        </button>
      </div>
      <p className="text-xs text-neutral-400 mb-3">
        Downloads an .ics with a reminder per match. Apple/Outlook open it directly; in Google Calendar use Settings → Import.
      </p>

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
    </div>
  )
}
