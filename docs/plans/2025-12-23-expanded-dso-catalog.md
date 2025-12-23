# Expanded DSO Catalog Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use agent-workflow:executing-plans to implement this plan task-by-task.

**Goal:** Expand the Messier catalog from 12 to all 110 objects with equipment guidance and size fields.

**Architecture:** Data-driven JSON catalog consumed by `deep_sky.py`. Extract base data from OpenNGC CSV, derive equipment from magnitude/size heuristics, manually write observing tips for each object.

**Tech Stack:** Python, JSON, OpenNGC dataset (one-time extraction)

---

## Task 1: Add Catalog Validation Test

Add a test that validates the catalog structure. This test will initially fail (only 12 objects), then pass after we populate the full catalog.

**Files:**
- Modify: `tests/test_deep_sky.py`
- Reference: `src/skycli/data/messier.json`

**Step 1: Write the catalog validation test**

Add to `tests/test_deep_sky.py`:

```python
import json
import re
from pathlib import Path


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
```

**Step 2: Run test to verify it fails**

Run: `pytest tests/test_deep_sky.py::test_messier_catalog_completeness -v`

Expected: FAIL with "Expected 110 objects, got 12"

**Step 3: Commit the failing test**

```bash
git add tests/test_deep_sky.py
git commit -m "test: add catalog validation for 110 Messier objects (failing)"
```

---

## Task 2: Update DSOInfo TypedDict

Add the new `size` and `equipment` fields to the TypedDict before we populate the catalog.

**Files:**
- Modify: `src/skycli/sources/deep_sky.py:12-20`

**Step 1: Write test for new fields in return value**

Add to `tests/test_deep_sky.py`:

```python
def test_dso_info_includes_size_and_equipment():
    """Each DSO includes size and equipment fields."""
    result = get_visible_dso(NYC_LAT, NYC_LON, datetime(2025, 1, 15, 22, 0, tzinfo=timezone.utc), limit=5)
    if result:
        obj = result[0]
        assert "size" in obj, "Missing size field"
        assert "equipment" in obj, "Missing equipment field"
        assert isinstance(obj["size"], (int, float)), "size should be numeric"
        assert obj["equipment"] in {"naked-eye", "binoculars", "small-scope", "large-scope"}
```

**Step 2: Run test to verify it fails**

Run: `pytest tests/test_deep_sky.py::test_dso_info_includes_size_and_equipment -v`

Expected: FAIL with "Missing size field"

**Step 3: Update DSOInfo TypedDict**

In `src/skycli/sources/deep_sky.py`, replace lines 12-20:

```python
class DSOInfo(TypedDict):
    """Information about a visible deep sky object."""
    id: str
    name: str
    constellation: str
    mag: float
    size: float
    type: str
    equipment: str
    tip: str
    altitude: float
```

**Step 4: Update get_visible_dso to include new fields**

In `src/skycli/sources/deep_sky.py`, replace lines 67-75:

```python
        if altitude >= min_altitude:
            visible.append(DSOInfo(
                id=obj["id"],
                name=obj["name"],
                constellation=obj["constellation"],
                mag=obj["mag"],
                size=obj["size"],
                type=obj["type"],
                equipment=obj["equipment"],
                tip=obj["tip"],
                altitude=round(altitude, 0),
            ))
```

**Step 5: Add size and equipment to current 12 objects temporarily**

Add `"size"` and `"equipment"` fields to all 12 objects in `src/skycli/data/messier.json`. Use placeholder values:
- size: 6.0 for all
- equipment: "small-scope" for all

This lets tests pass while we build the full catalog.

**Step 6: Run test to verify it passes**

Run: `pytest tests/test_deep_sky.py -v`

Expected: All tests PASS

**Step 7: Commit**

```bash
git add src/skycli/sources/deep_sky.py src/skycli/data/messier.json tests/test_deep_sky.py
git commit -m "feat: add size and equipment fields to DSOInfo"
```

---

## Task 3: Create Complete Messier Catalog

Replace the 12-object catalog with the complete 110-object catalog.

**Files:**
- Replace: `src/skycli/data/messier.json`

**Step 1: Download OpenNGC data**

```bash
curl -L "https://raw.githubusercontent.com/mattiaverga/OpenNGC/master/database_files/NGC.csv" -o /tmp/ngc.csv
```

**Step 2: Create extraction script**

Create `scripts/extract_messier.py` (temporary, will not be committed):

