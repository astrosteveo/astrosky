# CLAUDE.md

## Project Overview

AstroSky shows what's visible in the night sky. It's available as:
- **CLI tool** (`pip install astrosky`) - Terminal-based output
- **Web app** - React frontend + FastAPI backend

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
cd web && npm run test     # Frontend tests
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
│       └── events.py       # Astronomical events
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
        ├── hooks/          # useGeolocation, useReport
        ├── lib/api.ts      # API client
        └── components/     # MoonCard, PlanetsCard, etc.
```

**Data flow:**
- CLI: `cli.py` -> `report.py` -> `sources/*` -> `display.py`
- Web: `frontend` -> `api/report.py` -> `skycli.report.build_report()`

## Key Patterns

- **TypedDicts** for all Python data structures
- **Pydantic models** in API for request/response validation
- **Graceful degradation** - API failures return empty data
- **Geolocation + URL params** - Frontend supports `?lat=X&lon=Y`

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
- **Frontend**: Vitest + Testing Library
