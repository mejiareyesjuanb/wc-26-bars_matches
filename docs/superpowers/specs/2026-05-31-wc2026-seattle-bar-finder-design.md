# Seattle World Cup 2026 Bar Finder — Design

**Date:** 2026-05-31
**Status:** Approved

## Summary

A client-only React web app that helps a user in Seattle find the best sports
bar / venue to watch each FIFA World Cup 2026 match. The user sets preferences
(neighborhoods + venue tastes), browses all 104 matches with rich filters, and
for any match gets a ranked list of Seattle venues (#1 = best) computed from a
weighted scoring model.

## Goals

- Capture user preferences: up to 5 Seattle neighborhoods + venue preferences.
- Show all 104 WC2026 matches with filters by team, date, stage, and
  time-of-day (morning / afternoon / evening).
- For a selected match, rank Seattle venues best-to-worst with transparent
  "why ranked here" reasons.
- Responsive, mobile-first, minimalist UI.

## Non-Goals (YAGNI)

- Real authentication / accounts.
- Live match or bar APIs (all data is seeded client-side).
- Maps, geolocation, real booking/reservation integration.
- Multi-city support (city is fixed to Seattle).

## Architecture

- **Stack:** React + Vite + Tailwind CSS. No backend.
- **State/persistence:** React state; user preferences persisted to
  `localStorage`.
- **Routing:** Client-side, three views:
  1. Onboarding / preferences
  2. Matches list (with filters)
  3. Match detail (ranked venues)
- **Data:** Seeded modules under `src/data/` (matches, teams, bars).

## Data Models

### Team
`{ code, name, flag (emoji), confederation }`

### Match (104 total)
`{ id, matchNumber, stage, group, datetime (America/Los_Angeles), venueCity,
homeTeam (code), awayTeam (code) }`
- Real Seattle-hosted fixtures (Lumen Field / "Seattle Stadium") use accurate
  dates and kickoff times. Remaining matches fill out the full bracket
  (group stage → final) with qualified or placeholder teams.
- `stage` ∈ { Group, R32, R16, QF, SF, Third Place, Final }.
- Time-of-day derived from local kickoff hour: morning (<12), afternoon
  (12–16:59), evening (≥17).

### Bar / Venue (~20–25 curated Seattle venues)
`{ id, name, neighborhood, type, rating, reviewCount, screens,
confirmedViewing, bigScreenOrProjector, soundOnForMatches, capacity,
takesReservations, fanAffinity (country codes), atmosphereTags, priceLevel,
address, blurb }`
- `type` ∈ { sports bar, brewery, restaurant, pub, beer hall }.
- `capacity` is a size bucket: small / medium / large.
- Includes restaurants & breweries running official WC viewing experiences
  (flagged via `confirmedViewing`).
- `fanAffinity` lists country codes whose fans the venue caters to
  (fabricated but plausible for the demo, e.g. British pub → ENG/WAL,
  cantina → MEX).

## Onboarding / Preferences

- City fixed to **Seattle** (shown, not editable).
- Neighborhood multi-select chips (max 5) from real Seattle areas: Capitol
  Hill, Ballard, Fremont, Belltown, U-District, Georgetown, Pioneer Square,
  South Lake Union, Queen Anne, Wallingford, etc. Selection order is retained
  (used as a preference-strength signal).
- Venue preferences: venue-type chips, "needs reservations," "big-screen /
  projector," atmosphere (lively vs. low-key), price level.
- Persisted to `localStorage`; editable any time.

## Matches View

- Renders all matches as minimalist cards: teams + flags, stage badge,
  date/time (PT).
- **Filters:** team (searchable), date, stage, time-of-day. Filters combine
  (AND). On mobile, filters collapse into a sheet/drawer.
- Clicking a card opens the match detail view.

## Match Detail — Ranked Venues (Core)

For the selected match, every venue is scored 0–100 and ranked, **#1 = best**.

### Scoring model (weighted sum)

| Factor              | Weight | Logic |
|---------------------|:------:|-------|
| Neighborhood match  | 25 | Venue is in a user-chosen neighborhood; graduated by the user's selection order. |
| Viewing setup       | 20 | `confirmedViewing` + screen count + projector + sound-on-for-matches. |
| Reviews             | 15 | Rating normalized × confidence factor from `reviewCount`. |
| Fan affinity        | 15 | Venue caters to either team playing this match (via `fanAffinity`). |
| Venue-type pref     | 10 | Venue `type` matches a user-preferred type. |
| Size fit            |  7 | Capacity vs. expected demand (marquee stages favor larger venues). |
| Reservations        |  4 | User wants reservations and venue `takesReservations`. |
| Atmosphere/amenities|  4 | Matches lively/low-key preference + extras. |

- Each factor produces a normalized 0–1 sub-score, multiplied by its weight;
  total scaled to 0–100.
- Ties broken by rating, then reviewCount.

### Card display

- Rank number (#1 …), venue name, score, rating + review count.
- **"Why ranked here" reason chips**, e.g. "In Ballard · Shows Mexico fans ·
  6 screens · Takes reservations."
- Key attributes: type, neighborhood, capacity, viewing setup.
- Top 3 visually emphasized.

## Responsive / Minimalist UI

- Mobile-first, generous whitespace, neutral palette + one accent color,
  system font stack, no heavy component libraries.
- Filters collapse into a bottom sheet on mobile.

## Testing

- Unit tests for the scoring function: neighborhood weighting, fan-affinity
  matching against a given match, monotonicity (more screens / higher rating
  never lowers score, all else equal), and tie-breaking.
- Unit tests for filter logic (team/date/stage/time-of-day combine as AND).
- Unit tests for time-of-day bucketing from kickoff hour.

## File Structure (proposed)

```
src/
  data/        teams.js, matches.js, bars.js, neighborhoods.js
  lib/         scoring.js, filters.js, time.js, storage.js
  components/   (cards, chips, filter bar, etc.)
  views/       Onboarding.jsx, Matches.jsx, MatchDetail.jsx
  App.jsx, main.jsx, index.css
```
