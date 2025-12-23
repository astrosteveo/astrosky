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


@time_machine.travel("2025-12-01 12:00:00Z")
def test_finds_planet_moon_conjunction():
    """Should find planet-Moon conjunctions within threshold."""
    date = datetime(2025, 12, 1, 12, 0, tzinfo=timezone.utc)
    events = get_upcoming_events(lat=40.7, lon=-74.0, start=date, days=30)

    conjunctions = [e for e in events if e["type"] == "conjunction"]
    # December 2025 has several planet-Moon conjunctions
    assert len(conjunctions) >= 1

    # Check structure
    conj = conjunctions[0]
    assert "Moon" in conj["bodies"] or len(conj["bodies"]) == 2
    assert "°" in conj["description"]  # Should include separation


def test_conjunction_crosses_month_boundary():
    """Ensure conjunctions work across month boundaries."""
    date = datetime(2025, 12, 28, 12, 0, tzinfo=timezone.utc)
    # Should not crash - 7 days crosses into January
    events = get_upcoming_events(lat=40.7, lon=-74.0, start=date, days=7)
    assert isinstance(events, list)


@time_machine.travel("2025-01-01 12:00:00Z")
def test_finds_opposition_for_outer_planets():
    """Oppositions only occur for outer planets (Mars and beyond)."""
    date = datetime(2025, 1, 1, 12, 0, tzinfo=timezone.utc)
    # Look far ahead - oppositions are rare
    events = get_upcoming_events(lat=40.7, lon=-74.0, start=date, days=365)

    oppositions = [e for e in events if e["type"] == "opposition"]

    # Any oppositions found should be outer planets only
    for opp in oppositions:
        body = opp["bodies"][0]
        assert body in ["Mars", "Jupiter", "Saturn", "Uranus", "Neptune"]


def test_no_opposition_for_inner_planets():
    """Mercury and Venus never have oppositions."""
    date = datetime(2025, 1, 1, 12, 0, tzinfo=timezone.utc)
    events = get_upcoming_events(lat=40.7, lon=-74.0, start=date, days=365)

    oppositions = [e for e in events if e["type"] == "opposition"]
    inner_planet_opps = [o for o in oppositions if o["bodies"][0] in ["Mercury", "Venus"]]
    assert len(inner_planet_opps) == 0
