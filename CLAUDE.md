# CLAUDE.md

## Project Overview

AstroSky is a command-line tool that provides real-time information about what's visible in the night sky at a specific location and time. It displays moon phase, visible planets, ISS passes, meteor showers, deep sky objects, and upcoming astronomical events.

## Quick Commands

```bash
# Install dependencies
pip install -e ".[dev]"

# Run tests
pytest

# Run CLI
astrosky tonight --lat 40.7128 --lon -74.0060
astrosky tonight -l <saved-location>
astrosky events --lat 40.7128 --lon -74.0060 --days 14
```

## Architecture

```
src/skycli/
├── cli.py          # Click CLI entry point, command definitions
├── report.py       # Orchestrates data sources into unified report
├── display.py      # Rich terminal formatting
├── locations.py    # ~/.config/astrosky/locations.json management
└── sources/        # Independent data source modules
    ├── sun_moon.py # Skyfield-based sun/moon calculations
    ├── planets.py  # Planet visibility and positions
    ├── iss.py      # N2YO API for ISS pass predictions
    ├── meteors.py  # Data-driven from showers.json
    ├── deep_sky.py # Data-driven from messier.json
    └── events.py   # Astronomical events (astronomy-engine)
```

**Data flow:** CLI -> report.py (orchestration) -> sources/* -> display.py

## Key Patterns

- **TypedDicts** for all data structures (`SunTimes`, `MoonInfo`, `PlanetInfo`, etc.)
- **Graceful degradation** - API failures return empty data, not exceptions
- **Section filtering** via `--only` and `--exclude` flags
- **Time handling** - All times in UTC with timezone-aware datetime objects
- **Coordinate validation** - Custom Click parameter types for lat/lon

## Testing

- 73 tests across 11 test files
- Use `time-machine` for freezing time in astronomical tests
- Use `Click.testing.CliRunner` for CLI integration tests
- Monkeypatch `CONFIG_DIR` for location storage tests
- All external APIs are mocked

## Environment Variables

- `N2YO_API_KEY` - Required for ISS pass predictions (optional feature)

## Data Files

- `de421.bsp` - JPL ephemeris (16.8 MB, pre-downloaded, do not delete)
- `src/skycli/data/messier.json` - Complete Messier catalog (110 objects with coordinates, magnitudes, sizes, equipment recommendations, and observing tips)
- `src/skycli/data/showers.json` - Meteor shower data
