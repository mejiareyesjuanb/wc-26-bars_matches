# Seattle World Cup 2026 Bar Finder Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** A client-only React web app where a Seattle user sets neighborhood/venue preferences, browses all 104 WC2026 matches with filters, and gets a ranked list of the best venues to watch any selected match.

**Architecture:** Vite + React SPA, no backend. Seeded data modules under `src/data/`. Pure-function business logic (scoring, filters, time bucketing) under `src/lib/` is unit-tested with Vitest. Preferences persist to `localStorage`. Three views: Onboarding → Matches → Match detail.

**Tech Stack:** React 18, Vite, Tailwind CSS, Vitest.

---

## File Structure

```
index.html
package.json, vite.config.js, tailwind.config.js, postcss.config.js
src/
  main.jsx              App bootstrap
  App.jsx               View routing + global state (prefs, selected match)
  index.css             Tailwind directives + base styles
  data/
    teams.js            Team list (code, name, flag, confederation)
    neighborhoods.js    Seattle neighborhood list
    matches.js          104 matches (real Seattle fixtures + generated bracket)
    bars.js             ~22 curated Seattle venues
  lib/
    time.js             timeOfDay() bucketing + date formatting (TDD)
    filters.js          filterMatches() (TDD)
    scoring.js          scoreBar() + rankBars() (TDD)
    storage.js          loadPrefs()/savePrefs() localStorage wrapper
  components/
    Chip.jsx            selectable/label chip
    MatchCard.jsx       match summary card
    FilterBar.jsx       team/date/stage/time filters
    BarCard.jsx         ranked venue card with reason chips
  views/
    Onboarding.jsx      preferences capture
    Matches.jsx         list + filters
    MatchDetail.jsx     ranked venues for a match
```

---

## Task 1: Scaffold project (Vite + React + Tailwind + Vitest)

**Files:**
- Create: `package.json`, `vite.config.js`, `tailwind.config.js`, `postcss.config.js`, `index.html`, `src/main.jsx`, `src/App.jsx`, `src/index.css`

- [ ] **Step 1: Initialize and install**

```bash
cd "/Users/juanmejia/Documents/World cup webapp"
npm init -y
npm install react react-dom
npm install -D vite @vitejs/plugin-react tailwindcss postcss autoprefixer vitest jsdom @testing-library/react @testing-library/jest-dom
```

- [ ] **Step 2: Configure scripts in `package.json`**

Set `"type": "module"` and replace `"scripts"` with:

```json
{
  "scripts": {
    "dev": "vite",
    "build": "vite build",
    "preview": "vite preview",
    "test": "vitest run",
    "test:watch": "vitest"
  }
}
```

- [ ] **Step 3: Create config files**

`vite.config.js`:
```js
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  test: { environment: 'jsdom', globals: true, setupFiles: './src/setupTests.js' },
})
```

`tailwind.config.js`:
```js
/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      colors: { accent: '#0ea5e9' },
    },
  },
  plugins: [],
}
```

`postcss.config.js`:
```js
export default { plugins: { tailwindcss: {}, autoprefixer: {} } }
```

`src/setupTests.js`:
```js
import '@testing-library/jest-dom'
```

- [ ] **Step 4: Create entry files**

`index.html`:
```html
<!doctype html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>Seattle World Cup 2026 Bar Finder</title>
  </head>
  <body>
    <div id="root"></div>
    <script type="module" src="/src/main.jsx"></script>
  </body>
</html>
```

`src/index.css`:
```css
@tailwind base;
@tailwind components;
@tailwind utilities;

html { font-family: ui-sans-serif, system-ui, -apple-system, sans-serif; }
body { @apply bg-neutral-50 text-neutral-900; }
```

`src/main.jsx`:
```jsx
import React from 'react'
import { createRoot } from 'react-dom/client'
import App from './App.jsx'
import './index.css'

createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
)
```

`src/App.jsx` (temporary placeholder, replaced in Task 9):
```jsx
export default function App() {
  return <div className="p-8 text-xl">World Cup 2026 Bar Finder</div>
}
```

- [ ] **Step 5: Verify dev server boots**

Run: `npm run build`
Expected: builds without error, emits `dist/`.

- [ ] **Step 6: Commit**

```bash
git add -A
git commit -m "chore: scaffold Vite + React + Tailwind + Vitest"
```

---

## Task 2: Seed teams data

**Files:**
- Create: `src/data/teams.js`

- [ ] **Step 1: Create the team list**

`src/data/teams.js` — keyed by FIFA-style 3-letter code. Include the three hosts and a broad set of likely qualifiers plus placeholders.

```js
// Each: code, name, flag emoji, confederation
export const TEAMS = {
  USA: { code: 'USA', name: 'United States', flag: '🇺🇸', conf: 'CONCACAF' },
  CAN: { code: 'CAN', name: 'Canada', flag: '🇨🇦', conf: 'CONCACAF' },
  MEX: { code: 'MEX', name: 'Mexico', flag: '🇲🇽', conf: 'CONCACAF' },
  ARG: { code: 'ARG', name: 'Argentina', flag: '🇦🇷', conf: 'CONMEBOL' },
  BRA: { code: 'BRA', name: 'Brazil', flag: '🇧🇷', conf: 'CONMEBOL' },
  URU: { code: 'URU', name: 'Uruguay', flag: '🇺🇾', conf: 'CONMEBOL' },
  COL: { code: 'COL', name: 'Colombia', flag: '🇨🇴', conf: 'CONMEBOL' },
  ENG: { code: 'ENG', name: 'England', flag: '🏴', conf: 'UEFA' },
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
  WAL: { code: 'WAL', name: 'Wales', flag: '🏴', conf: 'UEFA' },
  IRL: { code: 'IRL', name: 'Ireland', flag: '🇮🇪', conf: 'UEFA' },
  SCO: { code: 'SCO', name: 'Scotland', flag: '🏴', conf: 'UEFA' },
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
```

- [ ] **Step 2: Commit**

```bash
git add src/data/teams.js
git commit -m "feat: seed team data"
```

---

## Task 3: Seed neighborhoods + matches

**Files:**
- Create: `src/data/neighborhoods.js`, `src/data/matches.js`

- [ ] **Step 1: Create neighborhoods**

`src/data/neighborhoods.js`:
```js
export const NEIGHBORHOODS = [
  'Capitol Hill', 'Ballard', 'Fremont', 'Belltown', 'U-District',
  'Georgetown', 'Pioneer Square', 'South Lake Union', 'Queen Anne',
  'Wallingford', 'Downtown', 'West Seattle',
]
```

- [ ] **Step 2: Create matches generator**

`src/data/matches.js` — builds 104 matches: real Seattle-hosted fixtures with accurate dates/times, then fills the remainder of the bracket. All datetimes are ISO strings with Pacific offset (`-07:00`, PDT in June/July).

