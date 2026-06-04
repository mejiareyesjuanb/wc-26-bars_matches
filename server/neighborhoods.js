// Re-export shared geo helpers so server code (and its tests) keep this path.
export {
  NEIGHBORHOOD_CENTROIDS,
  nearestNeighborhood,
  gmapsSearch,
  decorateCurated,
} from '../src/data/geo.js'
