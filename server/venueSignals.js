// The curated World-Cup-signals overlay, derived from the bundled venue data so
// there's a single source of truth. Keyed by normalized venue name; the merge
// step applies these signals to matching live Google Places results.
import { BARS } from '../src/data/bars.js'
import { normalizeName } from './merge.js'

export const SIGNALS = Object.fromEntries(
  BARS.map((b) => [
    normalizeName(b.name),
    {
      screens: b.screens,
      confirmedViewing: b.confirmedViewing,
      bigScreenOrProjector: b.bigScreenOrProjector,
      soundOnForMatches: b.soundOnForMatches,
      capacity: b.capacity,
      fanAffinity: b.fanAffinity,
      atmosphereTags: b.atmosphereTags,
      takesReservations: b.takesReservations,
      blurb: b.blurb,
    },
  ]),
)
