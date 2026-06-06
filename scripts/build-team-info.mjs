// Generates src/data/teamInfo.js from credible public sources. Re-run with:
//   node scripts/build-team-info.mjs
// Every value is parsed from a documented source (no hand-entered facts):
//   • Players to watch  — Wikipedia "2026 FIFA World Cup squads" (squad templates)
//   • FIFA ranking      — Wikipedia "2026 FIFA World Cup seeding" (FIFA ranking of 19 Nov 2025)
//   • Best WC finish    — Wikipedia "National team appearances in the FIFA World Cup" (Best result)
import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import { TEAMS, NAME_TO_CODE } from '../src/data/teams.js'

const SOURCES = {
  squads: 'https://en.wikipedia.org/wiki/2026_FIFA_World_Cup_squads',
  rank: 'https://en.wikipedia.org/wiki/FIFA_Men%27s_World_Ranking (via the {{FIFA World Rankings}} data template)',
  finishes: 'https://en.wikipedia.org/wiki/National_team_appearances_in_the_FIFA_World_Cup',
}

// Transparent list of marquee clubs for "players to watch" (the only editorial input).
const MARQUEE = ['Real Madrid', 'Barcelona', 'Atletico Madrid', 'Manchester City', 'Manchester United',
  'Liverpool', 'Arsenal', 'Chelsea', 'Tottenham', 'Newcastle United', 'Aston Villa', 'Bayern Munich',
  'Borussia Dortmund', 'Bayer Leverkusen', 'RB Leipzig', 'Paris Saint-Germain', 'Inter Milan',
  'Internazionale', 'AC Milan', 'Juventus', 'Napoli', 'Roma', 'Atalanta', 'Benfica', 'Porto',
  'Sporting', 'Ajax', 'PSV Eindhoven', 'Feyenoord', 'Al Nassr', 'Al Hilal', 'Al Ittihad']

const NAME_ALIASES = { 'Bosnia and Herzegovina': 'BIH' }
const codeForName = (n) => NAME_TO_CODE[n] || NAME_ALIASES[n] || null
const OUR_CODES = new Set(Object.keys(TEAMS))

const norm = (s) => (s || '').toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '')
  .replace(/[^a-z0-9]+/g, ' ').replace(/\b(fc|cf|afc|sc|ssc)\b/g, ' ').replace(/\s+/g, ' ').trim()
const MARQ = MARQUEE.map(norm)
const isMarquee = (club) => { const n = norm(club); if (!n) return false; return MARQ.some((m) => n === m || (n.length >= 4 && (n.includes(m) || m.includes(n)))) }

async function wikitext(page) {
  const url = `https://en.wikipedia.org/w/api.php?action=parse&page=${encodeURIComponent(page)}&prop=wikitext&format=json&formatversion=2&redirects=1`
  const r = await fetch(url, { headers: { 'User-Agent': 'wc26-teaminfo-builder/1.0' } })
  const j = await r.json()
  if (!j.parse) throw new Error(`No wikitext for ${page}`)
  return j.parse.wikitext
}

// --- wikitext helpers ---
function extractTemplate(s, start) {
  let d = 0
  for (let i = start; i < s.length - 1; i++) {
    if (s[i] === '{' && s[i + 1] === '{') { d++; i++ } else if (s[i] === '}' && s[i + 1] === '}') { d--; i++; if (d === 0) return s.slice(start, i + 1) }
  }
  return null
}
function templateParams(tmpl) {
  const inner = tmpl.slice(2, -2); const parts = []; let buf = '', cb = 0, sb = 0
  for (let i = 0; i < inner.length; i++) {
    const a = inner[i], b = inner[i + 1]
    if (a === '{' && b === '{') { cb++; buf += '{{'; i++; continue }
    if (a === '}' && b === '}') { cb--; buf += '}}'; i++; continue }
    if (a === '[' && b === '[') { sb++; buf += '[['; i++; continue }
    if (a === ']' && b === ']') { sb--; buf += ']]'; i++; continue }
    if (a === '|' && cb === 0 && sb === 0) { parts.push(buf); buf = ''; continue }
    buf += a
  }
  parts.push(buf)
  const o = {}
  for (const p of parts) { const e = p.indexOf('='); if (e > 0) o[p.slice(0, e).trim()] = p.slice(e + 1).trim() }
  return o
}
const linkText = (v) => {
  if (!v) return ''
  const m = v.match(/\[\[([^\]]+)\]\]/)
  let s = m ? (m[1].includes('|') ? m[1].split('|').pop() : m[1]) : v
  return s.replace(/\(footballer[^)]*\)/i, '').replace(/<.*?>/g, '').replace(/''/g, '').replace(/\s+/g, ' ').trim()
}
const prettyClub = (c) => c.replace(/\s+(F\.?C\.?|A\.?F\.?C\.?|S\.?C\.?)$/i, '').replace(/^(FC|AFC)\s+/i, '').trim()

