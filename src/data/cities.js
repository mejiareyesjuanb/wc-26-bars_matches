// City configs (pure data — imported by both client and server). Today Seattle
// is the only city; P3 adds more by appending configs here. Each config carries
// everything the pipeline needs so nothing stays hardcoded:
//   name / tzShort / tzLong  — display
//   tz                       — IANA zone (unused in P2; sets up P3 time conversion)
//   center                   — [lat,lng] map + search-bias center
//   centroids                — neighborhood → [lat,lng] (search tiles + map placement)
//   neighborhoods            — ordered list (derived from centroids key order)
//   textQueries              — prominence text searches (exact strings)
//   nearbyRegion             — region suffix for "sports bars in {hood}, {region}"
//   mapsRegion               — suffix for the Google Maps fallback search link
//
// Seattle's values are copied verbatim from the previous Seattle-only code so
// behavior is byte-identical (the P2 parity gate).

const SEATTLE_CENTROIDS = {
  'Capitol Hill': [47.6230, -122.3210],
  Ballard: [47.6680, -122.3840],
  Fremont: [47.6510, -122.3500],
  Belltown: [47.6140, -122.3470],
  'U-District': [47.6610, -122.3140],
  Georgetown: [47.5470, -122.3200],
  'Pioneer Square': [47.6015, -122.3340],
  'South Lake Union': [47.6270, -122.3370],
  'Queen Anne': [47.6370, -122.3570],
  Wallingford: [47.6610, -122.3340],
  Downtown: [47.6080, -122.3360],
  'West Seattle': [47.5700, -122.3870],
  // Eastside cities
  Bellevue: [47.6101, -122.2015],
  Kirkland: [47.6769, -122.2060],
  Redmond: [47.6740, -122.1215],
  'Mercer Island': [47.5707, -122.2221],
  Issaquah: [47.5301, -122.0326],
  Woodinville: [47.7543, -122.1635],
}

export const CITIES = {
  seattle: {
    id: 'seattle',
    name: 'Seattle',
    tzShort: 'PT',
    tzLong: 'Pacific',
    tz: 'America/Los_Angeles',
    center: [47.6062, -122.3321],
    centroids: SEATTLE_CENTROIDS,
    neighborhoods: Object.keys(SEATTLE_CENTROIDS),
    textQueries: [
      'World Cup viewing party bars Seattle',
      'restaurants showing soccer matches Seattle',
    ],
    nearbyRegion: 'WA',
    mapsRegion: 'Seattle',
  },
}

export const DEFAULT_CITY = 'seattle'

export function getCityConfig(id) {
  return CITIES[id] || CITIES[DEFAULT_CITY]
}
