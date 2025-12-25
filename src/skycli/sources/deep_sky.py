"""Deep sky object visibility calculations."""

import json
from datetime import datetime
from typing import TypedDict

from skyfield.api import Star, load, wgs84

from skycli.data import DATA_DIR

# Deep sky object visibility constants
MIN_ALTITUDE_DEGREES = 20.0  # Minimum altitude for DSO visibility
DEFAULT_DSO_LIMIT = 5        # Default number of objects to return


class DSOInfo(TypedDict):
    """Information about a visible deep sky object."""
    id: str
    name: str
    constellation: str
    mag: float
    size: float
    type: str
    equipment: str
    tip: str
    altitude: float
    azimuth: float


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


def get_visible_dso(lat: float, lon: float, date: datetime, limit: int = DEFAULT_DSO_LIMIT, min_altitude: float = MIN_ALTITUDE_DEGREES) -> list[DSOInfo]:
    """Get deep sky objects visible at the given location and time.

    Args:
        lat: Latitude in degrees
        lon: Longitude in degrees
        date: Date and time for observation
        limit: Maximum number of objects to return (default 5)
        min_altitude: Minimum altitude in degrees for visibility (default 20.0)

    Returns:
        List of visible deep sky objects, sorted by brightness (magnitude)
    """
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

        # Calculate altitude and azimuth
        astrometric = observer.at(t).observe(dso)
        apparent = astrometric.apparent()
        alt, az, _ = apparent.altaz()

        altitude = alt.degrees
        azimuth = az.degrees

        if altitude >= min_altitude:
            visible.append(DSOInfo(
                id=obj["id"],
                name=obj["name"],
                constellation=obj["constellation"],
                mag=obj["mag"],
                size=obj["size"],
                type=obj["type"],
                equipment=obj["equipment"],
                tip=obj["tip"],
                altitude=round(altitude, 0),
                azimuth=round(azimuth, 0),
            ))

    # Sort by magnitude (brightest first), then limit
    visible.sort(key=lambda o: o["mag"])
    return visible[:limit]
