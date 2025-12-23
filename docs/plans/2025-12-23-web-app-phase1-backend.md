# Phase 1 Backend Design - AstroSky Web API

## Overview

FastAPI backend wrapping existing `build_report()` function to expose sky data via REST API.

## Project Structure

```
api/
├── app/
│   ├── __init__.py
│   ├── main.py           # FastAPI app, CORS, lifespan
│   ├── config.py         # Settings via pydantic-settings
│   └── routers/
│       ├── __init__.py
│       ├── report.py     # /api/report endpoint
│       └── health.py     # /api/health endpoint
├── Dockerfile
└── requirements.txt
```

## API Endpoints

### GET /api/health

Health check for deployment monitoring.

```json
{"status": "ok", "version": "0.3.0"}
```

### GET /api/report

Main endpoint returning full sky report.

**Query parameters:**
- `lat` (required): Latitude, -90 to 90
- `lon` (required): Longitude, -180 to 180
- `date` (optional): ISO date string, defaults to today

**Response:** JSON matching `build_report()` output with proper datetime serialization.

## Configuration

Environment variables via pydantic-settings:
- `N2YO_API_KEY` - Optional, for ISS pass predictions
- `CORS_ORIGINS` - Comma-separated allowed origins (default: `http://localhost:5173`)
- `ENVIRONMENT` - development/production

## Dependencies

```
fastapi
uvicorn[standard]
pydantic-settings
-e ../  # Local skycli package
```

Installing skycli as editable dependency provides:
- Access to `build_report()` function
- Ephemeris file (`de421.bsp`) included
- All astronomy calculation code

## Dockerfile

```dockerfile
FROM python:3.12-slim

WORKDIR /app

COPY api/requirements.txt .
COPY src/ /app/src/
COPY pyproject.toml /app/

RUN pip install --no-cache-dir -r requirements.txt

COPY api/app /app/app

EXPOSE 8000
CMD ["uvicorn", "app.main:app", "--host", "0.0.0.0", "--port", "8000"]
```

## Decisions

- **No rate limiting** - Add later if needed
- **No caching** - Calculations fast enough (~100ms)
- **No separate deps.py** - Overkill for Phase 1
- **FastAPI defaults** for validation errors (422)
- **Graceful degradation** - ISS API failures return empty list (existing behavior)