```js
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
  let day = 11 // June 11 onward
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

  // 3) Knockout rounds: 32 + 16 + 8 + 4 + 2 + 1 + 1 = ... fill to 104.
  const knockout = [
    { stage: STAGES.R32, count: 32, startDay: 28, month: '06' },
    { stage: STAGES.R16, count: 16, startDay: 4, month: '07' },
    { stage: STAGES.QF, count: 8, startDay: 9, month: '07' },
    { stage: STAGES.SF, count: 4, startDay: 14, month: '07' },
    { stage: STAGES.TP, count: 1, startDay: 18, month: '07' },
    { stage: STAGES.FINAL, count: 1, startDay: 19, month: '07' },
  ]
  let ko = 0
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
      ko++
    }
  }

  return matches
}

export const MATCHES = buildMatches()
export const STAGE_ORDER = [STAGES.GROUP, STAGES.R32, STAGES.R16, STAGES.QF, STAGES.SF, STAGES.TP, STAGES.FINAL]
```

- [ ] **Step 3: Verify count in a scratch check**

Run: `node -e "import('./src/data/matches.js').then(m => console.log(m.MATCHES.length))"`
Expected: `104`

- [ ] **Step 4: Commit**

```bash
git add src/data/neighborhoods.js src/data/matches.js
git commit -m "feat: seed neighborhoods and 104-match schedule"
```

---

## Task 4: Seed bars data

**Files:**
- Create: `src/data/bars.js`

- [ ] **Step 1: Create ~22 curated Seattle venues**

`src/data/bars.js`. Each venue carries every attribute the scoring model reads. `capacity` ∈ small|medium|large. `fanAffinity` lists team codes whose fans the venue caters to.

