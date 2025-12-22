# SkyCLI Design

A Python CLI tool that shows what's visible in the night sky tonight.

## Overview

**Purpose:** Answer "What can I see tonight?" for stargazers and astronomy hobbyists.

**Core features:**
- Planets visible tonight with positions and best viewing times
- Moon phase, illumination, and impact on viewing conditions
- ISS and satellite passes with timing and directions
- Active meteor showers with peak dates and expected rates
- Special astronomical events (conjunctions, eclipses, etc.)
- Deep sky object recommendations based on visibility

## Command Interface

**Basic usage:**
```
skycli tonight --lat 40.7 --lon -74.0
```

**Optional filters:**
```
skycli tonight --lat 40.7 --lon -74.0 --only planets,moon
skycli tonight --lat 40.7 --lon -74.0 --exclude iss
```

**Time options:**
```
skycli tonight --lat 40.7 --lon -74.0              # defaults to now → sunrise
skycli tonight --lat 40.7 --lon -74.0 --at 22:00   # specific time
skycli tonight --lat 40.7 --lon -74.0 --date 2025-01-15  # future date
```

**Output control:**
```
skycli tonight ... --json          # machine-readable
skycli tonight ... --no-color      # for piping/logging
```

## Output Sections

1. **Header** - Date, location, sunset/sunrise times, darkness quality
2. **Moon** - Phase, illumination %, rise/set, impact on viewing
3. **Planets** - Which are visible, direction, elevation, best viewing time
4. **ISS & Satellites** - Upcoming visible passes with times and directions
5. **Meteor Showers** - Any active showers, peak dates, expected rate
6. **Special Events** - Conjunctions, eclipses, anything notable
7. **Deep Sky Picks** - 3-5 interesting objects visible tonight (with constellation)

## Example Output

```
┌─────────────────────────────────────────────────────────────┐
│  Tonight's Sky · Dec 22, 2025                               │
│  40.70°N, 74.00°W · Sunset 16:32 · Sunrise 07:18            │
│  New Moon (2%) · Excellent darkness                         │
└─────────────────────────────────────────────────────────────┘

PLANETS
  Venus      W   15°  Sets 18:45   Brilliant evening star
  Mars       E   42°  Rises 21:30  Good viewing after midnight
  Jupiter    SE  58°  Visible now  Best around 23:00
  Saturn     SW  25°  Sets 20:15   Catch it early

ISS PASSES
  18:42  3 min  Bright! SW → NE  Max 67°
  20:18  2 min  Moderate W → SE  Max 34°

METEOR SHOWERS
  Ursids · Active now · Peak Dec 22 · ~10/hour
    Look toward Ursa Minor after midnight

TONIGHT'S DEEP SKY PICKS
  M42  Orion Nebula      Orion     Mag 4.0  Naked eye!
  M45  Pleiades          Taurus    Mag 1.6  Stunning cluster
  M31  Andromeda Galaxy  Andromeda Mag 3.4  Use averted vision
```

## Data Sources

**Astronomical Calculations (via `skyfield` library):**
- Planet positions, rise/set times, visibility
- Moon phase, illumination, rise/set
- Sun position, twilight times (civil, nautical, astronomical)
- Deep sky object positions and visibility

**ISS & Satellites (online APIs):**
- Primary: N2YO.com API - free tier, good pass predictions
- Fallback: Calculate from TLE data via Celestrak if needed

**Meteor Showers (bundled + online):**
- Bundled: Static data for major annual showers with peak dates and ZHR
- Online enhancement: IMO for current activity levels

**Special Events (online):**
- in-the-sky.org or NASA APIs for upcoming events
- Conjunctions, eclipses, supermoons, occultations

**Deep Sky Objects (bundled):**
- Curated list of ~100 popular targets (Messier objects, bright NGCs)
- Stored locally with coordinates, magnitude, type, description

## Project Structure

```
skycli/
├── pyproject.toml          # Project config, dependencies, CLI entry point
├── src/
│   └── skycli/
│       ├── __init__.py
│       ├── cli.py          # Argument parsing, main entry point
│       ├── report.py       # Orchestrates all data and builds output
│       ├── display.py      # Rich terminal formatting
│       │
│       ├── sources/        # Data fetching, one module per category
│       │   ├── sun_moon.py    # Sunrise, sunset, twilight, moon phase
│       │   ├── planets.py     # Planet positions and visibility
│       │   ├── iss.py         # ISS and satellite passes (API calls)
│       │   ├── meteors.py     # Meteor shower data
│       │   ├── events.py      # Special astronomical events
│       │   └── deep_sky.py    # Deep sky object visibility
│       │
│       └── data/           # Bundled static data
│           ├── messier.json      # Messier catalog with coordinates
│           └── showers.json      # Annual meteor shower calendar
│
└── tests/
    └── ...
```

## Dependencies

- `skyfield` - Astronomical calculations
- `rich` - Terminal formatting
- `httpx` - API requests
- `click` - CLI argument parsing

## Error Handling

**Network failures:**
- If an API is unreachable, show what we can (planets, moon always work offline)
- Display warning but continue with other sections
- Each section fails independently

**Location validation:**
- Latitude must be -90 to 90, longitude -180 to 180
- Clear error messages for invalid input

**Time edge cases:**
- "Tonight" means from now until next sunrise
- If run during daytime, show tonight's forecast starting from sunset
- Handle polar regions (midnight sun / polar night) gracefully

**Nothing visible:**
- Show brief note rather than empty section
- e.g., `No visible ISS passes tonight`

**Rate limiting:**
- Cache API responses for 15 minutes
- Store in temp directory, keyed by location + date

## Testing Strategy

**Unit tests:**
- Astronomical calculations with known dates/locations
- Moon phase calculation for specific dates
- Visibility filtering logic
- CLI argument parsing and validation
- Output formatting with mock data

**Integration tests:**
- Full report generation with real API calls (marked as slow)
- Verify API response parsing

**Test fixtures:**
- Freeze time to known dates for reproducible positions
- Mock API responses with recorded real data
- Test locations: NYC, Sydney, Svalbard (polar)

**Manual testing checklist:**
- Run on new moon vs full moon
- Run during day vs night
- Run with `--only` and `--exclude` filters
- Run with bad coordinates
- Run with no network
