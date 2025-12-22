"""Tests for location storage."""

import pytest
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
