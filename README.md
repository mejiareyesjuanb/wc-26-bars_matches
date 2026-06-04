# Seattle World Cup 2026 Bar Finder

A minimalist, responsive web app that ranks the best Seattle venues to watch any
FIFA World Cup 2026 match, based on your neighborhoods and venue preferences.

**🔴 Live demo: https://wc-26-bars-matches.onrender.com**

Browse all 104 World Cup 2026 matches (Pacific time), then pick your neighborhoods
on the **Bars** tab to see the sports bars — and venues confirmed showing the
World Cup — ranked across (or within) your neighborhoods.

## Run it

```bash
npm install
npm run dev      # start the dev server (http://localhost:5173)
npm run build    # production build to dist/
npm test         # run the unit tests
```

## How it works

Two tabs:

1. **Matches** — browse all 104 World Cup matches; filter by team, date, stage,
   or time of day (morning / afternoon / evening). All kickoff times are in
   **Pacific time** — what's on your clock in Seattle.
2. **Bars** — first choose up to 5 preferred neighborhoods (required), then see
   the best bars to watch the World Cup **grouped by neighborhood**, ranked
   best-first, as a list or on a map. Tap a venue for its score breakdown and an
   "Open in Google Maps" link.

Bar recommendations are independent of any single match — this is the go-to app
for a fan who wants to find where to watch in Seattle. Preferences (neighborhoods)
are saved to `localStorage`.

## Data

The full 104-match schedule is **real**: the actual 2026 group draw (Dec 5
2025), dates, venues, and kickoff times, converted from the published UK times to
Pacific (PT = UK − 8h). Group-stage matches show real teams; knockout matches
show the real bracket slots (e.g. "Group G winner", "Winner M82") since those
teams depend on results. Seattle hosts six matches at Lumen Field (four group,
one Round of 32, one Round of 16). The Seattle venue list and fan-affinity tags
are curated demo data.

## Ranking model

Each venue is scored 0–100 per match as a weighted sum (`src/lib/scoring.js`):

| Factor | Weight |
|---|---|
| Showing the World Cup (website-confirmed counts most) | 40 |
| Screens / projector | 25 |
| In one of your preferred neighborhoods | 20 |
| Ratings & reviews | 15 |

The dominant signal is whether the venue is actually showing the World Cup. The
server checks the top candidates' own websites; a confirmed match-viewing venue
gets the full World Cup weight and rises to the top (this is how, e.g., the
Kangaroo & Kiwi Pub in Ballard surfaces as #1).

Plus a complementary **stadium-proximity ambiance bonus** (up to +10, capped):
only when the match is actually played in Seattle, bars near Lumen Field
(Pioneer Square, Downtown, Georgetown…) earn a small boost for the matchday
buzz. It nudges the ranking rather than driving it.

## Structure

- `src/data/` — seeded teams, neighborhoods, 104-match schedule, ~22 curated
  Seattle venues. Real Lumen Field fixtures use accurate dates/times; remaining
  bracket and venue details are representative demo data.
- `src/lib/` — pure logic (scoring, filters, time bucketing, storage), unit-tested.
- `src/components/`, `src/views/` — UI.

Design and implementation notes live in `docs/superpowers/`.
