"""Tests for meteor shower source."""

from datetime import datetime, timezone

from skycli.sources.meteors import get_active_showers


def test_ursids_active_in_december():
    """Ursids should be active around Dec 22."""
    result = get_active_showers(datetime(2025, 12, 22, tzinfo=timezone.utc))
    names = [s["name"] for s in result]
    assert "Ursids" in names


def test_perseids_active_in_august():
    """Perseids should be active in mid-August."""
    result = get_active_showers(datetime(2025, 8, 12, tzinfo=timezone.utc))
    names = [s["name"] for s in result]
    assert "Perseids" in names


def test_no_showers_in_march():
    """No major showers in mid-March."""
    result = get_active_showers(datetime(2025, 3, 15, tzinfo=timezone.utc))
    assert len(result) == 0


def test_shower_info_structure():
    """Each shower has required fields."""
    result = get_active_showers(datetime(2025, 12, 22, tzinfo=timezone.utc))
    if result:
        shower = result[0]
        assert "name" in shower
        assert "zhr" in shower
        assert "peak_date" in shower
        assert "radiant_constellation" in shower
        assert "is_peak" in shower
