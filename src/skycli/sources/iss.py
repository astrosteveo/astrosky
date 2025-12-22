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


def get_iss_passes(lat: float, lon: float, date: datetime, days: int = 2, min_visibility: int = 60) -> list[ISSPass]:
    """Get predicted ISS passes for the location.

    Requires N2YO_API_KEY environment variable.
    Returns empty list on error (graceful degradation).
    """
    api_key = os.environ.get("N2YO_API_KEY", "")

    if not api_key:
        return []

    try:
        url = f"{N2YO_API_URL}/{ISS_NORAD_ID}/{lat}/{lon}/0/{days}/{min_visibility}"
        response = httpx.get(url, params={"apiKey": api_key}, timeout=10.0)
        response.raise_for_status()
        data = response.json()
    except Exception:
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
