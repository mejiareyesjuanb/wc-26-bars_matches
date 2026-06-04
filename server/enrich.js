// Best-effort confirmation of (a) sports screens and (b) World Cup viewing,
// by fetching a venue's own website and scanning the text. No extra API key.
// To upgrade accuracy later, swap `checkVenue` for an LLM or web-search call —
// the rest of the app only depends on its { screens, worldCup, evidence } shape.

const SCREEN_RE =
  /(big screens?|projector|flat[- ]?screens?|\btvs?\b|televisions?|\bscreens?\b|watch part(?:y|ies)|game ?day|live sports|sports bar|every match)/i
const WORLDCUP_RE =
  /(world cup|fifa|wc ?'?26|2026 world cup|copa mundial|usmnt|us men'?s national|watch part(?:y|ies)|soccer|f[úu]tbol)/i

function stripHtml(html) {
  return html
    .replace(/<script[\s\S]*?<\/script>/gi, ' ')
    .replace(/<style[\s\S]*?<\/style>/gi, ' ')
    .replace(/<[^>]+>/g, ' ')
    .replace(/\s+/g, ' ')
}

function snippet(text, re) {
  const m = text.match(re)
  if (!m) return null
  const start = Math.max(0, m.index - 50)
  return text.slice(start, m.index + 70).trim()
}

async function fetchText(url, timeoutMs = 6000) {
  const ctrl = new AbortController()
  const t = setTimeout(() => ctrl.abort(), timeoutMs)
  try {
    const res = await fetch(url, {
      signal: ctrl.signal,
      redirect: 'follow',
      headers: { 'User-Agent': 'Mozilla/5.0 (compatible; WC26BarFinder/1.0)' },
    })
    if (!res.ok) return ''
    return stripHtml(await res.text())
  } catch {
    return ''
  } finally {
    clearTimeout(t)
  }
}

// Returns { screens, worldCup, evidence }. null = could not determine
// (no website or fetch failed); true/false = found / not found on the site.
export async function checkVenue(website) {
  if (!website) return { screens: null, worldCup: null, evidence: null }
  const text = await fetchText(website)
  if (!text) return { screens: null, worldCup: null, evidence: null }
  const screens = SCREEN_RE.test(text)
  const worldCup = WORLDCUP_RE.test(text)
  return {
    screens,
    worldCup,
    evidence: snippet(text, WORLDCUP_RE) || snippet(text, SCREEN_RE) || null,
  }
}

export const __test = { SCREEN_RE, WORLDCUP_RE, stripHtml, snippet }
