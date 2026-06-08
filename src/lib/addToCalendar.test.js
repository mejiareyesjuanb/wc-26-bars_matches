import { describe, it, expect } from 'vitest'
import { calendarApiUrl } from './addToCalendar.js'

describe('calendarApiUrl', () => {
  it('uses set=all for the full schedule', () => {
    expect(calendarApiUrl({ all: true })).toBe('/api/calendar.ics?set=all')
  })
  it('lists ids for a filtered subset', () => {
    expect(calendarApiUrl({ all: false, ids: ['M001', 'M104'] })).toBe(
      '/api/calendar.ics?ids=M001,M104',
    )
  })
})
