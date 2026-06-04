// Tiered ranking. The question we answer, in order of importance:
//   1. Which venues in your neighborhoods CONFIRM they're showing the World Cup?
//   2. Then: sports bars, and venues with screens confirmed on their website.
//   3. Reviews only fine-tune the order within a tier.
//
//   Tier A (confirmed World Cup):            score 75–100
//   Tier B (sports bar OR screens confirmed): score 45–70
//   Tier C (everything else):                 score  0–40
// The bands don't overlap, so tier always dominates; reviews tune within.

const clamp01 = (x) => Math.max(0, Math.min(1, x))

// 0..1 from rating (3.0→0, 5.0→1) scaled by review-count confidence.
export function reviewsScore(bar) {
  const quality = clamp01((bar.rating - 3) / 2)
  const confidence = clamp01((bar.reviewCount || 0) / 1500)
  return quality * (0.6 + 0.4 * confidence)
}

// `bar.type` is the venue's category derived from the Places primaryType
// (source of truth) — so a Mexican restaurant is never treated as a sports bar.
export function isSportsBar(bar) {
  return bar.type === 'sports bar'
}

export function tierOf(bar, check) {
  if (check?.worldCup === true || bar.confirmedViewing === true) return 'A'
  if (isSportsBar(bar) || check?.screens === true) return 'B'
  return 'C'
}

export function scoreBar(bar, check) {
  const tier = tierOf(bar, check)
  const r = reviewsScore(bar)
  let score
  if (tier === 'A') score = 75 + r * 25
  else if (tier === 'B') score = 45 + r * 25
  else score = r * 40
  return {
    score: Math.round(score),
    tier,
    reasons: buildReasons(bar, check),
    breakdown: buildBreakdown(bar, check, tier),
  }
}

function buildReasons(bar, check) {
  const r = []
  if (isSportsBar(bar)) r.push('Sports bar')
  if (bar.confirmedViewing && check?.worldCup !== true) r.push('Shows matches')
  if (bar.rating >= 4.5) r.push(`${bar.rating.toFixed(1)}★`)
  return r
}

function buildBreakdown(bar, check, tier) {
  const confirmedWC = check?.worldCup === true || bar.confirmedViewing === true
  const sports = isSportsBar(bar)
  const screens = check?.screens === true
  const tierLabel =
    tier === 'A' ? 'Confirmed: showing the World Cup'
      : tier === 'B' ? (sports ? 'Sports bar' : 'Screens confirmed on website')
        : 'Not confirmed to show the World Cup'
  return {
    tier,
    tierLabel,
    criteria: [
      { label: 'Confirms World Cup viewing (website)', met: confirmedWC },
      { label: `Sports bar (Google category: ${bar.type || 'unknown'})`, met: sports },
      { label: 'Screens confirmed on website', met: screens },
    ],
    rating: bar.rating,
    reviewCount: bar.reviewCount,
  }
}

export function rankBars(bars, checks = {}) {
  return bars
    .map((bar) => {
      const { score, tier, reasons, breakdown } = scoreBar(bar, checks[bar.id])
      return { ...bar, score, tier, reasons, breakdown }
    })
    .sort((a, b) => {
      if (b.score !== a.score) return b.score - a.score
      if (b.rating !== a.rating) return b.rating - a.rating
      return (b.reviewCount || 0) - (a.reviewCount || 0)
    })
    .map((bar, i) => ({ ...bar, rank: i + 1 }))
}
