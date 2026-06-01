import { codeFromName } from './teams.js'

// Real 2026 FIFA World Cup schedule. Source: official fixture list (group draw
// of Dec 5 2025 + published match schedule). Kickoff times were published in UK
// time; this app is for fans WATCHING IN SEATTLE, so every kickoff is converted
// to Pacific time (PDT, UTC-7) for display and the time-of-day filter.
// Pacific wall-clock = UK wall-clock − 8 hours (UK BST is UTC+1).

export const STAGES = {
  GROUP: 'Group', R32: 'Round of 32', R16: 'Round of 16',
  QF: 'Quarter-final', SF: 'Semi-final', TP: 'Third place', FINAL: 'Final',
}
export const STAGE_ORDER = [
  STAGES.GROUP, STAGES.R32, STAGES.R16, STAGES.QF, STAGES.SF, STAGES.TP, STAGES.FINAL,
]

// Display names for the schedule's venue labels (keep "Seattle" exact — the
// scoring stadium-proximity bonus keys off venueCity === 'Seattle').
const VENUE_DISPLAY = {
  'Mexico City': 'Mexico City', Zapopan: 'Guadalajara', Guadalupe: 'Monterrey',
  Toronto: 'Toronto', 'Los Angeles': 'Los Angeles', 'Santa Clara': 'SF Bay Area',
  'New Jersey': 'New York/NJ', Foxborough: 'Boston', Houston: 'Houston',
  Arlington: 'Dallas', Philadelphia: 'Philadelphia', Atlanta: 'Atlanta',
  Miami: 'Miami', Seattle: 'Seattle', Vancouver: 'Vancouver', 'Kansas City': 'Kansas City',
}

