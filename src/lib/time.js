import { getActiveCity } from './city.js'
import { getCurrentLang } from './i18n/index.js'

// Match `datetime` strings carry a fixed offset but represent the correct
// absolute instant. We convert that instant to the active city's IANA timezone
// for display + filtering, so a viewer in New York sees ET, Seattle sees PT, etc.
// Seattle (America/Los_Angeles) on the stored -07:00 instants yields the same
// wall clock as before → no change for Seattle.

const MONTHS = {
  en: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'],
  es: ['ene', 'feb', 'mar', 'abr', 'may', 'jun', 'jul', 'ago', 'sep', 'oct', 'nov', 'dic'],
}
const WEEKDAYS = {
  en: ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'],
  es: ['dom', 'lun', 'mar', 'mié', 'jue', 'vie', 'sáb'],
}
const months = (lang) => MONTHS[lang] || MONTHS.en
const weekdays = (lang) => WEEKDAYS[lang] || WEEKDAYS.en
const ampm = (hh, lang) => (hh >= 12 ? (lang === 'es' ? 'p. m.' : 'PM') : lang === 'es' ? 'a. m.' : 'AM')
const pad = (n) => String(n).padStart(2, '0')

// Cache one Intl formatter per timezone (formatToParts is the hot path).
const formatters = new Map()
function formatter(tz) {
  let f = formatters.get(tz)
  if (!f) {
    f = new Intl.DateTimeFormat('en-US', {
      timeZone: tz,
      year: 'numeric', month: '2-digit', day: '2-digit',
      hour: '2-digit', minute: '2-digit', hour12: false,
    })
    formatters.set(tz, f)
  }
  return f
}

// Wall-clock parts of the instant in the given timezone.
function partsInTz(iso, tz) {
  const map = {}
  for (const p of formatter(tz).formatToParts(new Date(iso))) {
    if (p.type !== 'literal') map[p.type] = p.value
  }
  let hh = Number(map.hour)
  if (hh === 24) hh = 0 // some engines emit 24 for midnight
  const y = Number(map.year)
  const mo = Number(map.month)
  const d = Number(map.day)
  const mm = map.minute
  const h12 = hh % 12 === 0 ? 12 : hh % 12
  return { y, mo, d, hh, mm, h12 }
}

const tzOf = () => getActiveCity().tz

export function timeOfDay(iso) {
  const { hh } = partsInTz(iso, tzOf())
  if (hh < 12) return 'morning'
  if (hh < 17) return 'afternoon'
  return 'evening'
}

export function dateKey(iso) {
  const { y, mo, d } = partsInTz(iso, tzOf())
  return `${y}-${pad(mo)}-${pad(d)}`
}

// "Mon Jun 15, 3:00 PM PT" (en) / "lun 15 jun, 3:00 p. m. PT" (es). Weekday +
// timezone label + the conversion all come from the active city (weekday matches
// the list view's `formatDay`).
export function formatKickoff(iso, lang) {
  const L = lang || getCurrentLang()
  const city = getActiveCity()
  const { y, mo, d, hh, mm, h12 } = partsInTz(iso, city.tz)
  const wd = new Date(Date.UTC(y, mo - 1, d)).getUTCDay()
  const dow = weekdays(L)[wd]
  const mon = months(L)[mo - 1]
  const date = L === 'es' ? `${dow} ${d} ${mon}` : `${dow} ${mon} ${d}`
  return `${date}, ${h12}:${mm} ${ampm(hh, L)} ${city.tzShort}`
}

// "Mon Jun 15" (en) / "lun 15 jun" (es) — short date for the list view.
export function formatDay(iso, lang) {
  const L = lang || getCurrentLang()
  const { y, mo, d } = partsInTz(iso, tzOf())
  const wd = new Date(Date.UTC(y, mo - 1, d)).getUTCDay()
  const mon = months(L)[mo - 1]
  return L === 'es'
    ? `${weekdays(L)[wd]} ${d} ${mon}`
    : `${weekdays(L)[wd]} ${mon} ${d}`
}

// "3:00 PM" (en) / "3:00 p. m." (es) — clock time only.
export function formatClock(iso, lang) {
  const L = lang || getCurrentLang()
  const { hh, mm, h12 } = partsInTz(iso, tzOf())
  return `${h12}:${mm} ${ampm(hh, L)}`
}
