"""Tests for astronomical events calculations."""

from datetime import datetime, timezone

import time_machine

from skycli.sources.events import AstroEvent, get_upcoming_events


def test_get_upcoming_events_returns_list():
    """Basic smoke test - function returns a list."""
    date = datetime(2025, 12, 25, 12, 0, tzinfo=timezone.utc)
    result = get_upcoming_events(lat=40.7, lon=-74.0, start=date, days=7)
    assert isinstance(result, list)


@time_machine.travel("2025-12-01 12:00:00Z")
def test_finds_full_moon_in_window():
    """Dec 4, 2025 has a Full Moon - should be found in 7-day window."""
    date = datetime(2025, 12, 1, 12, 0, tzinfo=timezone.utc)
    events = get_upcoming_events(lat=40.7, lon=-74.0, start=date, days=7)

    moon_events = [e for e in events if e["type"] == "moon_phase"]
    assert len(moon_events) >= 1

    full_moon = next((e for e in moon_events if "Full" in e["title"]), None)
    assert full_moon is not None
    assert full_moon["date"].day == 4  # Full Moon on Dec 4, 2025
