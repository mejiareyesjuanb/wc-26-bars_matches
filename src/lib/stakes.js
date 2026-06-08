import { dateKey } from './time.js'
import { translate, getCurrentLang } from './i18n/index.js'

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
// (i.e. a non-decider group-stage match). Localized via the i18n dictionary;
// `lang` defaults to the active language (English in tests / non-React callers).
export function stakesFor(match, matches, lang) {
  const L = lang || getCurrentLang()
  if (match.stage !== 'Group') {
    const key = `stakes.${match.stage}`
    const line = translate(L, key)
    return line === key ? translate(L, 'stakes.knockout') : line
  }
  return isGroupDecider(match, matches) ? translate(L, 'stakes.groupDecider') : null
}
