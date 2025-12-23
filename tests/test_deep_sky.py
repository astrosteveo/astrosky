"""Tests for deep sky object source."""

import json
import re
from datetime import datetime, timezone
from pathlib import Path

from skycli.sources.deep_sky import get_visible_dso


NYC_LAT = 40.7128
NYC_LON = -74.0060


def test_returns_list_of_visible_objects():
    """Returns visible deep sky objects for the location and time."""
    result = get_visible_dso(NYC_LAT, NYC_LON, datetime(2025, 1, 15, 22, 0, tzinfo=timezone.utc), limit=5)
    assert isinstance(result, list)
    assert len(result) <= 5


def test_orion_nebula_visible_winter():
    """M42 Orion Nebula should be visible in winter evenings."""
    result = get_visible_dso(NYC_LAT, NYC_LON, datetime(2025, 1, 16, 3, 0, tzinfo=timezone.utc), limit=10)
    ids = [obj["id"] for obj in result]
    assert "M042" in ids


def test_dso_info_structure():
    """Each DSO has required fields."""
    result = get_visible_dso(NYC_LAT, NYC_LON, datetime(2025, 1, 15, 22, 0, tzinfo=timezone.utc), limit=5)
    if result:
        obj = result[0]
        assert "id" in obj
        assert "name" in obj
        assert "constellation" in obj
        assert "mag" in obj
        assert "type" in obj
        assert "tip" in obj
        assert "altitude" in obj


def test_dso_info_includes_size_and_equipment():
    """Each DSO includes size and equipment fields."""
    result = get_visible_dso(NYC_LAT, NYC_LON, datetime(2025, 1, 15, 22, 0, tzinfo=timezone.utc), limit=5)
    if result:
        obj = result[0]
        assert "size" in obj, "Missing size field"
        assert "equipment" in obj, "Missing equipment field"
        assert isinstance(obj["size"], (int, float)), "size should be numeric"
        assert obj["equipment"] in {"naked-eye", "binoculars", "small-scope", "large-scope"}


def test_messier_catalog_completeness():
    """Validate the complete Messier catalog structure."""
    catalog_path = Path(__file__).parent.parent / "src" / "skycli" / "data" / "messier.json"
    with open(catalog_path) as f:
        catalog = json.load(f)

    # Must have all 110 Messier objects
    assert len(catalog) == 110, f"Expected 110 objects, got {len(catalog)}"

    # Track IDs for uniqueness check
    seen_ids = set()
    valid_types = {"Galaxy", "Globular Cluster", "Open Cluster", "Nebula", "Planetary Nebula", "Supernova Remnant"}
    valid_equipment = {"naked-eye", "binoculars", "small-scope", "large-scope"}

    for obj in catalog:
        # Required fields exist
        assert "id" in obj, f"Missing id in {obj}"
        assert "name" in obj, f"Missing name in {obj.get('id', 'unknown')}"
        assert "constellation" in obj, f"Missing constellation in {obj['id']}"
        assert "ra" in obj, f"Missing ra in {obj['id']}"
        assert "dec" in obj, f"Missing dec in {obj['id']}"
        assert "mag" in obj, f"Missing mag in {obj['id']}"
        assert "size" in obj, f"Missing size in {obj['id']}"
        assert "type" in obj, f"Missing type in {obj['id']}"
        assert "equipment" in obj, f"Missing equipment in {obj['id']}"
        assert "tip" in obj, f"Missing tip in {obj['id']}"

        # ID format and uniqueness
        assert re.match(r"^M\d{1,3}$", obj["id"]), f"Invalid id format: {obj['id']}"
        assert obj["id"] not in seen_ids, f"Duplicate id: {obj['id']}"
        seen_ids.add(obj["id"])

        # Coordinate ranges
        assert 0 <= obj["ra"] < 360, f"RA out of range in {obj['id']}: {obj['ra']}"
        assert -90 <= obj["dec"] <= 90, f"Dec out of range in {obj['id']}: {obj['dec']}"

        # Magnitude range (reasonable for Messier objects)
        assert 0 < obj["mag"] < 15, f"Magnitude out of range in {obj['id']}: {obj['mag']}"

        # Size is positive
        assert obj["size"] > 0, f"Size must be positive in {obj['id']}: {obj['size']}"

        # Valid enum values
        assert obj["type"] in valid_types, f"Invalid type in {obj['id']}: {obj['type']}"
        assert obj["equipment"] in valid_equipment, f"Invalid equipment in {obj['id']}: {obj['equipment']}"

        # Tip is non-empty
        assert len(obj["tip"].strip()) > 0, f"Empty tip in {obj['id']}"
