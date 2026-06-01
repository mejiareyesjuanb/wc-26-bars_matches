// All 48 teams of the 2026 FIFA World Cup, by group (final draw, Dec 5 2025).
// Each: code, name, flag emoji, confederation.
export const TEAMS = {
  // Group A
  MEX: { code: 'MEX', name: 'Mexico', flag: '🇲🇽', conf: 'CONCACAF' },
  RSA: { code: 'RSA', name: 'South Africa', flag: '🇿🇦', conf: 'CAF' },
  KOR: { code: 'KOR', name: 'South Korea', flag: '🇰🇷', conf: 'AFC' },
  CZE: { code: 'CZE', name: 'Czech Republic', flag: '🇨🇿', conf: 'UEFA' },
  // Group B
  CAN: { code: 'CAN', name: 'Canada', flag: '🇨🇦', conf: 'CONCACAF' },
  BIH: { code: 'BIH', name: 'Bosnia & Herzegovina', flag: '🇧🇦', conf: 'UEFA' },
  QAT: { code: 'QAT', name: 'Qatar', flag: '🇶🇦', conf: 'AFC' },
  SUI: { code: 'SUI', name: 'Switzerland', flag: '🇨🇭', conf: 'UEFA' },
  // Group C
  BRA: { code: 'BRA', name: 'Brazil', flag: '🇧🇷', conf: 'CONMEBOL' },
  MAR: { code: 'MAR', name: 'Morocco', flag: '🇲🇦', conf: 'CAF' },
  HAI: { code: 'HAI', name: 'Haiti', flag: '🇭🇹', conf: 'CONCACAF' },
  SCO: { code: 'SCO', name: 'Scotland', flag: '🏴󠁧󠁢󠁳󠁣󠁴󠁿', conf: 'UEFA' },
  // Group D
  USA: { code: 'USA', name: 'United States', flag: '🇺🇸', conf: 'CONCACAF' },
  PAR: { code: 'PAR', name: 'Paraguay', flag: '🇵🇾', conf: 'CONMEBOL' },
  AUS: { code: 'AUS', name: 'Australia', flag: '🇦🇺', conf: 'AFC' },
  TUR: { code: 'TUR', name: 'Turkey', flag: '🇹🇷', conf: 'UEFA' },
  // Group E
  GER: { code: 'GER', name: 'Germany', flag: '🇩🇪', conf: 'UEFA' },
  CUW: { code: 'CUW', name: 'Curaçao', flag: '🇨🇼', conf: 'CONCACAF' },
  CIV: { code: 'CIV', name: 'Ivory Coast', flag: '🇨🇮', conf: 'CAF' },
  ECU: { code: 'ECU', name: 'Ecuador', flag: '🇪🇨', conf: 'CONMEBOL' },
  // Group F
  NED: { code: 'NED', name: 'Netherlands', flag: '🇳🇱', conf: 'UEFA' },
  JPN: { code: 'JPN', name: 'Japan', flag: '🇯🇵', conf: 'AFC' },
  SWE: { code: 'SWE', name: 'Sweden', flag: '🇸🇪', conf: 'UEFA' },
  TUN: { code: 'TUN', name: 'Tunisia', flag: '🇹🇳', conf: 'CAF' },
  // Group G
  BEL: { code: 'BEL', name: 'Belgium', flag: '🇧🇪', conf: 'UEFA' },
  EGY: { code: 'EGY', name: 'Egypt', flag: '🇪🇬', conf: 'CAF' },
  IRN: { code: 'IRN', name: 'Iran', flag: '🇮🇷', conf: 'AFC' },
  NZL: { code: 'NZL', name: 'New Zealand', flag: '🇳🇿', conf: 'OFC' },
  // Group H
  ESP: { code: 'ESP', name: 'Spain', flag: '🇪🇸', conf: 'UEFA' },
  CPV: { code: 'CPV', name: 'Cape Verde', flag: '🇨🇻', conf: 'CAF' },
  KSA: { code: 'KSA', name: 'Saudi Arabia', flag: '🇸🇦', conf: 'AFC' },
  URU: { code: 'URU', name: 'Uruguay', flag: '🇺🇾', conf: 'CONMEBOL' },
  // Group I
  FRA: { code: 'FRA', name: 'France', flag: '🇫🇷', conf: 'UEFA' },
  SEN: { code: 'SEN', name: 'Senegal', flag: '🇸🇳', conf: 'CAF' },
  IRQ: { code: 'IRQ', name: 'Iraq', flag: '🇮🇶', conf: 'AFC' },
  NOR: { code: 'NOR', name: 'Norway', flag: '🇳🇴', conf: 'UEFA' },
  // Group J
  ARG: { code: 'ARG', name: 'Argentina', flag: '🇦🇷', conf: 'CONMEBOL' },
  ALG: { code: 'ALG', name: 'Algeria', flag: '🇩🇿', conf: 'CAF' },
  AUT: { code: 'AUT', name: 'Austria', flag: '🇦🇹', conf: 'UEFA' },
  JOR: { code: 'JOR', name: 'Jordan', flag: '🇯🇴', conf: 'AFC' },
  // Group K
  POR: { code: 'POR', name: 'Portugal', flag: '🇵🇹', conf: 'UEFA' },
  COD: { code: 'COD', name: 'DR Congo', flag: '🇨🇩', conf: 'CAF' },
  UZB: { code: 'UZB', name: 'Uzbekistan', flag: '🇺🇿', conf: 'AFC' },
  COL: { code: 'COL', name: 'Colombia', flag: '🇨🇴', conf: 'CONMEBOL' },
  // Group L
  ENG: { code: 'ENG', name: 'England', flag: '🏴󠁧󠁢󠁥󠁮󠁧󠁿', conf: 'UEFA' },
  CRO: { code: 'CRO', name: 'Croatia', flag: '🇭🇷', conf: 'UEFA' },
  GHA: { code: 'GHA', name: 'Ghana', flag: '🇬🇭', conf: 'CAF' },
  PAN: { code: 'PAN', name: 'Panama', flag: '🇵🇦', conf: 'CONCACAF' },
}

// Map the schedule's plain team names to their codes.
export const NAME_TO_CODE = Object.fromEntries(
  Object.values(TEAMS).map((t) => [t.name, t.code]),
)
// A couple of alternate spellings used by the schedule source.
NAME_TO_CODE['USA'] = 'USA'
NAME_TO_CODE['Curacao'] = 'CUW'

export function codeFromName(name) {
  return NAME_TO_CODE[name] || name
}

// Placeholder for knockout slots whose team is not yet determined
// (e.g. "Group G winner", "Winner M82"). Rendered without a flag.
export function placeholderTeam(label) {
  return { code: label, name: label, flag: '', conf: 'TBD' }
}

export function getTeam(code) {
  return TEAMS[code] || placeholderTeam(code)
}

export function isPlaceholder(team) {
  return team.conf === 'TBD'
}
