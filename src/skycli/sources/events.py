"""Astronomical event calculations using Astronomy Engine."""

from datetime import datetime
from typing import TypedDict


class AstroEvent(TypedDict):
    """Information about an astronomical event."""

    type: str  # "conjunction", "opposition", "moon_phase", "equinox", "solstice"
    date: datetime
    title: str
    description: str
    bodies: list[str]


def get_upcoming_events(
    lat: float, lon: float, start: datetime, days: int = 7
) -> list[AstroEvent]:
    """Get astronomical events within the specified window.

    Returns empty list on any error (graceful degradation).
    """
    return []
