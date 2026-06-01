import { TEAMS } from '../data/teams.js'
import { STAGE_ORDER } from '../data/matches.js'

const TIMES = ['morning', 'afternoon', 'evening']

export default function FilterBar({ filters, setFilters, dates }) {
  const update = (patch) => setFilters({ ...filters, ...patch })
  const teamCodes = Object.keys(TEAMS)
  const hasFilters = Object.values(filters).some(Boolean)
  return (
    <div className="mb-6">
      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        <select
          className="border border-neutral-300 rounded-lg px-3 py-2 bg-white"
          value={filters.team || ''}
          onChange={(e) => update({ team: e.target.value || undefined })}
        >
          <option value="">All teams</option>
          {teamCodes.map((c) => (
            <option key={c} value={c}>{TEAMS[c].name}</option>
          ))}
        </select>

        <select
          className="border border-neutral-300 rounded-lg px-3 py-2 bg-white"
          value={filters.stage || ''}
          onChange={(e) => update({ stage: e.target.value || undefined })}
        >
          <option value="">All stages</option>
          {STAGE_ORDER.map((s) => <option key={s} value={s}>{s}</option>)}
        </select>

        <select
          className="border border-neutral-300 rounded-lg px-3 py-2 bg-white"
          value={filters.date || ''}
          onChange={(e) => update({ date: e.target.value || undefined })}
        >
          <option value="">All dates</option>
          {dates.map((d) => <option key={d} value={d}>{d}</option>)}
        </select>

        <select
          className="border border-neutral-300 rounded-lg px-3 py-2 bg-white capitalize"
          value={filters.timeOfDay || ''}
          onChange={(e) => update({ timeOfDay: e.target.value || undefined })}
        >
          <option value="">Any time</option>
          {TIMES.map((t) => <option key={t} value={t} className="capitalize">{t}</option>)}
        </select>
      </div>
      {hasFilters && (
        <button
          onClick={() => setFilters({})}
          className="mt-2 text-sm text-neutral-500 hover:text-accent underline"
        >
          Clear filters
        </button>
      )}
    </div>
  )
}
