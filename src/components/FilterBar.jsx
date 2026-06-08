import { TEAMS } from '../data/teams.js'
import { STAGE_ORDER } from '../data/matches.js'
import { useI18n } from '../lib/i18n/react.jsx'

const TIMES = ['morning', 'afternoon', 'evening']

export default function FilterBar({ filters, setFilters, dates, cities = [] }) {
  const { t, stage } = useI18n()
  const update = (patch) => setFilters({ ...filters, ...patch })
  const teamCodes = Object.keys(TEAMS).sort((a, b) =>
    TEAMS[a].name.localeCompare(TEAMS[b].name),
  )
  const hasFilters = Object.values(filters).some(Boolean)
  return (
    <div className="mb-6">
      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-5">
        <select
          className="border border-neutral-300 rounded-lg px-3 py-2 bg-white"
          value={filters.team || ''}
          onChange={(e) => update({ team: e.target.value || undefined })}
        >
          <option value="">{t('filters.allTeams')}</option>
          {teamCodes.map((c) => (
            <option key={c} value={c}>{TEAMS[c].name}</option>
          ))}
        </select>

        <select
          className="border border-neutral-300 rounded-lg px-3 py-2 bg-white"
          value={filters.city || ''}
          onChange={(e) => update({ city: e.target.value || undefined })}
        >
          <option value="">{t('filters.allCities')}</option>
          {cities.map((c) => <option key={c} value={c}>{c}</option>)}
        </select>

        <select
          className="border border-neutral-300 rounded-lg px-3 py-2 bg-white"
          value={filters.stage || ''}
          onChange={(e) => update({ stage: e.target.value || undefined })}
        >
          <option value="">{t('filters.allStages')}</option>
          {STAGE_ORDER.map((s) => <option key={s} value={s}>{stage(s)}</option>)}
        </select>

        <select
          className="border border-neutral-300 rounded-lg px-3 py-2 bg-white"
          value={filters.date || ''}
          onChange={(e) => update({ date: e.target.value || undefined })}
        >
          <option value="">{t('filters.allDates')}</option>
          {dates.map((d) => <option key={d} value={d}>{d}</option>)}
        </select>

        <select
          className="border border-neutral-300 rounded-lg px-3 py-2 bg-white capitalize"
          value={filters.timeOfDay || ''}
          onChange={(e) => update({ timeOfDay: e.target.value || undefined })}
        >
          <option value="">{t('filters.anyTime')}</option>
          {TIMES.map((to) => <option key={to} value={to} className="capitalize">{t(`filters.${to}`)}</option>)}
        </select>
      </div>
      {hasFilters && (
        <button
          onClick={() => setFilters({})}
          className="mt-2 text-sm text-neutral-500 hover:text-accent underline"
        >
          {t('filters.clear')}
        </button>
      )}
    </div>
  )
}
