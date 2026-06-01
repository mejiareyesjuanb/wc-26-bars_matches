import { useMemo, useState } from 'react'
import { MATCHES } from '../data/matches.js'
import { filterMatches } from '../lib/filters.js'
import { dateKey } from '../lib/time.js'
import FilterBar from '../components/FilterBar.jsx'
import MatchCard from '../components/MatchCard.jsx'

export default function Matches({ onSelectMatch, onEditPrefs }) {
  const [filters, setFilters] = useState({})
  const dates = useMemo(
    () => [...new Set(MATCHES.map((m) => dateKey(m.datetime)))].sort(),
    [],
  )
  const results = useMemo(() => filterMatches(MATCHES, filters), [filters])

  return (
    <div className="max-w-5xl mx-auto p-6">
      <div className="flex items-center justify-between mb-4">
        <h1 className="text-2xl font-bold">Matches</h1>
        <button onClick={onEditPrefs} className="text-sm text-accent underline">Edit preferences</button>
      </div>
      <FilterBar filters={filters} setFilters={setFilters} dates={dates} />
      <p className="text-sm text-neutral-500 mb-3">{results.length} matches</p>
      <div className="grid gap-3 sm:grid-cols-2">
        {results.map((m) => (
          <MatchCard key={m.id} match={m} onClick={() => onSelectMatch(m)} />
        ))}
      </div>
      {results.length === 0 && (
        <p className="text-center text-neutral-400 py-12">No matches fit these filters.</p>
      )}
    </div>
  )
}
