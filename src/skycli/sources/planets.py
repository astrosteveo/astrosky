"""Planet visibility calculations using Skyfield."""

from datetime import datetime, timezone
from typing import TypedDict

from skyfield import almanac
from skyfield.api import load, wgs84


class PlanetInfo(TypedDict):
    """Information about a visible planet."""

    name: str
    direction: str  # N, NE, E, SE, S, SW, W, NW
    azimuth: float  # degrees from north (0-360)
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
            azimuth=round(azimuth, 1),
            altitude=round(altitude, 0),
            rise_time=rise_time,
            set_time=set_time,
            description=PLANET_DESCRIPTIONS[planet_name],
        ))

    # Sort by altitude (highest first)
    visible.sort(key=lambda p: p["altitude"], reverse=True)

    return visible
