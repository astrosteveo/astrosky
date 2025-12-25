"""Aurora and geomagnetic data from NOAA Space Weather Prediction Center."""

from typing import TypedDict
import urllib.request
import urllib.error
import json
import math


class AuroraForecast(TypedDict):
    """Aurora visibility forecast."""

    kp_current: float  # Current Kp index (0-9)
    kp_24h_max: float  # Maximum Kp in next 24 hours
    geomagnetic_storm: bool  # True if Kp >= 5
    storm_level: str  # G0 (none) to G5 (extreme)
    visibility_probability: int  # 0-100 for user's location
    visible_latitude: float  # Minimum latitude where aurora may be visible
    best_time: str  # Best viewing time advice
    activity_level: str  # Quiet, Unsettled, Active, Storm
    summary: str  # Human-readable summary


# Kp index to approximate visible latitude (degrees from pole)
# Higher Kp = aurora visible further from poles
KP_TO_LATITUDE = {
    0: 66,  # Arctic circle only
    1: 64,
    2: 62,
    3: 60,
    4: 58,
    5: 55,  # G1 storm - visible in northern US/UK
    6: 50,  # G2 storm - visible in central US/Europe
    7: 45,  # G3 storm - visible in southern US/Mediterranean
    8: 40,  # G4 storm - visible very far south
    9: 35,  # G5 extreme - historic visibility
}

# Storm level classifications
STORM_LEVELS = {
    5: "G1",
    6: "G2",
    7: "G3",
    8: "G4",
    9: "G5",
}


def _kp_to_visible_latitude(kp: float) -> float:
    """Convert Kp index to approximate minimum visible latitude."""
    kp_int = min(9, max(0, int(kp)))
    return KP_TO_LATITUDE.get(kp_int, 66)


def _get_activity_level(kp: float) -> str:
    """Get activity level description from Kp index."""
    if kp >= 7:
        return "Storm"
    elif kp >= 5:
        return "Active"
    elif kp >= 3:
        return "Unsettled"
    return "Quiet"


def _get_storm_level(kp: float) -> str:
    """Get geomagnetic storm level from Kp index."""
    kp_int = int(kp)
    if kp_int >= 5:
        return STORM_LEVELS.get(kp_int, "G1")
    return "G0"


def _calculate_visibility_probability(
    user_lat: float, visible_lat: float, kp: float
) -> int:
    """Calculate probability of aurora visibility at user's location.

    Takes into account:
    - Distance from auroral zone
    - Current activity level
    - Hemisphere (uses absolute latitude)
    """
    abs_lat = abs(user_lat)

    # If user is at or above the visible latitude, high probability
    if abs_lat >= visible_lat:
        base_prob = 80 + min(20, (abs_lat - visible_lat) * 2)
        return min(100, int(base_prob))

    # Calculate how far below the visible latitude
    lat_diff = visible_lat - abs_lat

    if lat_diff > 20:
        # Way too far south/north
        return 0
    elif lat_diff > 15:
        return 5
    elif lat_diff > 10:
        return 10 + int(kp * 2)
    elif lat_diff > 5:
        return 25 + int(kp * 5)
    else:
        # Close to visible latitude
        return 50 + int(kp * 5)


def _generate_summary(
    kp: float,
    activity: str,
    probability: int,
    user_lat: float
) -> str:
    """Generate human-readable aurora forecast summary."""
    abs_lat = abs(user_lat)
    hemisphere = "Northern" if user_lat >= 0 else "Southern"
    aurora_name = "Aurora Borealis" if user_lat >= 0 else "Aurora Australis"

    if probability >= 80:
        return f"{aurora_name} likely visible tonight! Get away from city lights for best views."
    elif probability >= 50:
        return f"Good chance of {aurora_name} activity. Watch for displays to the {'north' if user_lat >= 0 else 'south'}."
    elif probability >= 20:
        return f"Possible {aurora_name} if activity increases. Monitor for G2+ storm conditions."
    elif kp >= 5:
        return f"Geomagnetic storm active but you're too far {'south' if user_lat >= 0 else 'north'}. Travel {'north' if user_lat >= 0 else 'south'} for better chances."
    else:
        return f"Aurora activity quiet. Typical visible latitude: {_kp_to_visible_latitude(kp)}°N/S."


def _get_best_viewing_time(kp: float) -> str:
    """Get advice on best viewing time."""
    if kp >= 5:
        return "Active now - check immediately if skies are clear"
    elif kp >= 3:
        return "Best viewing: midnight to 3am local time"
    else:
        return "Low activity - best chances midnight to 4am if conditions improve"


def get_aurora_forecast(lat: float, lon: float) -> AuroraForecast:
    """Fetch aurora/geomagnetic data from NOAA SWPC.

    Returns current Kp index and visibility forecast for the user's location.
    Uses NOAA Space Weather Prediction Center's public APIs.
    """
    kp_current = 2.0
    kp_24h_max = 3.0

    try:
        # Fetch current Kp index
        kp_url = "https://services.swpc.noaa.gov/products/noaa-planetary-k-index.json"
        req = urllib.request.Request(kp_url, headers={"User-Agent": "AstroSky/1.0"})

        with urllib.request.urlopen(req, timeout=10) as response:
            data = json.loads(response.read().decode())

        # Data format: [["time_tag", "Kp", "a_running", "station_count"], [...], ...]
        # Skip header row, get latest readings
        if len(data) > 1:
            readings = data[1:]  # Skip header

            # Get most recent Kp
            if readings:
                latest = readings[-1]
                kp_current = float(latest[1]) if len(latest) > 1 else 2.0

            # Get max Kp from last 8 readings (24 hours of 3-hour intervals)
            recent = readings[-8:] if len(readings) >= 8 else readings
            kp_values = [float(r[1]) for r in recent if len(r) > 1]
            kp_24h_max = max(kp_values) if kp_values else kp_current

    except (urllib.error.URLError, json.JSONDecodeError, ValueError, TimeoutError, IndexError):
        # Use defaults on error
        pass

    # Calculate derived values
    visible_lat = _kp_to_visible_latitude(kp_current)
    probability = _calculate_visibility_probability(lat, visible_lat, kp_current)
    activity = _get_activity_level(kp_current)
    storm_level = _get_storm_level(kp_current)
    is_storm = kp_current >= 5
    summary = _generate_summary(kp_current, activity, probability, lat)
    best_time = _get_best_viewing_time(kp_current)

    return AuroraForecast(
        kp_current=round(kp_current, 1),
        kp_24h_max=round(kp_24h_max, 1),
        geomagnetic_storm=is_storm,
        storm_level=storm_level,
        visibility_probability=probability,
        visible_latitude=visible_lat,
        best_time=best_time,
        activity_level=activity,
        summary=summary,
    )
