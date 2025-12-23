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

PLANETS = [
    astronomy.Body.Mercury,
    astronomy.Body.Venus,
    astronomy.Body.Mars,
    astronomy.Body.Jupiter,
    astronomy.Body.Saturn,
    astronomy.Body.Uranus,
    astronomy.Body.Neptune,
]

PLANET_NAMES = {
    astronomy.Body.Mercury: "Mercury",
    astronomy.Body.Venus: "Venus",
    astronomy.Body.Mars: "Mars",
    astronomy.Body.Jupiter: "Jupiter",
    astronomy.Body.Saturn: "Saturn",
    astronomy.Body.Uranus: "Uranus",
    astronomy.Body.Neptune: "Neptune",
}

CONJUNCTION_THRESHOLD = 5.0  # degrees


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


def _angle_between(body1: astronomy.Body, body2: astronomy.Body, time: astronomy.Time) -> float:
    """Calculate angular separation between two bodies."""
    vec1 = astronomy.GeoVector(body1, time, True)
    vec2 = astronomy.GeoVector(body2, time, True)
    return astronomy.AngleBetween(vec1, vec2)


def _find_conjunctions(start: datetime, days: int) -> list[AstroEvent]:
    """Find conjunctions between planets and Moon."""
    events = []
    start_time = astronomy.Time.Make(start.year, start.month, start.day, start.hour, start.minute, 0)

    # Check each day for close approaches
    for day_offset in range(days):
        check_date = start + timedelta(days=day_offset)
        check_time = astronomy.Time.Make(
            check_date.year, check_date.month, check_date.day, 12, 0, 0
        )

        # Planet-Moon conjunctions
        for planet in PLANETS:
            angle = _angle_between(planet, astronomy.Body.Moon, check_time)
            if angle <= CONJUNCTION_THRESHOLD:
                event_date = check_time.Utc().replace(tzinfo=start.tzinfo)
                planet_name = PLANET_NAMES[planet]
                events.append(AstroEvent(
                    type="conjunction",
                    date=event_date,
                    title=f"{planet_name}-Moon Conjunction",
                    description=f"{planet_name} {angle:.1f}° from Moon",
                    bodies=[planet_name, "Moon"],
                ))

        # Planet-Planet conjunctions (avoid duplicates)
        for i, planet1 in enumerate(PLANETS):
            for planet2 in PLANETS[i + 1:]:
                angle = _angle_between(planet1, planet2, check_time)
                if angle <= CONJUNCTION_THRESHOLD:
                    event_date = check_time.Utc().replace(tzinfo=start.tzinfo)
                    name1 = PLANET_NAMES[planet1]
                    name2 = PLANET_NAMES[planet2]
                    events.append(AstroEvent(
                        type="conjunction",
                        date=event_date,
                        title=f"{name1}-{name2} Conjunction",
                        description=f"{name1} {angle:.1f}° from {name2}",
                        bodies=[name1, name2],
                    ))

    # Deduplicate events on same day for same bodies
    seen = set()
    unique_events = []
    for event in events:
        key = (event["date"].date(), tuple(sorted(event["bodies"])))
        if key not in seen:
            seen.add(key)
            unique_events.append(event)

    return unique_events


def get_upcoming_events(
    lat: float, lon: float, start: datetime, days: int = 7
) -> list[AstroEvent]:
    """Get astronomical events within the specified window.

    Returns empty list on any error (graceful degradation).
    """
    try:
        events = []
        events.extend(_find_moon_phases(start, days))
        events.extend(_find_conjunctions(start, days))
        return sorted(events, key=lambda e: e["date"])
    except Exception:
        return []
