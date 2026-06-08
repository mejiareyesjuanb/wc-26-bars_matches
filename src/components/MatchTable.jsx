import { getTeam } from '../data/teams.js'
import { formatDay, formatClock, dateKey } from '../lib/time.js'
import { getActiveCity } from '../lib/city.js'
import { useI18n } from '../lib/i18n/react.jsx'

function teamLabel(code) {
  const t = getTeam(code)
  return t.flag ? `${t.flag} ${t.name}` : t.name
}

// Compact, spreadsheet-style list of matches — quick to scan by date.
// The date is shown only when it changes from the row above (merged-cell feel).
export default function MatchTable({ matches, onSelect }) {
  const { t, lang, stage } = useI18n()
  let lastDate = null
  return (
    <div className="overflow-x-auto rounded-xl border border-neutral-200 bg-white">
      <table className="w-full text-sm">
        <thead>
          <tr className="text-left text-neutral-500 border-b border-neutral-200">
            <th className="font-medium px-2 sm:px-3 py-2 sm:whitespace-nowrap">{t('table.date')}</th>
            <th className="font-medium px-2 sm:px-3 py-2 whitespace-nowrap">{t('table.time', { tz: getActiveCity().tzShort })}</th>
            <th className="font-medium px-2 sm:px-3 py-2 sm:whitespace-nowrap">{t('table.stage')}</th>
            <th className="font-medium px-2 sm:px-3 py-2">{t('table.match')}</th>
            <th className="font-medium px-2 sm:px-3 py-2 whitespace-nowrap hidden sm:table-cell">{t('table.city')}</th>
          </tr>
        </thead>
        <tbody>
          {matches.map((m) => {
            const dk = dateKey(m.datetime)
            const newDay = dk !== lastDate
            lastDate = dk
            return (
              <tr
                key={m.id}
                onClick={() => onSelect?.(m)}
                className={`cursor-pointer hover:bg-neutral-50 ${newDay ? 'border-t border-neutral-200' : ''}`}
              >
                <td className="px-2 sm:px-3 py-2 sm:whitespace-nowrap font-medium text-neutral-700">
                  {newDay ? formatDay(m.datetime, lang) : ''}
                </td>
                <td className="px-2 sm:px-3 py-2 whitespace-nowrap text-neutral-600">{formatClock(m.datetime, lang)}</td>
                <td className="px-2 sm:px-3 py-2 sm:whitespace-nowrap text-accent text-xs">
                  {stage(m.stage)}{m.group ? ` ${m.group}` : ''}
                </td>
                <td className="px-2 sm:px-3 py-2">
                  {teamLabel(m.homeTeam)} <span className="text-neutral-400">v</span> {teamLabel(m.awayTeam)}
                </td>
                <td className="px-2 sm:px-3 py-2 whitespace-nowrap text-neutral-500 hidden sm:table-cell">{m.venueCity}</td>
              </tr>
            )
          })}
        </tbody>
      </table>
    </div>
  )
}
