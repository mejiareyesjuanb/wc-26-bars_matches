import { timeOfDay, dateKey } from './time.js'

export function filterMatches(matches, filters = {}) {
  return matches.filter((m) => {
    if (filters.team && m.homeTeam !== filters.team && m.awayTeam !== filters.team) return false
    if (filters.city && m.venueCity !== filters.city) return false
    if (filters.group && m.group !== filters.group) return false
    if (filters.stage && m.stage !== filters.stage) return false
    if (filters.date && dateKey(m.datetime) !== filters.date) return false
    if (filters.timeOfDay && timeOfDay(m.datetime) !== filters.timeOfDay) return false
    return true
  })
}
