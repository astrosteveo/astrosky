# Research: AstroSky Codebase Exploration & Feature Proposals

**Date:** 2025-12-23
**Purpose:** Explore codebase and propose 2-3 next features

## Codebase Summary

### Architecture
- **Pattern:** Modular source architecture with data-driven catalogs
- **Stack:** Python 3.11+, Click CLI, Skyfield astronomy, Rich terminal formatting
- **Data flow:** CLI → report.py (orchestration) → sources/* → display.py

### Key Areas
| Directory | Purpose |
|-----------|---------|
| src/skycli/cli.py | Click command definitions, coordinate validation |
| src/skycli/report.py | Orchestrates all data sources into unified report |
| src/skycli/display.py | Rich terminal formatting, JSON output |
| src/skycli/locations.py | ~/.config/astrosky/locations.json management |
| src/skycli/sources/ | Independent data source modules |
| src/skycli/data/ | JSON catalogs (messier.json, showers.json) |

### Existing Patterns
- **TypedDicts** for all data structures (SunTimes, MoonInfo, PlanetInfo, etc.)
- **Graceful degradation** - API failures return empty data, not exceptions
- **Section filtering** via `--only` and `--exclude` flags
- **Ephemeris caching** - de421.bsp loaded once, shared across modules
- **Data-driven catalogs** - Messier objects (12) and meteor showers (9) from JSON

### Current Features
1. **Sun/Moon:** Sunrise, sunset, twilight times, moon phase, illumination, darkness quality
2. **Planets:** 7 planets with altitude, direction, rise/set times, descriptions
3. **ISS Passes:** N2YO API integration (requires API key)
4. **Meteor Showers:** 9 major showers with active periods, ZHR, peak detection
5. **Deep Sky Objects:** 12 Messier objects filtered by altitude
6. **Location Management:** Save, list, remove, set-default locations
7. **Output Formats:** Rich terminal output, JSON, no-color mode

### Test Coverage
- 68 tests across 10 test files
- Uses time-machine for freezing time in astronomical tests
- All external APIs are mocked

## External Research

### Current Best Practices (from similar tools)
- **DSO Planner:** Uses "Best Time" sorting that prioritizes objects about to set
- **AstroPlanner:** Observation planning, logging, telescope control
- **SkyTools:** Fully accounts for telescope equipment and sky conditions
- **Stellarium:** 13 different constellation cultures, scripting support, plugins

### Relevant Features in Similar Apps
| Feature | Found In | Notes |
|---------|----------|-------|
| Best viewing time calculations | DSO Planner, SkyTools | Sort by optimal observation window |
| Constellation identification | Stellarium, NightShift | Current constellations visible |
| Astronomical events calendar | Stellarium Mobile, NightShift | Eclipses, conjunctions, oppositions |
| Bortle scale / light pollution | DSO Planner | Sky quality assessment |
| Observation logging | AstroPlanner, SkyTools | Record what you've observed |

### Gaps in Current AstroSky
1. No astronomical events (eclipses, conjunctions, planetary oppositions)
2. No constellation visibility information
3. No "best viewing time" optimization for objects
4. No observation logging/history
5. Limited DSO catalog (only 12 Messier objects)
6. No light pollution/Bortle scale consideration

## Feature Proposals

### 1. Astronomical Events Calendar (`--events` / new `events` command)

**What:** Show upcoming astronomical events (conjunctions, oppositions, eclipses, equinoxes/solstices)

**Why:**
- The `events` section exists in SECTION_MAP but returns empty array
- Users want to know about special events worth observing
- Similar tools (Stellarium Mobile, NightShift) include this as a core feature

**Implementation approach:**
- Create `src/skycli/sources/events.py`
- Use Skyfield to calculate:
  - Planetary conjunctions (planets within 5° of each other or Moon)
  - Oppositions (outer planets opposite to Sun)
  - Solstices and equinoxes
  - Lunar/solar eclipses (visible from location)
- Add `events.json` data file for recurring annual events
- Integrate into report.py and display.py

**Complexity:** Medium - Skyfield can calculate most of this

---

### 2. Starlink/Satellite Pass Predictions

**What:** Extend ISS passes to include Starlink trains and other bright satellites

**Why:**
- Starlink trains are now one of the most commonly spotted "UFOs"
- Users often ask "what was that bright moving light?"
- N2YO API or Celestrak TLE data can provide this

**Implementation approach:**
- Extend `src/skycli/sources/iss.py` to `satellites.py`
- Add support for configurable NORAD IDs
- Include Starlink (recent launches), Hubble, bright satellites
- New `--satellites` section or extend ISS section

**Complexity:** Low-Medium - Similar pattern to existing ISS code

---

### 3. Expanded Deep Sky Catalog with Filtering

**What:** Expand from 12 to 110 Messier objects (full catalog) plus filtering options

**Why:**
- Current catalog is very limited (12 objects)
- Full Messier catalog is a standard amateur astronomy target list
- Users need filtering by object type (galaxy, nebula, cluster)
- Ability to show only "new to me" objects (observation tracking)

**Implementation approach:**
- Expand `messier.json` to full 110 objects
- Add filtering flags: `--dso-type galaxy|nebula|cluster`
- Add `--dso-limit N` to control output length
- Optional: Add NGC/IC objects from open datasets

**Complexity:** Low - Mostly data entry and simple filtering

---

## Recommendations

### Immediate (Good first features)
1. **Astronomical Events** - Complete the existing empty `events` section
2. **Expanded DSO Catalog** - Quick win, adds significant value

### Future Considerations
- Observation logging (`astrosky log "Saw M31 tonight"`)
- Light pollution/Bortle scale awareness
- Telescope/binocular equipment profiles
- Constellation visibility section
- Week/month planning view

## Sources
- [Astropy](https://www.astropy.org/)
- [Stellarium](https://stellarium.org/)
- [DSO Planner](https://dsoplanner.com/)
- [AstroPlanner](https://www.astroplanner.net/)
- [SkyTools](https://skyhound.com/skytools.html)
- [Night Sky Planner - JPL](https://nightsky.jpl.nasa.gov/planner/)
- [Sky & Telescope Observing](https://skyandtelescope.org/observing/)
