// Approximate centroids (lat, lng) for Seattle neighborhoods, used to assign a
// Google Places venue to the nearest neighborhood.
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
