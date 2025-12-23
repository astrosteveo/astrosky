"""Tests for astronomical events calculations."""

from datetime import datetime, timezone

from skycli.sources.events import AstroEvent, get_upcoming_events


def test_get_upcoming_events_returns_list():
    """Basic smoke test - function returns a list."""
    date = datetime(2025, 12, 25, 12, 0, tzinfo=timezone.utc)
    result = get_upcoming_events(lat=40.7, lon=-74.0, start=date, days=7)
    assert isinstance(result, list)