// Group stage: [ukDate, ukTime, homeName, awayName, venue, group]
const GROUP = [
  ['2026-06-11', '20:00', 'Mexico', 'South Africa', 'Mexico City', 'A'],
  ['2026-06-12', '03:00', 'South Korea', 'Czech Republic', 'Zapopan', 'A'],
  ['2026-06-12', '20:00', 'Canada', 'Bosnia & Herzegovina', 'Toronto', 'B'],
  ['2026-06-13', '02:00', 'United States', 'Paraguay', 'Los Angeles', 'D'],
  ['2026-06-13', '20:00', 'Qatar', 'Switzerland', 'Santa Clara', 'B'],
  ['2026-06-13', '23:00', 'Brazil', 'Morocco', 'New Jersey', 'C'],
  ['2026-06-14', '02:00', 'Haiti', 'Scotland', 'Foxborough', 'C'],
  ['2026-06-14', '05:00', 'Australia', 'Turkey', 'Vancouver', 'D'],
  ['2026-06-14', '18:00', 'Germany', 'Curacao', 'Houston', 'E'],
  ['2026-06-14', '21:00', 'Netherlands', 'Japan', 'Arlington', 'F'],
  ['2026-06-15', '00:00', 'Ivory Coast', 'Ecuador', 'Philadelphia', 'E'],
  ['2026-06-15', '03:00', 'Sweden', 'Tunisia', 'Guadalupe', 'F'],
  ['2026-06-15', '17:00', 'Spain', 'Cape Verde', 'Atlanta', 'H'],
  ['2026-06-15', '20:00', 'Belgium', 'Egypt', 'Seattle', 'G'],
  ['2026-06-15', '23:00', 'Saudi Arabia', 'Uruguay', 'Miami', 'H'],
  ['2026-06-16', '02:00', 'Iran', 'New Zealand', 'Los Angeles', 'G'],
  ['2026-06-16', '20:00', 'France', 'Senegal', 'New Jersey', 'I'],
  ['2026-06-16', '23:00', 'Iraq', 'Norway', 'Foxborough', 'I'],
  ['2026-06-17', '02:00', 'Argentina', 'Algeria', 'Kansas City', 'J'],
  ['2026-06-17', '05:00', 'Austria', 'Jordan', 'Santa Clara', 'J'],
  ['2026-06-17', '18:00', 'Portugal', 'DR Congo', 'Houston', 'K'],
  ['2026-06-17', '21:00', 'England', 'Croatia', 'Arlington', 'L'],
  ['2026-06-18', '00:00', 'Ghana', 'Panama', 'Toronto', 'L'],
  ['2026-06-18', '03:00', 'Uzbekistan', 'Colombia', 'Mexico City', 'K'],
  ['2026-06-18', '17:00', 'Czech Republic', 'South Africa', 'Atlanta', 'A'],
  ['2026-06-18', '20:00', 'Switzerland', 'Bosnia & Herzegovina', 'Los Angeles', 'B'],
  ['2026-06-18', '23:00', 'Canada', 'Qatar', 'Vancouver', 'B'],
  ['2026-06-19', '02:00', 'Mexico', 'South Korea', 'Zapopan', 'A'],
  ['2026-06-19', '20:00', 'United States', 'Australia', 'Seattle', 'D'],
  ['2026-06-19', '23:00', 'Scotland', 'Morocco', 'Foxborough', 'C'],
  ['2026-06-20', '01:30', 'Brazil', 'Haiti', 'Philadelphia', 'C'],
  ['2026-06-20', '04:00', 'Turkey', 'Paraguay', 'Santa Clara', 'D'],
  ['2026-06-20', '18:00', 'Netherlands', 'Sweden', 'Houston', 'F'],
  ['2026-06-20', '21:00', 'Germany', 'Ivory Coast', 'Toronto', 'E'],
  ['2026-06-21', '01:00', 'Ecuador', 'Curacao', 'Kansas City', 'E'],
  ['2026-06-21', '05:00', 'Tunisia', 'Japan', 'Guadalupe', 'F'],
  ['2026-06-21', '17:00', 'Spain', 'Saudi Arabia', 'Atlanta', 'H'],
  ['2026-06-21', '20:00', 'Belgium', 'Iran', 'Los Angeles', 'G'],
  ['2026-06-21', '23:00', 'Uruguay', 'Cape Verde', 'Miami', 'H'],
  ['2026-06-22', '02:00', 'New Zealand', 'Egypt', 'Vancouver', 'G'],
  ['2026-06-22', '18:00', 'Argentina', 'Austria', 'Arlington', 'J'],
  ['2026-06-22', '22:00', 'France', 'Iraq', 'Philadelphia', 'I'],
  ['2026-06-23', '01:00', 'Norway', 'Senegal', 'Toronto', 'I'],
  ['2026-06-23', '04:00', 'Jordan', 'Algeria', 'Santa Clara', 'J'],
  ['2026-06-23', '18:00', 'Portugal', 'Uzbekistan', 'Houston', 'K'],
  ['2026-06-23', '21:00', 'England', 'Ghana', 'Foxborough', 'L'],
  ['2026-06-24', '00:00', 'Panama', 'Croatia', 'Foxborough', 'L'],
  ['2026-06-24', '03:00', 'Colombia', 'DR Congo', 'Zapopan', 'K'],
  ['2026-06-24', '20:00', 'Switzerland', 'Canada', 'Vancouver', 'B'],
  ['2026-06-24', '20:00', 'Bosnia & Herzegovina', 'Qatar', 'Seattle', 'B'],
  ['2026-06-24', '23:00', 'Morocco', 'Haiti', 'Atlanta', 'C'],
  ['2026-06-24', '23:00', 'Scotland', 'Brazil', 'Miami', 'C'],
  ['2026-06-25', '02:00', 'South Africa', 'South Korea', 'Guadalupe', 'A'],
  ['2026-06-25', '02:00', 'Czech Republic', 'Mexico', 'Mexico City', 'A'],
  ['2026-06-25', '21:00', 'Curacao', 'Ivory Coast', 'Philadelphia', 'E'],
  ['2026-06-25', '21:00', 'Ecuador', 'Germany', 'New Jersey', 'E'],
  ['2026-06-26', '00:00', 'Tunisia', 'Netherlands', 'Kansas City', 'F'],
  ['2026-06-26', '00:00', 'Japan', 'Sweden', 'Arlington', 'F'],
  ['2026-06-26', '03:00', 'Turkey', 'United States', 'Los Angeles', 'D'],
  ['2026-06-26', '03:00', 'Paraguay', 'Australia', 'Santa Clara', 'D'],
  ['2026-06-26', '20:00', 'Norway', 'France', 'Foxborough', 'I'],
  ['2026-06-26', '20:00', 'Senegal', 'Iraq', 'Toronto', 'I'],
  ['2026-06-27', '01:00', 'Cape Verde', 'Saudi Arabia', 'Houston', 'H'],
  ['2026-06-27', '01:00', 'Uruguay', 'Spain', 'Zapopan', 'H'],
  ['2026-06-27', '04:00', 'New Zealand', 'Belgium', 'Vancouver', 'G'],
  ['2026-06-27', '04:00', 'Egypt', 'Iran', 'Seattle', 'G'],
  ['2026-06-27', '22:00', 'Panama', 'England', 'New Jersey', 'L'],
  ['2026-06-27', '22:00', 'Croatia', 'Ghana', 'Philadelphia', 'L'],
  ['2026-06-28', '00:30', 'Colombia', 'Portugal', 'Miami', 'K'],
  ['2026-06-28', '00:30', 'DR Congo', 'Uzbekistan', 'Atlanta', 'K'],
  ['2026-06-28', '03:00', 'Algeria', 'Austria', 'Kansas City', 'J'],
  ['2026-06-28', '03:00', 'Jordan', 'Argentina', 'Arlington', 'J'],
]

