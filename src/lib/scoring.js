export const WEIGHTS = {
  neighborhood: 25,
  viewing: 20,
  reviews: 15,
  fanAffinity: 15,
  venueType: 10,
  size: 7,
  reservations: 4,
  atmosphere: 4,
}

const clamp01 = (x) => Math.max(0, Math.min(1, x))

// 1.0 for top-priority neighborhood, decaying with selection order; 0 if none.
function neighborhoodScore(bar, prefs) {
  const list = prefs.neighborhoods || []
  const idx = list.indexOf(bar.neighborhood)
  if (idx === -1) return 0
  return 1 - idx * 0.12 // #1 -> 1.0, #5 -> 0.52
}

function viewingScore(bar) {
  let s = 0
  if (bar.confirmedViewing) s += 0.45
  if (bar.bigScreenOrProjector) s += 0.2
  if (bar.soundOnForMatches) s += 0.15
  s += clamp01(bar.screens / 12) * 0.2 // screens contribution, saturating at 12
  return clamp01(s)
}

function reviewsScore(bar) {
  const quality = clamp01((bar.rating - 3) / 2) // 3.0 -> 0, 5.0 -> 1
  const confidence = clamp01(bar.reviewCount / 1500) // saturates at 1500 reviews
  return quality * (0.6 + 0.4 * confidence)
}

function fanAffinityScore(bar, match) {
  const aff = bar.fanAffinity || []
  const hitHome = aff.includes(match.homeTeam)
  const hitAway = aff.includes(match.awayTeam)
  if (hitHome && hitAway) return 1
  if (hitHome || hitAway) return 0.75
  return 0
}

function venueTypeScore(bar, prefs) {
  const types = prefs.venueTypes || []
  if (types.length === 0) return 0.5 // neutral when user has no preference
  return types.includes(bar.type) ? 1 : 0
}

const SIZE_RANK = { small: 0.34, medium: 0.67, large: 1 }
const MARQUEE = new Set(['R16', 'QF', 'SF', 'Third Place', 'Final'])

function sizeScore(bar, match) {
  const size = SIZE_RANK[bar.capacity] ?? 0.5
  // Marquee matches favor bigger venues; group matches are size-neutral-ish.
  return MARQUEE.has(match.stage) ? size : 0.4 + 0.6 * size
}

function reservationsScore(bar, prefs) {
  if (!prefs.wantsReservations) return 0.5 // neutral when not requested
  return bar.takesReservations ? 1 : 0
}

function atmosphereScore(bar, prefs) {
  if (!prefs.atmosphere) return 0.5
  const tags = bar.atmosphereTags || []
  return tags.includes(prefs.atmosphere) ? 1 : 0.2
}

export function scoreBar(bar, match, prefs) {
  const parts = {
    neighborhood: neighborhoodScore(bar, prefs),
    viewing: viewingScore(bar),
    reviews: reviewsScore(bar),
    fanAffinity: fanAffinityScore(bar, match),
    venueType: venueTypeScore(bar, prefs),
    size: sizeScore(bar, match),
    reservations: reservationsScore(bar, prefs),
    atmosphere: atmosphereScore(bar, prefs),
  }
  let total = 0
  for (const k of Object.keys(WEIGHTS)) total += parts[k] * WEIGHTS[k]
  const score = Math.round(total)

  const reasons = buildReasons(bar, match, prefs, parts)
  return { score, reasons }
}

function buildReasons(bar, match, prefs, parts) {
  const r = []
  if (parts.neighborhood > 0) r.push(`In ${bar.neighborhood}`)
  const aff = bar.fanAffinity || []
  if (aff.includes(match.homeTeam) || aff.includes(match.awayTeam)) {
    const team = aff.includes(match.homeTeam) ? match.homeTeam : match.awayTeam
    r.push(`Draws ${team} fans`)
  }
  if (bar.confirmedViewing) r.push('Confirmed viewing')
  if (bar.screens >= 6) r.push(`${bar.screens} screens`)
  else if (bar.bigScreenOrProjector) r.push('Big screen/projector')
  if (bar.rating >= 4.5) r.push(`${bar.rating.toFixed(1)}★`)
  if (prefs.wantsReservations && bar.takesReservations) r.push('Takes reservations')
  if (prefs.venueTypes?.includes(bar.type)) r.push(bar.type)
  return r
}

export function rankBars(bars, match, prefs) {
  return bars
    .map((bar) => {
      const { score, reasons } = scoreBar(bar, match, prefs)
      return { ...bar, score, reasons }
    })
    .sort((a, b) => {
      if (b.score !== a.score) return b.score - a.score
      if (b.rating !== a.rating) return b.rating - a.rating
      return b.reviewCount - a.reviewCount
    })
    .map((bar, i) => ({ ...bar, rank: i + 1 }))
}
