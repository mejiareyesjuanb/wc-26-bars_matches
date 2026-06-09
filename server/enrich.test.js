import { describe, it, expect } from 'vitest'
import { __test } from './enrich.js'

const { SCREEN_RE, WORLDCUP_RE, stripHtml } = __test

describe('enrich keyword detection', () => {
  it('detects screen mentions', () => {
    expect(SCREEN_RE.test('We have 12 big screens and projectors')).toBe(true)
    expect(SCREEN_RE.test('Catch every match on our TVs')).toBe(true)
    expect(SCREEN_RE.test('A quiet wine bar with no television')).toBe(true) // "television" matches
  })
  it('detects Spanish screen/viewing mentions', () => {
    expect(SCREEN_RE.test('Contamos con pantallas gigantes para todos los partidos')).toBe(true)
    expect(SCREEN_RE.test('Televisores en cada rincón del bar')).toBe(true)
    expect(SCREEN_RE.test('Transmisión de todos los partidos')).toBe(true)
    expect(SCREEN_RE.test('Ven a ver el partido con nosotros')).toBe(true)
    expect(SCREEN_RE.test('Fútbol en vivo todos los fines de semana')).toBe(true)
    expect(SCREEN_RE.test('El mejor bar deportivo de la ciudad')).toBe(true)
  })
  it('does not over-match generic Spanish venue copy', () => {
    expect(SCREEN_RE.test('Música en vivo todos los jueves')).toBe(false)
    expect(SCREEN_RE.test('Cocina de autor y coctelería artesanal')).toBe(false)
  })
  it('detects strict World Cup terms', () => {
    expect(WORLDCUP_RE.test('Join our World Cup 2026 watch party!')).toBe(true)
    expect(WORLDCUP_RE.test('FIFA fixtures shown live')).toBe(true)
    expect(WORLDCUP_RE.test('Ven por la Copa Mundial')).toBe(true)
  })
  it('does NOT confirm on bare soccer / watch-party mentions (avoids false positives)', () => {
    expect(WORLDCUP_RE.test('Live soccer every weekend')).toBe(false)
    expect(WORLDCUP_RE.test('Summer of Soccer — the screens are up!')).toBe(false)
    expect(WORLDCUP_RE.test('Trivia night watch party')).toBe(false)
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
