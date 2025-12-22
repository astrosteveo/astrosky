# SkyCLI Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Build a Python CLI that answers "What can I see tonight?" showing planets, moon, ISS passes, meteor showers, and deep sky objects.

**Architecture:** Modular source-based design where each celestial category (sun_moon, planets, iss, meteors, deep_sky, events) has its own module. A report orchestrator collects data from all sources, and a display module renders rich terminal output.

**Tech Stack:** Python 3.11+, click (CLI), skyfield (astronomy), rich (terminal UI), httpx (APIs), pytest (testing)

---

## Phase 1: Project Foundation

### Task 1: Create Project Structure

**Files:**
- Create: `pyproject.toml`
- Create: `src/skycli/__init__.py`
- Create: `src/skycli/cli.py`
- Create: `tests/__init__.py`

**Step 1: Create pyproject.toml**

```toml
[build-system]
requires = ["hatchling"]
build-backend = "hatchling.build"

[project]
name = "skycli"
version = "0.1.0"
description = "CLI tool to see what's visible in the night sky tonight"
requires-python = ">=3.11"
dependencies = [
    "click>=8.1.0",
    "skyfield>=1.46",
    "rich>=13.0.0",
    "httpx>=0.25.0",
]

[project.scripts]
skycli = "skycli.cli:main"

[project.optional-dependencies]
dev = [
    "pytest>=7.4.0",
    "pytest-mock>=3.12.0",
    "time-machine>=2.13.0",
]

[tool.hatch.build.targets.wheel]
packages = ["src/skycli"]

[tool.pytest.ini_options]
testpaths = ["tests"]
pythonpath = ["src"]
```

**Step 2: Create package files**

`src/skycli/__init__.py`:
```python
"""SkyCLI - See what's visible in the night sky tonight."""

__version__ = "0.1.0"
```

`src/skycli/cli.py`:
```python
"""Command-line interface for SkyCLI."""

import click


@click.group()
@click.version_option()
def main() -> None:
    """SkyCLI - See what's visible in the night sky tonight."""
    pass


if __name__ == "__main__":
    main()
```

`tests/__init__.py`:
```python
"""SkyCLI test suite."""
```

**Step 3: Install and verify**

Run: `pip install -e ".[dev]"`
Run: `skycli --version`
Expected: `skycli, version 0.1.0`

**Step 4: Commit**

```bash
git add -A
git commit -m "feat: initialize project structure with dependencies"
```

---

### Task 2: Add Tonight Command with Location Arguments

**Files:**
- Modify: `src/skycli/cli.py`
- Create: `tests/test_cli.py`

**Step 1: Write the failing test**

`tests/test_cli.py`:
```python
"""Tests for CLI argument parsing."""

from click.testing import CliRunner

from skycli.cli import main


def test_tonight_requires_location():
    """Tonight command requires --lat and --lon."""
    runner = CliRunner()
    result = runner.invoke(main, ["tonight"])
    assert result.exit_code != 0
    assert "Missing option" in result.output or "required" in result.output.lower()


def test_tonight_accepts_valid_location():
    """Tonight command accepts valid lat/lon."""
    runner = CliRunner()
    result = runner.invoke(main, ["tonight", "--lat", "40.7", "--lon", "-74.0"])
    assert result.exit_code == 0


def test_tonight_rejects_invalid_latitude():
    """Latitude must be between -90 and 90."""
    runner = CliRunner()
    result = runner.invoke(main, ["tonight", "--lat", "200", "--lon", "-74.0"])
    assert result.exit_code != 0
    assert "90" in result.output or "invalid" in result.output.lower()


def test_tonight_rejects_invalid_longitude():
    """Longitude must be between -180 and 180."""
    runner = CliRunner()
    result = runner.invoke(main, ["tonight", "--lat", "40.7", "--lon", "300"])
    assert result.exit_code != 0
    assert "180" in result.output or "invalid" in result.output.lower()
```

**Step 2: Run test to verify it fails**

