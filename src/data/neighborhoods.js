// The default city's neighborhood list (kept as a thin re-export for back-compat).
// City-aware UI reads the active city's list via getActiveCity().neighborhoods.
import { getCityConfig, DEFAULT_CITY } from './cities.js'

export const NEIGHBORHOODS = getCityConfig(DEFAULT_CITY).neighborhoods
