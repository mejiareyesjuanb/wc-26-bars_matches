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

// Values a match contributes to each filter field.
const FIELD = {
  team: (m) => [m.homeTeam, m.awayTeam],
  date: (m) => [dateKey(m.datetime)],
  group: (m) => (m.group ? [m.group] : []),
  stage: (m) => [m.stage],
  city: (m) => [m.venueCity],
  timeOfDay: (m) => [timeOfDay(m.datetime)],
}

// Dependent (faceted) filters: the allowed values for one field, given the OTHER
// active filters (the field's own filter is excluded). This keeps the current
// selection switchable and means no offered value can produce a 0-result combo.
export function facetValues(matches, filters, key) {
  const others = { ...filters }
  delete others[key]
  const set = new Set()
  for (const m of filterMatches(matches, others)) {
    for (const v of FIELD[key](m)) set.add(v)
  }
  return set
}
