// Ranking model — category-primary. A venue's fit-class (from Google's category)
// sets a non-overlapping score band; WC-confirmation, screens, and reviews only
// ORDER venues WITHIN their band (category always dominates).
//
//   Sports bar       80–93   (top)
//   Pub              64–77
//   Bar & grill      48–61
//   Brewery          32–45   (middle — play matches but few screens)
//   Generic bar      16–29   (only if it has a screens/WC signal)
//   Restaurants/etc. excluded (unless a real watch signal)
//
// Within a band: confirmed (+7) > screens (+4) > reviews (≤2, tie-break only).

const clamp01 = (x) => Math.max(0, Math.min(1, x))

// Drinking-venue primary categories (from Google primaryType). Plain `bar` is in
// here but gated separately (it's ambiguous). Cocktail/wine/lounge bars are NOT —
// they're poor fits and need an explicit watch signal to appear.
const DRINK_PRIMARY = new Set([
  'sports bar', 'pub', 'irish pub', 'bar', 'bar and grill',
  'brewery', 'brewpub', 'taproom', 'beer hall',
])

// Non-overlapping band bases; gap (16) exceeds the max within-band sub-score (13).
const BANDS = { sports: 80, pub: 64, barGrill: 48, brewery: 32, bar: 16, other: 16 }

const nameSportsBar = (bar) => /sports\s*bar/i.test(bar.name || '')

// 0..1 from rating (3.0→0, 5.0→1) scaled by review-count confidence.
export function reviewsScore(bar) {
  const quality = clamp01((bar.rating - 3) / 2)
  const confidence = clamp01((bar.reviewCount || 0) / 1500)
  return quality * (0.6 + 0.4 * confidence)
}

// A venue is a sports bar if its category is sports_bar, its Google types[] include
// sports_bar (sportsType — catches sports taverns typed as a generic bar/restaurant,
// e.g. Bad Albert's, Kangaroo & Kiwi), or its name says so. The loose Google "sports
// bars in {area}" text-search tag (googleSportsBar) is deliberately NOT used — it
// pulled in plain bars and even burger joints.
export function isSportsBar(bar) {
  return bar.type === 'sports bar' || bar.sportsType === true || nameSportsBar(bar)
}

export function isConfirmedWorldCup(bar, check) {
  return check?.worldCup === true || bar.confirmedViewing === true
}

// Fit-class → score band. Pure.
export function venueClass(bar) {
  if (isSportsBar(bar)) return 'sports'
  if (bar.type === 'pub' || bar.type === 'irish pub') return 'pub'
  if (bar.type === 'bar and grill') return 'barGrill'
  if (bar.type === 'brewery' || bar.type === 'brewpub' || bar.type === 'taproom' || bar.type === 'beer hall')
    return 'brewery'
  if (bar.type === 'bar') return 'bar'
  return 'other'
}

// Whether a venue should appear at all.
//  - fine dining: never.
//  - sports bars / pubs / bar & grills / breweries: always.
//  - generic `bar` (no sports signal): only with screens or WC confirmation.
//  - restaurants / cocktail-lounge-wine bars / other: only with a real watch signal
//    (name says sports bar, WC-confirmed, or sports_bar type AND screens).
export function isRanked(bar, check) {
  if (bar.fineDining) return false
  const screens = check?.screens === true
  const confirmed = isConfirmedWorldCup(bar, check)
  if (isSportsBar(bar)) {
    // A restaurant with only a stray sports_bar type needs screens to qualify
    // (drops Giddy Up Burgers; keeps Kangaroo & Kiwi which has screens).
    if (!DRINK_PRIMARY.has(bar.type) && !nameSportsBar(bar)) return screens || confirmed
    return true
  }
  if (bar.type === 'bar') return screens || confirmed // generic bar gate
  if (DRINK_PRIMARY.has(bar.type)) return true // pub / brewery / bar & grill
  return confirmed // restaurant / other: only when confirmed
}

export function scoreBar(bar, check) {
  const included = isRanked(bar, check)
  const cls = venueClass(bar)
  const confirmed = isConfirmedWorldCup(bar, check)
  const screens = check?.screens === true
  const sports = cls === 'sports'
  let score = 0
  if (included) {
    const sub = (confirmed ? 7 : 0) + (screens ? 4 : 0) + reviewsScore(bar) * 2 // 0–13
    score = Math.round(BANDS[cls] + sub)
  }
  return {
    score,
    included,
    confirmed: included && confirmed,
    sports,
    reasons: buildReasons(bar, check, confirmed, sports),
    breakdown: buildBreakdown(bar, cls, confirmed, included),
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

const TIER_KEY = {
  sports: 'tierSports', pub: 'tierPub', barGrill: 'tierBarGrill',
  brewery: 'tierBrewery', bar: 'tierBar', other: 'tierBar',
}

function buildBreakdown(bar, cls, confirmed, included) {
  return {
    tier: cls,
    tierKey: TIER_KEY[cls],
    included,
    criteria: [
      { key: 'critConfirms', met: confirmed },
      { key: 'critSportsBar', met: cls === 'sports', vars: { type: bar.type || 'unknown' } },
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
