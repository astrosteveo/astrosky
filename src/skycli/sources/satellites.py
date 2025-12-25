"""Satellite pass predictions for Starlink and other notable satellites using N2YO API."""

import logging
import os
from datetime import datetime, timezone
from typing import TypedDict

import httpx

logger = logging.getLogger(__name__)


class SatellitePass(TypedDict):
    """Information about a satellite pass."""
    satellite_name: str
    satellite_type: str  # "starlink", "station", "telescope", "other"
    norad_id: int
    start_time: str  # ISO format
    duration_minutes: int
    max_altitude: float  # degrees above horizon
    start_direction: str
    end_direction: str
    brightness: str  # "Brilliant!", "Bright", "Moderate", "Faint"
    magnitude: float


class SatelliteInfo(TypedDict):
    """Summary of satellite visibility."""
    total_passes: int
    starlink_passes: int
    station_passes: int
    next_bright_pass: SatellitePass | None
    passes: list[SatellitePass]


N2YO_API_URL = "https://api.n2yo.com/rest/v1/satellite/visualpasses"

# Notable satellites to track (NORAD ID, name, type)
NOTABLE_SATELLITES = [
    (20580, "Hubble Space Telescope", "telescope"),
    (48274, "Tiangong Space Station", "station"),
    (59559, "Starlink-31337", "starlink"),  # Recent Starlink - will update
]

# Starlink NORAD IDs - we'll query the most recently launched bright ones
# These change frequently as new batches launch
STARLINK_SAMPLE_IDS = [
    # Group 6 (2024 launches - typically bright)
    (58589, "Starlink-6148"),
    (58590, "Starlink-6149"),
    (58591, "Starlink-6150"),
    (58592, "Starlink-6151"),
    (58593, "Starlink-6152"),
    # Group 7 (2024-2025 launches)
    (59834, "Starlink-7001"),
    (59835, "Starlink-7002"),
    (59836, "Starlink-7003"),
]

# Brightness thresholds
BRIGHTNESS_BRILLIANT = -4.0
BRIGHTNESS_BRIGHT = -2.5
BRIGHTNESS_MODERATE = -1.0


def _azimuth_to_direction(azimuth: float) -> str:
    """Convert azimuth angle to cardinal direction."""
    directions = ["N", "NE", "E", "SE", "S", "SW", "W", "NW"]
    index = round(azimuth / 45) % 8
    return directions[index]


def _magnitude_to_brightness(mag: float) -> str:
    """Convert magnitude to human-readable brightness."""
    if mag <= BRIGHTNESS_BRILLIANT:
        return "Brilliant!"
    elif mag <= BRIGHTNESS_BRIGHT:
        return "Bright"
    elif mag <= BRIGHTNESS_MODERATE:
        return "Moderate"
    else:
        return "Faint"


def _fetch_satellite_passes(
    norad_id: int,
    lat: float,
    lon: float,
    days: int,
    min_visibility: int,
    api_key: str
) -> list[dict]:
    """Fetch passes for a single satellite."""
    try:
        url = f"{N2YO_API_URL}/{norad_id}/{lat}/{lon}/0/{days}/{min_visibility}"
        response = httpx.get(url, params={"apiKey": api_key}, timeout=10.0)
        response.raise_for_status()
        data = response.json()
        return data.get("passes", [])
    except Exception as e:
        logger.debug(f"Error fetching satellite {norad_id}: {e}")
        return []


def get_satellite_passes(
    lat: float,
    lon: float,
    days: int = 3,
    min_visibility: int = 120,
    max_results: int = 10
) -> SatelliteInfo:
    """Get predicted satellite passes for the location.

    Tracks Starlink satellites, space stations, and other notable satellites.
    Requires N2YO_API_KEY environment variable.

    Args:
        lat: Latitude in degrees
        lon: Longitude in degrees
        days: Number of days to predict (default 3)
        min_visibility: Minimum pass duration in seconds (default 120)
        max_results: Maximum number of passes to return (default 10)

    Returns:
        SatelliteInfo with pass predictions
    """
    api_key = os.environ.get("N2YO_API_KEY", "")

    empty_result = SatelliteInfo(
        total_passes=0,
        starlink_passes=0,
        station_passes=0,
        next_bright_pass=None,
        passes=[]
    )

    if not api_key:
        logger.debug("N2YO_API_KEY not set, skipping satellite predictions")
        return empty_result

    all_passes: list[SatellitePass] = []

    # Fetch notable satellites (Hubble, Tiangong)
    for norad_id, name, sat_type in NOTABLE_SATELLITES:
        raw_passes = _fetch_satellite_passes(norad_id, lat, lon, days, min_visibility, api_key)
        for p in raw_passes:
            mag = p.get("mag", 0.0)
            all_passes.append(SatellitePass(
                satellite_name=name,
                satellite_type=sat_type,
                norad_id=norad_id,
                start_time=datetime.fromtimestamp(p["startUTC"], tz=timezone.utc).isoformat(),
                duration_minutes=p["duration"] // 60,
                max_altitude=p["maxEl"],
                start_direction=_azimuth_to_direction(p["startAz"]),
                end_direction=_azimuth_to_direction(p["endAz"]),
                brightness=_magnitude_to_brightness(mag),
                magnitude=round(mag, 1),
            ))

    # Fetch sample Starlink satellites
    for norad_id, name in STARLINK_SAMPLE_IDS:
        raw_passes = _fetch_satellite_passes(norad_id, lat, lon, days, min_visibility, api_key)
        for p in raw_passes:
            mag = p.get("mag", 0.0)
            # Only include reasonably bright Starlink passes
            if mag <= 2.0:  # Visible to naked eye
                all_passes.append(SatellitePass(
                    satellite_name=name,
                    satellite_type="starlink",
                    norad_id=norad_id,
                    start_time=datetime.fromtimestamp(p["startUTC"], tz=timezone.utc).isoformat(),
                    duration_minutes=p["duration"] // 60,
                    max_altitude=p["maxEl"],
                    start_direction=_azimuth_to_direction(p["startAz"]),
                    end_direction=_azimuth_to_direction(p["endAz"]),
                    brightness=_magnitude_to_brightness(mag),
                    magnitude=round(mag, 1),
                ))

    # Sort by start time
    all_passes.sort(key=lambda x: x["start_time"])

    # Limit results
    passes = all_passes[:max_results]

    # Count by type
    starlink_count = sum(1 for p in passes if p["satellite_type"] == "starlink")
    station_count = sum(1 for p in passes if p["satellite_type"] == "station")

    # Find next bright pass (magnitude <= -2.0)
    next_bright = None
    for p in passes:
        if p["magnitude"] <= -2.0:
            next_bright = p
            break

    return SatelliteInfo(
        total_passes=len(passes),
        starlink_passes=starlink_count,
        station_passes=station_count,
        next_bright_pass=next_bright,
        passes=passes
    )
