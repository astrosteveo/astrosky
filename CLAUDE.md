# CLAUDE.md

## Project Overview

AstroSky is a real-time astronomy observatory showing what's visible in the night sky. It's available as:
- **CLI tool** (`pip install astrosky`) - Terminal-based output
- **Web app** - React frontend + FastAPI backend with live updates

## Quick Commands

```bash
# CLI - Install and run
pip install -e ".[dev]"
astrosky tonight --lat 40.7128 --lon -74.0060

# API - Run locally
cd api && uvicorn app.main:app --reload

# Web - Run locally
cd web && npm install && npm run dev

# Tests
pytest                     # Python tests (73 tests)
cd web && npm run test     # Frontend tests (75 tests)
```

## Architecture

```
astrosky/
├── src/skycli/             # Core Python library (shared by CLI + API)
│   ├── cli.py              # Click CLI entry point
│   ├── report.py           # Orchestrates data sources
│   ├── display.py          # Rich terminal formatting
│   ├── locations.py        # Saved location management
│   └── sources/            # Independent data modules
│       ├── sun_moon.py     # Skyfield-based calculations
│       ├── planets.py      # Planet visibility
│       ├── iss.py          # N2YO API for ISS passes
│       ├── meteors.py      # Meteor shower data
│       ├── deep_sky.py     # Messier catalog (110 objects)
│       ├── events.py       # Astronomical events
│       └── weather.py      # Open-Meteo API for observing conditions
│
├── api/                    # FastAPI backend
│   ├── app/
│   │   ├── main.py         # FastAPI app + CORS
│   │   ├── config.py       # Environment config
│   │   └── routers/
│   │       ├── health.py   # GET /api/health
│   │       └── report.py   # GET /api/report
│   ├── Dockerfile          # Railway deployment
│   └── de421.bsp           # JPL ephemeris (copied for Docker)
│
└── web/                    # React frontend (Vite + Tailwind)
    └── src/
        ├── App.tsx         # Main app component
        ├── hooks/          # useGeolocation, useReport, useCurrentTime
        ├── lib/
        │   ├── api.ts      # API client
        │   └── timeUtils.ts # Time calculations & countdowns
        └── components/     # MoonCard, PlanetsCard, etc.
            ├── CurrentSkyStatus.tsx      # Live sky phase indicator
            ├── NextEvent.tsx             # Next event highlighter
            ├── LiveCountdowns.tsx        # Real-time countdowns
            ├── ObservingConditionsCard.tsx # Weather-based observing quality
            └── ObservationAnalytics.tsx  # User stats and insights
```

**Data flow:**
- CLI: `cli.py` -> `report.py` -> `sources/*` -> `display.py`
- Web: `frontend` -> `api/report.py` -> `skycli.report.build_report()`

## Key Patterns

- **TypedDicts** for all Python data structures
- **Pydantic models** in API for request/response validation
- **Graceful degradation** - API failures return empty data
- **Geolocation + URL params** - Frontend supports `?lat=X&lon=Y`
- **Real-time updates** - Live clock, countdowns, auto-refresh every 5 minutes
- **Time-based rendering** - Components adapt based on current time (day/twilight/night)

## Deployment

- **API** (Railway): `railway.toml` + `api/Dockerfile`
- **Frontend** (Vercel): `web/vercel.json`
- **CLI** (PyPI): `pyproject.toml` -> `pip install astrosky`

## Environment Variables

### API
- `CORS_ORIGINS_STR` - Comma-separated allowed origins
- `N2YO_API_KEY` - ISS pass predictions (optional)
- `ENVIRONMENT` - development/production

### Frontend
- `VITE_API_URL` - API base URL (defaults to localhost:8000)

## Data Files

- `de421.bsp` - JPL ephemeris (16.8 MB, required by Skyfield)
- `src/skycli/data/messier.json` - Messier catalog (110 DSOs)
- `src/skycli/data/showers.json` - Meteor shower data

## Testing

- **Python**: 73 tests, use `time-machine` for time-dependent tests
- **Frontend**: 150 tests, Vitest + Testing Library, fake timers for real-time components

## Roadmap Maintenance

**IMPORTANT:** The `ROADMAP.md` file must be kept up to date after each task:

1. When completing a feature or fix, move items from Backlog to "Recently Completed"
2. Add version numbers (e.g., v1.7) to completed batches
3. Mark technical debt items as complete with `[x]` and version reference
4. Add new ideas or discovered tasks to the appropriate priority section
5. Keep the "Recently Completed" section at the top, ordered by version (newest first)

## PWA & Service Worker

The web app is a Progressive Web App (PWA) with offline support.

**IMPORTANT:** When making frontend changes, you MUST increment the service worker cache version:

```javascript
// web/public/sw.js - line 4
const CACHE_VERSION = 'astrosky-v15';  // Increment this (v15 -> v16)
```

This ensures users get the latest version of the app. The service worker:
- Caches static assets for offline use
- Caches API responses for use at dark sky sites with no signal
- Automatically cleans up old cache versions on update

## Real-Time Features

The web app includes live, dynamically updating components:

- **Live Clock** - Updates every second in header
- **Current Sky Status** - Real-time banner showing day/twilight/night phase
- **Next Event Card** - Highlights next upcoming celestial event with countdown
- **Live Countdowns** - Real-time timers for sunrise, sunset, twilight, ISS passes, meteor peaks
- **Auto-Refresh** - Data silently refreshes every 5 minutes
- **Color-Coded Urgency** - Countdowns change color based on time remaining
  - Green (>1 hour), Yellow (<1 hour), Amber (<30 min), Red (<5 min)