```js
export const VENUE_TYPES = ['sports bar', 'brewery', 'restaurant', 'pub', 'beer hall']

export const BARS = [
  {
    id: 'b1', name: 'The George & Dragon Pub', neighborhood: 'Fremont', type: 'pub',
    rating: 4.6, reviewCount: 1850, screens: 8, confirmedViewing: true,
    bigScreenOrProjector: true, soundOnForMatches: true, capacity: 'medium',
    takesReservations: false, fanAffinity: ['ENG', 'WAL', 'SCO', 'IRL'],
    atmosphereTags: ['lively', 'classic', 'beer'], priceLevel: 2,
    address: '206 N 36th St, Fremont', blurb: 'Seattle’s iconic English football pub — opens early for every match.',
  },
  {
    id: 'b2', name: 'Atlantic Crossing', neighborhood: 'Wallingford', type: 'pub',
    rating: 4.5, reviewCount: 920, screens: 6, confirmedViewing: true,
    bigScreenOrProjector: true, soundOnForMatches: true, capacity: 'medium',
    takesReservations: false, fanAffinity: ['ENG', 'IRL', 'SCO'],
    atmosphereTags: ['lively', 'beer'], priceLevel: 2,
    address: '6508 Roosevelt Way NE', blurb: 'Long-running soccer pub with sound on and a packed early crowd.',
  },
  {
    id: 'b3', name: 'Fado Irish Pub', neighborhood: 'Pioneer Square', type: 'pub',
    rating: 4.3, reviewCount: 1500, screens: 12, confirmedViewing: true,
    bigScreenOrProjector: true, soundOnForMatches: true, capacity: 'large',
    takesReservations: true, fanAffinity: ['IRL', 'ENG', 'USA'],
    atmosphereTags: ['lively', 'big-crowd'], priceLevel: 2,
    address: '801 1st Ave', blurb: 'Cavernous Irish pub downtown — a default big-match destination.',
  },
  {
    id: 'b4', name: 'Lottie’s Lounge', neighborhood: 'Columbia City', type: 'sports bar',
    rating: 4.2, reviewCount: 410, screens: 4, confirmedViewing: false,
    bigScreenOrProjector: false, soundOnForMatches: false, capacity: 'small',
    takesReservations: false, fanAffinity: [],
    atmosphereTags: ['low-key', 'neighborhood'], priceLevel: 2,
    address: '4900 Rainier Ave S', blurb: 'Mellow neighborhood spot; will put a game on if you ask.',
  },
  {
    id: 'b5', name: 'La Cantina Mexican Grill', neighborhood: 'Capitol Hill', type: 'restaurant',
    rating: 4.4, reviewCount: 760, screens: 5, confirmedViewing: true,
    bigScreenOrProjector: true, soundOnForMatches: true, capacity: 'medium',
    takesReservations: true, fanAffinity: ['MEX', 'ARG', 'COL', 'ECU', 'CRC'],
    atmosphereTags: ['lively', 'food', 'festive'], priceLevel: 2,
    address: '432 Broadway E', blurb: 'El Tri central — jerseys, chants, and a full viewing menu for Mexico matches.',
  },
  {
    id: 'b6', name: 'Stoup Brewing', neighborhood: 'Ballard', type: 'brewery',
    rating: 4.7, reviewCount: 2100, screens: 3, confirmedViewing: true,
    bigScreenOrProjector: true, soundOnForMatches: false, capacity: 'large',
    takesReservations: false, fanAffinity: ['USA', 'GER'],
    atmosphereTags: ['family-friendly', 'beer', 'spacious'], priceLevel: 2,
    address: '1108 NW 52nd St', blurb: 'Big Ballard brewery rolling out a projector for marquee matches.',
  },
  {
    id: 'b7', name: 'Rhein Haus', neighborhood: 'Capitol Hill', type: 'beer hall',
    rating: 4.4, reviewCount: 1980, screens: 10, confirmedViewing: true,
    bigScreenOrProjector: true, soundOnForMatches: true, capacity: 'large',
    takesReservations: true, fanAffinity: ['GER', 'USA', 'AUT'],
    atmosphereTags: ['lively', 'big-crowd', 'beer', 'food'], priceLevel: 2,
    address: '912 12th Ave', blurb: 'Bavarian beer hall with bocce, huge screens, and reservable tables.',
  },
  {
    id: 'b8', name: 'Sport Restaurant & Bar', neighborhood: 'Queen Anne', type: 'sports bar',
    rating: 4.1, reviewCount: 1340, screens: 40, confirmedViewing: true,
    bigScreenOrProjector: true, soundOnForMatches: true, capacity: 'large',
    takesReservations: true, fanAffinity: ['USA'],
    atmosphereTags: ['lively', 'big-crowd', 'food'], priceLevel: 3,
    address: '140 4th Ave N', blurb: 'Wall-to-wall screens next to the stadiums — every match, every angle.',
  },
  {
    id: 'b9', name: 'The Masonry', neighborhood: 'Queen Anne', type: 'restaurant',
    rating: 4.6, reviewCount: 880, screens: 2, confirmedViewing: false,
    bigScreenOrProjector: false, soundOnForMatches: false, capacity: 'small',
    takesReservations: true, fanAffinity: ['ITA'],
    atmosphereTags: ['low-key', 'food', 'craft'], priceLevel: 3,
    address: '20 Roy St', blurb: 'Pizza and great beer; quieter spot for a low-key watch.',
  },
  {
    id: 'b10', name: 'Big Time Brewery', neighborhood: 'U-District', type: 'brewery',
    rating: 4.3, reviewCount: 1100, screens: 6, confirmedViewing: true,
    bigScreenOrProjector: true, soundOnForMatches: true, capacity: 'medium',
    takesReservations: false, fanAffinity: ['USA', 'KOR'],
    atmosphereTags: ['lively', 'students', 'beer'], priceLevel: 1,
    address: '4133 University Way NE', blurb: 'Student-packed brewpub near UW; loud for USA and Korea matches.',
  },
  {
    id: 'b11', name: 'Smarty Pants', neighborhood: 'Georgetown', type: 'sports bar',
    rating: 4.2, reviewCount: 540, screens: 5, confirmedViewing: true,
    bigScreenOrProjector: true, soundOnForMatches: true, capacity: 'medium',
    takesReservations: false, fanAffinity: ['USA', 'BRA'],
    atmosphereTags: ['lively', 'food'], priceLevel: 2,
    address: '6017 Airport Way S', blurb: 'Georgetown sandwich-and-sports bar; opens for big kickoffs.',
  },
  {
    id: 'b12', name: 'Brave Horse Tavern', neighborhood: 'South Lake Union', type: 'pub',
    rating: 4.1, reviewCount: 1450, screens: 8, confirmedViewing: true,
    bigScreenOrProjector: true, soundOnForMatches: false, capacity: 'large',
    takesReservations: true, fanAffinity: ['USA', 'ENG'],
    atmosphereTags: ['lively', 'beer', 'food'], priceLevel: 2,
    address: '310 Terry Ave N', blurb: 'Tom Douglas tavern with shuffleboard and a wall of taps.',
  },
  {
    id: 'b13', name: 'Cafe Bengodi', neighborhood: 'Pioneer Square', type: 'restaurant',
    rating: 4.5, reviewCount: 300, screens: 2, confirmedViewing: true,
    bigScreenOrProjector: false, soundOnForMatches: true, capacity: 'small',
    takesReservations: true, fanAffinity: ['ITA'],
    atmosphereTags: ['festive', 'food'], priceLevel: 2,
    address: '700 1st Ave', blurb: 'Little Italy energy — the place for Azzurri matches.',
  },
  {
    id: 'b14', name: 'The Independent Pizzeria', neighborhood: 'Madison Park', type: 'restaurant',
    rating: 4.6, reviewCount: 420, screens: 1, confirmedViewing: false,
    bigScreenOrProjector: false, soundOnForMatches: false, capacity: 'small',
    takesReservations: true, fanAffinity: [],
    atmosphereTags: ['low-key', 'food'], priceLevel: 3,
    address: '4235 E Madison St', blurb: 'Cozy, food-first; one screen for a relaxed sit-down watch.',
  },
  {
    id: 'b15', name: 'Peddler Brewing', neighborhood: 'Ballard', type: 'brewery',
    rating: 4.6, reviewCount: 990, screens: 2, confirmedViewing: true,
    bigScreenOrProjector: true, soundOnForMatches: false, capacity: 'medium',
    takesReservations: false, fanAffinity: ['USA', 'CAN'],
    atmosphereTags: ['family-friendly', 'beer', 'patio'], priceLevel: 2,
    address: '1514 NW Leary Way', blurb: 'Dog-friendly Ballard beer garden with a big-match projector.',
  },
  {
    id: 'b16', name: 'Targy’s Tavern', neighborhood: 'Queen Anne', type: 'sports bar',
    rating: 4.4, reviewCount: 360, screens: 3, confirmedViewing: false,
    bigScreenOrProjector: false, soundOnForMatches: true, capacity: 'small',
    takesReservations: false, fanAffinity: ['USA'],
    atmosphereTags: ['low-key', 'dive', 'neighborhood'], priceLevel: 1,
    address: '600 W Crockett St', blurb: 'Historic tiny dive; intimate watch with the regulars.',
  },
  {
    id: 'b17', name: 'Flatstick Pub', neighborhood: 'Pioneer Square', type: 'pub',
    rating: 4.5, reviewCount: 1600, screens: 6, confirmedViewing: true,
    bigScreenOrProjector: true, soundOnForMatches: false, capacity: 'large',
    takesReservations: true, fanAffinity: ['USA'],
    atmosphereTags: ['lively', 'games', 'beer'], priceLevel: 2,
    address: '240 2nd Ave S', blurb: 'Mini-golf pub with local beer and plenty of room for a crowd.',
  },
  {
    id: 'b18', name: 'El Camion', neighborhood: 'Ballard', type: 'restaurant',
    rating: 4.5, reviewCount: 700, screens: 3, confirmedViewing: true,
    bigScreenOrProjector: false, soundOnForMatches: true, capacity: 'small',
    takesReservations: false, fanAffinity: ['MEX', 'PER', 'COL'],
    atmosphereTags: ['festive', 'food'], priceLevel: 1,
    address: '6416 15th Ave NW', blurb: 'Beloved taqueria turning up the volume for CONMEBOL and Mexico games.',
  },
  {
    id: 'b19', name: 'Pike Brewing Tap Room', neighborhood: 'Downtown', type: 'brewery',
    rating: 4.3, reviewCount: 2400, screens: 5, confirmedViewing: true,
    bigScreenOrProjector: true, soundOnForMatches: false, capacity: 'large',
    takesReservations: true, fanAffinity: ['USA', 'ENG'],
    atmosphereTags: ['big-crowd', 'tourist', 'beer'], priceLevel: 2,
    address: '1415 1st Ave', blurb: 'Pike Place brewery with room for big tournament crowds.',
  },
  {
    id: 'b20', name: 'Ounces Taproom', neighborhood: 'West Seattle', type: 'beer hall',
    rating: 4.4, reviewCount: 650, screens: 4, confirmedViewing: true,
    bigScreenOrProjector: true, soundOnForMatches: false, capacity: 'medium',
    takesReservations: false, fanAffinity: ['USA'],
    atmosphereTags: ['family-friendly', 'patio', 'beer'], priceLevel: 2,
    address: '3809 Delridge Way SW', blurb: 'West Seattle beer garden showing matches on the patio screen.',
  },
  {
    id: 'b21', name: 'Belltown Yacht Club', neighborhood: 'Belltown', type: 'restaurant',
    rating: 4.2, reviewCount: 480, screens: 4, confirmedViewing: true,
    bigScreenOrProjector: true, soundOnForMatches: true, capacity: 'medium',
    takesReservations: true, fanAffinity: ['BRA', 'ARG', 'POR'],
    atmosphereTags: ['lively', 'food', 'festive'], priceLevel: 3,
    address: '2331 2nd Ave', blurb: 'Belltown hotspot hosting South American watch parties.',
  },
  {
    id: 'b22', name: 'The Pine Box', neighborhood: 'Capitol Hill', type: 'beer hall',
    rating: 4.4, reviewCount: 1700, screens: 6, confirmedViewing: true,
    bigScreenOrProjector: true, soundOnForMatches: true, capacity: 'large',
    takesReservations: false, fanAffinity: ['USA', 'GER', 'BEL'],
    atmosphereTags: ['lively', 'big-crowd', 'beer'], priceLevel: 2,
    address: '1600 Melrose Ave', blurb: 'Former mortuary, now a soaring taproom — big screens, big crowds.',
  },
]
```

