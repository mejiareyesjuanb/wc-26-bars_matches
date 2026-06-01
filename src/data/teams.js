// Each: code, name, flag emoji, confederation
export const TEAMS = {
  USA: { code: 'USA', name: 'United States', flag: '🇺🇸', conf: 'CONCACAF' },
  CAN: { code: 'CAN', name: 'Canada', flag: '🇨🇦', conf: 'CONCACAF' },
  MEX: { code: 'MEX', name: 'Mexico', flag: '🇲🇽', conf: 'CONCACAF' },
  ARG: { code: 'ARG', name: 'Argentina', flag: '🇦🇷', conf: 'CONMEBOL' },
  BRA: { code: 'BRA', name: 'Brazil', flag: '🇧🇷', conf: 'CONMEBOL' },
  URU: { code: 'URU', name: 'Uruguay', flag: '🇺🇾', conf: 'CONMEBOL' },
  COL: { code: 'COL', name: 'Colombia', flag: '🇨🇴', conf: 'CONMEBOL' },
  ENG: { code: 'ENG', name: 'England', flag: '🏴󠁧󠁢󠁥󠁮󠁧󠁿', conf: 'UEFA' },
  FRA: { code: 'FRA', name: 'France', flag: '🇫🇷', conf: 'UEFA' },
  ESP: { code: 'ESP', name: 'Spain', flag: '🇪🇸', conf: 'UEFA' },
  GER: { code: 'GER', name: 'Germany', flag: '🇩🇪', conf: 'UEFA' },
  POR: { code: 'POR', name: 'Portugal', flag: '🇵🇹', conf: 'UEFA' },
  NED: { code: 'NED', name: 'Netherlands', flag: '🇳🇱', conf: 'UEFA' },
  ITA: { code: 'ITA', name: 'Italy', flag: '🇮🇹', conf: 'UEFA' },
  CRO: { code: 'CRO', name: 'Croatia', flag: '🇭🇷', conf: 'UEFA' },
  BEL: { code: 'BEL', name: 'Belgium', flag: '🇧🇪', conf: 'UEFA' },
  JPN: { code: 'JPN', name: 'Japan', flag: '🇯🇵', conf: 'AFC' },
  KOR: { code: 'KOR', name: 'South Korea', flag: '🇰🇷', conf: 'AFC' },
  AUS: { code: 'AUS', name: 'Australia', flag: '🇦🇺', conf: 'AFC' },
  SEN: { code: 'SEN', name: 'Senegal', flag: '🇸🇳', conf: 'CAF' },
  MAR: { code: 'MAR', name: 'Morocco', flag: '🇲🇦', conf: 'CAF' },
  GHA: { code: 'GHA', name: 'Ghana', flag: '🇬🇭', conf: 'CAF' },
  NGA: { code: 'NGA', name: 'Nigeria', flag: '🇳🇬', conf: 'CAF' },
  WAL: { code: 'WAL', name: 'Wales', flag: '🏴󠁧󠁢󠁷󠁬󠁳󠁿', conf: 'UEFA' },
  IRL: { code: 'IRL', name: 'Ireland', flag: '🇮🇪', conf: 'UEFA' },
  SCO: { code: 'SCO', name: 'Scotland', flag: '🏴󠁧󠁢󠁳󠁣󠁴󠁿', conf: 'UEFA' },
  ECU: { code: 'ECU', name: 'Ecuador', flag: '🇪🇨', conf: 'CONMEBOL' },
  CRC: { code: 'CRC', name: 'Costa Rica', flag: '🇨🇷', conf: 'CONCACAF' },
  SUI: { code: 'SUI', name: 'Switzerland', flag: '🇨🇭', conf: 'UEFA' },
  DEN: { code: 'DEN', name: 'Denmark', flag: '🇩🇰', conf: 'UEFA' },
  POL: { code: 'POL', name: 'Poland', flag: '🇵🇱', conf: 'UEFA' },
  SRB: { code: 'SRB', name: 'Serbia', flag: '🇷🇸', conf: 'UEFA' },
}

// Placeholder used when a slot's team is not yet determined.
export function placeholderTeam(label) {
  return { code: label, name: label, flag: '🏳️', conf: 'TBD' }
}

export function getTeam(code) {
  return TEAMS[code] || placeholderTeam(code)
}
