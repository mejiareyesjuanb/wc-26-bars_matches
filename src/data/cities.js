// City configs (pure data — imported by both client and server).
//
// Seattle keeps curated neighborhood `centroids` (its venues are tiled by
// centroid and mapped to those names — preserves the validated Seattle behavior).
// Every other city has NO centroids: the server tiles a grid around `center` and
// neighborhoods are discovered from each venue's Google sublocality. Cities that
// yield too few neighborhoods fall back to city-level mode at runtime.
//
// Each config: id, name, country, tzShort/tzLong (display), tz (IANA — used to
// convert match kickoff times to the city's local time), center [lat,lng],
// mapsRegion (Google Maps fallback search suffix), textQueries (prominence
// searches), nearbyRegion (Seattle only — "sports bars in {hood}, {region}").

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

// Build templated prominence queries from the display name.
const queries = (name) => [
  `World Cup viewing party bars ${name}`,
  `restaurants showing soccer matches ${name}`,
]

// Helper to declare a discovered-neighborhood city (no centroids).
function city(id, name, country, tzShort, tzLong, tz, center, mapsRegion) {
  return { id, name, country, tzShort, tzLong, tz, center, mapsRegion, textQueries: queries(name) }
}

export const CITIES = {
  seattle: {
    id: 'seattle',
    name: 'Seattle',
    country: 'USA',
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

  // North America
  'new-york': {
    ...city('new-york', 'New York', 'USA', 'ET', 'Eastern', 'America/New_York', [40.7128, -74.0060], 'New York, NY'),
    twoLevel: true,
    stateFilter: 'New York', // drop Jersey City venues that the tiles can reach
    // Explicit tiles covering all five boroughs (the generic grid missed the
    // Bronx, most of Queens, and Staten Island).
    tiles: [
      // Manhattan
      [40.715, -74.005], [40.742, -73.989], [40.775, -73.965], [40.808, -73.945],
      // Brooklyn
      [40.690, -73.990], [40.708, -73.957], [40.668, -73.978], [40.640, -73.985],
      // Queens
      [40.752, -73.930], [40.748, -73.880], [40.722, -73.845], [40.760, -73.830],
      // Bronx
      [40.832, -73.918], [40.862, -73.895],
      // Staten Island
      [40.630, -74.090], [40.580, -74.150],
    ],
  },
  'los-angeles': city('los-angeles', 'Los Angeles', 'USA', 'PT', 'Pacific', 'America/Los_Angeles', [34.0522, -118.2437], 'Los Angeles, CA'),
  boston: city('boston', 'Boston', 'USA', 'ET', 'Eastern', 'America/New_York', [42.3601, -71.0589], 'Boston, MA'),
  denver: city('denver', 'Denver', 'USA', 'MT', 'Mountain', 'America/Denver', [39.7392, -104.9903], 'Denver, CO'),
  miami: city('miami', 'Miami', 'USA', 'ET', 'Eastern', 'America/New_York', [25.7617, -80.1918], 'Miami, FL'),
  chicago: city('chicago', 'Chicago', 'USA', 'CT', 'Central', 'America/Chicago', [41.8781, -87.6298], 'Chicago, IL'),
  'san-francisco': city('san-francisco', 'San Francisco', 'USA', 'PT', 'Pacific', 'America/Los_Angeles', [37.7749, -122.4194], 'San Francisco, CA'),
  austin: city('austin', 'Austin', 'USA', 'CT', 'Central', 'America/Chicago', [30.2672, -97.7431], 'Austin, TX'),
  'washington-dc': city('washington-dc', 'Washington DC', 'USA', 'ET', 'Eastern', 'America/New_York', [38.9072, -77.0369], 'Washington, DC'),
  portland: city('portland', 'Portland', 'USA', 'PT', 'Pacific', 'America/Los_Angeles', [45.5152, -122.6784], 'Portland, OR'),
  'mountain-view': city('mountain-view', 'Mountain View', 'USA', 'PT', 'Pacific', 'America/Los_Angeles', [37.3861, -122.0839], 'Mountain View, CA'),
  'palo-alto': city('palo-alto', 'Palo Alto', 'USA', 'PT', 'Pacific', 'America/Los_Angeles', [37.4419, -122.1430], 'Palo Alto, CA'),
  'redwood-city': city('redwood-city', 'Redwood City', 'USA', 'PT', 'Pacific', 'America/Los_Angeles', [37.4852, -122.2364], 'Redwood City, CA'),

  // Latin America
  'mexico-city': { ...city('mexico-city', 'Mexico City', 'Mexico', 'CT', 'Central', 'America/Mexico_City', [19.4326, -99.1332], 'Ciudad de México'), hidden: true },
  bogota: { ...city('bogota', 'Bogotá', 'Colombia', 'COT', 'Colombia', 'America/Bogota', [4.7110, -74.0721], 'Bogotá'), hidden: true },
  'buenos-aires': city('buenos-aires', 'Buenos Aires', 'Argentina', 'ART', 'Argentina', 'America/Argentina/Buenos_Aires', [-34.6037, -58.3816], 'Buenos Aires'),

  // Europe
  copenhagen: { ...city('copenhagen', 'Copenhagen', 'Denmark', 'CET', 'Central European', 'Europe/Copenhagen', [55.6761, 12.5683], 'Copenhagen'), hidden: true },
  london: { ...city('london', 'London', 'UK', 'BST', 'British', 'Europe/London', [51.5074, -0.1278], 'London, UK'), hidden: true },
  'st-andrews': city('st-andrews', 'St Andrews', 'UK', 'BST', 'British', 'Europe/London', [56.3398, -2.7967], 'St Andrews, Scotland'),
}

export const DEFAULT_CITY = 'seattle'

export function getCityConfig(id) {
  return CITIES[id] || CITIES[DEFAULT_CITY]
}