Note: a few venue neighborhoods (Columbia City, Madison Park) intentionally fall outside the onboarding list so neighborhood-match scoring has negative cases.

- [ ] **Step 2: Commit**

```bash
git add src/data/bars.js
git commit -m "feat: seed curated Seattle venue data"
```

---

## Task 5: Time-of-day logic (TDD)

**Files:**
- Create: `src/lib/time.js`, `src/lib/time.test.js`

- [ ] **Step 1: Write the failing test**

`src/lib/time.test.js`:
```js
import { describe, it, expect } from 'vitest'
import { timeOfDay, formatKickoff } from './time.js'

describe('timeOfDay', () => {
  it('classifies before noon as morning', () => {
    expect(timeOfDay('2026-06-15T09:00:00-07:00')).toBe('morning')
  })
  it('classifies noon-to-5pm as afternoon', () => {
    expect(timeOfDay('2026-06-15T12:00:00-07:00')).toBe('afternoon')
    expect(timeOfDay('2026-06-15T16:59:00-07:00')).toBe('afternoon')
  })
  it('classifies 5pm and later as evening', () => {
    expect(timeOfDay('2026-06-15T17:00:00-07:00')).toBe('evening')
    expect(timeOfDay('2026-06-15T20:00:00-07:00')).toBe('evening')
  })
})

describe('formatKickoff', () => {
  it('formats a readable Pacific time string', () => {
    const out = formatKickoff('2026-06-15T15:00:00-07:00')
    expect(out).toContain('Jun')
    expect(out).toMatch(/3:00/)
  })
})
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npm test -- time`
Expected: FAIL ("timeOfDay is not a function" / module not found).

- [ ] **Step 3: Implement**

`src/lib/time.js`. Parse the hour directly from the ISO string's local-time field (the `-07:00` offset is the displayed Pacific kickoff hour), avoiding timezone surprises from the test runner's locale.

```js
// Hour as written in the ISO string (the local Pacific kickoff hour).
function localHour(iso) {
  const m = iso.match(/T(\d{2}):/)
  return m ? Number(m[1]) : 0
}

export function timeOfDay(iso) {
  const h = localHour(iso)
  if (h < 12) return 'morning'
  if (h < 17) return 'afternoon'
  return 'evening'
}

const MONTHS = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec']

export function formatKickoff(iso) {
  const [datePart, timePart] = iso.split('T')
  const [y, mo, d] = datePart.split('-').map(Number)
  const hh = Number(timePart.slice(0, 2))
  const mm = timePart.slice(3, 5)
  const ampm = hh >= 12 ? 'PM' : 'AM'
  const h12 = hh % 12 === 0 ? 12 : hh % 12
  return `${MONTHS[mo - 1]} ${d}, ${h12}:${mm} ${ampm} PT`
}

export function dateKey(iso) {
  return iso.split('T')[0]
}
```

- [ ] **Step 4: Run test to verify it passes**

Run: `npm test -- time`
Expected: PASS (all cases).

- [ ] **Step 5: Commit**

```bash
git add src/lib/time.js src/lib/time.test.js
git commit -m "feat: time-of-day bucketing and kickoff formatting"
```

---

## Task 6: Filter logic (TDD)

**Files:**
- Create: `src/lib/filters.js`, `src/lib/filters.test.js`

- [ ] **Step 1: Write the failing test**

`src/lib/filters.test.js`:
```js
import { describe, it, expect } from 'vitest'
import { filterMatches } from './filters.js'

const MATCHES = [
  { id: 'M1', stage: 'Group', datetime: '2026-06-15T09:00:00-07:00', homeTeam: 'USA', awayTeam: 'MEX' },
  { id: 'M2', stage: 'Group', datetime: '2026-06-15T18:00:00-07:00', homeTeam: 'ENG', awayTeam: 'BRA' },
  { id: 'M3', stage: 'R16', datetime: '2026-07-06T14:00:00-07:00', homeTeam: 'USA', awayTeam: 'GER' },
]

describe('filterMatches', () => {
  it('returns all when no filters set', () => {
    expect(filterMatches(MATCHES, {}).length).toBe(3)
  })
  it('filters by team (home or away)', () => {
    const r = filterMatches(MATCHES, { team: 'USA' })
    expect(r.map((m) => m.id)).toEqual(['M1', 'M3'])
  })
  it('filters by stage', () => {
    expect(filterMatches(MATCHES, { stage: 'R16' }).map((m) => m.id)).toEqual(['M3'])
  })
  it('filters by date', () => {
    expect(filterMatches(MATCHES, { date: '2026-06-15' }).length).toBe(2)
  })
  it('filters by time of day', () => {
    expect(filterMatches(MATCHES, { timeOfDay: 'morning' }).map((m) => m.id)).toEqual(['M1'])
    expect(filterMatches(MATCHES, { timeOfDay: 'evening' }).map((m) => m.id)).toEqual(['M2'])
  })
  it('combines filters with AND', () => {
    const r = filterMatches(MATCHES, { team: 'USA', stage: 'Group' })
    expect(r.map((m) => m.id)).toEqual(['M1'])
  })
})
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npm test -- filters`
Expected: FAIL (module not found).

- [ ] **Step 3: Implement**

`src/lib/filters.js`:
```js
import { timeOfDay, dateKey } from './time.js'

export function filterMatches(matches, filters = {}) {
  return matches.filter((m) => {
    if (filters.team && m.homeTeam !== filters.team && m.awayTeam !== filters.team) return false
    if (filters.stage && m.stage !== filters.stage) return false
    if (filters.date && dateKey(m.datetime) !== filters.date) return false
    if (filters.timeOfDay && timeOfDay(m.datetime) !== filters.timeOfDay) return false
    return true
  })
}
```

- [ ] **Step 4: Run test to verify it passes**

Run: `npm test -- filters`
Expected: PASS.

- [ ] **Step 5: Commit**

```bash
git add src/lib/filters.js src/lib/filters.test.js
git commit -m "feat: match filtering by team, stage, date, time-of-day"
```

---

