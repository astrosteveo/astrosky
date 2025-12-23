"""Astronomical event calculations using Astronomy Engine."""

from datetime import datetime, timedelta
from typing import TypedDict

import astronomy


class AstroEvent(TypedDict):
    """Information about an astronomical event."""

    type: str  # "conjunction", "opposition", "moon_phase", "equinox", "solstice"
    date: datetime
    title: str
    description: str
    bodies: list[str]


# Traditional Full Moon names by month
FULL_MOON_NAMES = {
    1: "Wolf Moon",
    2: "Snow Moon",
    3: "Worm Moon",
    4: "Pink Moon",
    5: "Flower Moon",
    6: "Strawberry Moon",
    7: "Buck Moon",
    8: "Sturgeon Moon",
    9: "Harvest Moon",
    10: "Hunter's Moon",
    11: "Beaver Moon",
    12: "Cold Moon",
}


def _find_moon_phases(start: datetime, days: int) -> list[AstroEvent]:
    """Find Full Moon and New Moon events in the window."""
    events = []
    end = start + timedelta(days=days)

    start_time = astronomy.Time.Make(start.year, start.month, start.day, start.hour, start.minute, 0)

    # Search for Full Moon (phase 180°)
    full_moon = astronomy.SearchMoonPhase(180, start_time, days)
    if full_moon is not None:
        # full_moon.Utc() returns a datetime object
        event_date = full_moon.Utc().replace(tzinfo=start.tzinfo)
        if event_date <= end:
            name = FULL_MOON_NAMES.get(event_date.month, "Full Moon")
            events.append(AstroEvent(
                type="moon_phase",
                date=event_date,
                title=f"Full Moon ({name})",
                description="Moon fully illuminated",
                bodies=["Moon"],
            ))

    # Search for New Moon (phase 0°)
    new_moon = astronomy.SearchMoonPhase(0, start_time, days)
    if new_moon is not None:
        # new_moon.Utc() returns a datetime object
        event_date = new_moon.Utc().replace(tzinfo=start.tzinfo)
        if event_date <= end:
            events.append(AstroEvent(
                type="moon_phase",
                date=event_date,
                title="New Moon",
                description="Best time for deep sky observing",
                bodies=["Moon"],
            ))

    return events


def get_upcoming_events(
    lat: float, lon: float, start: datetime, days: int = 7
) -> list[AstroEvent]:
    """Get astronomical events within the specified window.

    Returns empty list on any error (graceful degradation).
    """
    try:
        events = []
        events.extend(_find_moon_phases(start, days))
        return sorted(events, key=lambda e: e["date"])
    except Exception:
        return []