// --- 1) players to watch ---
function parsePlayers(wt) {
  const heads = [...wt.matchAll(/^=+\s*(.*?)\s*=+\s*$/gm)].map((m) => ({ txt: m[1], idx: m.index }))
  const teamHeads = heads.filter((h) => codeForName(h.txt))
  const byCode = {}
  teamHeads.forEach((h) => {
    const next = heads.find((x) => x.idx > h.idx)
    const block = wt.slice(h.idx, next ? next.idx : wt.length)
    const players = []
    let p = block.indexOf('{{nat fs g player')
    while (p >= 0) {
      const t = extractTemplate(block, p)
      if (t) { const o = templateParams(t); players.push({ name: linkText(o.name), caps: +o.caps || 0, goals: +o.goals || 0, club: prettyClub(linkText(o.club)) }) }
      p = block.indexOf('{{nat fs g player', p + 5)
    }
    // "Players to watch": blended notability score so squad stars surface even
    // at non-marquee clubs (e.g. Messi at Inter Miami), while marquee-club
    // players still get a boost. International goals dominate; caps lightly
    // weighted; +8 (goals-equivalent) if the club is marquee. Exclude near-
    // uncapped players. Tie-break by goals then caps.
    const MARQUEE_BONUS = 8
    const score = (p) => p.goals + 0.03 * p.caps + (isMarquee(p.club) ? MARQUEE_BONUS : 0)
    const pick = players
      .filter((p) => p.caps >= 5)
      .sort((a, b) => score(b) - score(a) || b.goals - a.goals || b.caps - a.caps)
      .slice(0, 3)
      .map((x) => ({ name: x.name, club: x.club }))
    byCode[codeForName(h.txt)] = { players: pick, squadSize: players.length }
  })
  return byCode
}

// --- 2) FIFA rank (current, via Wikipedia's {{FIFA World Rankings|CODE}} data template) ---
async function fetchRanks(codes) {
  const text = codes.map((c) => `@@${c}@@{{FIFA World Rankings|${c}}}`).join('\n')
  const url = `https://en.wikipedia.org/w/api.php?action=expandtemplates&prop=wikitext&format=json&formatversion=2&text=${encodeURIComponent(text)}`
  const j = await (await fetch(url, { headers: { 'User-Agent': 'wc26-teaminfo-builder/1.0' } })).json()
  const wt = j.expandtemplates.wikitext
  const ranks = {}
  let asOf = null
  for (const c of codes) {
    const i = wt.indexOf(`@@${c}@@`)
    if (i < 0) continue
    const nextAt = wt.indexOf('@@', i + c.length + 4)
    const seg = wt.slice(i, nextAt < 0 ? wt.length : nextAt)
    const m = seg.match(/<nowiki\s*\/>\s*(\d+)/) || seg.match(/@@\s*(\d+)/)
    if (m) ranks[c] = +m[1]
    if (!asOf) { const d = seg.match(/\((\d{1,2} \w+ \d{4})\)/); if (d) asOf = d[1] }
  }
  return { ranks, asOf }
}