## Task 7: Scoring + ranking (TDD) — Core

**Files:**
- Create: `src/lib/scoring.js`, `src/lib/scoring.test.js`

The scoring model: each factor yields a 0..1 sub-score multiplied by its weight; the weighted total is scaled to 0..100. `scoreBar(bar, match, prefs)` returns `{ score, reasons }`; `rankBars(bars, match, prefs)` returns bars sorted desc with `score`/`reasons`/`rank` attached.

`prefs` shape: `{ neighborhoods: string[] (ordered, max 5), venueTypes: string[], wantsReservations: bool, wantsBigScreen: bool, atmosphere: 'lively'|'low-key'|null }`.

- [ ] **Step 1: Write the failing test**

`src/lib/scoring.test.js`:
```js
import { describe, it, expect } from 'vitest'
import { scoreBar, rankBars, WEIGHTS } from './scoring.js'

const baseBar = {
  id: 'x', name: 'X', neighborhood: 'Ballard', type: 'pub',
  rating: 4.0, reviewCount: 500, screens: 4, confirmedViewing: true,
  bigScreenOrProjector: true, soundOnForMatches: true, capacity: 'medium',
  takesReservations: true, fanAffinity: [], atmosphereTags: ['lively'],
  priceLevel: 2, address: '', blurb: '',
}
const match = { id: 'M1', stage: 'Group', homeTeam: 'USA', awayTeam: 'MEX' }
const prefs = {
  neighborhoods: ['Ballard'], venueTypes: ['pub'], wantsReservations: true,
  wantsBigScreen: true, atmosphere: 'lively',
}

describe('scoreBar', () => {
  it('returns a 0..100 score and reasons array', () => {
    const r = scoreBar(baseBar, match, prefs)
    expect(r.score).toBeGreaterThan(0)
    expect(r.score).toBeLessThanOrEqual(100)
    expect(Array.isArray(r.reasons)).toBe(true)
  })

  it('rewards a neighborhood match', () => {
    const inHood = scoreBar(baseBar, match, prefs).score
    const outHood = scoreBar({ ...baseBar, neighborhood: 'Georgetown' }, match, prefs).score
    expect(inHood).toBeGreaterThan(outHood)
  })

  it('rewards fan affinity to a team in this match', () => {
    const affine = scoreBar({ ...baseBar, fanAffinity: ['MEX'] }, match, prefs).score
    const none = scoreBar({ ...baseBar, fanAffinity: ['JPN'] }, match, prefs).score
    expect(affine).toBeGreaterThan(none)
  })

  it('is monotonic in screen count (more screens never scores lower)', () => {
    const few = scoreBar({ ...baseBar, screens: 2 }, match, prefs).score
    const many = scoreBar({ ...baseBar, screens: 12 }, match, prefs).score
    expect(many).toBeGreaterThanOrEqual(few)
  })

  it('is monotonic in rating', () => {
    const lo = scoreBar({ ...baseBar, rating: 3.0 }, match, prefs).score
    const hi = scoreBar({ ...baseBar, rating: 5.0 }, match, prefs).score
    expect(hi).toBeGreaterThanOrEqual(lo)
  })

  it('produces a neighborhood reason chip when matched', () => {
    const r = scoreBar(baseBar, match, prefs)
    expect(r.reasons.some((x) => x.includes('Ballard'))).toBe(true)
  })

  it('weights sum to 100', () => {
    const total = Object.values(WEIGHTS).reduce((a, b) => a + b, 0)
    expect(total).toBe(100)
  })
})

describe('rankBars', () => {
  it('sorts best-first and assigns rank starting at 1', () => {
    const bars = [
      { ...baseBar, id: 'low', neighborhood: 'Georgetown', fanAffinity: [], rating: 3.0 },
      { ...baseBar, id: 'high', neighborhood: 'Ballard', fanAffinity: ['MEX'], rating: 5.0 },
    ]
    const ranked = rankBars(bars, match, prefs)
    expect(ranked[0].id).toBe('high')
    expect(ranked[0].rank).toBe(1)
    expect(ranked[1].rank).toBe(2)
  })

  it('breaks ties by rating then reviewCount', () => {
    const a = { ...baseBar, id: 'a', rating: 4.0, reviewCount: 100 }
    const b = { ...baseBar, id: 'b', rating: 4.0, reviewCount: 900 }
    const ranked = rankBars([a, b], match, { neighborhoods: [], venueTypes: [], wantsReservations: false, wantsBigScreen: false, atmosphere: null })
    expect(ranked[0].id).toBe('b')
  })
})
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npm test -- scoring`
Expected: FAIL (module not found).

- [ ] **Step 3: Implement**