// Knockout: [matchNumber, ukDate, ukTime, stage, homeSlot, awaySlot, venue]
const KNOCKOUT = [
  [73, '2026-06-28', '20:00', STAGES.R32, 'A runner-up', 'B runner-up', 'Los Angeles'],
  [74, '2026-06-29', '21:30', STAGES.R32, 'E winner', '3rd: A/B/C/D/F', 'Foxborough'],
  [75, '2026-06-30', '02:00', STAGES.R32, 'F winner', 'C runner-up', 'Guadalupe'],
  [76, '2026-06-29', '18:00', STAGES.R32, 'C winner', 'F runner-up', 'Houston'],
  [77, '2026-06-30', '22:00', STAGES.R32, 'I winner', '3rd: C/D/F/G/H', 'New Jersey'],
  [78, '2026-06-30', '18:00', STAGES.R32, 'E runner-up', 'I runner-up', 'Arlington'],
  [79, '2026-07-01', '02:00', STAGES.R32, 'A winner', '3rd: C/E/F/H/I', 'Mexico City'],
  [80, '2026-07-01', '17:00', STAGES.R32, 'L winner', '3rd: E/H/I/J/K', 'Atlanta'],
  [81, '2026-07-02', '01:00', STAGES.R32, 'D winner', '3rd: B/E/F/I/J', 'Santa Clara'],
  [82, '2026-07-01', '21:00', STAGES.R32, 'G winner', '3rd: A/E/H/I/J', 'Seattle'],
  [83, '2026-07-03', '00:00', STAGES.R32, 'K runner-up', 'L runner-up', 'Toronto'],
  [84, '2026-07-02', '20:00', STAGES.R32, 'H winner', 'J runner-up', 'Los Angeles'],
  [85, '2026-07-03', '04:00', STAGES.R32, 'B winner', '3rd: E/F/G/I/J', 'Vancouver'],
  [86, '2026-07-03', '23:00', STAGES.R32, 'J winner', 'H runner-up', 'Miami'],
  [87, '2026-07-04', '02:30', STAGES.R32, 'K winner', '3rd: D/E/I/J/L', 'Kansas City'],
  [88, '2026-07-03', '19:00', STAGES.R32, 'D runner-up', 'G runner-up', 'Arlington'],
  [89, '2026-07-04', '22:00', STAGES.R16, 'Winner M74', 'Winner M77', 'Philadelphia'],
  [90, '2026-07-04', '18:00', STAGES.R16, 'Winner M73', 'Winner M75', 'Houston'],
  [91, '2026-07-05', '21:00', STAGES.R16, 'Winner M76', 'Winner M78', 'New Jersey'],
  [92, '2026-07-06', '01:00', STAGES.R16, 'Winner M79', 'Winner M80', 'Mexico City'],
  [93, '2026-07-06', '20:00', STAGES.R16, 'Winner M83', 'Winner M84', 'Arlington'],
  [94, '2026-07-07', '01:00', STAGES.R16, 'Winner M81', 'Winner M82', 'Seattle'],
  [95, '2026-07-07', '17:00', STAGES.R16, 'Winner M86', 'Winner M88', 'Atlanta'],
  [96, '2026-07-07', '21:00', STAGES.R16, 'Winner M85', 'Winner M87', 'Vancouver'],
  [97, '2026-07-09', '21:00', STAGES.QF, 'Winner M89', 'Winner M90', 'Foxborough'],
  [98, '2026-07-10', '20:00', STAGES.QF, 'Winner M93', 'Winner M94', 'Los Angeles'],
  [99, '2026-07-11', '22:00', STAGES.QF, 'Winner M91', 'Winner M92', 'Miami'],
  [100, '2026-07-12', '02:00', STAGES.QF, 'Winner M95', 'Winner M96', 'Kansas City'],
  [101, '2026-07-14', '20:00', STAGES.SF, 'Winner M97', 'Winner M98', 'Arlington'],
  [102, '2026-07-15', '20:00', STAGES.SF, 'Winner M99', 'Winner M100', 'Atlanta'],
  [103, '2026-07-18', '22:00', STAGES.TP, 'Loser M101', 'Loser M102', 'Miami'],
  [104, '2026-07-19', '20:00', STAGES.FINAL, 'Winner M101', 'Winner M102', 'New Jersey'],
]

