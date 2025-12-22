"""Tests for location storage."""

from skycli.locations import load_locations, save_locations


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