`src/lib/scoring.js`:
```js
export const WEIGHTS = {
  neighborhood: 25,
  viewing: 20,
  reviews: 15,
  fanAffinity: 15,
  venueType: 10,
  size: 7,
  reservations: 4,
  atmosphere: 4,
}

const clamp01 = (x) => Math.max(0, Math.min(1, x))

// 1.0 for top-priority neighborhood, decaying with selection order; 0 if none.
function neighborhoodScore(bar, prefs) {
  const list = prefs.neighborhoods || []
  const idx = list.indexOf(bar.neighborhood)
  if (idx === -1) return 0
  return 1 - idx * 0.12 // #1 -> 1.0, #5 -> 0.52
}

function viewingScore(bar) {
  let s = 0
  if (bar.confirmedViewing) s += 0.45
  if (bar.bigScreenOrProjector) s += 0.2
  if (bar.soundOnForMatches) s += 0.15
  s += clamp01(bar.screens / 12) * 0.2 // screens contribution, saturating at 12
  return clamp01(s)
}

function reviewsScore(bar) {
  const quality = clamp01((bar.rating - 3) / 2) // 3.0 -> 0, 5.0 -> 1
  const confidence = clamp01(bar.reviewCount / 1500) // saturates at 1500 reviews
  return quality * (0.6 + 0.4 * confidence)
}

function fanAffinityScore(bar, match) {
  const aff = bar.fanAffinity || []
  const hitHome = aff.includes(match.homeTeam)
  const hitAway = aff.includes(match.awayTeam)
  if (hitHome && hitAway) return 1
  if (hitHome || hitAway) return 0.75
  return 0
}

function venueTypeScore(bar, prefs) {
  const types = prefs.venueTypes || []
  if (types.length === 0) return 0.5 // neutral when user has no preference
  return types.includes(bar.type) ? 1 : 0
}

const SIZE_RANK = { small: 0.34, medium: 0.67, large: 1 }
const MARQUEE = new Set(['R16', 'QF', 'SF', 'Third Place', 'Final'])

function sizeScore(bar, match) {
  const size = SIZE_RANK[bar.capacity] ?? 0.5
  // Marquee matches favor bigger venues; group matches are size-neutral-ish.
  return MARQUEE.has(match.stage) ? size : 0.4 + 0.6 * size
}

function reservationsScore(bar, prefs) {
  if (!prefs.wantsReservations) return 0.5 // neutral when not requested
  return bar.takesReservations ? 1 : 0
}

function atmosphereScore(bar, prefs) {
  if (!prefs.atmosphere) return 0.5
  const tags = bar.atmosphereTags || []
  return tags.includes(prefs.atmosphere) ? 1 : 0.2
}

export function scoreBar(bar, match, prefs) {
  const parts = {
    neighborhood: neighborhoodScore(bar, prefs),
    viewing: viewingScore(bar),
    reviews: reviewsScore(bar),
    fanAffinity: fanAffinityScore(bar, match),
    venueType: venueTypeScore(bar, prefs),
    size: sizeScore(bar, match),
    reservations: reservationsScore(bar, prefs),
    atmosphere: atmosphereScore(bar, prefs),
  }
  let total = 0
  for (const k of Object.keys(WEIGHTS)) total += parts[k] * WEIGHTS[k]
  const score = Math.round(total)

  const reasons = buildReasons(bar, match, prefs, parts)
  return { score, reasons }
}

function buildReasons(bar, match, prefs, parts) {
  const r = []
  if (parts.neighborhood > 0) r.push(`In ${bar.neighborhood}`)
  const aff = bar.fanAffinity || []
  if (aff.includes(match.homeTeam) || aff.includes(match.awayTeam)) {
    const team = aff.includes(match.homeTeam) ? match.homeTeam : match.awayTeam
    r.push(`Draws ${team} fans`)
  }
  if (bar.confirmedViewing) r.push('Confirmed viewing')
  if (bar.screens >= 6) r.push(`${bar.screens} screens`)
  else if (bar.bigScreenOrProjector) r.push('Big screen/projector')
  if (bar.rating >= 4.5) r.push(`${bar.rating.toFixed(1)}★`)
  if (prefs.wantsReservations && bar.takesReservations) r.push('Takes reservations')
  if (prefs.venueTypes?.includes(bar.type)) r.push(bar.type)
  return r
}

export function rankBars(bars, match, prefs) {
  return bars
    .map((bar) => {
      const { score, reasons } = scoreBar(bar, match, prefs)
      return { ...bar, score, reasons }
    })
    .sort((a, b) => {
      if (b.score !== a.score) return b.score - a.score
      if (b.rating !== a.rating) return b.rating - a.rating
      return b.reviewCount - a.reviewCount
    })
    .map((bar, i) => ({ ...bar, rank: i + 1 }))
}
```

- [ ] **Step 4: Run test to verify it passes**

Run: `npm test -- scoring`
Expected: PASS (all cases).

- [ ] **Step 5: Commit**

```bash
git add src/lib/scoring.js src/lib/scoring.test.js
git commit -m "feat: weighted venue scoring and ranking for a match"
```

---

## Task 8: Preferences storage

**Files:**
- Create: `src/lib/storage.js`, `src/lib/storage.test.js`

- [ ] **Step 1: Write the failing test**

`src/lib/storage.test.js`:
```js
import { describe, it, expect, beforeEach } from 'vitest'
import { loadPrefs, savePrefs, DEFAULT_PREFS } from './storage.js'

beforeEach(() => localStorage.clear())

describe('prefs storage', () => {
  it('returns defaults when nothing stored', () => {
    expect(loadPrefs()).toEqual(DEFAULT_PREFS)
  })
  it('round-trips saved prefs', () => {
    const p = { ...DEFAULT_PREFS, neighborhoods: ['Ballard'], atmosphere: 'lively' }
    savePrefs(p)
    expect(loadPrefs()).toEqual(p)
  })
  it('survives corrupt storage by returning defaults', () => {
    localStorage.setItem('wc26_prefs', '{not json')
    expect(loadPrefs()).toEqual(DEFAULT_PREFS)
  })
})
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npm test -- storage`
Expected: FAIL (module not found).

- [ ] **Step 3: Implement**

`src/lib/storage.js`:
```js
const KEY = 'wc26_prefs'

export const DEFAULT_PREFS = {
  city: 'Seattle',
  neighborhoods: [],
  venueTypes: [],
  wantsReservations: false,
  wantsBigScreen: false,
  atmosphere: null,
  onboarded: false,
}

export function loadPrefs() {
  try {
    const raw = localStorage.getItem(KEY)
    if (!raw) return { ...DEFAULT_PREFS }
    return { ...DEFAULT_PREFS, ...JSON.parse(raw) }
  } catch {
    return { ...DEFAULT_PREFS }
  }
}

export function savePrefs(prefs) {
  localStorage.setItem(KEY, JSON.stringify(prefs))
}
```

- [ ] **Step 4: Run test to verify it passes**

Run: `npm test -- storage`
Expected: PASS.

Note: the round-trip test stores `onboarded: false` from defaults; that's expected and equal on both sides.

- [ ] **Step 5: Commit**

```bash
git add src/lib/storage.js src/lib/storage.test.js
git commit -m "feat: localStorage-backed preferences"
```

---

## Task 9: UI components + views + App wiring

**Files:**
- Create: `src/components/Chip.jsx`, `src/components/MatchCard.jsx`, `src/components/FilterBar.jsx`, `src/components/BarCard.jsx`
- Create: `src/views/Onboarding.jsx`, `src/views/Matches.jsx`, `src/views/MatchDetail.jsx`
- Modify: `src/App.jsx` (replace placeholder)

- [ ] **Step 1: Chip component**

`src/components/Chip.jsx`:
```jsx
export default function Chip({ active, children, onClick, disabled }) {
  const base = 'px-3 py-1.5 rounded-full text-sm border transition select-none'
  const cls = active
    ? 'bg-accent text-white border-accent'
    : disabled
      ? 'bg-neutral-100 text-neutral-400 border-neutral-200 cursor-not-allowed'
      : 'bg-white text-neutral-700 border-neutral-300 hover:border-accent'
  return (
    <button type="button" disabled={disabled} onClick={onClick} className={`${base} ${cls}`}>
      {children}
    </button>
  )
}
```

- [ ] **Step 2: MatchCard component**

`src/components/MatchCard.jsx`:
```jsx
import { getTeam } from '../data/teams.js'
import { formatKickoff } from '../lib/time.js'

export default function MatchCard({ match, onClick }) {
  const home = getTeam(match.homeTeam)
  const away = getTeam(match.awayTeam)
  return (
    <button
      onClick={onClick}
      className="w-full text-left bg-white rounded-xl border border-neutral-200 p-4 hover:shadow-md hover:border-accent transition"
    >
      <div className="flex items-center justify-between mb-2">
        <span className="text-xs font-medium text-accent">
          {match.stage}{match.group ? ` · Group ${match.group}` : ''}
        </span>
        <span className="text-xs text-neutral-500">{match.venueCity}</span>
      </div>
      <div className="flex items-center gap-2 text-lg font-semibold">
        <span>{home.flag} {home.name}</span>
        <span className="text-neutral-400 text-sm">vs</span>
        <span>{away.flag} {away.name}</span>
      </div>
      <div className="mt-2 text-sm text-neutral-500">{formatKickoff(match.datetime)}</div>
    </button>
  )
}
```

