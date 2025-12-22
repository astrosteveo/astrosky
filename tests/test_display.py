"""Tests for terminal display formatting."""

from datetime import datetime, timezone

from skycli.display import render_report


def test_render_report_returns_string():
    """render_report returns a string for console output."""
    report_data = {
        "date": datetime(2025, 1, 15, tzinfo=timezone.utc),
        "location": {"lat": 40.7, "lon": -74.0},
        "sun": {
            "sunrise": datetime(2025, 1, 15, 12, 18, tzinfo=timezone.utc),
            "sunset": datetime(2025, 1, 15, 21, 45, tzinfo=timezone.utc),
        },
        "moon": {
            "phase_name": "Full Moon",
            "illumination": 98.5,
            "darkness_quality": "Poor",
        },
        "planets": [],
        "iss_passes": [],
        "meteors": [],
        "deep_sky": [],
    }
    result = render_report(report_data)
    assert isinstance(result, str)
    assert "Tonight's Sky" in result or "tonight" in result.lower()


def test_render_includes_location():
    """Output includes formatted location."""
    report_data = {
        "date": datetime(2025, 1, 15, tzinfo=timezone.utc),
        "location": {"lat": 40.7, "lon": -74.0},
        "sun": {
            "sunrise": datetime(2025, 1, 15, 12, 18, tzinfo=timezone.utc),
            "sunset": datetime(2025, 1, 15, 21, 45, tzinfo=timezone.utc),
        },
        "moon": {"phase_name": "New Moon", "illumination": 2.0, "darkness_quality": "Excellent"},
        "planets": [], "iss_passes": [], "meteors": [], "deep_sky": [],
    }
    result = render_report(report_data)
    assert "40.7" in result


def test_render_includes_moon_info():
    """Output includes moon phase."""
    report_data = {
        "date": datetime(2025, 1, 15, tzinfo=timezone.utc),
        "location": {"lat": 40.7, "lon": -74.0},
        "sun": {
            "sunrise": datetime(2025, 1, 15, 12, 18, tzinfo=timezone.utc),
            "sunset": datetime(2025, 1, 15, 21, 45, tzinfo=timezone.utc),
        },
        "moon": {"phase_name": "Full Moon", "illumination": 98.5, "darkness_quality": "Poor"},
        "planets": [], "iss_passes": [], "meteors": [], "deep_sky": [],
    }
    result = render_report(report_data)
    assert "Full Moon" in result or "98" in result
