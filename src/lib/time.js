// Hour as written in the ISO string (the local Pacific kickoff hour).
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

const MONTHS = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec']

export function formatKickoff(iso) {
  const [datePart, timePart] = iso.split('T')
  const [, mo, d] = datePart.split('-').map(Number)
  const hh = Number(timePart.slice(0, 2))
  const mm = timePart.slice(3, 5)
  const ampm = hh >= 12 ? 'PM' : 'AM'
  const h12 = hh % 12 === 0 ? 12 : hh % 12
  return `${MONTHS[mo - 1]} ${d}, ${h12}:${mm} ${ampm} PT`
}

export function dateKey(iso) {
  return iso.split('T')[0]
}
