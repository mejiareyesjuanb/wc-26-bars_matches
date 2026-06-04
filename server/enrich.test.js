import { describe, it, expect } from 'vitest'
import { __test } from './enrich.js'

const { SCREEN_RE, WORLDCUP_RE, stripHtml } = __test

describe('enrich keyword detection', () => {
  it('detects screen mentions', () => {
    expect(SCREEN_RE.test('We have 12 big screens and projectors')).toBe(true)
    expect(SCREEN_RE.test('Catch every match on our TVs')).toBe(true)
    expect(SCREEN_RE.test('A quiet wine bar with no television')).toBe(true) // "television" matches
  })
  it('detects World Cup / soccer mentions', () => {
    expect(WORLDCUP_RE.test('Join our World Cup 2026 watch party!')).toBe(true)
    expect(WORLDCUP_RE.test('FIFA fixtures shown live')).toBe(true)
    expect(WORLDCUP_RE.test('Live soccer every weekend')).toBe(true)
  })
  it('does not over-match plain text', () => {
    expect(WORLDCUP_RE.test('Farm to table dinner menu')).toBe(false)
  })
})

describe('stripHtml', () => {
  it('removes tags, scripts and styles', () => {
    const html = '<style>.x{}</style><div>Big <b>screens</b></div><script>x()</script>'
    const out = stripHtml(html)
    expect(out).toContain('Big screens')
    expect(out).not.toContain('<')
    expect(out).not.toContain('x()')
  })
})
