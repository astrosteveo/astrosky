"""Report orchestration - collects data from all sources."""

from datetime import datetime
from typing import Any

from skycli.sources.sun_moon import get_sun_times, get_moon_info
from skycli.sources.planets import get_visible_planets
from skycli.sources.iss import get_iss_passes
from skycli.sources.meteors import get_active_showers
from skycli.sources.deep_sky import get_visible_dso
from skycli.sources.events import get_upcoming_events


SECTION_MAP = {
    "moon": "moon",
    "planets": "planets",
    "iss": "iss_passes",
    "meteors": "meteors",
    "deepsky": "deep_sky",
    "events": "events",
}


def _should_include(section: str, only: list[str] | None, exclude: list[str] | None) -> bool:
    """Determine if a section should be included based on filters."""
    if only is not None:
        return section in only
    if exclude is not None:
        return section not in exclude
    return True


def build_report(
    lat: float,
    lon: float,
    date: datetime,
    at_time: str | None = None,
    only: list[str] | None = None,
    exclude: list[str] | None = None,
) -> dict[str, Any]:
    """Build a complete sky report for the given location and time."""

    # Always get sun times (needed for context)
    sun_times = get_sun_times(lat, lon, date)

    # Always get moon info (needed for header)
    moon_info = get_moon_info(lat, lon, date)

    # Build report structure
    report: dict[str, Any] = {
        "date": date,
        "location": {"lat": lat, "lon": lon},
        "sun": sun_times,
        "moon": moon_info,
        "planets": [],
        "iss_passes": [],
        "meteors": [],
        "deep_sky": [],
        "events": [],
    }

    # Planets
    if _should_include("planets", only, exclude):
        report["planets"] = get_visible_planets(lat, lon, date)

    # ISS passes
    if _should_include("iss", only, exclude):
        report["iss_passes"] = get_iss_passes(lat, lon, date)

    # Meteor showers
    if _should_include("meteors", only, exclude):
        report["meteors"] = get_active_showers(date)

    # Deep sky objects
    if _should_include("deepsky", only, exclude):
        report["deep_sky"] = get_visible_dso(lat, lon, date)

    # Astronomical events (next 2 days for tonight report)
    if _should_include("events", only, exclude):
        report["events"] = get_upcoming_events(lat, lon, date, days=2)

    return report
