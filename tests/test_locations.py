"""Tests for location storage."""

import pytest
from click.testing import CliRunner
from skycli.cli import main
from skycli.locations import load_locations, save_locations, get_location, get_default_location


def test_load_locations_empty(tmp_path, monkeypatch):
    """Returns empty structure when file doesn't exist."""
    monkeypatch.setattr("skycli.locations.CONFIG_DIR", tmp_path / "skycli")

    data = load_locations()

    assert data == {"default": None, "locations": {}}


def test_save_and_load_roundtrip(tmp_path, monkeypatch):
    """Save and load preserves data."""
    monkeypatch.setattr("skycli.locations.CONFIG_DIR", tmp_path / "skycli")

    data = {
        "default": "home",
        "locations": {"home": {"lat": 40.7, "lon": -74.0}}
    }
    save_locations(data)
    loaded = load_locations()

    assert loaded == data


def test_get_location_returns_coordinates(tmp_path, monkeypatch):
    """get_location returns lat/lon tuple."""
    monkeypatch.setattr("skycli.locations.CONFIG_DIR", tmp_path / "skycli")
    save_locations({
        "default": None,
        "locations": {"home": {"lat": 40.7, "lon": -74.0}}
    })

    lat, lon = get_location("home")

    assert lat == 40.7
    assert lon == -74.0


def test_get_location_not_found(tmp_path, monkeypatch):
    """get_location raises KeyError for missing location."""
    monkeypatch.setattr("skycli.locations.CONFIG_DIR", tmp_path / "skycli")
    save_locations({"default": None, "locations": {}})

    with pytest.raises(KeyError):
        get_location("nowhere")


def test_get_default_location_returns_tuple(tmp_path, monkeypatch):
    """get_default_location returns (name, lat, lon) tuple."""
    monkeypatch.setattr("skycli.locations.CONFIG_DIR", tmp_path / "skycli")
    save_locations({
        "default": "home",
        "locations": {"home": {"lat": 40.7, "lon": -74.0}}
    })

    result = get_default_location()

    assert result == ("home", 40.7, -74.0)


def test_get_default_location_returns_none(tmp_path, monkeypatch):
    """get_default_location returns None when no default set."""
    monkeypatch.setattr("skycli.locations.CONFIG_DIR", tmp_path / "skycli")
    save_locations({"default": None, "locations": {}})

    result = get_default_location()

    assert result is None


def test_location_add_saves_location(tmp_path, monkeypatch):
    """location add saves a new location."""
    monkeypatch.setattr("skycli.locations.CONFIG_DIR", tmp_path / "skycli")
    runner = CliRunner()

    result = runner.invoke(main, ["location", "add", "home", "40.7", "-74.0"])

    assert result.exit_code == 0
    assert "home" in result.output.lower() or "saved" in result.output.lower()

    lat, lon = get_location("home")
    assert lat == 40.7
    assert lon == -74.0


def test_location_add_duplicate_fails(tmp_path, monkeypatch):
    """location add fails if name already exists."""
    monkeypatch.setattr("skycli.locations.CONFIG_DIR", tmp_path / "skycli")
    runner = CliRunner()

    runner.invoke(main, ["location", "add", "home", "40.7", "-74.0"])
    result = runner.invoke(main, ["location", "add", "home", "41.0", "-75.0"])

    assert result.exit_code != 0
    assert "already exists" in result.output.lower()


def test_location_add_with_default(tmp_path, monkeypatch):
    """location add --default sets as default."""
    monkeypatch.setattr("skycli.locations.CONFIG_DIR", tmp_path / "skycli")
    runner = CliRunner()

    result = runner.invoke(main, ["location", "add", "--default", "home", "40.7", "-74.0"])

    assert result.exit_code == 0
    assert "default" in result.output.lower()

    name, lat, lon = get_default_location()
    assert name == "home"


def test_location_list_shows_locations(tmp_path, monkeypatch):
    """location list shows all saved locations."""
    monkeypatch.setattr("skycli.locations.CONFIG_DIR", tmp_path / "skycli")
    runner = CliRunner()

    runner.invoke(main, ["location", "add", "--default", "home", "40.7", "-74.0"])
    runner.invoke(main, ["location", "add", "cabin", "44.26", "-72.58"])
    result = runner.invoke(main, ["location", "list"])

    assert result.exit_code == 0
    assert "home" in result.output
    assert "cabin" in result.output
    assert "*" in result.output  # Default marker


def test_location_list_empty(tmp_path, monkeypatch):
    """location list shows message when no locations."""
    monkeypatch.setattr("skycli.locations.CONFIG_DIR", tmp_path / "skycli")
    runner = CliRunner()

    result = runner.invoke(main, ["location", "list"])

    assert result.exit_code == 0
    assert "no saved locations" in result.output.lower()


def test_location_remove_deletes_location(tmp_path, monkeypatch):
    """location remove deletes a saved location."""
    monkeypatch.setattr("skycli.locations.CONFIG_DIR", tmp_path / "skycli")
    runner = CliRunner()

    runner.invoke(main, ["location", "add", "home", "40.7", "-74.0"])
    result = runner.invoke(main, ["location", "remove", "home"])

    assert result.exit_code == 0
    assert "removed" in result.output.lower()

    with pytest.raises(KeyError):
        get_location("home")


def test_location_remove_not_found(tmp_path, monkeypatch):
    """location remove fails if name doesn't exist."""
    monkeypatch.setattr("skycli.locations.CONFIG_DIR", tmp_path / "skycli")
    runner = CliRunner()

    result = runner.invoke(main, ["location", "remove", "nowhere"])

    assert result.exit_code != 0
    assert "not found" in result.output.lower()


def test_location_remove_clears_default(tmp_path, monkeypatch):
    """location remove clears default if removing default location."""
    monkeypatch.setattr("skycli.locations.CONFIG_DIR", tmp_path / "skycli")
    runner = CliRunner()

    runner.invoke(main, ["location", "add", "--default", "home", "40.7", "-74.0"])
    runner.invoke(main, ["location", "remove", "home"])

    assert get_default_location() is None