const pad = (n) => String(n).padStart(2, '0')

// Convert a UK (BST = UTC+1) wall-clock to a Pacific (PDT = UTC-7) ISO string.
function ukToPacificISO(ukDate, ukTime) {
  const [y, m, d] = ukDate.split('-').map(Number)
  const [hh, mm] = ukTime.split(':').map(Number)
  const utcMs = Date.UTC(y, m - 1, d, hh, mm) - 60 * 60 * 1000 // UK → UTC
  const pt = new Date(utcMs - 7 * 60 * 60 * 1000) // UTC → PDT
  return `${pt.getUTCFullYear()}-${pad(pt.getUTCMonth() + 1)}-${pad(pt.getUTCDate())}` +
    `T${pad(pt.getUTCHours())}:${pad(pt.getUTCMinutes())}:00-07:00`
}

const venue = (city) => VENUE_DISPLAY[city] || city

function buildMatches() {
  const out = []

  GROUP.forEach(([date, time, home, away, city, group], i) => {
    out.push({
      id: `M${pad(i + 1)}`,
      matchNumber: i + 1,
      stage: STAGES.GROUP,
      group,
      datetime: ukToPacificISO(date, time),
      venueCity: venue(city),
      homeTeam: codeFromName(home),
      awayTeam: codeFromName(away),
    })
  })

  KNOCKOUT.forEach(([num, date, time, stage, home, away, city]) => {
    out.push({
      id: `M${num}`,
      matchNumber: num,
      stage,
      group: null,
      datetime: ukToPacificISO(date, time),
      venueCity: venue(city),
      homeTeam: home, // readable slot label (placeholder team)
      awayTeam: away,
    })
  })

  // Order chronologically by Pacific kickoff.
  return out.sort((a, b) => a.datetime.localeCompare(b.datetime))
}

export const MATCHES = buildMatches()
