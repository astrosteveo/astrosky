"""Command-line interface for AstroSky."""

from datetime import datetime, timezone, timedelta
from typing import Optional

import click

from skycli.report import build_report
from skycli.display import render_report, render_json
from skycli.locations import (
    load_locations,
    save_locations,
    get_location,
    get_default_location,
)
from skycli.sources.events import get_upcoming_events


class LatitudeType(click.ParamType):
    """Click parameter type for latitude validation."""

    name = "latitude"

    def convert(self, value, param, ctx):
        try:
            lat = float(value)
            if not -90 <= lat <= 90:
                self.fail(f"Latitude must be between -90 and 90, got {lat}", param, ctx)
            return lat
        except ValueError:
            self.fail(f"Invalid latitude: {value}", param, ctx)


class LongitudeType(click.ParamType):
    """Click parameter type for longitude validation."""

    name = "longitude"

    def convert(self, value, param, ctx):
        try:
            lon = float(value)
            if not -180 <= lon <= 180:
                self.fail(f"Longitude must be between -180 and 180, got {lon}", param, ctx)
            return lon
        except ValueError:
            self.fail(f"Invalid longitude: {value}", param, ctx)


LATITUDE = LatitudeType()
LONGITUDE = LongitudeType()

SECTIONS = ["moon", "planets", "iss", "meteors", "events", "deepsky"]


def parse_sections(value: str) -> list[str]:
    """Parse comma-separated section names."""
    sections = [s.strip().lower() for s in value.split(",")]
    invalid = [s for s in sections if s not in SECTIONS]
    if invalid:
        raise click.BadParameter(f"Unknown sections: {', '.join(invalid)}. Valid: {', '.join(SECTIONS)}")
    return sections


@click.group()
@click.version_option()
def main() -> None:
    """AstroSky - See what's visible in the night sky tonight."""
    pass


@main.group()
def location() -> None:
    """Manage saved observation locations."""
    pass


def format_coord(lat: float, lon: float) -> str:
    """Format coordinates as human-readable string."""
    lat_dir = "N" if lat >= 0 else "S"
    lon_dir = "E" if lon >= 0 else "W"
    return f"{abs(lat):.4f}°{lat_dir}, {abs(lon):.4f}°{lon_dir}"


@location.command(context_settings={"ignore_unknown_options": True, "allow_interspersed_args": False})
@click.argument("name")
@click.argument("lat", type=LATITUDE)
@click.argument("lon", type=LONGITUDE)
@click.option("--default", "set_default", is_flag=True, help="Set as default location")
def add(name: str, lat: float, lon: float, set_default: bool) -> None:
    """Add a saved location."""
    data = load_locations()

    if name in data["locations"]:
        raise click.ClickException(
            f"Location '{name}' already exists. Remove it first with: astrosky location remove {name}"
        )

    data["locations"][name] = {"lat": lat, "lon": lon}
    if set_default:
        data["default"] = name
    save_locations(data)

    coord_str = format_coord(lat, lon)
    if set_default:
        click.echo(f"Saved location '{name}' ({coord_str}) as default")
    else:
        click.echo(f"Saved location '{name}' ({coord_str})")


@location.command("list")
def list_locations() -> None:
    """List all saved locations."""
    data = load_locations()

    if not data["locations"]:
        click.echo("No saved locations. Add one with: astrosky location add <name> <lat> <lon>")
        return

    for name, coords in data["locations"].items():
        marker = "* " if name == data.get("default") else "  "
        coord_str = format_coord(coords["lat"], coords["lon"])
        click.echo(f"{marker}{name}  {coord_str}")


@location.command()
@click.argument("name")
def remove(name: str) -> None:
    """Remove a saved location."""
    data = load_locations()

    if name not in data["locations"]:
        raise click.ClickException(f"Location '{name}' not found.")

    del data["locations"][name]
    if data.get("default") == name:
        data["default"] = None
    save_locations(data)

    click.echo(f"Removed location '{name}'")


@location.command("set-default")
@click.argument("name")
def set_default(name: str) -> None:
    """Set the default location."""
    data = load_locations()

    if name not in data["locations"]:
        raise click.ClickException(
            f"Location '{name}' not found. Add it first with: astrosky location add {name} <lat> <lon>"
        )

    data["default"] = name
    save_locations(data)

    click.echo(f"Default location set to '{name}'")


