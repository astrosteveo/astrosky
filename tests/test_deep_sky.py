"""Tests for deep sky object source."""

from datetime import datetime, timezone

from skycli.sources.deep_sky import get_visible_dso


NYC_LAT = 40.7128
NYC_LON = -74.0060


def test_returns_list_of_visible_objects():
    """Returns visible deep sky objects for the location and time."""
    result = get_visible_dso(NYC_LAT, NYC_LON, datetime(2025, 1, 15, 22, 0, tzinfo=timezone.utc), limit=5)
    assert isinstance(result, list)
    assert len(result) <= 5


def test_orion_nebula_visible_winter():
    """M42 Orion Nebula should be visible in winter evenings."""
    result = get_visible_dso(NYC_LAT, NYC_LON, datetime(2025, 1, 16, 3, 0, tzinfo=timezone.utc), limit=10)
    ids = [obj["id"] for obj in result]
    assert "M42" in ids


def test_dso_info_structure():
    """Each DSO has required fields."""
    result = get_visible_dso(NYC_LAT, NYC_LON, datetime(2025, 1, 15, 22, 0, tzinfo=timezone.utc), limit=5)
    if result:
        obj = result[0]
        assert "id" in obj
        assert "name" in obj
        assert "constellation" in obj
        assert "mag" in obj
        assert "type" in obj
        assert "tip" in obj
        assert "altitude" in obj
