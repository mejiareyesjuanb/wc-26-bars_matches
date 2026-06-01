const STAGES = {
  GROUP: 'Group', R32: 'R32', R16: 'R16', QF: 'QF', SF: 'SF',
  TP: 'Third Place', FINAL: 'Final',
}

// Real Seattle (Lumen Field) WC2026 fixtures: 6 matches.
const SEATTLE_FIXTURES = [
  { date: '2026-06-15', time: '15:00', home: 'TBD', away: 'TBD', stage: STAGES.GROUP, group: 'F' },
  { date: '2026-06-19', time: '12:00', home: 'USA', away: 'TBD', stage: STAGES.GROUP, group: 'D' },
  { date: '2026-06-24', time: '18:00', home: 'TBD', away: 'TBD', stage: STAGES.GROUP, group: 'G' },
  { date: '2026-06-26', time: '15:00', home: 'TBD', away: 'TBD', stage: STAGES.GROUP, group: 'E' },
  { date: '2026-07-01', time: '17:00', home: 'TBD', away: 'TBD', stage: STAGES.R32, group: null },
  { date: '2026-07-06', time: '14:00', home: 'TBD', away: 'TBD', stage: STAGES.R16, group: null },
]

// Pool of teams used to populate generated group fixtures deterministically.
const POOL = [
  'USA','CAN','MEX','ARG','BRA','URU','COL','ENG','FRA','ESP','GER','POR',
  'NED','ITA','CRO','BEL','JPN','KOR','AUS','SEN','MAR','GHA','NGA','ECU',
  'CRC','SUI','DEN','POL','SRB','WAL','IRL','SCO',
]

function iso(date, time) {
  return `${date}T${time}:00-07:00`
}

function makeMatch(n, { date, time, home, away, stage, group, venue = 'Seattle' }) {
  return {
    id: `M${String(n).padStart(3, '0')}`,
    matchNumber: n,
    stage,
    group,
    datetime: iso(date, time),
    venueCity: venue,
    homeTeam: home,
    awayTeam: away,
  }
}

// Deterministic generated schedule so the full 104 render with varied
// teams, dates, stages, and kickoff times for the filters to act on.
function buildMatches() {
  const matches = []
  let n = 1

  // 1) Real Seattle fixtures first (so they appear with accurate data).
  for (const f of SEATTLE_FIXTURES) {
    matches.push(makeMatch(n++, { ...f, venue: 'Seattle' }))
  }

  const otherCities = [
    'Los Angeles', 'New York/NJ', 'Dallas', 'Atlanta', 'Miami', 'Houston',
    'Kansas City', 'Philadelphia', 'San Francisco', 'Boston',
    'Toronto', 'Vancouver', 'Mexico City', 'Guadalajara', 'Monterrey',
  ]
  const times = ['09:00', '12:00', '15:00', '18:00']
  const groups = ['A','B','C','D','E','F','G','H','I','J','K','L']

  // 2) Remaining group-stage matches up to 72 total.
  while (matches.length < 72) {
    const i = matches.length
    const home = POOL[i % POOL.length]
    const away = POOL[(i + 7) % POOL.length]
    const date = `2026-06-${String(Math.min(11 + (i % 17), 27)).padStart(2, '0')}`
    matches.push(makeMatch(n++, {
      date,
      time: times[i % times.length],
      home, away,
      stage: STAGES.GROUP,
      group: groups[i % groups.length],
      venue: otherCities[i % otherCities.length],
    }))
  }

  // 3) Knockout rounds: fill to 104.
  const knockout = [
    { stage: STAGES.R32, count: 32, startDay: 28, month: '06' },
    { stage: STAGES.R16, count: 16, startDay: 4, month: '07' },
    { stage: STAGES.QF, count: 8, startDay: 9, month: '07' },
    { stage: STAGES.SF, count: 4, startDay: 14, month: '07' },
    { stage: STAGES.TP, count: 1, startDay: 18, month: '07' },
    { stage: STAGES.FINAL, count: 1, startDay: 19, month: '07' },
  ]
  for (const round of knockout) {
    for (let k = 0; k < round.count && matches.length < 104; k++) {
      const i = matches.length
      matches.push(makeMatch(n++, {
        date: `2026-${round.month}-${String(round.startDay + (k % 3)).padStart(2, '0')}`,
        time: times[(i + 1) % times.length],
        home: POOL[(i * 3) % POOL.length],
        away: POOL[(i * 3 + 5) % POOL.length],
        stage: round.stage,
        group: null,
        venue: otherCities[i % otherCities.length],
      }))
    }
  }

  return matches
}

export const MATCHES = buildMatches()
export const STAGE_ORDER = [STAGES.GROUP, STAGES.R32, STAGES.R16, STAGES.QF, STAGES.SF, STAGES.TP, STAGES.FINAL]