- [ ] **Step 3: FilterBar component**

`src/components/FilterBar.jsx`:
```jsx
import { TEAMS } from '../data/teams.js'
import { STAGE_ORDER } from '../data/matches.js'

const TIMES = ['morning', 'afternoon', 'evening']

export default function FilterBar({ filters, setFilters, dates }) {
  const update = (patch) => setFilters({ ...filters, ...patch })
  const teamCodes = Object.keys(TEAMS)
  return (
    <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4 mb-6">
      <select
        className="border border-neutral-300 rounded-lg px-3 py-2 bg-white"
        value={filters.team || ''}
        onChange={(e) => update({ team: e.target.value || undefined })}
      >
        <option value="">All teams</option>
        {teamCodes.map((c) => (
          <option key={c} value={c}>{TEAMS[c].name}</option>
        ))}
      </select>

      <select
        className="border border-neutral-300 rounded-lg px-3 py-2 bg-white"
        value={filters.stage || ''}
        onChange={(e) => update({ stage: e.target.value || undefined })}
      >
        <option value="">All stages</option>
        {STAGE_ORDER.map((s) => <option key={s} value={s}>{s}</option>)}
      </select>

      <select
        className="border border-neutral-300 rounded-lg px-3 py-2 bg-white"
        value={filters.date || ''}
        onChange={(e) => update({ date: e.target.value || undefined })}
      >
        <option value="">All dates</option>
        {dates.map((d) => <option key={d} value={d}>{d}</option>)}
      </select>

      <select
        className="border border-neutral-300 rounded-lg px-3 py-2 bg-white"
        value={filters.timeOfDay || ''}
        onChange={(e) => update({ timeOfDay: e.target.value || undefined })}
      >
        <option value="">Any time</option>
        {TIMES.map((t) => <option key={t} value={t} className="capitalize">{t}</option>)}
      </select>
    </div>
  )
}
```

- [ ] **Step 4: BarCard component**

`src/components/BarCard.jsx`:
```jsx
export default function BarCard({ bar }) {
  const top3 = bar.rank <= 3
  return (
    <div className={`bg-white rounded-xl border p-4 flex gap-4 ${top3 ? 'border-accent shadow-sm' : 'border-neutral-200'}`}>
      <div className={`shrink-0 w-10 h-10 rounded-full grid place-items-center font-bold ${top3 ? 'bg-accent text-white' : 'bg-neutral-100 text-neutral-600'}`}>
        {bar.rank}
      </div>
      <div className="flex-1">
        <div className="flex items-center justify-between">
          <h3 className="font-semibold">{bar.name}</h3>
          <span className="text-sm text-neutral-500">{bar.score}/100</span>
        </div>
        <div className="text-sm text-neutral-500">
          {bar.type} · {bar.neighborhood} · {bar.rating.toFixed(1)}★ ({bar.reviewCount})
        </div>
        <p className="text-sm text-neutral-600 mt-1">{bar.blurb}</p>
        <div className="flex flex-wrap gap-1.5 mt-2">
          {bar.reasons.map((r, i) => (
            <span key={i} className="text-xs bg-neutral-100 text-neutral-700 rounded-full px-2 py-0.5">{r}</span>
          ))}
        </div>
      </div>
    </div>
  )
}
```

- [ ] **Step 5: Onboarding view**

`src/views/Onboarding.jsx`:
```jsx
import { useState } from 'react'
import Chip from '../components/Chip.jsx'
import { NEIGHBORHOODS } from '../data/neighborhoods.js'
import { VENUE_TYPES } from '../data/bars.js'

export default function Onboarding({ initial, onSave }) {
  const [hoods, setHoods] = useState(initial.neighborhoods)
  const [types, setTypes] = useState(initial.venueTypes)
  const [wantsReservations, setRes] = useState(initial.wantsReservations)
  const [wantsBigScreen, setBig] = useState(initial.wantsBigScreen)
  const [atmosphere, setAtmo] = useState(initial.atmosphere)

  const toggleHood = (h) => {
    if (hoods.includes(h)) setHoods(hoods.filter((x) => x !== h))
    else if (hoods.length < 5) setHoods([...hoods, h])
  }
  const toggleType = (t) =>
    setTypes(types.includes(t) ? types.filter((x) => x !== t) : [...types, t])

  const save = () =>
    onSave({ city: 'Seattle', neighborhoods: hoods, venueTypes: types, wantsReservations, wantsBigScreen, atmosphere, onboarded: true })

  return (
    <div className="max-w-2xl mx-auto p-6">
      <h1 className="text-2xl font-bold">Watch the World Cup in Seattle</h1>
      <p className="text-neutral-500 mt-1">Tell us your spots and tastes; we’ll rank the best venues for every match.</p>

      <section className="mt-6">
        <h2 className="font-semibold">Neighborhoods <span className="text-neutral-400 font-normal">(up to 5, in order of preference)</span></h2>
        <div className="flex flex-wrap gap-2 mt-2">
          {NEIGHBORHOODS.map((h) => (
            <Chip key={h} active={hoods.includes(h)} disabled={!hoods.includes(h) && hoods.length >= 5} onClick={() => toggleHood(h)}>
              {hoods.includes(h) ? `${hoods.indexOf(h) + 1}. ${h}` : h}
            </Chip>
          ))}
        </div>
      </section>

      <section className="mt-6">
        <h2 className="font-semibold">Venue types</h2>
        <div className="flex flex-wrap gap-2 mt-2">
          {VENUE_TYPES.map((t) => (
            <Chip key={t} active={types.includes(t)} onClick={() => toggleType(t)}>{t}</Chip>
          ))}
        </div>
      </section>

      <section className="mt-6">
        <h2 className="font-semibold">Atmosphere</h2>
        <div className="flex flex-wrap gap-2 mt-2">
          {['lively', 'low-key'].map((a) => (
            <Chip key={a} active={atmosphere === a} onClick={() => setAtmo(atmosphere === a ? null : a)}>{a}</Chip>
          ))}
        </div>
      </section>

      <section className="mt-6 flex flex-wrap gap-2">
        <Chip active={wantsBigScreen} onClick={() => setBig(!wantsBigScreen)}>Big screen / projector</Chip>
        <Chip active={wantsReservations} onClick={() => setRes(!wantsReservations)}>Needs reservations</Chip>
      </section>

      <button onClick={save} className="mt-8 w-full bg-accent text-white rounded-lg py-3 font-semibold hover:opacity-90">
        See matches
      </button>
    </div>
  )
}
```

