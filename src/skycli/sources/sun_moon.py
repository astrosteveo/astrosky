"""Sun and moon calculations using Skyfield."""

from datetime import datetime, timedelta, timezone
from typing import TypedDict

from skyfield import almanac
from skyfield.api import N, W, load, wgs84

# Moon phase angle thresholds (in degrees)
PHASE_NEW_MOON_MAX = 22.5
PHASE_WAXING_CRESCENT_MAX = 67.5
PHASE_FIRST_QUARTER_MAX = 112.5
PHASE_WAXING_GIBBOUS_MAX = 157.5
PHASE_FULL_MOON_MAX = 202.5
PHASE_WANING_GIBBOUS_MAX = 247.5
PHASE_LAST_QUARTER_MAX = 292.5
PHASE_WANING_CRESCENT_MAX = 337.5

# Darkness quality thresholds (moon illumination percentage)
DARKNESS_EXCELLENT_MAX = 25  # < 25% illumination = Excellent
DARKNESS_GOOD_MAX = 50       # < 50% illumination = Good
DARKNESS_FAIR_MAX = 75       # < 75% illumination = Fair
# >= 75% illumination = Poor


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
    darkness_quality: str  # Excellent, Good, Fair, Poor
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

    # Determine phase name based on angle thresholds
    if phase_angle < PHASE_NEW_MOON_MAX or phase_angle >= PHASE_WANING_CRESCENT_MAX:
        phase_name = "New Moon"
    elif phase_angle < PHASE_WAXING_CRESCENT_MAX:
        phase_name = "Waxing Crescent"
    elif phase_angle < PHASE_FIRST_QUARTER_MAX:
        phase_name = "First Quarter"
    elif phase_angle < PHASE_WAXING_GIBBOUS_MAX:
        phase_name = "Waxing Gibbous"
    elif phase_angle < PHASE_FULL_MOON_MAX:
        phase_name = "Full Moon"
    elif phase_angle < PHASE_WANING_GIBBOUS_MAX:
        phase_name = "Waning Gibbous"
    elif phase_angle < PHASE_LAST_QUARTER_MAX:
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

    # Determine darkness quality based on moon illumination percentage
    if illumination < DARKNESS_EXCELLENT_MAX:
        darkness_quality = "Excellent"
    elif illumination < DARKNESS_GOOD_MAX:
        darkness_quality = "Good"
    elif illumination < DARKNESS_FAIR_MAX:
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
