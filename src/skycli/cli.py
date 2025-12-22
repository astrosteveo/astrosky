"""Command-line interface for SkyCLI."""

import click


@click.group()
@click.version_option()
def main() -> None:
    """SkyCLI - See what's visible in the night sky tonight."""
    pass


if __name__ == "__main__":
    main()