// --- 3) best WC finish ---
const FINISH_MAP = {
  Champions: 'Winners', 'First round': 'Group stage', 'First group stage': 'Group stage',
  Third: 'Third place', Fourth: 'Fourth place', TBD: 'First appearance',
  'To be determined': 'First appearance', Debut: 'First appearance', '—': 'First appearance',
}
const FINISH_LABEL = (s) => FINISH_MAP[s] || s
function parseFinishes(wt) {
  const byCode = {}
  const fbs = [...wt.matchAll(/\{\{fb\|([A-Z]{3})\}\}/g)]
  for (let i = 0; i < fbs.length; i++) {
    const code = fbs[i][1]
    if (!OUR_CODES.has(code) || byCode[code]) continue
    const seg = wt.slice(fbs[i].index, i + 1 < fbs.length ? fbs[i + 1].index : wt.length)
    const aw = seg.match(/\{\{\s*Awards table sorting\s*\|\s*([^|}]+)/i)
    let label, years = []
    if (aw) {
      label = aw[1].trim()
      const after = seg.slice(seg.indexOf(aw[0]) + aw[0].length)
      years = [...after.matchAll(/\[\[(\d{4}) FIFA World Cup/g)].map((x) => +x[1]).slice(0, 6)
    } else {
      // fallback: last cell text (teams whose best is group stage may not use the template)
      const firstRow = seg.split(/\n\s*\|-/)[0]
      const cells = firstRow.split('||')
      label = (cells[cells.length - 1] || '').replace(/\{\{[^}]*\}\}/g, '').replace(/\[\[[^\]]*\]\]/g, '')
        .replace(/bgcolor=\S+/gi, '').replace(/\(.*?\)/g, '').replace(/[|''*]/g, '').trim()
    }
    if (label) byCode[code] = { bestFinish: FINISH_LABEL(label), bestFinishYears: years }
  }
  return byCode
}

async function main() {
  const [sq, fn, rankRes] = await Promise.all([
    wikitext('2026 FIFA World Cup squads'),
    wikitext('National team appearances in the FIFA World Cup'),
    fetchRanks([...OUR_CODES]),
  ])
  const players = parsePlayers(sq)
  const finishes = parseFinishes(fn)
  const ranks = rankRes.ranks
  const rankAsOf = rankRes.asOf

  const info = {}
  const warnings = []
  for (const code of OUR_CODES) {
    const p = players[code]
    const f = finishes[code]
    info[code] = {
      fifaRank: ranks[code] ?? null,
      bestFinish: f ? f.bestFinish : 'First appearance',
      bestFinishYears: f ? f.bestFinishYears : [],
      playersToWatch: p ? p.players : [],
    }
    if (ranks[code] == null) warnings.push(`${code}: no FIFA rank`)
    if (!p || !p.players.length) warnings.push(`${code}: no players`)
    if (p && p.squadSize < 20) warnings.push(`${code}: squad size ${p?.squadSize} (parse?)`)
  }

  // sort keys to match TEAMS order for a clean diff
  const ordered = {}
  for (const code of Object.keys(TEAMS)) ordered[code] = info[code]

  const out = `// AUTO-GENERATED by scripts/build-team-info.mjs — do not edit by hand.
// Sourced from Wikipedia (see TEAM_INFO_META.sources). Re-run the script to refresh.
export const TEAM_INFO = ${JSON.stringify(ordered, null, 2)}

export const TEAM_INFO_META = ${JSON.stringify({ asOf: new Date().toISOString().slice(0, 10), rankAsOf, sources: SOURCES }, null, 2)}

export function teamInfo(code) {
  return TEAM_INFO[code] || null
}
`
  const dir = path.dirname(fileURLToPath(import.meta.url))
  const outPath = path.resolve(dir, '../src/data/teamInfo.js')
  fs.writeFileSync(outPath, out)
  console.log(`Wrote ${outPath} (${Object.keys(ordered).length} teams)`)
  console.log('Sample:', JSON.stringify(ordered.MEX), JSON.stringify(ordered.BRA).slice(0, 120))
  if (warnings.length) console.log('\nWARNINGS:\n' + warnings.join('\n'))
  else console.log('No warnings — all teams complete.')
}
main().catch((e) => { console.error(e); process.exit(1) })
