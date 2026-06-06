import { getTeam } from '../data/teams.js'

const DURATION_MIN = 120 // a match window incl. halftime/stoppage

// Build a calendar event from a match. The match `datetime` ISO carries the
// Pacific offset (-07:00), so `new Date(...)` is the correct UTC instant — we
// never re-apply an offset. KO slot labels flow through via getTeam().name.
export function eventForMatch(match) {
  const home = getTeam(match.homeTeam).name
  const away = getTeam(match.awayTeam).name
  const start = new Date(match.datetime)
  const end = new Date(start.getTime() + DURATION_MIN * 60 * 1000)
  return {
    title: `${home} vs ${away} — World Cup 2026`,
    start,
    end,
    location: match.venueCity,
    description:
      `${match.stage}${match.group ? ` · Group ${match.group}` : ''} — 2026 FIFA World Cup. Kickoff shown in Pacific Time.`,
  }
}

// Compact UTC stamp for calendar APIs: 20260611T190000Z
export function icsStamp(date) {
  return date.toISOString().replace(/[-:]/g, '').replace(/\.\d{3}Z$/, 'Z')
}

export function googleCalendarUrl(match) {
  const e = eventForMatch(match)
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

// An .ics with a 1-hour-before reminder alarm (this IS the "remind me").
export function icsForMatch(match) {
  const e = eventForMatch(match)
  return [
    'BEGIN:VCALENDAR',
    'VERSION:2.0',
    'PRODID:-//Seattle and Eastside WC 26//EN',
    'CALSCALE:GREGORIAN',
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
    'DESCRIPTION:Match starts in 1 hour',
    'TRIGGER:-PT1H',
    'END:VALARM',
    'END:VEVENT',
    'END:VCALENDAR',
  ].join('\r\n')
}

export const ICS_FILENAME = (match) => `${match.id}-wc2026.ics`
