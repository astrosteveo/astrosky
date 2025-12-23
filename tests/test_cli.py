"""Tests for CLI argument parsing."""

import time_machine
from click.testing import CliRunner

from skycli.cli import main
from skycli.locations import save_locations


def test_tonight_requires_location(tmp_path, monkeypatch):
    """Tonight command requires location (explicit or saved)."""
    monkeypatch.setattr("skycli.locations.CONFIG_DIR", tmp_path / "skycli")
    save_locations({"default": None, "locations": {}})

    runner = CliRunner()
    result = runner.invoke(main, ["tonight"])
    assert result.exit_code != 0
    assert "location required" in result.output.lower()


def test_tonight_accepts_valid_location():
    """Tonight command accepts valid lat/lon."""
    runner = CliRunner()
    result = runner.invoke(main, ["tonight", "--lat", "40.7", "--lon", "-74.0"])
    assert result.exit_code == 0


def test_tonight_rejects_invalid_latitude():
    """Latitude must be between -90 and 90."""
    runner = CliRunner()
    result = runner.invoke(main, ["tonight", "--lat", "200", "--lon", "-74.0"])
    assert result.exit_code != 0
    assert "90" in result.output or "invalid" in result.output.lower()


def test_tonight_rejects_invalid_longitude():
    """Longitude must be between -180 and 180."""
    runner = CliRunner()
    result = runner.invoke(main, ["tonight", "--lat", "40.7", "--lon", "300"])
    assert result.exit_code != 0
    assert "180" in result.output or "invalid" in result.output.lower()


def test_tonight_accepts_date_option():
    """Tonight command accepts --date for future dates."""
    runner = CliRunner()
    result = runner.invoke(
        main, ["tonight", "--lat", "40.7", "--lon", "-74.0", "--date", "2025-01-15"]
    )
    assert result.exit_code == 0


def test_tonight_accepts_at_option():
    """Tonight command accepts --at for specific time."""
    runner = CliRunner()
    result = runner.invoke(
        main, ["tonight", "--lat", "40.7", "--lon", "-74.0", "--at", "22:00"]
    )
    assert result.exit_code == 0


def test_tonight_accepts_only_filter():
    """Tonight command accepts --only to filter sections."""
    runner = CliRunner()
    result = runner.invoke(
        main, ["tonight", "--lat", "40.7", "--lon", "-74.0", "--only", "planets,moon"]
    )
    assert result.exit_code == 0


def test_tonight_accepts_exclude_filter():
    """Tonight command accepts --exclude to hide sections."""
    runner = CliRunner()
    result = runner.invoke(
        main, ["tonight", "--lat", "40.7", "--lon", "-74.0", "--exclude", "iss"]
    )
    assert result.exit_code == 0


def test_tonight_accepts_json_output():
    """Tonight command accepts --json for machine-readable output."""
    runner = CliRunner()
    result = runner.invoke(
        main, ["tonight", "--lat", "40.7", "--lon", "-74.0", "--json"]
    )
    assert result.exit_code == 0


def test_tonight_accepts_no_color():
    """Tonight command accepts --no-color for plain output."""
    runner = CliRunner()
    result = runner.invoke(
        main, ["tonight", "--lat", "40.7", "--lon", "-74.0", "--no-color"]
    )
    assert result.exit_code == 0


@time_machine.travel("2025-01-15 22:00:00", tick=False)
def test_tonight_produces_output():
    """Tonight command produces formatted output."""
    runner = CliRunner()
    result = runner.invoke(main, ["tonight", "--lat", "40.7", "--lon", "-74.0"])

    assert result.exit_code == 0
    assert "Tonight's Sky" in result.output or "tonight" in result.output.lower()


@time_machine.travel("2025-01-15 22:00:00", tick=False)
def test_tonight_json_output():
    """Tonight command with --json produces JSON."""
    runner = CliRunner()
    result = runner.invoke(main, ["tonight", "--lat", "40.7", "--lon", "-74.0", "--json"])

    assert result.exit_code == 0
    # Should be valid JSON
    import json
    data = json.loads(result.output)
    assert "date" in data
    assert "moon" in data


def test_tonight_with_location_flag(tmp_path, monkeypatch):
    """tonight --location uses saved location."""
    monkeypatch.setattr("skycli.locations.CONFIG_DIR", tmp_path / "skycli")
    save_locations({
        "default": None,
        "locations": {"home": {"lat": 40.7, "lon": -74.0}}
    })
    runner = CliRunner()

    result = runner.invoke(main, ["tonight", "--location", "home"])

    assert result.exit_code == 0


def test_tonight_with_short_location_flag(tmp_path, monkeypatch):
    """tonight -l uses saved location."""
    monkeypatch.setattr("skycli.locations.CONFIG_DIR", tmp_path / "skycli")
    save_locations({
        "default": None,
        "locations": {"home": {"lat": 40.7, "lon": -74.0}}
    })
    runner = CliRunner()

    result = runner.invoke(main, ["tonight", "-l", "home"])

    assert result.exit_code == 0


def test_tonight_uses_default_location(tmp_path, monkeypatch):
    """tonight with no args uses default location."""
    monkeypatch.setattr("skycli.locations.CONFIG_DIR", tmp_path / "skycli")
    save_locations({
        "default": "home",
        "locations": {"home": {"lat": 40.7, "lon": -74.0}}
    })
    runner = CliRunner()

    result = runner.invoke(main, ["tonight"])

    assert result.exit_code == 0


@time_machine.travel("2025-01-15 22:00:00", tick=False)
def test_tonight_explicit_overrides_default(tmp_path, monkeypatch):
    """tonight --lat/--lon overrides default."""
    monkeypatch.setattr("skycli.locations.CONFIG_DIR", tmp_path / "skycli")
    save_locations({
        "default": "home",
        "locations": {"home": {"lat": 40.7, "lon": -74.0}}
    })
    runner = CliRunner()

    # Use Sydney instead of NYC default
    result = runner.invoke(main, ["tonight", "--lat", "-33.9", "--lon", "151.2", "--json"])

    assert result.exit_code == 0
    import json
    data = json.loads(result.output)
    assert data["location"]["lat"] == -33.9
    assert data["location"]["lon"] == 151.2


def test_tonight_location_not_found(tmp_path, monkeypatch):
    """tonight --location shows error for unknown location."""
    monkeypatch.setattr("skycli.locations.CONFIG_DIR", tmp_path / "skycli")
    save_locations({"default": None, "locations": {}})
    runner = CliRunner()

    result = runner.invoke(main, ["tonight", "--location", "nowhere"])

    assert result.exit_code != 0
    assert "not found" in result.output.lower()


def test_tonight_no_location_shows_help(tmp_path, monkeypatch):
    """tonight with no location shows helpful error."""
    monkeypatch.setattr("skycli.locations.CONFIG_DIR", tmp_path / "skycli")
    save_locations({"default": None, "locations": {}})
    runner = CliRunner()

    result = runner.invoke(main, ["tonight"])

    assert result.exit_code != 0
    assert "location required" in result.output.lower()


def test_events_command_basic():
    """Events command should work with coordinates."""
    runner = CliRunner()
    result = runner.invoke(main, ["events", "--lat", "40.7", "--lon", "-74.0"])
    assert result.exit_code == 0
    assert "UPCOMING EVENTS" in result.output or "No upcoming events" in result.output


def test_events_command_with_days():
    """Events command should accept --days option."""
    runner = CliRunner()
    result = runner.invoke(main, ["events", "--lat", "40.7", "--lon", "-74.0", "--days", "14"])
    assert result.exit_code == 0
