# SkyCLI

A command-line tool that shows you what's visible in the night sky tonight.

## Features

- **Moon phase** - Current phase, illumination, and rise/set times
- **Visible planets** - Which planets are up and where to look
- **ISS passes** - Upcoming International Space Station flyovers for your location
- **Meteor showers** - Active showers and peak dates
- **Deep sky objects** - Visible Messier objects (galaxies, nebulae, clusters)

## Installation

```bash
# With pip
pip install skycli

# Or run directly with uvx
uvx skycli tonight --lat 40.7128 --lon -74.0060
```

## Quick Start

```bash
# Check the sky for a specific location
skycli tonight --lat 40.7128 --lon -74.0060

# Save a location for easy reuse
skycli location add home 40.7128 -74.0060 --default

# Now just run
skycli tonight
```

## Commands

### `skycli tonight`

Show what's visible in the night sky.

```bash
# Using coordinates
skycli tonight --lat 40.7128 --lon -74.0060

# Using a saved location
skycli tonight -l home

# For a specific date
skycli tonight --date 2025-01-15

# At a specific time
skycli tonight --at 22:30

# Show only specific sections
skycli tonight --only planets,moon

# Exclude sections
skycli tonight --exclude iss,meteors

# JSON output
skycli tonight --json
```

**Sections:** `moon`, `planets`, `iss`, `meteors`, `events`, `deepsky`

### `skycli location`

Manage saved observation locations.

```bash
# Add a location
skycli location add home 40.7128 -74.0060

# Add and set as default
skycli location add cabin 44.9778 -93.2650 --default

# List saved locations (* marks default)
skycli location list

# Set default location
skycli location set-default home

# Remove a location
skycli location remove cabin
```

Locations are stored in `~/.config/skycli/locations.json`.

## ISS Tracking

ISS pass predictions require a free API key from [N2YO](https://www.n2yo.com/api/):

```bash
export N2YO_API_KEY=your-api-key
skycli tonight
```

Without the API key, ISS passes will be skipped (other features work fine).

## License

MIT
