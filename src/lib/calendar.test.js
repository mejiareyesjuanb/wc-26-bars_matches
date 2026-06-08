import { describe, it, expect } from 'vitest'
import { eventForMatch, icsStamp, googleCalendarUrl, icsForMatch, icsForMatches } from './calendar.js'

// Mexico vs South Africa — 2026-06-11 12:00 PM PT (PDT, UTC-7) => 19:00 UTC.
const groupMatch = {
  id: 'M001', stage: 'Group', group: 'A',
  datetime: '2026-06-11T12:00:00-07:00', venueCity: 'Mexico City',
  homeTeam: 'MEX', awayTeam: 'RSA',
}
// Knockout with placeholder slot teams (no flags / names are the slot labels).
const koMatch = {
  id: 'M104', stage: 'Final', group: null,
  datetime: '2026-07-19T12:00:00-07:00', venueCity: 'New York/NJ',
  homeTeam: 'Winner M101', awayTeam: 'Winner M102',
}

describe('eventForMatch', () => {
  it('converts the Pacific datetime to the correct UTC instant', () => {
    const e = eventForMatch(groupMatch)
    expect(e.start.toISOString()).toBe('2026-06-11T19:00:00.000Z')
    expect(e.end.toISOString()).toBe('2026-06-11T21:00:00.000Z') // +2h
  })
  it('builds a readable title and uses the host city as location', () => {
    expect(eventForMatch(groupMatch).title).toBe('Mexico vs South Africa — World Cup 2026')
    expect(eventForMatch(groupMatch).location).toBe('Mexico City')
  })
  it('flows knockout slot labels through the title', () => {
    expect(eventForMatch(koMatch).title).toBe('Winner M101 vs Winner M102 — World Cup 2026')
  })
})

describe('icsStamp', () => {
  it('formats a compact UTC stamp', () => {
    expect(icsStamp(new Date('2026-06-11T19:00:00.000Z'))).toBe('20260611T190000Z')
  })
})

describe('googleCalendarUrl', () => {
  it('includes the UTC dates range and encoded title/location', () => {
    const url = googleCalendarUrl(groupMatch)
    expect(url).toContain('https://calendar.google.com/calendar/render?')
    expect(url).toContain('dates=20260611T190000Z%2F20260611T210000Z')
    expect(url).toContain('text=Mexico+vs+South+Africa')
    expect(url).toContain('location=Mexico+City')
  })
})

describe('icsForMatch', () => {
  it('has UTC DTSTART/DTEND, a UID, and a 1-hour VALARM', () => {
    const ics = icsForMatch(groupMatch)
    expect(ics).toContain('BEGIN:VCALENDAR')
    expect(ics).toContain('DTSTART:20260611T190000Z')
    expect(ics).toContain('DTEND:20260611T210000Z')
    expect(ics).toContain('UID:M001@wc2026-seattle')
    expect(ics).toContain('SUMMARY:Mexico vs South Africa — World Cup 2026')
    expect(ics).toContain('BEGIN:VALARM')
    expect(ics).toContain('TRIGGER:-PT1H')
  })
})

describe('icsForMatches (bulk)', () => {
  const many = [groupMatch, koMatch]
  it('wraps N matches in a single VCALENDAR with one VEVENT each', () => {
    const ics = icsForMatches(many)
    expect((ics.match(/BEGIN:VCALENDAR/g) || []).length).toBe(1)
    expect((ics.match(/END:VCALENDAR/g) || []).length).toBe(1)
    expect((ics.match(/BEGIN:VEVENT/g) || []).length).toBe(2)
    expect((ics.match(/BEGIN:VALARM/g) || []).length).toBe(2) // one reminder each
  })
  it('includes each match: UTC times + both titles', () => {
    const ics = icsForMatches(many)
    expect(ics).toContain('DTSTART:20260611T190000Z') // group match
    expect(ics).toContain('DTSTART:20260719T190000Z') // final, 12pm PT -> 19:00Z
    expect(ics).toContain('SUMMARY:Mexico vs South Africa — World Cup 2026')
    expect(ics).toContain('SUMMARY:Winner M101 vs Winner M102 — World Cup 2026')
  })
})
