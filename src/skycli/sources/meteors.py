"""Meteor shower data and activity detection."""

import json
from datetime import datetime
from typing import TypedDict

from skycli.data import DATA_DIR


class ShowerInfo(TypedDict):
    """Information about an active meteor shower."""
    name: str
    zhr: int  # Zenithal Hourly Rate
    peak_date: str  # "Dec 22"
    radiant_constellation: str
    is_peak: bool


def _load_showers() -> list[dict]:
    """Load meteor shower data from JSON."""
    with open(DATA_DIR / "showers.json") as f:
        return json.load(f)


def _is_date_in_range(date: datetime, start: dict, end: dict) -> bool:
    """Check if date falls within active period."""
    month = date.month
    day = date.day
    start_month, start_day = start["month"], start["day"]
    end_month, end_day = end["month"], end["day"]

    # Handle year wraparound (e.g., Dec 28 to Jan 5)
    if start_month > end_month:
        if month > start_month or (month == start_month and day >= start_day):
            return True
        if month < end_month or (month == end_month and day <= end_day):
            return True
        return False

    # Normal case
    if month < start_month or month > end_month:
        return False
    if month == start_month and day < start_day:
        return False
    if month == end_month and day > end_day:
        return False
    return True


def _format_peak_date(month: int, day: int) -> str:
    """Format peak date as 'Mon DD'."""
    months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"]
    return f"{months[month - 1]} {day}"


def get_active_showers(date: datetime) -> list[ShowerInfo]:
    """Get meteor showers active on the given date."""
    showers = _load_showers()
    active = []

    for shower in showers:
        if _is_date_in_range(date, shower["active_start"], shower["active_end"]):
            is_peak = (date.month == shower["peak_month"] and abs(date.day - shower["peak_day"]) <= 1)
            active.append(ShowerInfo(
                name=shower["name"],
                zhr=shower["zhr"],
                peak_date=_format_peak_date(shower["peak_month"], shower["peak_day"]),
                radiant_constellation=shower["radiant_constellation"],
                is_peak=is_peak,
            ))

    # Sort by ZHR (most active first)
    active.sort(key=lambda s: s["zhr"], reverse=True)
    return active
