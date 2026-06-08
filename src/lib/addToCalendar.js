import { icsForMatches } from './calendar.js'
import { isIOS } from './platform.js'

// Server route that returns a text/calendar response. On iOS we navigate to it
// as a normal link so Safari hands the file straight to Apple Calendar's
// "Add All Events" sheet (a forced Blob+download tends to detour through Files).
export function calendarApiUrl({ all, ids }) {
  if (all) return '/api/calendar.ics?set=all'
  return `/api/calendar.ics?ids=${ids.join(',')}`
}

function blobDownload(matches, filename) {
  const blob = new Blob([icsForMatches(matches)], { type: 'text/calendar;charset=utf-8' })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = filename
  document.body.appendChild(a)
  a.click()
  a.remove()
  URL.revokeObjectURL(url)
}

// Add a set of matches to the user's calendar. iOS → open the served .ics as a
// link (one tap into Apple Calendar); everywhere else → in-browser .ics download
// (Apple/Outlook open it; Android imports into Google Calendar; desktop Google
// uses the import shortcut in CalendarHelp).
export function addMatchesToCalendar(matches, { filename, all = false } = {}) {
  if (isIOS()) {
    window.location.href = calendarApiUrl({ all, ids: matches.map((m) => m.id) })
    return
  }
  blobDownload(matches, filename || 'wc2026-matches.ics')
}