- [ ] **Step 6: Matches view**

`src/views/Matches.jsx`:
```jsx
import { useMemo, useState } from 'react'
import { MATCHES } from '../data/matches.js'
import { filterMatches } from '../lib/filters.js'
import { dateKey } from '../lib/time.js'
import FilterBar from '../components/FilterBar.jsx'
import MatchCard from '../components/MatchCard.jsx'

export default function Matches({ onSelectMatch, onEditPrefs }) {
  const [filters, setFilters] = useState({})
  const dates = useMemo(
    () => [...new Set(MATCHES.map((m) => dateKey(m.datetime)))].sort(),
    [],
  )
  const results = useMemo(() => filterMatches(MATCHES, filters), [filters])

  return (
    <div className="max-w-5xl mx-auto p-6">
      <div className="flex items-center justify-between mb-4">
        <h1 className="text-2xl font-bold">Matches</h1>
        <button onClick={onEditPrefs} className="text-sm text-accent underline">Edit preferences</button>
      </div>
      <FilterBar filters={filters} setFilters={setFilters} dates={dates} />
      <p className="text-sm text-neutral-500 mb-3">{results.length} matches</p>
      <div className="grid gap-3 sm:grid-cols-2">
        {results.map((m) => (
          <MatchCard key={m.id} match={m} onClick={() => onSelectMatch(m)} />
        ))}
      </div>
    </div>
  )
}
```

- [ ] **Step 7: MatchDetail view**

`src/views/MatchDetail.jsx`:
```jsx
import { useMemo } from 'react'
import { BARS } from '../data/bars.js'
import { rankBars } from '../lib/scoring.js'
import { getTeam } from '../data/teams.js'
import { formatKickoff } from '../lib/time.js'
import BarCard from '../components/BarCard.jsx'

export default function MatchDetail({ match, prefs, onBack }) {
  const ranked = useMemo(() => rankBars(BARS, match, prefs), [match, prefs])
  const home = getTeam(match.homeTeam)
  const away = getTeam(match.awayTeam)

  return (
    <div className="max-w-3xl mx-auto p-6">
      <button onClick={onBack} className="text-sm text-accent underline mb-4">← All matches</button>
      <div className="bg-white rounded-xl border border-neutral-200 p-5 mb-6">
        <div className="text-xs font-medium text-accent">{match.stage}{match.group ? ` · Group ${match.group}` : ''}</div>
        <div className="text-xl font-bold mt-1">{home.flag} {home.name} vs {away.flag} {away.name}</div>
        <div className="text-sm text-neutral-500 mt-1">{formatKickoff(match.datetime)} · {match.venueCity}</div>
      </div>

      <h2 className="font-semibold mb-3">Best Seattle venues for this match</h2>
      <div className="grid gap-3">
        {ranked.map((bar) => <BarCard key={bar.id} bar={bar} />)}
      </div>
    </div>
  )
}
```

- [ ] **Step 8: App wiring (replace placeholder)**

`src/App.jsx`:
```jsx
import { useState } from 'react'
import { loadPrefs, savePrefs } from './lib/storage.js'
import Onboarding from './views/Onboarding.jsx'
import Matches from './views/Matches.jsx'
import MatchDetail from './views/MatchDetail.jsx'

export default function App() {
  const [prefs, setPrefs] = useState(loadPrefs)
  const [view, setView] = useState(prefs.onboarded ? 'matches' : 'onboarding')
  const [selected, setSelected] = useState(null)

  const handleSave = (p) => {
    setPrefs(p)
    savePrefs(p)
    setView('matches')
  }

  return (
    <div className="min-h-screen">
      {view === 'onboarding' && <Onboarding initial={prefs} onSave={handleSave} />}
      {view === 'matches' && (
        <Matches
          onSelectMatch={(m) => { setSelected(m); setView('detail') }}
          onEditPrefs={() => setView('onboarding')}
        />
      )}
      {view === 'detail' && selected && (
        <MatchDetail match={selected} prefs={prefs} onBack={() => setView('matches')} />
      )}
    </div>
  )
}
```

- [ ] **Step 9: Verify build + manual smoke**

Run: `npm run build`
Expected: builds clean.
Run: `npm run dev`, open the local URL. Expected: onboarding → pick neighborhoods/types → matches list with working filters → click a match → ranked venue list with #1 highlighted.

- [ ] **Step 10: Commit**

```bash
git add -A
git commit -m "feat: UI components, views, and app wiring"
```

---

## Task 10: Responsive + minimalist polish

**Files:**
- Modify: `src/views/Matches.jsx`, `src/index.css`, `src/App.jsx`

- [ ] **Step 1: Add a slim sticky header and constrain widths**

In `src/App.jsx`, wrap views with a minimal header:
```jsx
// inside the returned root div, above the view switches:
<header className="sticky top-0 z-10 bg-white/80 backdrop-blur border-b border-neutral-200">
  <div className="max-w-5xl mx-auto px-6 py-3 font-semibold">⚽ Seattle WC26</div>
</header>
```

- [ ] **Step 2: Ensure filter selects stack cleanly on mobile**

Confirm `FilterBar` grid uses `grid-cols-1` by default (it does via responsive `sm:`/`lg:`), and that the matches grid is single-column on small screens (`grid sm:grid-cols-2`). No change needed if already present; otherwise adjust.

- [ ] **Step 3: Add empty-state message in Matches**

In `src/views/Matches.jsx`, below the grid, render when no results:
```jsx
{results.length === 0 && (
  <p className="text-center text-neutral-400 py-12">No matches fit these filters.</p>
)}
```

- [ ] **Step 4: Verify on narrow viewport**

Run: `npm run dev`; resize to ~375px width. Expected: single-column layout, filters stacked, no horizontal scroll, tappable cards.

- [ ] **Step 5: Final test + build**

Run: `npm test`
Expected: all suites pass.
Run: `npm run build`
Expected: clean build.

- [ ] **Step 6: Commit**

```bash
git add -A
git commit -m "polish: sticky header, responsive layout, empty state"
```

---

## Self-Review Notes

- **Spec coverage:** onboarding/neighborhoods/venue prefs (Task 9), 104 matches (Task 3), filters team/date/stage/time (Tasks 6, 9), ranked venues with all factors + reasons (Tasks 4, 7, 9), responsive/minimalist (Tasks 1, 9, 10), localStorage persistence (Task 8), testing of scoring/filters/time (Tasks 5–7). All covered.
- **Type consistency:** `prefs` shape is identical across `storage.js`, `scoring.js`, and the views. `rankBars` output (`score`, `reasons`, `rank`) matches `BarCard` consumption. `STAGE_ORDER` exported from `matches.js` and consumed by `FilterBar`.
- **No placeholders:** every code step contains complete code.
```
