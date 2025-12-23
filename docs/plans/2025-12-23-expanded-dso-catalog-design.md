# Expanded DSO Catalog Design

## Overview

Expand the deep sky object catalog from 12 hand-picked Messier objects to the complete 110-object Messier catalog, with enhanced metadata for equipment guidance and angular size.

## Data Structure

Enhanced `messier.json` schema:

```json
{
  "id": "M1",
  "name": "Crab Nebula",
  "constellation": "Taurus",
  "ra": 83.63,
  "dec": 22.01,
  "mag": 8.4,
  "size": 6.0,
  "type": "Supernova Remnant",
  "equipment": "small-scope",
  "tip": "Look for fuzzy oval; supernova remnant from 1054 AD"
}
```

### Field Definitions

| Field | Type | Description |
|-------|------|-------------|
| `id` | string | Messier number (M1-M110) |
| `name` | string | Common name or "Messier N" |
| `constellation` | string | IAU constellation name |
| `ra` | float | Right ascension in degrees (J2000) |
| `dec` | float | Declination in degrees (J2000) |
| `mag` | float | Visual magnitude |
| `size` | float | Angular size in arcminutes (largest dimension) |
| `type` | string | One of: Galaxy, Globular Cluster, Open Cluster, Nebula, Planetary Nebula, Supernova Remnant |
| `equipment` | string | One of: `naked-eye`, `binoculars`, `small-scope`, `large-scope` |
| `tip` | string | 10-20 word observing tip |

### Equipment Thresholds

- `naked-eye`: mag <= 4.5
- `binoculars`: mag 4.5-7.0
- `small-scope`: mag 7.0-10.0 and size > 2'
- `large-scope`: mag > 10 or size < 2'

## Implementation Approach

### Step 1: Extract Base Data from OpenNGC

Download OpenNGC CSV and extract all 110 Messier objects. Map fields:
- `Name` -> parse M-number for `id`
- `RA`/`Dec` -> convert to decimal degrees
- `V-Mag` -> `mag`
- `MajAx` -> `size` (major axis in arcminutes)
- `Type` -> normalize to our type categories
- `Const` -> `constellation`

### Step 2: Derive Equipment Field

Apply magnitude/size heuristics programmatically, then review outliers manually.

### Step 3: Write Observing Tips

For each object, write a tip covering:
- Visual characteristics (shape, features, companions)
- Best season or conditions
- Historical/interesting context
- Nearby reference stars

### Step 4: Update TypedDict

Add `size: float` and `equipment: str` to `DSOInfo` in `deep_sky.py`.

## Testing

### Data Validation Test

Validate complete `messier.json`:
- Exactly 110 objects present
- All required fields exist
- `id` matches pattern `M[1-110]` with no duplicates
- Coordinates in valid ranges
- `equipment` and `type` are valid enum values
- `tip` is non-empty

### Existing Tests

Current tests continue to work unchanged - they mock the catalog or test visibility calculations using existing fields.

## Deliverables

| File | Change |
|------|--------|
| `src/skycli/data/messier.json` | Replace 12 objects with 110-object catalog |
| `src/skycli/sources/deep_sky.py` | Add `size` and `equipment` to `DSOInfo`; include in returned dict |
| `tests/test_deep_sky.py` | Add catalog validation test |

## Out of Scope

- CLI filter flags (`--equipment`, `--type`)
- Display format changes to show new fields
- Non-Messier catalogs (NGC, Caldwell)
