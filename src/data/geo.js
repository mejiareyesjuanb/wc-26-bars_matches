// Shared Seattle geo helpers — used by the server (to place live Google venues)
// and by the client-side fallback (to place bundled curated venues on the map).

export const NEIGHBORHOOD_CENTROIDS = {
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

export function nearestNeighborhood(lat, lng) {
  let best = null
  let bestD = Infinity
  for (const [name, [clat, clng]] of Object.entries(NEIGHBORHOOD_CENTROIDS)) {
    const d = (lat - clat) ** 2 + (lng - clng) ** 2
    if (d < bestD) {
      bestD = d
      best = name
    }
  }
  return best
}

export function gmapsSearch(name, address) {
  const q = encodeURIComponent([name, address, 'Seattle'].filter(Boolean).join(' '))
  return `https://www.google.com/maps/search/?api=1&query=${q}`
}

// Give curated venues approximate map positions (neighborhood centroid plus a
// deterministic offset so they don't all stack) and a Google Maps link.
export function decorateCurated(bars) {
  return bars.map((b, i) => {
    const [clat, clng] = NEIGHBORHOOD_CENTROIDS[b.neighborhood] || [47.6062, -122.3321]
    return {
      ...b,
      placeId: b.placeId ?? null,
      lat: b.lat ?? clat + (((i % 5) - 2) * 0.004),
      lng: b.lng ?? clng + ((((i * 7) % 5) - 2) * 0.004),
      website: b.website,
      googleMapsUri: b.googleMapsUri || gmapsSearch(b.name, b.address),
    }
  })
}