```python
#!/usr/bin/env python3
"""Extract Messier objects from OpenNGC CSV and generate messier.json."""

import csv
import json
import re
from pathlib import Path

# OpenNGC type mapping to our categories
TYPE_MAP = {
    "G": "Galaxy",
    "GGroup": "Galaxy",
    "GPair": "Galaxy",
    "GTrpl": "Galaxy",
    "GC": "Globular Cluster",
    "OC": "Open Cluster",
    "OC+N": "Open Cluster",
    "PN": "Planetary Nebula",
    "HII": "Nebula",
    "Neb": "Nebula",
    "RfN": "Nebula",
    "EmN": "Nebula",
    "SNR": "Supernova Remnant",
    "*Ass": "Open Cluster",
    "Cl+N": "Open Cluster",
}

def derive_equipment(mag: float, size: float) -> str:
    """Derive equipment recommendation from magnitude and size."""
    if mag <= 4.5:
        return "naked-eye"
    elif mag <= 7.0:
        return "binoculars"
    elif mag <= 10.0 and size > 2.0:
        return "small-scope"
    else:
        return "large-scope"

def parse_ra(ra_str: str) -> float:
    """Convert RA from HH:MM:SS.s to degrees."""
    if not ra_str:
        return 0.0
    parts = ra_str.split(":")
    hours = float(parts[0])
    minutes = float(parts[1]) if len(parts) > 1 else 0
    seconds = float(parts[2]) if len(parts) > 2 else 0
    return (hours + minutes/60 + seconds/3600) * 15  # 15 degrees per hour

def parse_dec(dec_str: str) -> float:
    """Convert Dec from +/-DD:MM:SS.s to degrees."""
    if not dec_str:
        return 0.0
    sign = -1 if dec_str.startswith("-") else 1
    dec_str = dec_str.lstrip("+-")
    parts = dec_str.split(":")
    degrees = float(parts[0])
    minutes = float(parts[1]) if len(parts) > 1 else 0
    seconds = float(parts[2]) if len(parts) > 2 else 0
    return sign * (degrees + minutes/60 + seconds/3600)

def main():
    messier_objects = []

    with open("/tmp/ngc.csv", newline="", encoding="utf-8") as f:
        reader = csv.DictReader(f, delimiter=";")
        for row in reader:
            messier = row.get("M", "").strip()
            if not messier:
                continue

            # Parse fields
            m_id = f"M{messier}"
            name = row.get("Common names", "").split(",")[0].strip() or m_id
            constellation = row.get("Const", "")
            ra = parse_ra(row.get("RA", ""))
            dec = parse_dec(row.get("Dec", ""))

            # Magnitude - use V-Mag, fall back to B-Mag
            mag_str = row.get("V-Mag", "") or row.get("B-Mag", "")
            mag = float(mag_str) if mag_str else 10.0

            # Size in arcminutes
            size_str = row.get("MajAx", "")
            size = float(size_str) if size_str else 1.0

            # Type mapping
            obj_type = row.get("Type", "")
            mapped_type = TYPE_MAP.get(obj_type, "Galaxy")

            # Equipment derivation
            equipment = derive_equipment(mag, size)

            messier_objects.append({
                "id": m_id,
                "name": name,
                "constellation": constellation,
                "ra": round(ra, 2),
                "dec": round(dec, 2),
                "mag": round(mag, 1),
                "size": round(size, 1),
                "type": mapped_type,
                "equipment": equipment,
                "tip": "TODO"  # Will be filled in manually
            })

    # Sort by Messier number
    messier_objects.sort(key=lambda x: int(x["id"][1:]))

    # Output
    output_path = Path(__file__).parent.parent / "src" / "skycli" / "data" / "messier.json"
    with open(output_path, "w") as f:
        json.dump(messier_objects, f, indent=2)

    print(f"Extracted {len(messier_objects)} Messier objects")

if __name__ == "__main__":
    main()
```

**Step 3: Run extraction script**

```bash
python scripts/extract_messier.py
```

Expected: "Extracted 110 Messier objects"

**Step 4: Verify catalog structure**

```bash
python -c "import json; c=json.load(open('src/skycli/data/messier.json')); print(f'{len(c)} objects')"
```

Expected: "110 objects"

**Step 5: Remove extraction script**

```bash
rm scripts/extract_messier.py
rmdir scripts 2>/dev/null || true
```

---

## Task 4: Write Observing Tips

Replace placeholder "TODO" tips with real observing guidance for each Messier object.

**Files:**
- Modify: `src/skycli/data/messier.json`

**Step 1: Replace all 110 tips**

This is manual creative work. For each object, write a 10-20 word tip covering:
- What to look for (shape, features)
- Equipment notes
- Nearby objects or companions
- Best conditions

Example tips:
- M1: "Look for fuzzy oval; supernova remnant from 1054 AD visible in small scopes"
- M13: "Stunning globular cluster; resolves into stars with 6-inch scope"
- M31: "Visible naked-eye as fuzzy patch; use averted vision for extent"
- M42: "Naked-eye in Orion's sword; trapezium stars visible at 50x"
- M45: "Pleiades star cluster; binoculars reveal surrounding nebulosity"

**Step 2: Verify no TODO tips remain**

```bash
grep -c '"tip": "TODO"' src/skycli/data/messier.json
```

Expected: 0

**Step 3: Run all tests**

```bash
pytest tests/test_deep_sky.py -v
```

Expected: All tests PASS including catalog validation

**Step 4: Commit complete catalog**

```bash
git add src/skycli/data/messier.json
git commit -m "feat: complete Messier catalog with 110 objects and observing tips"
```

---

## Task 5: Final Verification

Verify everything works end-to-end.

**Step 1: Run full test suite**

```bash
pytest -v
```

Expected: 72+ tests pass (71 original + 1-2 new)

**Step 2: Manual smoke test**

```bash
astrosky tonight --lat 40.7128 --lon -74.0060
```

Verify: DSO section shows objects with correct formatting.

**Step 3: Commit any final fixes**

If needed, commit fixes.

**Step 4: Ready for merge**

Branch `feature/expanded-dso-catalog` is ready for PR/merge to main.
