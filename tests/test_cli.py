"""Tests for CLI argument parsing."""

from click.testing import CliRunner

from skycli.cli import main


def test_tonight_requires_location():
    """Tonight command requires --lat and --lon."""
    runner = CliRunner()
    result = runner.invoke(main, ["tonight"])
    assert result.exit_code != 0
    assert "Missing option" in result.output or "required" in result.output.lower()


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
