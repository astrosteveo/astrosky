"""Command-line interface for SkyCLI."""

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


@click.group()
@click.version_option()
def main() -> None:
    """SkyCLI - See what's visible in the night sky tonight."""
    pass


@main.command()
@click.option("--lat", type=LATITUDE, required=True, help="Latitude (-90 to 90)")
@click.option("--lon", type=LONGITUDE, required=True, help="Longitude (-180 to 180)")
def tonight(lat: float, lon: float) -> None:
    """Show what's visible in the night sky tonight."""
    click.echo(f"Location: {lat}°N, {lon}°E")


if __name__ == "__main__":
    main()
