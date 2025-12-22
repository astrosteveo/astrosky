# Location Presets Design

Save favorite observation locations to avoid typing `--lat`/`--lon` every time.

## Storage

**File:** `~/.config/skycli/locations.json`

```json
{
  "default": "home",
  "locations": {
    "home": {"lat": 40.7128, "lon": -74.006},
    "cabin": {"lat": 44.259, "lon": -72.575}
  }
}
```

**New module:** `src/skycli/locations.py`

- `load_locations()` — Returns data dict (empty structure if file missing)
- `save_locations(data)` — Writes to disk, creates directory if needed
- `get_location(name)` — Returns `(lat, lon)` or raises `KeyError`
- `get_default_location()` — Returns `(name, lat, lon)` or `None`

## CLI Commands

New command group: `skycli location`

```bash
skycli location add <name> <lat> <lon> [--default]
skycli location list
skycli location remove <name>
skycli location set-default <name>
```

### Validation

- `add` reuses existing `LatitudeType`/`LongitudeType` validators
- `add` fails if name already exists
- `remove` fails if name doesn't exist
- `remove` clears default if removing the default location
- `set-default` fails if name doesn't exist

## Tonight Integration

New option: `--location` / `-l`

```bash
skycli tonight --location home
skycli tonight -l cabin
skycli tonight   # Uses default if set
```

### Option precedence (highest to lowest)

1. Explicit `--lat`/`--lon` — always wins
2. `--location <name>` — looks up saved location
3. Default location — used if set and nothing else specified
4. Error — helpful message with setup instructions

### Changes to `tonight` command

- `--lat` and `--lon` change from `required=True` to `default=None`
- Add `-l`/`--location` option
- Resolution logic checks precedence and resolves coordinates

## Error Messages

```
Location 'X' not found. Run 'skycli location list' to see saved locations.

Location required. Use --lat/--lon, --location <name>, or set a default with:
  skycli location add <name> <lat> <lon> --default

Location 'X' already exists. Remove it first with: skycli location remove X
```

## Testing

**File:** `tests/test_locations.py`

| Test | Description |
|------|-------------|
| `test_load_empty` | Returns empty structure when file doesn't exist |
| `test_save_and_load` | Round-trip preserves data |
| `test_add_location` | Adds new location |
| `test_add_duplicate_fails` | Error when name exists |
| `test_remove_location` | Removes location |
| `test_remove_clears_default` | Removing default clears it |
| `test_get_location` | Returns correct coordinates |
| `test_get_location_not_found` | Raises KeyError |
| `test_set_default` | Updates default field |
| `test_tonight_with_location` | CLI resolves saved location |
| `test_tonight_with_default` | CLI uses default |
| `test_tonight_explicit_overrides` | `--lat/--lon` beats default |

## Files

**Create:**
- `src/skycli/locations.py`
- `tests/test_locations.py`

**Modify:**
- `src/skycli/cli.py`

**Dependencies:** None (uses stdlib `json` and `pathlib`)
