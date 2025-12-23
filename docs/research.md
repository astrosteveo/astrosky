# Research: AstroSky Codebase Exploration & Feature Proposals

**Date:** 2025-12-23 (Updated)
**Purpose:** Track implemented features and propose next steps

## Codebase Summary

### Architecture
- **Pattern:** Modular source architecture with data-driven catalogs
- **Stack:** Python 3.11+, Click CLI, Skyfield astronomy, Rich terminal formatting
- **Web:** FastAPI backend + React 19 frontend (Tailwind CSS)
- **Data flow:**
  - CLI: `cli.py` → `report.py` → `sources/*` → `display.py`
  - Web: `frontend` → `api/report.py` → `skycli.report.build_report()`

### Key Areas
| Directory | Purpose |
|-----------|---------|
| src/skycli/ | Core Python library (shared by CLI + API) |
| api/app/ | FastAPI backend with Pydantic models |
| web/src/ | React frontend with glassmorphic UI |
| src/skycli/sources/ | Independent data source modules |
| src/skycli/data/ | JSON catalogs (messier.json, showers.json) |

### Current Features
1. **Sun/Moon:** Sunrise, sunset, twilight times, moon phase, illumination, darkness quality
2. **Planets:** 7 planets with altitude, direction, rise/set times, descriptions
3. **ISS Passes:** N2YO API integration (requires API key)
4. **Meteor Showers:** 9 major showers with active periods, ZHR, peak detection
5. **Deep Sky Objects:** Full Messier catalog (110 objects) with equipment tips
6. **Astronomical Events:** Conjunctions, oppositions, moon phases, equinoxes/solstices
7. **Location Management:** Save, list, remove, set-default locations
8. **Output Formats:** Rich terminal, JSON, web UI
9. **Web App:** Geolocation support, URL params (`?lat=X&lon=Y`)

### Test Coverage
- 73 tests across 11 test files (Python)
- Frontend tests with Vitest + Testing Library
- Uses time-machine for freezing time in astronomical tests
- All external APIs are mocked

### Deployment
- **CLI:** PyPI (`pip install astrosky`)
- **API:** Railway (Dockerfile)
- **Frontend:** Vercel

---

## Completed Features (from original proposals)

### ~~1. Astronomical Events Calendar~~ DONE
- Created `src/skycli/sources/events.py` using astronomy-engine
- Calculates conjunctions, oppositions, moon phases, equinoxes/solstices
- Standalone `astrosky events` command with `--days` and `--type` filters
- Integrated into both CLI and web API

### ~~2. Expanded Deep Sky Catalog~~ DONE
- Expanded `messier.json` from 12 to full 110 objects
- Added equipment recommendations and observing tips
- Objects filtered by altitude (>15°) and sorted by visibility

### ~~3. Web Application~~ DONE
- FastAPI backend wrapping `skycli.report.build_report()`
- React 19 + Tailwind CSS frontend with glassmorphic cards
- Geolocation + URL parameter support
- Deployed on Railway (API) + Vercel (frontend)

---

## Feature Proposals (Next Steps)

### 1. Starlink/Satellite Pass Predictions

**What:** Extend ISS passes to include Starlink trains and other bright satellites

**Why:**
- Starlink trains are commonly spotted and asked about
- N2YO API already supports other satellites
- Would differentiate from basic astronomy apps

**Implementation approach:**
- Extend `src/skycli/sources/iss.py` or create `satellites.py`
- Add configurable NORAD IDs for popular satellites
- Include Starlink (recent launches), Hubble, Chinese Space Station

**Complexity:** Low-Medium

---

### 2. Observation Logging

**What:** Track what you've observed (`astrosky log "Saw M31 tonight"`)

**Why:**
- Users want to track their observing progress
- "What's new to me tonight?" filtering
- Common feature in AstroPlanner, SkyTools

**Implementation approach:**
- SQLite database in `~/.config/astrosky/observations.db`
- `astrosky log` command to record observations
- `astrosky history` to view past observations
- `--new-to-me` flag to filter DSOs not yet observed

**Complexity:** Medium

---

### 3. Light Pollution / Bortle Scale

**What:** Consider sky darkness in recommendations

**Why:**
- No point showing mag 10 objects if you're in a city
- Bortle scale is standard measure of sky quality
- Could integrate with light pollution maps API

**Implementation approach:**
- Add `--bortle N` flag (1-9 scale)
- Filter DSOs by observable magnitude for given Bortle
- Optional: integrate with lightpollutionmap.info API for auto-detection

**Complexity:** Low-Medium

---

### 4. Constellation Visibility

**What:** Show which constellations are currently visible

**Why:**
- Helps users orient themselves in the sky
- "Where do I look for Orion?" is a common question
- Foundation for star chart features

**Implementation approach:**
- Add constellation boundaries data
- Calculate which constellations are above horizon
- Show best viewing direction and altitude

**Complexity:** Medium

---

## Future Considerations

- Telescope/binocular equipment profiles
- Week/month planning calendar view
- Push notifications for events (web app)
- Offline PWA support
- Star chart visualization
- NGC/IC catalog expansion

## Sources
- [Astropy](https://www.astropy.org/)
- [Stellarium](https://stellarium.org/)
- [DSO Planner](https://dsoplanner.com/)
- [N2YO API](https://www.n2yo.com/api/)
- [Light Pollution Map](https://www.lightpollutionmap.info/)
