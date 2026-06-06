import { dateKey } from './time.js'

// One short "what's at stake" line per knockout stage.
const KO_STAKES = {
  'Round of 32': 'Round of 32 — win or go home.',
  'Round of 16': 'Round of 16 — win or go home.',
  'Quarter-final': 'Quarter-final — win to reach the semis.',
  'Semi-final': 'Semi-final — win to play for the title.',
  'Third place': 'Third-place play-off.',
  Final: 'The final — the winner lifts the World Cup. 🏆',
}

// A group match is a "decider" if it's on the final matchday of its group.
// There's no matchday field, so derive it: the latest date within the group.
export function isGroupDecider(match, matches) {
  if (match.stage !== 'Group' || !match.group) return false
  const dates = matches
    .filter((m) => m.stage === 'Group' && m.group === match.group)
    .map((m) => dateKey(m.datetime))
  if (!dates.length) return false
  const lastDate = dates.sort()[dates.length - 1] // YYYY-MM-DD sorts chronologically
  return dateKey(match.datetime) === lastDate
}

// Short stakes line, or null when there's nothing special on the line
// (i.e. a non-decider group-stage match).
export function stakesFor(match, matches) {
  if (match.stage !== 'Group') return KO_STAKES[match.stage] || 'Knockout — win or go home.'
  return isGroupDecider(match, matches)
    ? 'Final group-stage match — decides who advances.'
    : null
}
