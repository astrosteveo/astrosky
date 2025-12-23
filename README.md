# AstroSKY

A command-line tool that shows you what's visible in the night sky tonight.

## Features

- **Moon phase** - Current phase, illumination, and rise/set times
- **Visible planets** - Which planets are up and where to look
- **ISS passes** - Upcoming International Space Station flyovers for your location
- **Meteor showers** - Active showers and peak dates
- **Deep sky objects** - Complete Messier catalog (110 objects) with equipment recommendations and observing tips
- **Astronomical events** - Conjunctions, oppositions, moon phases, equinoxes, and solstices

## Installation

```bash
# With pip
pip install astrosky
astrosky tonight --lat 40.7128 --lon -74.0060

# Or run directly with uvx (no install needed)
uvx astrosky tonight --lat 40.7128 --lon -74.0060
```

## Quick Start

```bash
# Check the sky for a specific location
astrosky tonight --lat 40.7128 --lon -74.0060

# Save a location for easy reuse
astrosky location add home 40.7128 -74.0060 --default

# Now just run
astrosky tonight
```

## Commands

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
astrosky events --lat 40.7128 --lon -74.0060 --type moon
astrosky events --lat 40.7128 --lon -74.0060 --type conjunction

# JSON output
astrosky events --lat 40.7128 --lon -74.0060 --json
```

**Event types:** `moon` (full/new moon), `conjunction`, `opposition`, `seasonal` (equinoxes/solstices)

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

## License

MIT
