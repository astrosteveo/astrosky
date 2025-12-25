"""Weather data for observing conditions using Open-Meteo API."""

from datetime import datetime
from typing import TypedDict
import urllib.request
import urllib.error
import json


class ObservingConditions(TypedDict):
    """Weather-based observing conditions."""

    cloud_cover: int  # 0-100 percentage
    humidity: int  # 0-100 percentage
    visibility: float  # km
    wind_speed: float  # km/h
    temperature: float  # Celsius
    condition: str  # Excellent, Good, Fair, Poor
    summary: str  # Human-readable summary


# Cloud cover thresholds for observing quality
CLOUD_EXCELLENT_MAX = 10  # < 10% clouds = Excellent
CLOUD_GOOD_MAX = 30  # < 30% clouds = Good
CLOUD_FAIR_MAX = 60  # < 60% clouds = Fair
# >= 60% clouds = Poor


def _calculate_condition(cloud_cover: int, humidity: int, visibility: float) -> str:
    """Calculate overall observing condition based on weather factors."""
    # Primary factor: cloud cover
    if cloud_cover >= 80:
        return "Poor"
    if cloud_cover >= CLOUD_FAIR_MAX:
        return "Fair"

    # Secondary factors can downgrade the rating
    score = 0

    # Cloud cover scoring (most important)
    if cloud_cover < CLOUD_EXCELLENT_MAX:
        score += 3
    elif cloud_cover < CLOUD_GOOD_MAX:
        score += 2
    else:
        score += 1

    # Humidity scoring (affects transparency)
    if humidity < 50:
        score += 2
    elif humidity < 70:
        score += 1
    # High humidity = no bonus

    # Visibility scoring
    if visibility >= 20:
        score += 2
    elif visibility >= 10:
        score += 1
    # Low visibility = no bonus

    # Convert score to condition
    if score >= 6:
        return "Excellent"
    elif score >= 4:
        return "Good"
    elif score >= 2:
        return "Fair"
    return "Poor"


def _generate_summary(
    cloud_cover: int, humidity: int, visibility: float, wind_speed: float, condition: str
) -> str:
    """Generate a human-readable summary of observing conditions."""
    parts = []

    # Cloud description
    if cloud_cover < 10:
        parts.append("Clear skies")
    elif cloud_cover < 30:
        parts.append("Mostly clear")
    elif cloud_cover < 60:
        parts.append("Partly cloudy")
    elif cloud_cover < 80:
        parts.append("Mostly cloudy")
    else:
        parts.append("Overcast")

    # Transparency note
    if humidity > 80:
        parts.append("hazy conditions")
    elif humidity < 40 and visibility > 20:
        parts.append("excellent transparency")

    # Wind note (affects telescope stability)
    if wind_speed > 30:
        parts.append("windy")
    elif wind_speed > 20:
        parts.append("breezy")

    summary = ", ".join(parts)

    # Add recommendation
    if condition == "Excellent":
        summary += ". Perfect for deep sky observing!"
    elif condition == "Good":
        summary += ". Good night for astronomy."
    elif condition == "Fair":
        summary += ". Planets and bright objects visible."
    else:
        summary += ". Consider rescheduling observations."

    return summary


def get_observing_conditions(lat: float, lon: float, date: datetime) -> ObservingConditions:
    """Fetch weather data and calculate observing conditions.

    Uses Open-Meteo API (free, no API key required).
    Returns default "unknown" conditions if API call fails.
    """
    try:
        # Open-Meteo API for current weather
        url = (
            f"https://api.open-meteo.com/v1/forecast?"
            f"latitude={lat}&longitude={lon}"
            f"&current=cloud_cover,relative_humidity_2m,visibility,wind_speed_10m,temperature_2m"
            f"&timezone=auto"
        )

        req = urllib.request.Request(url, headers={"User-Agent": "AstroSky/1.0"})
        with urllib.request.urlopen(req, timeout=5) as response:
            data = json.loads(response.read().decode())

        current = data.get("current", {})

        cloud_cover = int(current.get("cloud_cover", 50))
        humidity = int(current.get("relative_humidity_2m", 50))
        # Visibility comes in meters, convert to km
        visibility_m = current.get("visibility", 10000)
        visibility = round(visibility_m / 1000, 1)
        wind_speed = round(current.get("wind_speed_10m", 0), 1)
        temperature = round(current.get("temperature_2m", 15), 1)

        condition = _calculate_condition(cloud_cover, humidity, visibility)
        summary = _generate_summary(cloud_cover, humidity, visibility, wind_speed, condition)

        return ObservingConditions(
            cloud_cover=cloud_cover,
            humidity=humidity,
            visibility=visibility,
            wind_speed=wind_speed,
            temperature=temperature,
            condition=condition,
            summary=summary,
        )

    except (urllib.error.URLError, json.JSONDecodeError, KeyError, TimeoutError):
        # Return fallback data on any error
        return ObservingConditions(
            cloud_cover=-1,  # -1 indicates unknown
            humidity=-1,
            visibility=-1,
            wind_speed=-1,
            temperature=-1,
            condition="Unknown",
            summary="Weather data unavailable. Check local conditions.",
        )
