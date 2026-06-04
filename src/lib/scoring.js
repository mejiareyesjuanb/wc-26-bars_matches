// Simplified ranking model. Four factors only — World Cup viewing is the
// dominant signal, especially when a venue's own website confirms it.
export const WEIGHTS = {
  worldCup: 40, // showing the World Cup (website-confirmed counts most)
  screens: 25, // has screens / projector
  neighborhood: 20, // in one of the user's preferred neighborhoods
  reviews: 15, // good ratings
}

export const FACTOR_LABELS = {
  worldCup: 'Showing the World Cup',
  screens: 'Screens / projector',
  neighborhood: 'Your neighborhoods',
  reviews: 'Ratings & reviews',
}

const clamp01 = (x) => Math.max(0, Math.min(1, x))

// 1.0 for top-priority neighborhood, decaying with selection order; 0 if none.
function neighborhoodScore(bar, prefs) {
  const list = prefs.neighborhoods || []
  const idx = list.indexOf(bar.neighborhood)
  if (idx === -1) return 0
  return 1 - idx * 0.12 // #1 -> 1.0, #5 -> 0.52
}

// `check` is the optional website confirmation { screens, worldCup } for a venue.
function screensScore(bar, check) {
  let s = 0
  if (bar.confirmedViewing || check?.screens === true) s += 0.4
  if (bar.bigScreenOrProjector) s += 0.3
  s += clamp01((bar.screens || 0) / 10) * 0.3 // saturates at 10 screens
  return clamp01(s)
}

// World Cup viewing — website confirmation is the strongest evidence.
function worldCupScore(bar, check) {
  if (check?.worldCup === true) return 1 // confirmed on their website
  if (bar.confirmedViewing) return 0.6 // known to show matches (curated)
  if (check?.screens === true) return 0.35 // has sports screens (likely)
  return 0.1 // unknown
}

function reviewsScore(bar) {
  const quality = clamp01((bar.rating - 3) / 2) // 3.0 -> 0, 5.0 -> 1
  const confidence = clamp01(bar.reviewCount / 1500) // saturates at 1500 reviews
  return quality * (0.6 + 0.4 * confidence)
}

// Complementary ambiance bonus (max +10), only when the match is actually played
// in Seattle: bars near Lumen Field ride the matchday buzz. Not a primary factor.
export const STADIUM_BONUS_MAX = 10
const STADIUM_PROXIMITY = {
  'Pioneer Square': 1.0,
  Downtown: 0.7,
  Georgetown: 0.5,
  Belltown: 0.45,
  'South Lake Union': 0.3,
  'Capitol Hill': 0.25,
}

function stadiumBonus(bar, match) {
  if (match.venueCity !== 'Seattle') return 0
  return (STADIUM_PROXIMITY[bar.neighborhood] ?? 0) * STADIUM_BONUS_MAX
}

export function scoreBar(bar, match, prefs, check) {
  const parts = {
    worldCup: worldCupScore(bar, check),
    screens: screensScore(bar, check),
    neighborhood: neighborhoodScore(bar, prefs),
    reviews: reviewsScore(bar),
  }
  let total = 0
  for (const k of Object.keys(WEIGHTS)) total += parts[k] * WEIGHTS[k]

  const bonus = stadiumBonus(bar, match)
  const score = Math.round(Math.min(100, total + bonus))

  return {
    score,
    reasons: buildReasons(bar, match, prefs, parts, bonus, check),
    breakdown: buildBreakdown(parts, bonus),
  }
}

function buildReasons(bar, match, prefs, parts, bonus, check) {
  const r = []
  if (check?.worldCup === true) r.push('Confirmed: showing the World Cup')
  else if (bar.confirmedViewing) r.push('Shows matches')
  if (parts.neighborhood > 0) r.push(`In ${bar.neighborhood}`)
  if (bonus > 0) r.push('Near the stadium')
  if (bar.screens >= 6) r.push(`${bar.screens} screens`)
  else if (bar.bigScreenOrProjector || check?.screens === true) r.push('Big screen/projector')
  if (bar.rating >= 4.5) r.push(`${bar.rating.toFixed(1)}★`)
  return r
}

// Per-dimension contribution, for the "how it ranks" modal.
function buildBreakdown(parts, bonus) {
  const rows = Object.keys(WEIGHTS).map((k) => ({
    key: k,
    label: FACTOR_LABELS[k],
    weight: WEIGHTS[k],
    sub: parts[k],
    points: Math.round(parts[k] * WEIGHTS[k]),
  }))
  if (bonus > 0) {
    rows.push({
      key: 'stadium',
      label: 'Near Lumen Field (played in Seattle)',
      weight: STADIUM_BONUS_MAX,
      sub: bonus / STADIUM_BONUS_MAX,
      points: Math.round(bonus),
    })
  }
  return rows
}

export function rankBars(bars, match, prefs, checks = {}) {
  return bars
    .map((bar) => {
      const { score, reasons, breakdown } = scoreBar(bar, match, prefs, checks[bar.id])
      return { ...bar, score, reasons, breakdown }
    })
    .sort((a, b) => {
      if (b.score !== a.score) return b.score - a.score
      if (b.rating !== a.rating) return b.rating - a.rating
      return b.reviewCount - a.reviewCount
    })
    .map((bar, i) => ({ ...bar, rank: i + 1 }))
}
