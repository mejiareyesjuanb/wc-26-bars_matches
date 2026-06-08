import { getTeam } from '../data/teams.js'
import { translate, getCurrentLang, stageLabel } from './i18n/index.js'

const DURATION_MIN = 120 // a match window incl. halftime/stoppage

function stageText(match, lang) {
  const base = stageLabel(match.stage, lang)
  return match.group ? `${base} · ${translate(lang, 'match.group', { g: match.group })}` : base
}

// Build a calendar event from a match. The match `datetime` ISO carries the
// host city's offset, so `new Date(...)` is the correct UTC instant — we never
// re-apply an offset. Strings are localized; `lang` defaults to the active
// language (English for non-React/server callers unless passed explicitly).
export function eventForMatch(match, lang) {
  const L = lang || getCurrentLang()
  const home = getTeam(match.homeTeam).name
  const away = getTeam(match.awayTeam).name
  const start = new Date(match.datetime)
  const end = new Date(start.getTime() + DURATION_MIN * 60 * 1000)
  return {
    title: translate(L, 'calendar.eventTitle', { home, away }),
    start,
    end,
    location: match.venueCity,
    description: translate(L, 'calendar.eventDesc', { stage: stageText(match, L) }),
  }
}

// Compact UTC stamp for calendar APIs: 20260611T190000Z
export function icsStamp(date) {
  return date.toISOString().replace(/[-:]/g, '').replace(/\.\d{3}Z$/, 'Z')
}

export function googleCalendarUrl(match, lang) {
  const e = eventForMatch(match, lang)
  const params = new URLSearchParams({
    action: 'TEMPLATE',
    text: e.title,
    dates: `${icsStamp(e.start)}/${icsStamp(e.end)}`,
    location: e.location,
    details: e.description,
  })
  return `https://calendar.google.com/calendar/render?${params.toString()}`
}

function escapeICS(s) {
  return String(s)
    .replace(/\\/g, '\\\\')
    .replace(/;/g, '\\;')
    .replace(/,/g, '\\,')
    .replace(/\n/g, '\\n')
}

// One VEVENT (with a 1-hour reminder alarm) — shared by single + bulk export.
function veventLines(match, lang) {
  const L = lang || getCurrentLang()
  const e = eventForMatch(match, L)
  return [
    'BEGIN:VEVENT',
    `UID:${match.id}@wc2026-seattle`,
    `DTSTAMP:${icsStamp(e.start)}`,
    `DTSTART:${icsStamp(e.start)}`,
    `DTEND:${icsStamp(e.end)}`,
    `SUMMARY:${escapeICS(e.title)}`,
    `LOCATION:${escapeICS(e.location)}`,
    `DESCRIPTION:${escapeICS(e.description)}`,
    'BEGIN:VALARM',
    'ACTION:DISPLAY',
    `DESCRIPTION:${escapeICS(translate(L, 'calendar.reminder'))}`,
    'TRIGGER:-PT1H',
    'END:VALARM',
    'END:VEVENT',
  ]
}

function wrapCalendar(eventLineGroups) {
  return [
    'BEGIN:VCALENDAR',
    'VERSION:2.0',
    'PRODID:-//WC26 Watch//EN',
    'CALSCALE:GREGORIAN',
    ...eventLineGroups.flat(),
    'END:VCALENDAR',
  ].join('\r\n')
}

// An .ics for a single match (timezone-correct anywhere via UTC stamps).
export function icsForMatch(match, lang) {
  return wrapCalendar([veventLines(match, lang)])
}

// An .ics containing many matches — one VCALENDAR, one VEVENT each.
export function icsForMatches(matches, lang) {
  return wrapCalendar(matches.map((m) => veventLines(m, lang)))
}

export const ICS_FILENAME = (match) => `${match.id}-wc2026.ics`
