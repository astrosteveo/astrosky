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

    # Summer solstice in NYC: sunrise ~5:25 EDT (9:25 UTC), sunset ~20:31 EDT (00:31 UTC next day)
    assert result["sunrise"].hour == 9
    assert result["sunset"].hour == 0
    assert "astronomical_twilight_end" in result
    assert "astronomical_twilight_start" in result


@time_machine.travel("2025-12-21 12:00:00", tick=False)
def test_get_sun_times_winter_solstice():
    """Sun times for NYC on winter solstice."""
    result = get_sun_times(NYC_LAT, NYC_LON, datetime(2025, 12, 21, tzinfo=timezone.utc))

    # Winter solstice in NYC: sunrise ~7:16 EST (12:16 UTC), sunset ~16:32 EST (21:32 UTC)
    assert result["sunrise"].hour == 12
    assert result["sunset"].hour == 21


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


def test_darkness_quality_new_moon():
    """New moon = excellent darkness."""
    result = get_moon_info(NYC_LAT, NYC_LON, datetime(2025, 1, 29, 12, 0, tzinfo=timezone.utc))
    assert result["darkness_quality"] == "Excellent"


def test_darkness_quality_full_moon():
    """Full moon = poor darkness."""
    result = get_moon_info(NYC_LAT, NYC_LON, datetime(2025, 1, 13, 12, 0, tzinfo=timezone.utc))
    assert result["darkness_quality"] == "Poor"
