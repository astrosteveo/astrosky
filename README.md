# AstroSKY

See what's visible in the night sky tonight - as a web app or CLI tool.

<div align="center">

### **Try it now - no install required!**

[![Web App](https://img.shields.io/badge/Launch_Web_App-astrosky--beryl.vercel.app-7c3aed?style=for-the-badge&logo=vercel)](https://astrosky-beryl.vercel.app)

**Moon phases | Planets | ISS passes | Meteor showers | 110 deep sky objects**

*Automatically detects your location*

</div>

---

## Features

- **Moon phase** - Current phase, illumination, and rise/set times
- **Visible planets** - Which planets are up and where to look
- **ISS passes** - Upcoming International Space Station flyovers
- **Meteor showers** - Active showers and peak dates
- **Deep sky objects** - Complete Messier catalog (110 objects)
- **Astronomical events** - Conjunctions, oppositions, equinoxes, solstices

## Web App

Visit **[astrosky-beryl.vercel.app](https://astrosky-beryl.vercel.app)** or run locally:

```bash
# Start the API
cd api && pip install -r requirements.txt
uvicorn app.main:app --reload

# Start the frontend (in another terminal)
cd web && npm install && npm run dev
```

The web app automatically detects your location or accepts URL parameters:
```
https://astrosky-beryl.vercel.app/?lat=40.7128&lon=-74.0060
```

## CLI Installation

```bash
# With pip
pip install astrosky
astrosky tonight --lat 40.7128 --lon -74.0060

# Or run directly with uvx (no install needed)
uvx astrosky tonight --lat 40.7128 --lon -74.0060
```

## CLI Usage

### `astrosky tonight`

Show what's visible in the night sky.

```bash
# Using coordinates
astrosky tonight --lat 40.7128 --lon -74.0060

# Using a saved location
astrosky tonight -l home

# For a specific date
astrosky tonight --date 2025-01-15

# At a specific time
astrosky tonight --at 22:30

# Show only specific sections
astrosky tonight --only planets,moon

# Exclude sections
astrosky tonight --exclude iss,meteors

# JSON output
astrosky tonight --json
```

**Sections:** `moon`, `planets`, `iss`, `meteors`, `events`, `deepsky`

### `astrosky events`

Show upcoming astronomical events.

```bash
# Next 7 days (default)
astrosky events --lat 40.7128 --lon -74.0060

# Next 30 days
astrosky events --lat 40.7128 --lon -74.0060 --days 30

# Filter by event type
astrosky events --lat 40.7128 --lon -74.0060 --type conjunction

# JSON output
astrosky events --lat 40.7128 --lon -74.0060 --json
```

**Event types:** `moon`, `conjunction`, `opposition`, `seasonal`

### `astrosky location`

Manage saved observation locations.

```bash
# Add a location
astrosky location add home 40.7128 -74.0060

# Add and set as default
astrosky location add cabin 44.9778 -93.2650 --default

# List saved locations (* marks default)
astrosky location list

# Set default location
astrosky location set-default home

# Remove a location
astrosky location remove cabin
```

Locations are stored in `~/.config/astrosky/locations.json`.

## ISS Tracking

ISS pass predictions require a free API key from [N2YO](https://www.n2yo.com/api/):

```bash
export N2YO_API_KEY=your-api-key
astrosky tonight
```

Without the API key, ISS passes will be skipped (other features work fine).

## API

Build your own integrations with the public API:

```
https://astrosky-production.up.railway.app/api/report?lat=41.1359&lon=-95.9576
```

| Endpoint | Description |
|----------|-------------|
| `GET /api/report?lat=X&lon=Y` | Full sky report (moon, planets, ISS, meteors, DSOs, events) |
| `GET /api/report?lat=X&lon=Y&date=YYYY-MM-DD` | Report for a specific date |
| `GET /api/health` | Health check (`{"status": "ok"}`) |

Returns JSON with all astronomical data for the given location. Perfect for home automation, dashboards, Discord bots, or custom apps.

## Development

```bash
# Install CLI in dev mode
pip install -e ".[dev]"

# Run tests
pytest                     # Python (73 tests)
cd web && npm run test     # Frontend
```

## Acknowledgments

Special thanks to [Jesse Vincent](https://github.com/obra) for [Superpowers](https://github.com/superpowers-ai/superpowers) - the AI-powered development tools that made building this project a joy.

## License

MIT
