import { REGION } from './region.js'
import { getCurrentLang } from './i18n/index.js'

// Hour as written in the ISO string (the local kickoff hour for the host city).
function localHour(iso) {
  const m = iso.match(/T(\d{2}):/)
  return m ? Number(m[1]) : 0
}

export function timeOfDay(iso) {
  const h = localHour(iso)
  if (h < 12) return 'morning'
  if (h < 17) return 'afternoon'
  return 'evening'
}

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

function parts(iso) {
  const [datePart, timePart] = iso.split('T')
  const [y, mo, d] = datePart.split('-').map(Number)
  const hh = Number(timePart.slice(0, 2))
  const mm = timePart.slice(3, 5)
  const h12 = hh % 12 === 0 ? 12 : hh % 12
  return { y, mo, d, hh, mm, h12 }
}

// "Jun 15, 3:00 PM PT" (en) / "15 jun, 3:00 p. m. PT" (es). The timezone label
// comes from REGION (Pacific today; per-city in P2).
export function formatKickoff(iso, lang) {
  const L = lang || getCurrentLang()
  const { mo, d, hh, mm, h12 } = parts(iso)
  const mon = months(L)[mo - 1]
  const date = L === 'es' ? `${d} ${mon}` : `${mon} ${d}`
  return `${date}, ${h12}:${mm} ${ampm(hh, L)} ${REGION.tzShort}`
}

export function dateKey(iso) {
  return iso.split('T')[0]
}

// "Mon Jun 15" (en) / "lun 15 jun" (es) — short date for the list view.
export function formatDay(iso, lang) {
  const L = lang || getCurrentLang()
  const { y, mo, d } = parts(iso)
  const wd = new Date(Date.UTC(y, mo - 1, d)).getUTCDay()
  const mon = months(L)[mo - 1]
  return L === 'es'
    ? `${weekdays(L)[wd]} ${d} ${mon}`
    : `${weekdays(L)[wd]} ${mon} ${d}`
}

// "3:00 PM" (en) / "3:00 p. m." (es) — clock time only.
export function formatClock(iso, lang) {
  const L = lang || getCurrentLang()
  const { hh, mm, h12 } = parts(iso)
  return `${h12}:${mm} ${ampm(hh, L)}`
}
