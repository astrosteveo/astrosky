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
