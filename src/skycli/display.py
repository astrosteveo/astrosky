"""Rich terminal display for sky reports."""

from datetime import datetime
from io import StringIO
from typing import Any

from rich.console import Console
from rich.panel import Panel
from rich.text import Text


def _format_time(dt: datetime | None) -> str:
    """Format datetime as HH:MM."""
    if dt is None:
        return "--:--"
    return dt.strftime("%H:%M")


def _format_location(lat: float, lon: float) -> str:
    """Format coordinates nicely."""
    lat_dir = "N" if lat >= 0 else "S"
    lon_dir = "E" if lon >= 0 else "W"
    return f"{abs(lat):.2f}°{lat_dir}, {abs(lon):.2f}°{lon_dir}"


def render_report(data: dict[str, Any], no_color: bool = False) -> str:
    """Render the sky report as a formatted string."""
    output = StringIO()
    console = Console(file=output, force_terminal=not no_color, no_color=no_color, width=65)

    # Header panel
    date_str = data["date"].strftime("%b %d, %Y")
    location_str = _format_location(data["location"]["lat"], data["location"]["lon"])
    sunset_str = _format_time(data["sun"].get("sunset"))
    sunrise_str = _format_time(data["sun"].get("sunrise"))

    moon = data["moon"]
    moon_str = f"{moon['phase_name']} ({moon['illumination']:.0f}%)"
    darkness_str = f"{moon['darkness_quality']} darkness"

    header_text = Text()
    header_text.append(f"Tonight's Sky · {date_str}\n", style="bold")
    header_text.append(f"{location_str} · Sunset {sunset_str} · Sunrise {sunrise_str}\n")
    header_text.append(f"{moon_str} · {darkness_str}")

    console.print(Panel(header_text, expand=True))
    console.print()

    # Planets section
    if data.get("planets"):
        console.print("[bold]PLANETS[/bold]")
        for p in data["planets"]:
            set_time = _format_time(p.get("set_time"))
            console.print(f"  {p['name']:<10} {p['direction']:<3} {p['altitude']:>3.0f}°  Sets {set_time}   {p['description']}")
        console.print()

    # ISS passes section
    if data.get("iss_passes"):
        console.print("[bold]ISS PASSES[/bold]")
        for p in data["iss_passes"]:
            time_str = _format_time(p["start_time"])
            console.print(f"  {time_str}  {p['duration_minutes']} min  {p['brightness']:<8} {p['start_direction']} → {p['end_direction']}  Max {p['max_altitude']:.0f}°")
        console.print()
    elif "iss_passes" in data:
        console.print("[bold]ISS PASSES[/bold]")
        console.print("  No visible passes tonight")
        console.print()

    # Meteor showers section
    if data.get("meteors"):
        console.print("[bold]METEOR SHOWERS[/bold]")
        for m in data["meteors"]:
            peak_marker = " (Peak!)" if m["is_peak"] else ""
            console.print(f"  {m['name']}{peak_marker} · Peak {m['peak_date']} · ~{m['zhr']}/hour")
            console.print(f"    Look toward {m['radiant_constellation']} after midnight")
        console.print()

    # Deep sky section
    if data.get("deep_sky"):
        console.print("[bold]TONIGHT'S DEEP SKY PICKS[/bold]")
        for obj in data["deep_sky"]:
            console.print(f"  {obj['id']:<5} {obj['name']:<20} {obj['constellation']:<12} Mag {obj['mag']:<4}  {obj['tip']}")
        console.print()

    return output.getvalue()


def render_json(data: dict[str, Any]) -> str:
    """Render report as JSON string."""
    import json

    def serialize(obj):
        if isinstance(obj, datetime):
            return obj.isoformat()
        raise TypeError(f"Object of type {type(obj)} is not JSON serializable")

    return json.dumps(data, default=serialize, indent=2)