@main.command()
@click.option("--lat", type=LATITUDE, default=None, help="Latitude (-90 to 90)")
@click.option("--lon", type=LONGITUDE, default=None, help="Longitude (-180 to 180)")
@click.option("-l", "--location", "location_name", type=str, default=None, help="Use saved location")
@click.option("--date", type=click.DateTime(formats=["%Y-%m-%d"]), default=None, help="Date (YYYY-MM-DD)")
@click.option("--at", "at_time", type=str, default=None, help="Time (HH:MM)")
@click.option("--only", "only_sections", type=str, default=None, help="Only show these sections (comma-separated)")
@click.option("--exclude", "exclude_sections", type=str, default=None, help="Hide these sections (comma-separated)")
@click.option("--json", "json_output", is_flag=True, help="Output as JSON")
@click.option("--no-color", is_flag=True, help="Disable colored output")
def tonight(
    lat: Optional[float],
    lon: Optional[float],
    location_name: Optional[str],
    date: Optional[datetime],
    at_time: Optional[str],
    only_sections: Optional[str],
    exclude_sections: Optional[str],
    json_output: bool,
    no_color: bool,
) -> None:
    """Show what's visible in the night sky tonight."""
    # Resolve location
    if lat is not None and lon is not None:
        pass  # Use explicit coordinates
    elif location_name:
        try:
            lat, lon = get_location(location_name)
        except KeyError:
            raise click.ClickException(
                f"Location '{location_name}' not found. Run 'astrosky location list' to see saved locations."
            )
    elif default := get_default_location():
        _, lat, lon = default
    else:
        raise click.UsageError(
            "Location required. Use --lat/--lon, --location <name>, or set a default with:\n"
            "  astrosky location add <name> <lat> <lon> --default"
        )

    # Parse section filters
    only = parse_sections(only_sections) if only_sections else None
    exclude = parse_sections(exclude_sections) if exclude_sections else None

    # Use provided date or today
    if date is None:
        date = datetime.now(timezone.utc)
    else:
        date = date.replace(tzinfo=timezone.utc)

    # Build the report
    report_data = build_report(
        lat=lat,
        lon=lon,
        date=date,
        at_time=at_time,
        only=only,
        exclude=exclude,
    )

    # Render output
    if json_output:
        output = render_json(report_data)
    else:
        output = render_report(report_data, no_color=no_color)

    click.echo(output)


def render_events_standalone(events: list, start_date: datetime, days: int, no_color: bool = False) -> str:
    """Render events list for standalone command."""
    from io import StringIO
    from rich.console import Console

    output = StringIO()
    console = Console(file=output, force_terminal=not no_color, no_color=no_color, width=65)

    end_date = start_date + timedelta(days=days)
    date_range = f"{start_date.strftime('%b %d')} - {end_date.strftime('%b %d')}"

    if not events:
        console.print(f"[bold]UPCOMING EVENTS ({date_range})[/bold]")
        console.print("  No upcoming events in this period")
        return output.getvalue()

    console.print(f"[bold]UPCOMING EVENTS ({date_range})[/bold]")
    for event in events:
        date_str = event["date"].strftime("%b %d")
        console.print(f"  {date_str}  {event['title']}")
        if event["description"]:
            console.print(f"          {event['description']}")
    console.print()

    return output.getvalue()


@main.command()
@click.option("--lat", type=LATITUDE, default=None, help="Latitude (-90 to 90)")
@click.option("--lon", type=LONGITUDE, default=None, help="Longitude (-180 to 180)")
@click.option("-l", "--location", "location_name", type=str, default=None, help="Use saved location")
@click.option("--days", type=click.IntRange(1, 30), default=7, help="Days to look ahead (1-30)")
@click.option("--type", "event_type", type=click.Choice(["conjunction", "opposition", "moon", "seasonal"]), default=None, help="Filter by event type")
@click.option("--json", "json_output", is_flag=True, help="Output as JSON")
@click.option("--no-color", is_flag=True, help="Disable colored output")
def events(
    lat: Optional[float],
    lon: Optional[float],
    location_name: Optional[str],
    days: int,
    event_type: Optional[str],
    json_output: bool,
    no_color: bool,
) -> None:
    """Show upcoming astronomical events."""
    # Resolve location (same logic as tonight)
    if lat is not None and lon is not None:
        pass
    elif location_name:
        try:
            lat, lon = get_location(location_name)
        except KeyError:
            raise click.ClickException(
                f"Location '{location_name}' not found. Run 'astrosky location list' to see saved locations."
            )
    elif default := get_default_location():
        _, lat, lon = default
    else:
        raise click.UsageError(
            "Location required. Use --lat/--lon, --location <name>, or set a default with:\n"
            "  astrosky location add <name> <lat> <lon> --default"
        )

    start = datetime.now(timezone.utc)
    all_events = get_upcoming_events(lat, lon, start, days=days)

    # Filter by type if specified
    if event_type:
        type_map = {
            "conjunction": "conjunction",
            "opposition": "opposition",
            "moon": "moon_phase",
            "seasonal": ["equinox", "solstice"],
        }
        filter_types = type_map[event_type]
        if isinstance(filter_types, str):
            filter_types = [filter_types]
        all_events = [e for e in all_events if e["type"] in filter_types]

    if json_output:
        import json

        def serialize(obj):
            if isinstance(obj, datetime):
                return obj.isoformat()
            raise TypeError(f"Object of type {type(obj)} is not JSON serializable")

        click.echo(json.dumps(all_events, default=serialize, indent=2))
    else:
        output = render_events_standalone(all_events, start, days, no_color=no_color)
        click.echo(output)


if __name__ == "__main__":
    main()
