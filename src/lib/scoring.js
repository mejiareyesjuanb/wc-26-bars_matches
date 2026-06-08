// Ranking model. Eligible = drinking venues likely to show the World Cup;
// restaurants/cafés are excluded unless they confirm WC viewing.
//
//   Confirmed World Cup:            score 60–100  (top group)
//   Sports bar, not confirmed:      score 30–60   (bonus — more screens)
//   Other drinking venue (bar/pub/  score  0–30
//     brewery/bar-and-grill):
//   Anything else (restaurant/…):   excluded (included = false)
// Reviews only break ties within a group.

const clamp01 = (x) => Math.max(0, Math.min(1, x))

// Drinking venues that count even without a WC confirmation (they typically show
// big matches). Excludes restaurants/cafés (those need confirmation).
const DRINKING_TYPES = new Set(['sports bar', 'bar', 'pub', 'brewery', 'bar and grill'])
export function isDrinkingVenue(bar) {
  return DRINKING_TYPES.has(bar.type)
}

// 0..1 from rating (3.0→0, 5.0→1) scaled by review-count confidence.
export function reviewsScore(bar) {
  const quality = clamp01((bar.rating - 3) / 2)
  const confidence = clamp01((bar.reviewCount || 0) / 1500)
  return quality * (0.6 + 0.4 * confidence)
}

// A venue counts as a sports bar if Google returns it for a "sports bars in
// {neighborhood}" search (googleSportsBar), if its primaryType is sports_bar
// (bar.type), or if its name says so — covering sports bars that Google types
// as a generic bar/pub/grill (Old County Bar, Bad Albert's, 4Bs Tavern, …).
export function isSportsBar(bar) {
  return bar.googleSportsBar === true || bar.type === 'sports bar' || /sports\s*bar/i.test(bar.name || '')
}

export function isConfirmedWorldCup(bar, check) {
  return check?.worldCup === true || bar.confirmedViewing === true
}

// A venue is shown if it confirms WC viewing, is a sports bar, or is a drinking
// venue (bar/pub/brewery/bar-and-grill).
export function isRanked(bar, check) {
  return isConfirmedWorldCup(bar, check) || isSportsBar(bar) || isDrinkingVenue(bar)
}

export function scoreBar(bar, check) {
  const confirmed = isConfirmedWorldCup(bar, check)
  const sports = isSportsBar(bar)
  const drinking = isDrinkingVenue(bar)
  const included = confirmed || sports || drinking
  const r = reviewsScore(bar)
  let score
  if (confirmed) score = 60 + r * 40 // 60–100 (top)
  else if (sports) score = 30 + r * 30 // 30–60 (sports-bar bonus)
  else if (drinking) score = r * 30 // 0–30
  else score = 0 // excluded
  return {
    score: Math.round(score),
    included,
    confirmed,
    sports,
    reasons: buildReasons(bar, check, confirmed, sports),
    breakdown: buildBreakdown(bar, check, confirmed, sports, included),
  }
}

// Reasons are emitted as i18n codes (translated at render) so the bar UI is
// language-agnostic. `rating` carries the formatted value as a var.
function buildReasons(bar, check, confirmed, sports) {
  const r = []
  if (sports) r.push({ code: 'sportsBar' })
  if (bar.confirmedViewing && check?.worldCup !== true) r.push({ code: 'showsMatches' })
  if (bar.rating >= 4.5) r.push({ code: 'rating', vars: { r: bar.rating.toFixed(1) } })
  return r
}

function buildBreakdown(bar, check, confirmed, sports, included) {
  // A confirmed · B sports bar · C other drinking venue (bar/pub/brewery).
  const tier = confirmed ? 'A' : sports ? 'B' : 'C'
  return {
    tier,
    tierKey: confirmed ? 'tierA' : sports ? 'tierB' : 'tierC',
    included,
    criteria: [
      { key: 'critConfirms', met: confirmed },
      { key: 'critSportsBar', met: sports, vars: { type: bar.type || 'unknown' } },
    ],
    rating: bar.rating,
    reviewCount: bar.reviewCount,
  }
}

// Scores and ranks every venue (tagging `included`); callers filter to included
// for display. Excluded venues sink to the bottom (score 0).
export function rankBars(bars, checks = {}) {
  return bars
    .map((bar) => ({ ...bar, ...scoreBar(bar, checks[bar.id]) }))
    .sort((a, b) => {
      if (b.score !== a.score) return b.score - a.score
      if (b.rating !== a.rating) return b.rating - a.rating
      return (b.reviewCount || 0) - (a.reviewCount || 0)
    })
    .map((bar, i) => ({ ...bar, rank: i + 1 }))
}
