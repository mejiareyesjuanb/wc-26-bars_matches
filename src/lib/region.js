// Single source of truth for the active region's timezone label. Today the app
// is Seattle-only (Pacific). In P2 this becomes per-city (each city config
// supplies tzShort/tzLong) — callers read REGION so that's a value swap, not a
// code change. Used by time.js (the clock suffix) and the matches table header.
export const REGION = {
  tzShort: 'PT',
  tzLong: 'Pacific',
}
