"""Tests for report orchestration."""

from datetime import datetime, timezone

import time_machine

from skycli.report import build_report


NYC_LAT = 40.7128
NYC_LON = -74.0060


@time_machine.travel("2025-01-15 22:00:00", tick=False)
def test_build_report_returns_complete_structure():
    """build_report returns all expected sections."""
    result = build_report(lat=NYC_LAT, lon=NYC_LON, date=datetime(2025, 1, 15, tzinfo=timezone.utc))

    assert "date" in result
    assert "location" in result
    assert "sun" in result
    assert "moon" in result
    assert "planets" in result
    assert "iss_passes" in result
    assert "meteors" in result
    assert "deep_sky" in result


@time_machine.travel("2025-01-15 22:00:00", tick=False)
def test_build_report_respects_only_filter():
    """Only requested sections are populated when using only filter."""
    result = build_report(lat=NYC_LAT, lon=NYC_LON, date=datetime(2025, 1, 15, tzinfo=timezone.utc), only=["moon", "planets"])

    # Moon and planets should be present
    assert result["moon"] is not None
    assert result["planets"] is not None

    # Others should be empty/None
    assert result["iss_passes"] == []
    assert result["meteors"] == []
    assert result["deep_sky"] == []


@time_machine.travel("2025-01-15 22:00:00", tick=False)
def test_build_report_respects_exclude_filter():
    """Excluded sections are empty."""
    result = build_report(lat=NYC_LAT, lon=NYC_LON, date=datetime(2025, 1, 15, tzinfo=timezone.utc), exclude=["iss"])

    # ISS should be empty
    assert result["iss_passes"] == []

    # Others should be populated
    assert result["moon"] is not None


@time_machine.travel("2025-12-20 12:00:00Z")
def test_report_includes_events():
    """Report should include events section."""
    date = datetime(2025, 12, 20, 20, 0, tzinfo=timezone.utc)
    report = build_report(lat=40.7, lon=-74.0, date=date)

    assert "events" in report
    assert isinstance(report["events"], list)