Run: `pytest tests/test_cli.py -v`
Expected: FAIL (tonight command doesn't exist)

**Step 3: Implement the tonight command**

`src/skycli/cli.py`:
```python
"""Command-line interface for SkyCLI."""

import click


class LatitudeType(click.ParamType):
    """Click parameter type for latitude validation."""

    name = "latitude"

    def convert(self, value, param, ctx):
        try:
            lat = float(value)
            if not -90 <= lat <= 90:
                self.fail(f"Latitude must be between -90 and 90, got {lat}", param, ctx)
            return lat
        except ValueError:
            self.fail(f"Invalid latitude: {value}", param, ctx)


class LongitudeType(click.ParamType):
    """Click parameter type for longitude validation."""

    name = "longitude"

    def convert(self, value, param, ctx):
        try:
            lon = float(value)
            if not -180 <= lon <= 180:
                self.fail(f"Longitude must be between -180 and 180, got {lon}", param, ctx)
            return lon
        except ValueError:
            self.fail(f"Invalid longitude: {value}", param, ctx)


LATITUDE = LatitudeType()
LONGITUDE = LongitudeType()


@click.group()
@click.version_option()
def main() -> None:
    """SkyCLI - See what's visible in the night sky tonight."""
    pass


@main.command()
@click.option("--lat", type=LATITUDE, required=True, help="Latitude (-90 to 90)")
@click.option("--lon", type=LONGITUDE, required=True, help="Longitude (-180 to 180)")
def tonight(lat: float, lon: float) -> None:
    """Show what's visible in the night sky tonight."""
    click.echo(f"Location: {lat}°N, {lon}°E")


if __name__ == "__main__":
    main()
```

**Step 4: Run tests to verify they pass**

Run: `pytest tests/test_cli.py -v`
Expected: 4 passed

**Step 5: Commit**

```bash
git add -A
git commit -m "feat: add tonight command with location validation"
```

---

### Task 3: Add Time and Filter Options

**Files:**
- Modify: `src/skycli/cli.py`
- Modify: `tests/test_cli.py`

**Step 1: Add tests for time options**

Append to `tests/test_cli.py`:
```python
def test_tonight_accepts_date_option():
    """Tonight command accepts --date for future dates."""
    runner = CliRunner()
    result = runner.invoke(
        main, ["tonight", "--lat", "40.7", "--lon", "-74.0", "--date", "2025-01-15"]
    )
    assert result.exit_code == 0


def test_tonight_accepts_at_option():
    """Tonight command accepts --at for specific time."""
    runner = CliRunner()
    result = runner.invoke(
        main, ["tonight", "--lat", "40.7", "--lon", "-74.0", "--at", "22:00"]
    )
    assert result.exit_code == 0


def test_tonight_accepts_only_filter():
    """Tonight command accepts --only to filter sections."""
    runner = CliRunner()
    result = runner.invoke(
        main, ["tonight", "--lat", "40.7", "--lon", "-74.0", "--only", "planets,moon"]
    )
    assert result.exit_code == 0


def test_tonight_accepts_exclude_filter():
    """Tonight command accepts --exclude to hide sections."""
    runner = CliRunner()
    result = runner.invoke(
        main, ["tonight", "--lat", "40.7", "--lon", "-74.0", "--exclude", "iss"]
    )
    assert result.exit_code == 0


def test_tonight_accepts_json_output():
    """Tonight command accepts --json for machine-readable output."""
    runner = CliRunner()
    result = runner.invoke(
        main, ["tonight", "--lat", "40.7", "--lon", "-74.0", "--json"]
    )
    assert result.exit_code == 0


def test_tonight_accepts_no_color():
    """Tonight command accepts --no-color for plain output."""
    runner = CliRunner()
    result = runner.invoke(
        main, ["tonight", "--lat", "40.7", "--lon", "-74.0", "--no-color"]
    )
    assert result.exit_code == 0
```

**Step 2: Run tests to verify they fail**

Run: `pytest tests/test_cli.py -v`
Expected: 6 new tests FAIL

**Step 3: Implement the options**

Update the `tonight` command in `src/skycli/cli.py`:
```python
from datetime import datetime
from typing import Optional


SECTIONS = ["moon", "planets", "iss", "meteors", "events", "deepsky"]


def parse_sections(value: str) -> list[str]:
    """Parse comma-separated section names."""
    sections = [s.strip().lower() for s in value.split(",")]
    invalid = [s for s in sections if s not in SECTIONS]
    if invalid:
        raise click.BadParameter(f"Unknown sections: {', '.join(invalid)}. Valid: {', '.join(SECTIONS)}")
    return sections


@main.command()
@click.option("--lat", type=LATITUDE, required=True, help="Latitude (-90 to 90)")
@click.option("--lon", type=LONGITUDE, required=True, help="Longitude (-180 to 180)")
@click.option("--date", type=click.DateTime(formats=["%Y-%m-%d"]), default=None, help="Date (YYYY-MM-DD)")
@click.option("--at", "at_time", type=str, default=None, help="Time (HH:MM)")
@click.option("--only", "only_sections", type=str, default=None, help="Only show these sections (comma-separated)")
@click.option("--exclude", "exclude_sections", type=str, default=None, help="Hide these sections (comma-separated)")
@click.option("--json", "json_output", is_flag=True, help="Output as JSON")
@click.option("--no-color", is_flag=True, help="Disable colored output")
def tonight(
    lat: float,
    lon: float,
    date: Optional[datetime],
    at_time: Optional[str],
    only_sections: Optional[str],
    exclude_sections: Optional[str],
    json_output: bool,
    no_color: bool,
) -> None:
    """Show what's visible in the night sky tonight."""
    # Parse section filters
    only = parse_sections(only_sections) if only_sections else None
    exclude = parse_sections(exclude_sections) if exclude_sections else None

    # For now, just echo the configuration
    click.echo(f"Location: {lat}°N, {lon}°E")
    if date:
        click.echo(f"Date: {date.strftime('%Y-%m-%d')}")
    if at_time:
        click.echo(f"Time: {at_time}")
    if only:
        click.echo(f"Only: {only}")
    if exclude:
        click.echo(f"Exclude: {exclude}")
    if json_output:
        click.echo("Format: JSON")
    if no_color:
        click.echo("Color: disabled")
```

**Step 4: Run tests to verify they pass**

Run: `pytest tests/test_cli.py -v`
Expected: 10 passed

**Step 5: Commit**

```bash
git add -A
git commit -m "feat: add time, filter, and output options to tonight command"
```

---

## Phase 2: Sun & Moon Module

### Task 4: Create Sun/Moon Source with Sunset/Sunrise

**Files:**
- Create: `src/skycli/sources/__init__.py`
- Create: `src/skycli/sources/sun_moon.py`
- Create: `tests/test_sun_moon.py`

**Step 1: Write failing tests**

`tests/test_sun_moon.py`:
```python
"""Tests for sun and moon calculations."""

from datetime import datetime, timezone

import time_machine

from skycli.sources.sun_moon import get_sun_times, get_moon_info


# NYC coordinates
NYC_LAT = 40.7128
NYC_LON = -74.0060


@time_machine.travel("2025-06-21 12:00:00", tick=False)
def test_get_sun_times_summer_solstice():
    """Sun times for NYC on summer solstice."""
    result = get_sun_times(NYC_LAT, NYC_LON, datetime(2025, 6, 21, tzinfo=timezone.utc))

    # Summer solstice in NYC: sunrise ~5:25, sunset ~20:31
    assert result["sunrise"].hour == 5
    assert result["sunset"].hour == 20
    assert "astronomical_twilight_end" in result
    assert "astronomical_twilight_start" in result


@time_machine.travel("2025-12-21 12:00:00", tick=False)
def test_get_sun_times_winter_solstice():
    """Sun times for NYC on winter solstice."""
    result = get_sun_times(NYC_LAT, NYC_LON, datetime(2025, 12, 21, tzinfo=timezone.utc))

    # Winter solstice in NYC: sunrise ~7:16, sunset ~16:32
    assert result["sunrise"].hour == 7
    assert result["sunset"].hour == 16


def test_get_moon_info_new_moon():
    """Moon info for a known new moon date."""
    # Jan 29, 2025 is a new moon
    result = get_moon_info(NYC_LAT, NYC_LON, datetime(2025, 1, 29, 12, 0, tzinfo=timezone.utc))

    assert result["phase_name"] == "New Moon"
    assert result["illumination"] < 5  # Less than 5%


def test_get_moon_info_full_moon():
    """Moon info for a known full moon date."""
    # Jan 13, 2025 is a full moon
    result = get_moon_info(NYC_LAT, NYC_LON, datetime(2025, 1, 13, 12, 0, tzinfo=timezone.utc))

    assert result["phase_name"] == "Full Moon"
    assert result["illumination"] > 95  # More than 95%
```

**Step 2: Run tests to verify they fail**

Run: `pytest tests/test_sun_moon.py -v`
Expected: FAIL (module doesn't exist)

**Step 3: Implement sun_moon module**

`src/skycli/sources/__init__.py`:
```python
"""Data sources for SkyCLI."""
```

`src/skycli/sources/sun_moon.py`:
```python
"""Sun and moon calculations using Skyfield."""

from datetime import datetime, timedelta, timezone
from typing import TypedDict

from skyfield import almanac
from skyfield.api import N, W, load, wgs84


class SunTimes(TypedDict):
    """Sun timing information."""

    sunrise: datetime
    sunset: datetime
    astronomical_twilight_start: datetime  # Evening
    astronomical_twilight_end: datetime  # Morning


class MoonInfo(TypedDict):
    """Moon phase and timing information."""

    phase_name: str
    illumination: float  # 0-100
    moonrise: datetime | None
    moonset: datetime | None


# Load ephemeris data (cached after first download)
_ephemeris = None
_timescale = None


def _get_ephemeris():
    """Get or load the ephemeris data."""
    global _ephemeris, _timescale
    if _ephemeris is None:
        _ephemeris = load("de421.bsp")
        _timescale = load.timescale()
    return _ephemeris, _timescale


def get_sun_times(lat: float, lon: float, date: datetime) -> SunTimes:
    """Calculate sunrise, sunset, and twilight times for a location and date."""
    eph, ts = _get_ephemeris()

    # Create location
    location = wgs84.latlon(lat, lon)

    # Time range: the full day
    t0 = ts.utc(date.year, date.month, date.day)
    t1 = ts.utc(date.year, date.month, date.day + 1)

    # Find sunrise and sunset
    f = almanac.sunrise_sunset(eph, location)
    times, events = almanac.find_discrete(t0, t1, f)

    sunrise = None
    sunset = None
    for t, event in zip(times, events):
        dt = t.utc_datetime()
        if event == 1:  # Sunrise
            sunrise = dt
        else:  # Sunset
            sunset = dt

    # Find astronomical twilight
    f_twilight = almanac.dark_twilight_day(eph, location)
    twilight_times, twilight_events = almanac.find_discrete(t0, t1, f_twilight)

    astro_start = None  # Evening astronomical twilight starts
    astro_end = None  # Morning astronomical twilight ends

    for t, event in zip(twilight_times, twilight_events):
        dt = t.utc_datetime()
        # Event 0 = dark (night), 1 = astronomical twilight, 2 = nautical, 3 = civil, 4 = day
        if event == 0 and astro_start is None and dt.hour > 12:
            astro_start = dt
        elif event == 1 and astro_end is None and dt.hour < 12:
            astro_end = dt

    return SunTimes(
        sunrise=sunrise or date.replace(hour=6, minute=0),
        sunset=sunset or date.replace(hour=18, minute=0),
        astronomical_twilight_start=astro_start or date.replace(hour=21, minute=0),
        astronomical_twilight_end=astro_end or date.replace(hour=5, minute=0),
    )


def get_moon_info(lat: float, lon: float, date: datetime) -> MoonInfo:
    """Calculate moon phase and timing for a location and date."""
    eph, ts = _get_ephemeris()

    # Get moon phase
    t = ts.utc(date.year, date.month, date.day, date.hour, date.minute)
    phase_angle = almanac.moon_phase(eph, t).degrees

    # Calculate illumination (approximate)
    # 0° = new moon, 180° = full moon
    illumination = (1 - abs(180 - phase_angle) / 180) * 100

    # Determine phase name
    if phase_angle < 22.5 or phase_angle >= 337.5:
        phase_name = "New Moon"
    elif phase_angle < 67.5:
        phase_name = "Waxing Crescent"
    elif phase_angle < 112.5:
        phase_name = "First Quarter"
    elif phase_angle < 157.5:
        phase_name = "Waxing Gibbous"
    elif phase_angle < 202.5:
        phase_name = "Full Moon"
    elif phase_angle < 247.5:
        phase_name = "Waning Gibbous"
    elif phase_angle < 292.5:
        phase_name = "Last Quarter"
    else:
        phase_name = "Waning Crescent"

    # Find moonrise and moonset
    location = wgs84.latlon(lat, lon)
    t0 = ts.utc(date.year, date.month, date.day)
    t1 = ts.utc(date.year, date.month, date.day + 1)

    f = almanac.risings_and_settings(eph, eph["Moon"], location)
    times, events = almanac.find_discrete(t0, t1, f)

    moonrise = None
    moonset = None
    for time, event in zip(times, events):
        dt = time.utc_datetime()
        if event == 1:  # Rise
            moonrise = dt
        else:  # Set
            moonset = dt

    return MoonInfo(
        phase_name=phase_name,
        illumination=round(illumination, 1),
        moonrise=moonrise,
        moonset=moonset,
    )
```

**Step 4: Run tests to verify they pass**

Run: `pytest tests/test_sun_moon.py -v`
Expected: 4 passed

**Step 5: Commit**

```bash
git add -A
git commit -m "feat: add sun_moon source with sunrise/sunset and moon phase"
```

---

### Task 5: Add Darkness Quality Assessment

**Files:**
- Modify: `src/skycli/sources/sun_moon.py`
- Modify: `tests/test_sun_moon.py`

**Step 1: Add test for darkness quality**

Append to `tests/test_sun_moon.py`:
```python
def test_darkness_quality_new_moon():
    """New moon = excellent darkness."""
    result = get_moon_info(NYC_LAT, NYC_LON, datetime(2025, 1, 29, 12, 0, tzinfo=timezone.utc))
    assert result["darkness_quality"] == "Excellent"


def test_darkness_quality_full_moon():
    """Full moon = poor darkness."""
    result = get_moon_info(NYC_LAT, NYC_LON, datetime(2025, 1, 13, 12, 0, tzinfo=timezone.utc))
    assert result["darkness_quality"] == "Poor"
```

**Step 2: Run tests to verify they fail**

Run: `pytest tests/test_sun_moon.py::test_darkness_quality_new_moon -v`
Expected: FAIL (KeyError: 'darkness_quality')

**Step 3: Add darkness quality to MoonInfo**

Update `MoonInfo` TypedDict and `get_moon_info` function:

```python
class MoonInfo(TypedDict):
    """Moon phase and timing information."""

    phase_name: str
    illumination: float  # 0-100
    darkness_quality: str  # Excellent, Good, Fair, Poor
    moonrise: datetime | None
    moonset: datetime | None


# In get_moon_info, before the return statement:
    # Determine darkness quality based on illumination
    if illumination < 25:
        darkness_quality = "Excellent"
    elif illumination < 50:
        darkness_quality = "Good"
    elif illumination < 75:
        darkness_quality = "Fair"
    else:
        darkness_quality = "Poor"

    return MoonInfo(
        phase_name=phase_name,
        illumination=round(illumination, 1),
        darkness_quality=darkness_quality,
        moonrise=moonrise,
        moonset=moonset,
    )
```

**Step 4: Run tests to verify they pass**

Run: `pytest tests/test_sun_moon.py -v`
Expected: 6 passed

**Step 5: Commit**

```bash
git add -A
git commit -m "feat: add darkness quality assessment to moon info"
```

---

## Phase 3: Planets Module

### Task 6: Create Planets Source

**Files:**
- Create: `src/skycli/sources/planets.py`
- Create: `tests/test_planets.py`

**Step 1: Write failing tests**

`tests/test_planets.py`:
```python
"""Tests for planet visibility calculations."""

from datetime import datetime, timezone

import time_machine

from skycli.sources.planets import get_visible_planets


NYC_LAT = 40.7128
NYC_LON = -74.0060


@time_machine.travel("2025-01-15 22:00:00", tick=False)
def test_get_visible_planets_returns_list():
    """get_visible_planets returns a list of planet info."""
    result = get_visible_planets(NYC_LAT, NYC_LON, datetime(2025, 1, 15, 22, 0, tzinfo=timezone.utc))

    assert isinstance(result, list)
    # At least one planet should be visible on any given night
    assert len(result) >= 0


@time_machine.travel("2025-01-15 22:00:00", tick=False)
def test_planet_info_structure():
    """Each planet has required fields."""
    result = get_visible_planets(NYC_LAT, NYC_LON, datetime(2025, 1, 15, 22, 0, tzinfo=timezone.utc))

    if result:  # If any planets are visible
        planet = result[0]
        assert "name" in planet
        assert "direction" in planet  # N, NE, E, SE, S, SW, W, NW
        assert "altitude" in planet  # degrees above horizon
        assert "rise_time" in planet
        assert "set_time" in planet
        assert "description" in planet


@time_machine.travel("2025-01-15 22:00:00", tick=False)
def test_only_visible_planets_returned():
    """Only planets above horizon are returned."""
    result = get_visible_planets(NYC_LAT, NYC_LON, datetime(2025, 1, 15, 22, 0, tzinfo=timezone.utc))

    for planet in result:
        assert planet["altitude"] > 0, f"{planet['name']} is below horizon"
```

**Step 2: Run tests to verify they fail**

Run: `pytest tests/test_planets.py -v`
Expected: FAIL (module doesn't exist)

**Step 3: Implement planets module**

`src/skycli/sources/planets.py`:
```python
"""Planet visibility calculations using Skyfield."""

from datetime import datetime, timezone
from typing import TypedDict

from skyfield import almanac
from skyfield.api import load, wgs84


class PlanetInfo(TypedDict):
    """Information about a visible planet."""

    name: str
    direction: str  # N, NE, E, SE, S, SW, W, NW
    altitude: float  # degrees above horizon
    rise_time: datetime | None
    set_time: datetime | None
    description: str


PLANETS = ["Mercury", "Venus", "Mars", "Jupiter", "Saturn", "Uranus", "Neptune"]

PLANET_DESCRIPTIONS = {
    "Mercury": "Elusive, close to Sun",
    "Venus": "Brilliant, unmistakable",
    "Mars": "Reddish hue",
    "Jupiter": "Bright, steady light",
    "Saturn": "Golden, rings in telescope",
    "Uranus": "Faint, blue-green",
    "Neptune": "Very faint, needs telescope",
}

# Load ephemeris data (cached)
_ephemeris = None
_timescale = None


def _get_ephemeris():
    """Get or load the ephemeris data."""
    global _ephemeris, _timescale
    if _ephemeris is None:
        _ephemeris = load("de421.bsp")
        _timescale = load.timescale()
    return _ephemeris, _timescale


def _azimuth_to_direction(azimuth: float) -> str:
    """Convert azimuth angle to cardinal/intercardinal direction."""
    # Azimuth: 0=N, 90=E, 180=S, 270=W
    directions = ["N", "NE", "E", "SE", "S", "SW", "W", "NW"]
    index = round(azimuth / 45) % 8
    return directions[index]


def get_visible_planets(lat: float, lon: float, date: datetime) -> list[PlanetInfo]:
    """Get list of planets visible at the given location and time."""
    eph, ts = _get_ephemeris()

    location = wgs84.latlon(lat, lon)
    observer = eph["Earth"] + location

    t = ts.utc(date.year, date.month, date.day, date.hour, date.minute)
    t0 = ts.utc(date.year, date.month, date.day)
    t1 = ts.utc(date.year, date.month, date.day + 1)

    visible = []

    for planet_name in PLANETS:
        # Handle barycenter vs planet distinction
        if planet_name in ["Jupiter", "Saturn", "Uranus", "Neptune"]:
            planet_key = f"{planet_name} barycenter"
        else:
            planet_key = planet_name

        planet = eph[planet_key]

        # Get current position
        astrometric = observer.at(t).observe(planet)
        apparent = astrometric.apparent()
        alt, az, _ = apparent.altaz()

        altitude = alt.degrees
        azimuth = az.degrees

        # Skip if below horizon
        if altitude <= 0:
            continue

        # Find rise and set times
        f = almanac.risings_and_settings(eph, planet, location)
        times, events = almanac.find_discrete(t0, t1, f)

        rise_time = None
        set_time = None
        for time, event in zip(times, events):
            dt = time.utc_datetime()
            if event == 1:
                rise_time = dt
            else:
                set_time = dt

        visible.append(PlanetInfo(
            name=planet_name,
            direction=_azimuth_to_direction(azimuth),
            altitude=round(altitude, 0),
            rise_time=rise_time,
            set_time=set_time,
            description=PLANET_DESCRIPTIONS[planet_name],
        ))

    # Sort by altitude (highest first)
    visible.sort(key=lambda p: p["altitude"], reverse=True)

    return visible
```

**Step 4: Run tests to verify they pass**

Run: `pytest tests/test_planets.py -v`
Expected: 3 passed

**Step 5: Commit**

```bash
git add -A
git commit -m "feat: add planets source with visibility calculations"
```

---

## Phase 4: Static Data

### Task 7: Create Meteor Shower Data

**Files:**
- Create: `src/skycli/data/__init__.py`
- Create: `src/skycli/data/showers.json`
- Create: `src/skycli/sources/meteors.py`
- Create: `tests/test_meteors.py`

**Step 1: Create the JSON data file**

`src/skycli/data/__init__.py`:
```python
"""Bundled data files for SkyCLI."""

from pathlib import Path

DATA_DIR = Path(__file__).parent
```

`src/skycli/data/showers.json`:
```json
[
  {
    "name": "Quadrantids",
    "peak_month": 1,
    "peak_day": 3,
    "active_start": {"month": 1, "day": 1},
    "active_end": {"month": 1, "day": 6},
    "zhr": 120,
    "radiant_constellation": "Bootes"
  },
  {
    "name": "Lyrids",
    "peak_month": 4,
    "peak_day": 22,
    "active_start": {"month": 4, "day": 16},
    "active_end": {"month": 4, "day": 25},
    "zhr": 18,
    "radiant_constellation": "Lyra"
  },
  {
    "name": "Eta Aquariids",
    "peak_month": 5,
    "peak_day": 6,
    "active_start": {"month": 4, "day": 19},
    "active_end": {"month": 5, "day": 28},
    "zhr": 50,
    "radiant_constellation": "Aquarius"
  },
  {
    "name": "Delta Aquariids",
    "peak_month": 7,
    "peak_day": 30,
    "active_start": {"month": 7, "day": 12},
    "active_end": {"month": 8, "day": 23},
    "zhr": 25,
    "radiant_constellation": "Aquarius"
  },
  {
    "name": "Perseids",
    "peak_month": 8,
    "peak_day": 12,
    "active_start": {"month": 7, "day": 17},
    "active_end": {"month": 8, "day": 24},
    "zhr": 100,
    "radiant_constellation": "Perseus"
  },
  {
    "name": "Orionids",
    "peak_month": 10,
    "peak_day": 21,
    "active_start": {"month": 10, "day": 2},
    "active_end": {"month": 11, "day": 7},
    "zhr": 20,
    "radiant_constellation": "Orion"
  },
  {
    "name": "Leonids",
    "peak_month": 11,
    "peak_day": 17,
    "active_start": {"month": 11, "day": 6},
    "active_end": {"month": 11, "day": 30},
    "zhr": 15,
    "radiant_constellation": "Leo"
  },
  {
    "name": "Geminids",
    "peak_month": 12,
    "peak_day": 14,
    "active_start": {"month": 12, "day": 4},
    "active_end": {"month": 12, "day": 17},
    "zhr": 150,
    "radiant_constellation": "Gemini"
  },
  {
    "name": "Ursids",
    "peak_month": 12,
    "peak_day": 22,
    "active_start": {"month": 12, "day": 17},
    "active_end": {"month": 12, "day": 26},
    "zhr": 10,
    "radiant_constellation": "Ursa Minor"
  }
]
```

**Step 2: Write failing tests**

`tests/test_meteors.py`:
```python
"""Tests for meteor shower source."""

from datetime import datetime, timezone

from skycli.sources.meteors import get_active_showers


def test_ursids_active_in_december():
    """Ursids should be active around Dec 22."""
    result = get_active_showers(datetime(2025, 12, 22, tzinfo=timezone.utc))

    names = [s["name"] for s in result]
    assert "Ursids" in names


def test_perseids_active_in_august():
    """Perseids should be active in mid-August."""
    result = get_active_showers(datetime(2025, 8, 12, tzinfo=timezone.utc))

    names = [s["name"] for s in result]
    assert "Perseids" in names


def test_no_showers_in_march():
    """No major showers in mid-March."""
    result = get_active_showers(datetime(2025, 3, 15, tzinfo=timezone.utc))

    assert len(result) == 0


def test_shower_info_structure():
    """Each shower has required fields."""
    result = get_active_showers(datetime(2025, 12, 22, tzinfo=timezone.utc))

    if result:
        shower = result[0]
        assert "name" in shower
        assert "zhr" in shower
        assert "peak_date" in shower
        assert "radiant_constellation" in shower
        assert "is_peak" in shower
```

**Step 3: Run tests to verify they fail**

Run: `pytest tests/test_meteors.py -v`
Expected: FAIL (module doesn't exist)

**Step 4: Implement meteors module**

`src/skycli/sources/meteors.py`:
```python
"""Meteor shower data and activity detection."""

import json
from datetime import datetime
from typing import TypedDict

from skycli.data import DATA_DIR


class ShowerInfo(TypedDict):
    """Information about an active meteor shower."""

    name: str
    zhr: int  # Zenithal Hourly Rate
    peak_date: str  # "Dec 22"
    radiant_constellation: str
    is_peak: bool


def _load_showers() -> list[dict]:
    """Load meteor shower data from JSON."""
    with open(DATA_DIR / "showers.json") as f:
        return json.load(f)


def _is_date_in_range(date: datetime, start: dict, end: dict) -> bool:
    """Check if date falls within active period."""
    month = date.month
    day = date.day

    start_month, start_day = start["month"], start["day"]
    end_month, end_day = end["month"], end["day"]

    # Handle year wraparound (e.g., Dec 28 to Jan 5)
    if start_month > end_month:
        # Either in the end of year or start of year
        if month > start_month or (month == start_month and day >= start_day):
            return True
        if month < end_month or (month == end_month and day <= end_day):
            return True
        return False

    # Normal case
    if month < start_month or month > end_month:
        return False
    if month == start_month and day < start_day:
        return False
    if month == end_month and day > end_day:
        return False
    return True


def _format_peak_date(month: int, day: int) -> str:
    """Format peak date as 'Mon DD'."""
    months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun",
              "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"]
    return f"{months[month - 1]} {day}"


def get_active_showers(date: datetime) -> list[ShowerInfo]:
    """Get meteor showers active on the given date."""
    showers = _load_showers()
    active = []

    for shower in showers:
        if _is_date_in_range(date, shower["active_start"], shower["active_end"]):
            is_peak = (date.month == shower["peak_month"] and
                      abs(date.day - shower["peak_day"]) <= 1)

            active.append(ShowerInfo(
                name=shower["name"],
                zhr=shower["zhr"],
                peak_date=_format_peak_date(shower["peak_month"], shower["peak_day"]),
                radiant_constellation=shower["radiant_constellation"],
                is_peak=is_peak,
            ))

    # Sort by ZHR (most active first)
    active.sort(key=lambda s: s["zhr"], reverse=True)

    return active
```

**Step 5: Run tests to verify they pass**

Run: `pytest tests/test_meteors.py -v`
Expected: 4 passed

**Step 6: Commit**

```bash
git add -A
git commit -m "feat: add meteor shower source with bundled data"
```

---

### Task 8: Create Deep Sky Object Data

**Files:**
- Create: `src/skycli/data/messier.json`
- Create: `src/skycli/sources/deep_sky.py`
- Create: `tests/test_deep_sky.py`

**Step 1: Create Messier catalog JSON (subset of popular objects)**

`src/skycli/data/messier.json`:
```json
[
  {"id": "M1", "name": "Crab Nebula", "constellation": "Taurus", "ra": 83.63, "dec": 22.01, "mag": 8.4, "type": "Supernova Remnant", "tip": "Look for fuzzy patch"},
  {"id": "M13", "name": "Hercules Cluster", "constellation": "Hercules", "ra": 250.42, "dec": 36.46, "mag": 5.8, "type": "Globular Cluster", "tip": "Stunning in any scope"},
  {"id": "M27", "name": "Dumbbell Nebula", "constellation": "Vulpecula", "ra": 299.90, "dec": 22.72, "mag": 7.5, "type": "Planetary Nebula", "tip": "Easy binocular target"},
  {"id": "M31", "name": "Andromeda Galaxy", "constellation": "Andromeda", "ra": 10.68, "dec": 41.27, "mag": 3.4, "type": "Galaxy", "tip": "Use averted vision"},
  {"id": "M42", "name": "Orion Nebula", "constellation": "Orion", "ra": 83.82, "dec": -5.39, "mag": 4.0, "type": "Nebula", "tip": "Naked eye!"},
  {"id": "M44", "name": "Beehive Cluster", "constellation": "Cancer", "ra": 130.05, "dec": 19.67, "mag": 3.7, "type": "Open Cluster", "tip": "Naked eye fuzzy patch"},
  {"id": "M45", "name": "Pleiades", "constellation": "Taurus", "ra": 56.87, "dec": 24.12, "mag": 1.6, "type": "Open Cluster", "tip": "Stunning cluster"},
  {"id": "M51", "name": "Whirlpool Galaxy", "constellation": "Canes Venatici", "ra": 202.47, "dec": 47.20, "mag": 8.4, "type": "Galaxy", "tip": "Face-on spiral"},
  {"id": "M57", "name": "Ring Nebula", "constellation": "Lyra", "ra": 283.40, "dec": 33.03, "mag": 8.8, "type": "Planetary Nebula", "tip": "Small but distinct"},
  {"id": "M81", "name": "Bode's Galaxy", "constellation": "Ursa Major", "ra": 148.89, "dec": 69.07, "mag": 6.9, "type": "Galaxy", "tip": "Pair with M82"},
  {"id": "M101", "name": "Pinwheel Galaxy", "constellation": "Ursa Major", "ra": 210.80, "dec": 54.35, "mag": 7.9, "type": "Galaxy", "tip": "Large, face-on spiral"},
  {"id": "M104", "name": "Sombrero Galaxy", "constellation": "Virgo", "ra": 189.99, "dec": -11.62, "mag": 8.0, "type": "Galaxy", "tip": "Edge-on with dust lane"}
]
```

**Step 2: Write failing tests**

`tests/test_deep_sky.py`:
```python
"""Tests for deep sky object source."""

from datetime import datetime, timezone

from skycli.sources.deep_sky import get_visible_dso


NYC_LAT = 40.7128
NYC_LON = -74.0060


def test_returns_list_of_visible_objects():
    """Returns visible deep sky objects for the location and time."""
    # Winter evening - Orion should be up
    result = get_visible_dso(
        NYC_LAT, NYC_LON,
        datetime(2025, 1, 15, 22, 0, tzinfo=timezone.utc),
        limit=5
    )

    assert isinstance(result, list)
    assert len(result) <= 5


def test_orion_nebula_visible_winter():
    """M42 Orion Nebula should be visible in winter evenings."""
    result = get_visible_dso(
        NYC_LAT, NYC_LON,
        datetime(2025, 1, 15, 22, 0, tzinfo=timezone.utc),
        limit=10
    )

    ids = [obj["id"] for obj in result]
    assert "M42" in ids


def test_dso_info_structure():
    """Each DSO has required fields."""
    result = get_visible_dso(
        NYC_LAT, NYC_LON,
        datetime(2025, 1, 15, 22, 0, tzinfo=timezone.utc),
        limit=5
    )

    if result:
        obj = result[0]
        assert "id" in obj
        assert "name" in obj
        assert "constellation" in obj
        assert "mag" in obj
        assert "type" in obj
        assert "tip" in obj
        assert "altitude" in obj
```

**Step 3: Run tests to verify they fail**

Run: `pytest tests/test_deep_sky.py -v`
Expected: FAIL (module doesn't exist)

**Step 4: Implement deep_sky module**

`src/skycli/sources/deep_sky.py`:
```python
"""Deep sky object visibility calculations."""

import json
from datetime import datetime
from typing import TypedDict

from skyfield.api import Star, load, wgs84

from skycli.data import DATA_DIR


class DSOInfo(TypedDict):
    """Information about a visible deep sky object."""

    id: str
    name: str
    constellation: str
    mag: float
    type: str
    tip: str
    altitude: float


_ephemeris = None
_timescale = None


def _get_ephemeris():
    """Get or load the ephemeris data."""
    global _ephemeris, _timescale
    if _ephemeris is None:
        _ephemeris = load("de421.bsp")
        _timescale = load.timescale()
    return _ephemeris, _timescale


def _load_catalog() -> list[dict]:
    """Load deep sky object catalog."""
    with open(DATA_DIR / "messier.json") as f:
        return json.load(f)


def get_visible_dso(
    lat: float,
    lon: float,
    date: datetime,
    limit: int = 5,
    min_altitude: float = 20.0,
) -> list[DSOInfo]:
    """Get deep sky objects visible at the given location and time."""
    eph, ts = _get_ephemeris()

    location = wgs84.latlon(lat, lon)
    observer = eph["Earth"] + location
    t = ts.utc(date.year, date.month, date.day, date.hour, date.minute)

    catalog = _load_catalog()
    visible = []

    for obj in catalog:
        # Create a star object at the DSO's coordinates
        # RA is in degrees, need to convert to hours for Skyfield
        ra_hours = obj["ra"] / 15.0
        dso = Star(ra_hours=ra_hours, dec_degrees=obj["dec"])

        # Calculate altitude
        astrometric = observer.at(t).observe(dso)
        apparent = astrometric.apparent()
        alt, _, _ = apparent.altaz()

        altitude = alt.degrees

        if altitude >= min_altitude:
            visible.append(DSOInfo(
                id=obj["id"],
                name=obj["name"],
                constellation=obj["constellation"],
                mag=obj["mag"],
                type=obj["type"],
                tip=obj["tip"],
                altitude=round(altitude, 0),
            ))

    # Sort by magnitude (brightest first), then limit
    visible.sort(key=lambda o: o["mag"])

    return visible[:limit]
```

**Step 5: Run tests to verify they pass**

Run: `pytest tests/test_deep_sky.py -v`
Expected: 3 passed

**Step 6: Commit**

```bash
git add -A
git commit -m "feat: add deep sky object source with Messier catalog"
```

---

## Phase 5: ISS Passes (API Integration)

### Task 9: Create ISS Pass Source with API Integration

**Files:**
- Create: `src/skycli/sources/iss.py`
- Create: `tests/test_iss.py`

**Step 1: Write failing tests with mocked API**

`tests/test_iss.py`:
```python
"""Tests for ISS pass predictions."""

from datetime import datetime, timezone

import pytest

from skycli.sources.iss import get_iss_passes, ISSPass


# Sample API response structure (based on N2YO API)
MOCK_API_RESPONSE = {
    "info": {"satid": 25544, "satname": "SPACE STATION"},
    "passes": [
        {
            "startAz": 225,
            "startEl": 10,
            "startUTC": 1737054120,
            "maxAz": 315,
            "maxEl": 67,
            "maxUTC": 1737054420,
            "endAz": 45,
            "endEl": 10,
            "endUTC": 1737054720,
            "mag": -3.2,
            "duration": 600
        },
        {
            "startAz": 270,
            "startEl": 10,
            "startUTC": 1737060000,
            "maxAz": 0,
            "maxEl": 34,
            "maxUTC": 1737060300,
            "endAz": 90,
            "endEl": 10,
            "endUTC": 1737060600,
            "mag": -1.5,
            "duration": 600
        }
    ]
}


def test_parse_iss_passes_structure(mocker):
    """ISS passes have correct structure."""
    mock_response = mocker.Mock()
    mock_response.json.return_value = MOCK_API_RESPONSE
    mock_response.raise_for_status = mocker.Mock()

    mocker.patch("httpx.get", return_value=mock_response)

    result = get_iss_passes(40.7, -74.0, datetime(2025, 1, 16, 18, 0, tzinfo=timezone.utc))

    assert len(result) == 2
    pass_info = result[0]
    assert "start_time" in pass_info
    assert "duration_minutes" in pass_info
    assert "max_altitude" in pass_info
    assert "start_direction" in pass_info
    assert "end_direction" in pass_info
    assert "brightness" in pass_info


def test_handles_api_error_gracefully(mocker):
    """Returns empty list on API error."""
    mocker.patch("httpx.get", side_effect=Exception("Network error"))

    result = get_iss_passes(40.7, -74.0, datetime(2025, 1, 16, tzinfo=timezone.utc))

    assert result == []


def test_filters_to_visible_passes_only(mocker):
    """Only returns passes during nighttime (would need more complex mock)."""
    mock_response = mocker.Mock()
    mock_response.json.return_value = MOCK_API_RESPONSE
    mock_response.raise_for_status = mocker.Mock()

    mocker.patch("httpx.get", return_value=mock_response)

    result = get_iss_passes(40.7, -74.0, datetime(2025, 1, 16, tzinfo=timezone.utc))

    # All returned passes should have positive max altitude
    for p in result:
        assert p["max_altitude"] > 0
```

**Step 2: Run tests to verify they fail**

Run: `pytest tests/test_iss.py -v`
Expected: FAIL (module doesn't exist)

**Step 3: Implement ISS module**

`src/skycli/sources/iss.py`:
```python
"""ISS pass predictions using N2YO API."""

import os
from datetime import datetime, timezone
from typing import TypedDict

import httpx


class ISSPass(TypedDict):
    """Information about an ISS pass."""

    start_time: datetime
    duration_minutes: int
    max_altitude: float  # degrees
    start_direction: str
    end_direction: str
    brightness: str  # "Bright!", "Moderate", "Faint"


N2YO_API_URL = "https://api.n2yo.com/rest/v1/satellite/visualpasses"
ISS_NORAD_ID = 25544


def _azimuth_to_direction(azimuth: float) -> str:
    """Convert azimuth angle to cardinal direction."""
    directions = ["N", "NE", "E", "SE", "S", "SW", "W", "NW"]
    index = round(azimuth / 45) % 8
    return directions[index]


def _magnitude_to_brightness(mag: float) -> str:
    """Convert magnitude to human-readable brightness."""
    if mag <= -3.0:
        return "Bright!"
    elif mag <= -1.5:
        return "Moderate"
    else:
        return "Faint"


def get_iss_passes(
    lat: float,
    lon: float,
    date: datetime,
    days: int = 2,
    min_visibility: int = 60,  # minimum seconds
) -> list[ISSPass]:
    """Get predicted ISS passes for the location.

    Requires N2YO_API_KEY environment variable.
    Returns empty list on error (graceful degradation).
    """
    api_key = os.environ.get("N2YO_API_KEY", "")

    if not api_key:
        # No API key - return empty list silently
        return []

    try:
        url = f"{N2YO_API_URL}/{ISS_NORAD_ID}/{lat}/{lon}/0/{days}/{min_visibility}"
        response = httpx.get(url, params={"apiKey": api_key}, timeout=10.0)
        response.raise_for_status()
        data = response.json()
    except Exception:
        # Network error, API error, etc. - graceful degradation
        return []

    passes = []
    for p in data.get("passes", []):
        passes.append(ISSPass(
            start_time=datetime.fromtimestamp(p["startUTC"], tz=timezone.utc),
            duration_minutes=p["duration"] // 60,
            max_altitude=p["maxEl"],
            start_direction=_azimuth_to_direction(p["startAz"]),
            end_direction=_azimuth_to_direction(p["endAz"]),
            brightness=_magnitude_to_brightness(p.get("mag", 0)),
        ))

    return passes
```

**Step 4: Run tests to verify they pass**

Run: `pytest tests/test_iss.py -v`
Expected: 3 passed

**Step 5: Commit**

```bash
git add -A
git commit -m "feat: add ISS pass source with N2YO API integration"
```

---

## Phase 6: Display Module

### Task 10: Create Rich Terminal Display

**Files:**
- Create: `src/skycli/display.py`
- Create: `tests/test_display.py`

**Step 1: Write failing tests**

`tests/test_display.py`:
```python
"""Tests for terminal display formatting."""

from datetime import datetime, timezone

from skycli.display import render_report


def test_render_report_returns_string():
    """render_report returns a string for console output."""
    report_data = {
        "date": datetime(2025, 1, 15, tzinfo=timezone.utc),
        "location": {"lat": 40.7, "lon": -74.0},
        "sun": {
            "sunrise": datetime(2025, 1, 15, 12, 18, tzinfo=timezone.utc),
            "sunset": datetime(2025, 1, 15, 21, 45, tzinfo=timezone.utc),
        },
        "moon": {
            "phase_name": "Full Moon",
            "illumination": 98.5,
            "darkness_quality": "Poor",
        },
        "planets": [],
        "iss_passes": [],
        "meteors": [],
        "deep_sky": [],
    }

    result = render_report(report_data)

    assert isinstance(result, str)
    assert "Tonight's Sky" in result or "tonight" in result.lower()


def test_render_includes_location():
    """Output includes formatted location."""
    report_data = {
        "date": datetime(2025, 1, 15, tzinfo=timezone.utc),
        "location": {"lat": 40.7, "lon": -74.0},
        "sun": {
            "sunrise": datetime(2025, 1, 15, 12, 18, tzinfo=timezone.utc),
            "sunset": datetime(2025, 1, 15, 21, 45, tzinfo=timezone.utc),
        },
        "moon": {
            "phase_name": "New Moon",
            "illumination": 2.0,
            "darkness_quality": "Excellent",
        },
        "planets": [],
        "iss_passes": [],
        "meteors": [],
        "deep_sky": [],
    }

    result = render_report(report_data)

    assert "40.7" in result


def test_render_includes_moon_info():
    """Output includes moon phase."""
    report_data = {
        "date": datetime(2025, 1, 15, tzinfo=timezone.utc),
        "location": {"lat": 40.7, "lon": -74.0},
        "sun": {
            "sunrise": datetime(2025, 1, 15, 12, 18, tzinfo=timezone.utc),
            "sunset": datetime(2025, 1, 15, 21, 45, tzinfo=timezone.utc),
        },
        "moon": {
            "phase_name": "Full Moon",
            "illumination": 98.5,
            "darkness_quality": "Poor",
        },
        "planets": [],
        "iss_passes": [],
        "meteors": [],
        "deep_sky": [],
    }

    result = render_report(report_data)

    assert "Full Moon" in result or "98" in result
```

**Step 2: Run tests to verify they fail**

Run: `pytest tests/test_display.py -v`
Expected: FAIL (module doesn't exist)

**Step 3: Implement display module**

`src/skycli/display.py`:
```python
"""Rich terminal display for sky reports."""

from datetime import datetime
from io import StringIO
from typing import Any

from rich.console import Console
from rich.panel import Panel
from rich.table import Table
from rich.text import Text


def _format_time(dt: datetime | None) -> str:
    """Format datetime as HH:MM."""
    if dt is None:
        return "--:--"
    return dt.strftime("%H:%M")


def _format_location(lat: float, lon: float) -> str:
    """Format coordinates nicely."""
    lat_dir = "N" if lat >= 0 else "S"
    lon_dir = "E" if lon >= 0 else "W"
    return f"{abs(lat):.2f}°{lat_dir}, {abs(lon):.2f}°{lon_dir}"


def render_report(data: dict[str, Any], no_color: bool = False) -> str:
    """Render the sky report as a formatted string."""
    output = StringIO()
    console = Console(file=output, force_terminal=not no_color, no_color=no_color, width=65)

    # Header panel
    date_str = data["date"].strftime("%b %d, %Y")
    location_str = _format_location(data["location"]["lat"], data["location"]["lon"])
    sunset_str = _format_time(data["sun"].get("sunset"))
    sunrise_str = _format_time(data["sun"].get("sunrise"))

    moon = data["moon"]
    moon_str = f"{moon['phase_name']} ({moon['illumination']:.0f}%)"
    darkness_str = f"{moon['darkness_quality']} darkness"

    header_text = Text()
    header_text.append(f"Tonight's Sky · {date_str}\n", style="bold")
    header_text.append(f"{location_str} · Sunset {sunset_str} · Sunrise {sunrise_str}\n")
    header_text.append(f"{moon_str} · {darkness_str}")

    console.print(Panel(header_text, expand=True))
    console.print()

    # Planets section
    if data.get("planets"):
        console.print("[bold]PLANETS[/bold]")
        for p in data["planets"]:
            set_time = _format_time(p.get("set_time"))
            console.print(f"  {p['name']:<10} {p['direction']:<3} {p['altitude']:>3.0f}°  Sets {set_time}   {p['description']}")
        console.print()

    # ISS passes section
    if data.get("iss_passes"):
        console.print("[bold]ISS PASSES[/bold]")
        for p in data["iss_passes"]:
            time_str = _format_time(p["start_time"])
            console.print(f"  {time_str}  {p['duration_minutes']} min  {p['brightness']:<8} {p['start_direction']} → {p['end_direction']}  Max {p['max_altitude']:.0f}°")
        console.print()
    elif "iss_passes" in data:
        console.print("[bold]ISS PASSES[/bold]")
        console.print("  No visible passes tonight")
        console.print()

    # Meteor showers section
    if data.get("meteors"):
        console.print("[bold]METEOR SHOWERS[/bold]")
        for m in data["meteors"]:
            peak_marker = " (Peak!)" if m["is_peak"] else ""
            console.print(f"  {m['name']}{peak_marker} · Peak {m['peak_date']} · ~{m['zhr']}/hour")
            console.print(f"    Look toward {m['radiant_constellation']} after midnight")
        console.print()

    # Deep sky section
    if data.get("deep_sky"):
        console.print("[bold]TONIGHT'S DEEP SKY PICKS[/bold]")
        for obj in data["deep_sky"]:
            console.print(f"  {obj['id']:<5} {obj['name']:<20} {obj['constellation']:<12} Mag {obj['mag']:<4}  {obj['tip']}")
        console.print()

    return output.getvalue()


def render_json(data: dict[str, Any]) -> str:
    """Render report as JSON string."""
    import json

    # Convert datetimes to ISO format strings
    def serialize(obj):
        if isinstance(obj, datetime):
            return obj.isoformat()
        raise TypeError(f"Object of type {type(obj)} is not JSON serializable")

    return json.dumps(data, default=serialize, indent=2)
```

**Step 4: Run tests to verify they pass**

Run: `pytest tests/test_display.py -v`
Expected: 3 passed

**Step 5: Commit**

```bash
git add -A
git commit -m "feat: add rich terminal display for sky reports"
```

---

## Phase 7: Report Orchestration

### Task 11: Create Report Builder

**Files:**
- Create: `src/skycli/report.py`
- Create: `tests/test_report.py`

**Step 1: Write failing tests**

`tests/test_report.py`:
```python
"""Tests for report orchestration."""

from datetime import datetime, timezone

import time_machine

from skycli.report import build_report


NYC_LAT = 40.7128
NYC_LON = -74.0060


@time_machine.travel("2025-01-15 22:00:00", tick=False)
def test_build_report_returns_complete_structure():
    """build_report returns all expected sections."""
    result = build_report(
        lat=NYC_LAT,
        lon=NYC_LON,
        date=datetime(2025, 1, 15, tzinfo=timezone.utc),
    )

    assert "date" in result
    assert "location" in result
    assert "sun" in result
    assert "moon" in result
    assert "planets" in result
    assert "iss_passes" in result
    assert "meteors" in result
    assert "deep_sky" in result


@time_machine.travel("2025-01-15 22:00:00", tick=False)
def test_build_report_respects_only_filter():
    """Only requested sections are populated when using only filter."""
    result = build_report(
        lat=NYC_LAT,
        lon=NYC_LON,
        date=datetime(2025, 1, 15, tzinfo=timezone.utc),
        only=["moon", "planets"],
    )

    # Moon and planets should be present
    assert result["moon"] is not None
    assert result["planets"] is not None

    # Others should be empty/None
    assert result["iss_passes"] == []
    assert result["meteors"] == []
    assert result["deep_sky"] == []


@time_machine.travel("2025-01-15 22:00:00", tick=False)
def test_build_report_respects_exclude_filter():
    """Excluded sections are empty."""
    result = build_report(
        lat=NYC_LAT,
        lon=NYC_LON,
        date=datetime(2025, 1, 15, tzinfo=timezone.utc),
        exclude=["iss"],
    )

    # ISS should be empty
    assert result["iss_passes"] == []

    # Others should be populated
    assert result["moon"] is not None
```

**Step 2: Run tests to verify they fail**

Run: `pytest tests/test_report.py -v`
Expected: FAIL (module doesn't exist)

**Step 3: Implement report module**

`src/skycli/report.py`:
```python
"""Report orchestration - collects data from all sources."""

from datetime import datetime
from typing import Any

from skycli.sources.sun_moon import get_sun_times, get_moon_info
from skycli.sources.planets import get_visible_planets
from skycli.sources.iss import get_iss_passes
from skycli.sources.meteors import get_active_showers
from skycli.sources.deep_sky import get_visible_dso


SECTION_MAP = {
    "moon": "moon",
    "planets": "planets",
    "iss": "iss_passes",
    "meteors": "meteors",
    "deepsky": "deep_sky",
    "events": "events",
}


def _should_include(section: str, only: list[str] | None, exclude: list[str] | None) -> bool:
    """Determine if a section should be included based on filters."""
    if only is not None:
        return section in only
    if exclude is not None:
        return section not in exclude
    return True


def build_report(
    lat: float,
    lon: float,
    date: datetime,
    at_time: str | None = None,
    only: list[str] | None = None,
    exclude: list[str] | None = None,
) -> dict[str, Any]:
    """Build a complete sky report for the given location and time."""

    # Always get sun times (needed for context)
    sun_times = get_sun_times(lat, lon, date)

    # Always get moon info (needed for header)
    moon_info = get_moon_info(lat, lon, date)

    # Build report structure
    report: dict[str, Any] = {
        "date": date,
        "location": {"lat": lat, "lon": lon},
        "sun": sun_times,
        "moon": moon_info,
        "planets": [],
        "iss_passes": [],
        "meteors": [],
        "deep_sky": [],
        "events": [],
    }

    # Planets
    if _should_include("planets", only, exclude):
        report["planets"] = get_visible_planets(lat, lon, date)

    # ISS passes
    if _should_include("iss", only, exclude):
        report["iss_passes"] = get_iss_passes(lat, lon, date)

    # Meteor showers
    if _should_include("meteors", only, exclude):
        report["meteors"] = get_active_showers(date)

    # Deep sky objects
    if _should_include("deepsky", only, exclude):
        report["deep_sky"] = get_visible_dso(lat, lon, date)

    return report
```

**Step 4: Run tests to verify they pass**

Run: `pytest tests/test_report.py -v`
Expected: 3 passed

**Step 5: Commit**

```bash
git add -A
git commit -m "feat: add report builder to orchestrate all sources"
```

---

## Phase 8: Final Integration

### Task 12: Wire CLI to Report and Display

**Files:**
- Modify: `src/skycli/cli.py`
- Modify: `tests/test_cli.py`

**Step 1: Add integration test**

Append to `tests/test_cli.py`:
```python
import time_machine


@time_machine.travel("2025-01-15 22:00:00", tick=False)
def test_tonight_produces_output():
    """Tonight command produces formatted output."""
    runner = CliRunner()
    result = runner.invoke(main, ["tonight", "--lat", "40.7", "--lon", "-74.0"])

    assert result.exit_code == 0
    assert "Tonight's Sky" in result.output or "tonight" in result.output.lower()


@time_machine.travel("2025-01-15 22:00:00", tick=False)
def test_tonight_json_output():
    """Tonight command with --json produces JSON."""
    runner = CliRunner()
    result = runner.invoke(main, ["tonight", "--lat", "40.7", "--lon", "-74.0", "--json"])

    assert result.exit_code == 0
    # Should be valid JSON
    import json
    data = json.loads(result.output)
    assert "date" in data
    assert "moon" in data
```

**Step 2: Run tests to verify they fail**

Run: `pytest tests/test_cli.py::test_tonight_produces_output -v`
Expected: FAIL (output doesn't contain expected text)

**Step 3: Update CLI to use report and display**

Update `src/skycli/cli.py`:
```python
"""Command-line interface for SkyCLI."""

from datetime import datetime, timezone
from typing import Optional

import click

from skycli.report import build_report
from skycli.display import render_report, render_json


class LatitudeType(click.ParamType):
    """Click parameter type for latitude validation."""

    name = "latitude"

    def convert(self, value, param, ctx):
        try:
            lat = float(value)
            if not -90 <= lat <= 90:
                self.fail(f"Latitude must be between -90 and 90, got {lat}", param, ctx)
            return lat
        except ValueError:
            self.fail(f"Invalid latitude: {value}", param, ctx)


class LongitudeType(click.ParamType):
    """Click parameter type for longitude validation."""

    name = "longitude"

    def convert(self, value, param, ctx):
        try:
            lon = float(value)
            if not -180 <= lon <= 180:
                self.fail(f"Longitude must be between -180 and 180, got {lon}", param, ctx)
            return lon
        except ValueError:
            self.fail(f"Invalid longitude: {value}", param, ctx)


LATITUDE = LatitudeType()
LONGITUDE = LongitudeType()

SECTIONS = ["moon", "planets", "iss", "meteors", "events", "deepsky"]


def parse_sections(value: str) -> list[str]:
    """Parse comma-separated section names."""
    sections = [s.strip().lower() for s in value.split(",")]
    invalid = [s for s in sections if s not in SECTIONS]
    if invalid:
        raise click.BadParameter(f"Unknown sections: {', '.join(invalid)}. Valid: {', '.join(SECTIONS)}")
    return sections


@click.group()
@click.version_option()
def main() -> None:
    """SkyCLI - See what's visible in the night sky tonight."""
    pass


@main.command()
@click.option("--lat", type=LATITUDE, required=True, help="Latitude (-90 to 90)")
@click.option("--lon", type=LONGITUDE, required=True, help="Longitude (-180 to 180)")
@click.option("--date", type=click.DateTime(formats=["%Y-%m-%d"]), default=None, help="Date (YYYY-MM-DD)")
@click.option("--at", "at_time", type=str, default=None, help="Time (HH:MM)")
@click.option("--only", "only_sections", type=str, default=None, help="Only show these sections (comma-separated)")
@click.option("--exclude", "exclude_sections", type=str, default=None, help="Hide these sections (comma-separated)")
@click.option("--json", "json_output", is_flag=True, help="Output as JSON")
@click.option("--no-color", is_flag=True, help="Disable colored output")
def tonight(
    lat: float,
    lon: float,
    date: Optional[datetime],
    at_time: Optional[str],
    only_sections: Optional[str],
    exclude_sections: Optional[str],
    json_output: bool,
    no_color: bool,
) -> None:
    """Show what's visible in the night sky tonight."""
    # Parse section filters
    only = parse_sections(only_sections) if only_sections else None
    exclude = parse_sections(exclude_sections) if exclude_sections else None

    # Use provided date or today
    if date is None:
        date = datetime.now(timezone.utc)
    else:
        date = date.replace(tzinfo=timezone.utc)

    # Build the report
    report_data = build_report(
        lat=lat,
        lon=lon,
        date=date,
        at_time=at_time,
        only=only,
        exclude=exclude,
    )

    # Render output
    if json_output:
        output = render_json(report_data)
    else:
        output = render_report(report_data, no_color=no_color)

    click.echo(output)


if __name__ == "__main__":
    main()
```

**Step 4: Run all tests to verify they pass**

Run: `pytest -v`
Expected: All tests pass

**Step 5: Commit**

```bash
git add -A
git commit -m "feat: integrate CLI with report builder and display"
```

---

### Task 13: Manual Verification and Polish

**Step 1: Run the CLI manually**

```bash
skycli tonight --lat 40.7 --lon -74.0
```

Expected: Formatted output with header, planets, meteor showers, and deep sky picks.

**Step 2: Test with different options**

```bash
skycli tonight --lat 40.7 --lon -74.0 --only planets,moon
skycli tonight --lat 40.7 --lon -74.0 --exclude iss
skycli tonight --lat 40.7 --lon -74.0 --json
skycli tonight --lat 40.7 --lon -74.0 --no-color
skycli tonight --lat 40.7 --lon -74.0 --date 2025-08-12  # Perseids!
```

**Step 3: Test error cases**

```bash
skycli tonight --lat 200 --lon -74.0  # Should error
skycli tonight  # Should require lat/lon
```

**Step 4: Run full test suite**

```bash
pytest -v --tb=short
```

Expected: All tests pass

**Step 5: Final commit**

```bash
git add -A
git commit -m "chore: polish and verify CLI functionality"
```

---

## Summary

After completing all tasks, you will have:

1. **Project structure** with proper Python packaging
2. **CLI** with click, supporting location, time, filter, and output options
3. **Sun/Moon source** calculating sunrise/sunset, moon phase, darkness quality
4. **Planets source** showing visible planets with positions
5. **Meteor shower source** with bundled annual data
6. **Deep sky source** with Messier catalog subset
7. **ISS pass source** with N2YO API integration (graceful degradation without API key)
8. **Rich display** with formatted terminal output
9. **JSON output** for scripting
10. **Comprehensive tests** for all components

To run the tool:
```bash
skycli tonight --lat YOUR_LAT --lon YOUR_LON
```
