"""Command-line interface for SkyCLI."""

from datetime import datetime
from typing import Optional

import click


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
    """SkyCLI - See what's visible in the night sky tonight."""
    pass


@main.command()
@click.option("--lat", type=LATITUDE, required=True, help="Latitude (-90 to 90)")
@click.option("--lon", type=LONGITUDE, required=True, help="Longitude (-180 to 180)")
@click.option("--date", type=click.DateTime(formats=["%Y-%m-%d"]), default=None, help="Date (YYYY-MM-DD)")
@click.option("--at", "at_time", type=str, default=None, help="Time (HH:MM)")
@click.option("--only", "only_sections", type=str, default=None, help="Only show these sections (comma-separated)")
@click.option("--exclude", "exclude_sections", type=str, default=None, help="Hide these sections (comma-separated)")
@click.option("--json", "json_output", is_flag=True, help="Output as JSON")
@click.option("--no-color", is_flag=True, help="Disable colored output")
def tonight(
    lat: float,
    lon: float,
    date: Optional[datetime],
    at_time: Optional[str],
    only_sections: Optional[str],
    exclude_sections: Optional[str],
    json_output: bool,
    no_color: bool,
) -> None:
    """Show what's visible in the night sky tonight."""
    # Parse section filters
    only = parse_sections(only_sections) if only_sections else None
    exclude = parse_sections(exclude_sections) if exclude_sections else None

    # For now, just echo the configuration
    click.echo(f"Location: {lat}°N, {lon}°E")
    if date:
        click.echo(f"Date: {date.strftime('%Y-%m-%d')}")
    if at_time:
        click.echo(f"Time: {at_time}")
    if only:
        click.echo(f"Only: {only}")
    if exclude:
        click.echo(f"Exclude: {exclude}")
    if json_output:
        click.echo("Format: JSON")
    if no_color:
        click.echo("Color: disabled")


if __name__ == "__main__":
    main()
