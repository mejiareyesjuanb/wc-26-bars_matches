import { TEAMS } from '../data/teams.js'
import { STAGE_ORDER } from '../data/matches.js'
import { useI18n } from '../lib/i18n/react.jsx'

const GROUP_STAGE = STAGE_ORDER[0] // 'Group' — groups apply only here

// Option lists (teams/dates/groups/stages/cities/times) are dependent/faceted —
// computed in Matches from the other active filters and passed in here.
export default function FilterBar({ filters, setFilters, teams = [], dates = [], groups = [], stages = [], cities = [], times = [] }) {
  const { t, stage } = useI18n()
  const update = (patch) => setFilters({ ...filters, ...patch })
  const hasFilters = Object.values(filters).some(Boolean)
  // Groups exist only in the group stage — disable the picker for knockout stages.
  const knockout = !!filters.stage && filters.stage !== GROUP_STAGE
  const cls = 'border border-neutral-300 rounded-lg px-3 py-2.5 bg-white'
  return (
    <div className="mb-6">
      {/* Order: teams · dates · groups · stages · cities · time. Two per line on
          mobile (grid-cols-2), one row of six on desktop (lg:grid-cols-6). */}
      <div className="grid grid-cols-2 gap-3 lg:grid-cols-6">
        <select
          className={cls}
          value={filters.team || ''}
          onChange={(e) => update({ team: e.target.value || undefined })}
        >
          <option value="">{t('filters.allTeams')}</option>
          {teams.map((c) => (
            <option key={c} value={c}>{TEAMS[c].name}</option>
          ))}
        </select>

        <select
          className={cls}
          value={filters.date || ''}
          onChange={(e) => update({ date: e.target.value || undefined })}
        >
          <option value="">{t('filters.allDates')}</option>
          {dates.map((d) => <option key={d} value={d}>{d}</option>)}
        </select>

        <select
          className={`${cls} disabled:bg-neutral-100 disabled:text-neutral-400`}
          value={knockout ? '' : (filters.group || '')}
          disabled={knockout}
          onChange={(e) => update({ group: e.target.value || undefined })}
        >
          <option value="">{t('filters.allGroups')}</option>
          {groups.map((g) => <option key={g} value={g}>{t('match.group', { g })}</option>)}
        </select>

        <select
          className={cls}
          value={filters.stage || ''}
          onChange={(e) => {
            const v = e.target.value || undefined
            // Switching to a knockout stage clears any group selection.
            update({ stage: v, group: v && v !== GROUP_STAGE ? undefined : filters.group })
          }}
        >
          <option value="">{t('filters.allStages')}</option>
          {stages.map((s) => <option key={s} value={s}>{stage(s)}</option>)}
        </select>

        <select
          className={cls}
          value={filters.city || ''}
          onChange={(e) => update({ city: e.target.value || undefined })}
        >
          <option value="">{t('filters.allCities')}</option>
          {cities.map((c) => <option key={c} value={c}>{c}</option>)}
        </select>

        <select
          className={`${cls} capitalize`}
          value={filters.timeOfDay || ''}
          onChange={(e) => update({ timeOfDay: e.target.value || undefined })}
        >
          <option value="">{t('filters.anyTime')}</option>
          {times.map((to) => <option key={to} value={to} className="capitalize">{t(`filters.${to}`)}</option>)}
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
