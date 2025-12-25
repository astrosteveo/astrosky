"""ISS pass predictions using N2YO API."""

import logging
import os
from datetime import datetime, timezone
from typing import TypedDict

import httpx

logger = logging.getLogger(__name__)


class ISSPass(TypedDict):
    """Information about an ISS pass."""
    start_time: datetime
    duration_minutes: int
    max_altitude: float  # degrees
    start_direction: str
    end_direction: str
    brightness: str  # "Bright!", "Moderate", "Faint"
    magnitude: float  # Visual magnitude (lower = brighter, e.g., -3.5)


N2YO_API_URL = "https://api.n2yo.com/rest/v1/satellite/visualpasses"
ISS_NORAD_ID = 25544

# Configuration constants
MIN_VISIBILITY_SECONDS = 60  # Minimum pass duration to show
BRIGHTNESS_THRESHOLD_BRIGHT = -3.0  # Magnitude threshold for "Bright!" rating
BRIGHTNESS_THRESHOLD_MODERATE = -1.5  # Magnitude threshold for "Moderate" rating


def _azimuth_to_direction(azimuth: float) -> str:
    """Convert azimuth angle to cardinal direction."""
    directions = ["N", "NE", "E", "SE", "S", "SW", "W", "NW"]
    index = round(azimuth / 45) % 8
    return directions[index]


def _magnitude_to_brightness(mag: float) -> str:
    """Convert magnitude to human-readable brightness."""
    if mag <= BRIGHTNESS_THRESHOLD_BRIGHT:
        return "Bright!"
    elif mag <= BRIGHTNESS_THRESHOLD_MODERATE:
        return "Moderate"
    else:
        return "Faint"


def get_iss_passes(lat: float, lon: float, date: datetime, days: int = 2, min_visibility: int = MIN_VISIBILITY_SECONDS) -> list[ISSPass]:
    """Get predicted ISS passes for the location.

    Requires N2YO_API_KEY environment variable.
    Returns empty list on error (graceful degradation).

    Args:
        lat: Latitude in degrees
        lon: Longitude in degrees
        date: Date for predictions (not directly used, kept for API consistency)
        days: Number of days to predict (default 2)
        min_visibility: Minimum pass duration in seconds (default 60)

    Returns:
        List of ISS passes, or empty list if API unavailable
    """
    api_key = os.environ.get("N2YO_API_KEY", "")

    if not api_key:
        logger.debug("N2YO_API_KEY not set, skipping ISS pass predictions")
        return []

    try:
        url = f"{N2YO_API_URL}/{ISS_NORAD_ID}/{lat}/{lon}/0/{days}/{min_visibility}"
        response = httpx.get(url, params={"apiKey": api_key}, timeout=10.0)
        response.raise_for_status()
        data = response.json()
    except httpx.TimeoutException as e:
        logger.warning(f"N2YO API timeout: {e}")
        return []
    except httpx.HTTPStatusError as e:
        logger.error(f"N2YO API HTTP error {e.response.status_code}: {e}")
        return []
    except httpx.RequestError as e:
        logger.error(f"N2YO API request error: {e}")
        return []
    except Exception as e:
        logger.error(f"Unexpected error fetching ISS passes: {e}")
        return []

    passes = []
    for p in data.get("passes", []):
        mag = p.get("mag", 0.0)
        passes.append(ISSPass(
            start_time=datetime.fromtimestamp(p["startUTC"], tz=timezone.utc),
            duration_minutes=p["duration"] // 60,
            max_altitude=p["maxEl"],
            start_direction=_azimuth_to_direction(p["startAz"]),
            end_direction=_azimuth_to_direction(p["endAz"]),
            brightness=_magnitude_to_brightness(mag),
            magnitude=round(mag, 1),
        ))

    return passes
