// English strings (default + fallback). Keys are dotted paths used by t().
// Team/country names and host-city names are data (not here) — left untranslated.
export default {
  app: { brand: '⚽ WC26 Watch', tabMatches: 'Matches', tabBars: 'Bars' },

  common: { vs: 'vs', v: 'v' },

  matches: {
    title: 'World Cup 2026 matches',
    subtitle: 'Tap a match for details',
    cards: 'Cards',
    list: 'List',
    count: '{n} matches',
    addAll: '📅 Add all matches to my calendar',
    addThese: '📅 Add these {n} matches to my calendar',
    empty: 'No matches fit these filters.',
  },

  filters: {
    allTeams: 'All teams',
    allCities: 'All cities',
    allStages: 'All stages',
    allDates: 'All dates',
    anyTime: 'Any time',
    clear: 'Clear filters',
    morning: 'morning',
    afternoon: 'afternoon',
    evening: 'evening',
  },

  table: { date: 'Date', time: 'Time ({tz})', stage: 'Stage', match: 'Match', city: 'City' },

  // Knockout stage labels + the group badge word.
  stages: {
    Group: 'Group',
    'Round of 32': 'Round of 32',
    'Round of 16': 'Round of 16',
    'Quarter-final': 'Quarter-final',
    'Semi-final': 'Semi-final',
    'Third place': 'Third place',
    Final: 'Final',
  },
  match: { group: 'Group {g}' },

  detail: {
    close: 'Close',
    fifaLine: 'FIFA #{rank} · Best: {finish}',
    playersToWatch: 'Players to watch',
    fifaAsOf: 'FIFA rank as of {date}.',
    addToCalendar: 'Add to calendar',
    addGoogle: 'Add to Google Calendar ↗',
    downloadIcs: 'Download .ics (Apple/Outlook)',
    reminderNote: 'Includes a reminder 1 hour before kickoff.',
    whereToWatch: 'Where to watch',
    noVenuesArea: 'No sports bars or confirmed World Cup venues in your neighborhoods yet.',
    barsNote: 'Bars showing the World Cup in your neighborhoods — not specific to this match.',
    seeAllBars: 'See all bars →',
    seeSchedule: "See {team}'s schedule",
  },

  addCal: {
    headingAll: 'Add all matches to your calendar',
    headingThese: 'Add these {n} matches to your calendar',
    download: '📅 Download',
    desktopLead: 'Click Download to save a calendar file with your matches.',
    desktopApple: 'Apple Calendar / Outlook — open the downloaded file; it imports automatically.',
    desktopGoogle1: 'Google Calendar — open',
    desktopGoogleLink: 'Google Calendar import ↗',
    desktopGoogle2: ', choose the downloaded .ics, then Import.',
    iosLead: 'Tap Download — the matches open in Apple Calendar; tap “Add All” to save them.',
    iosGoogle: 'Using Google Calendar? Bulk import is desktop-only — open this site on a computer, or add games one-by-one from a match.',
    android: 'Tap Download, then open the downloaded file — Google Calendar imports your matches (choose Google Calendar if asked).',
  },

  bars: {
    titleCombined: 'Best bars',
    titleByHood: 'Best bars by neighborhood',
    choose: 'Choose neighborhood',
    list: 'List',
    map: 'Map',
    subtitle: 'Sports bars & confirmed World Cup venues — best first.',
    sourceLive: 'Live · Google',
    sourceCurated: 'Curated',
    combined: 'Combined',
    byHood: 'By neighborhood',
    finding: 'Finding bars…',
    sectionEmpty: 'No sports bars or confirmed World Cup venues in {h}.',
    showAllIn: 'Show all {n} in {h}',
    emptyAll: 'No sports bars or confirmed World Cup venues in your neighborhoods.',
    showMore: 'Show more ({n} more)',
    changeAreas: '{h} — change neighborhoods',
  },

  picker: {
    compactPrompt: 'Pick up to 5 neighborhoods to see the best nearby bars for the World Cup.',
    title: 'Choose your neighborhoods',
    blurb: 'Pick up to 5, in order of preference — we use them to rank the best bars near you.',
    see: 'See bars',
    pickAtLeast: 'Pick at least one neighborhood',
    optionalTitle: 'Choose your neighborhoods in {city} (optional)',
    skip: 'Skip — set this later in Bars',
    loading: 'Finding neighborhoods…',
    chooseBorough: 'Choose a borough',
    inBorough: 'Neighborhoods in {borough}',
    back: '← Boroughs',
  },

  city: {
    change: 'Change city',
    pickTitle: 'Choose a city',
    search: 'Search…',
    closest: 'closest to you',
    banner: 'Showing {city} (closest to you).',
    notRight: 'Not right?',
  },

  barCard: {
    sportsBar: 'Sports bar',
    showsMatches: 'Shows matches',
    rating: '{r}★',
    showingWC: '📺 Showing the World Cup',
    screensConfirmed: '✓ Screens confirmed',
    openMaps: 'Open in Google Maps ↗',
  },

  venue: {
    watchScore: 'Watch score',
    tierSports: 'Sports bar',
    tierPub: 'Pub',
    tierBarGrill: 'Bar & grill',
    tierBrewery: 'Brewery',
    tierBar: 'Bar',
    why: 'Why it ranks here:',
    critConfirms: 'Confirms World Cup viewing (website)',
    critSportsBar: 'Sports bar (by name or Google category: {type})',
    reviewsTiebreak: 'Reviews (tie-breaker): {rating}★ ({count})',
    websiteEvidence: 'Website: “…{evidence}…”',
    openMaps: 'Open in Google Maps ↗',
    visitWebsite: 'Visit website ↗',
  },

  fallback: {
    no_key: 'Live data is off — no Google API key is configured on the server. Showing the curated list.',
    api_error: 'Couldn’t reach Google Places. Showing the curated list.',
    no_results: 'No live venues found. Showing the curated list.',
    unreachable: 'The venues service isn’t reachable. Showing the curated list.',
    default: 'Showing the curated venue list.',
  },

  stakes: {
    'Round of 32': 'Round of 32 — win or go home.',
    'Round of 16': 'Round of 16 — win or go home.',
    'Quarter-final': 'Quarter-final — win to reach the semis.',
    'Semi-final': 'Semi-final — win to play for the title.',
    'Third place': 'Third-place play-off.',
    Final: 'The final — the winner lifts the World Cup. 🏆',
    knockout: 'Knockout — win or go home.',
    groupDecider: 'Final group-stage match — decides who advances.',
  },

  calendar: {
    eventTitle: '{home} vs {away} — World Cup 2026',
    eventDesc: '{stage} — 2026 FIFA World Cup.',
    reminder: 'Match starts in 1 hour',
  },
}
