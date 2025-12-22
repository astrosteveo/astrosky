# Location Presets Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Allow users to save favorite observation locations with names instead of typing `--lat`/`--lon` every time.

**Architecture:** New `locations.py` module handles JSON storage at `~/.config/skycli/locations.json`. CLI gets a `location` command group for management and `tonight` gains `--location` option with default fallback.

**Tech Stack:** Python stdlib (`json`, `pathlib`), Click CLI framework

---

## Task 1: Storage Module - Load/Save

**Files:**
- Create: `src/skycli/locations.py`
- Create: `tests/test_locations.py`

**Step 1: Write failing test for load_locations**

```python
# tests/test_locations.py
"""Tests for location storage."""

from skycli.locations import load_locations


def test_load_locations_empty(tmp_path, monkeypatch):
    """Returns empty structure when file doesn't exist."""
    monkeypatch.setattr("skycli.locations.CONFIG_DIR", tmp_path / "skycli")

    data = load_locations()

    assert data == {"default": None, "locations": {}}
```

**Step 2: Run test to verify it fails**

Run: `pytest tests/test_locations.py::test_load_locations_empty -v`
Expected: FAIL with "cannot import name 'load_locations'"

**Step 3: Write minimal implementation**

```python
# src/skycli/locations.py
"""Location storage for saved observation sites."""

import json
from pathlib import Path

CONFIG_DIR = Path.home() / ".config" / "skycli"
LOCATIONS_FILE = "locations.json"


def load_locations() -> dict:
    """Load locations from config file. Returns empty structure if missing."""
    config_file = CONFIG_DIR / LOCATIONS_FILE
    if not config_file.exists():
        return {"default": None, "locations": {}}

    with open(config_file) as f:
        return json.load(f)
```

**Step 4: Run test to verify it passes**

Run: `pytest tests/test_locations.py::test_load_locations_empty -v`
Expected: PASS

**Step 5: Write failing test for save_locations**

Add to `tests/test_locations.py`:

```python
from skycli.locations import load_locations, save_locations


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
```

**Step 6: Run test to verify it fails**

Run: `pytest tests/test_locations.py::test_save_and_load_roundtrip -v`
Expected: FAIL with "cannot import name 'save_locations'"

**Step 7: Add save_locations implementation**

Add to `src/skycli/locations.py`:

```python
def save_locations(data: dict) -> None:
    """Save locations to config file. Creates directory if needed."""
    CONFIG_DIR.mkdir(parents=True, exist_ok=True)
    config_file = CONFIG_DIR / LOCATIONS_FILE

    with open(config_file, "w") as f:
        json.dump(data, f, indent=2)
```

**Step 8: Run tests to verify they pass**

Run: `pytest tests/test_locations.py -v`
Expected: 2 tests PASS

**Step 9: Commit**

```bash
git add src/skycli/locations.py tests/test_locations.py
git commit -m "feat(locations): add load/save storage functions"
```

---

## Task 2: Location Lookup Functions

**Files:**
- Modify: `src/skycli/locations.py`
- Modify: `tests/test_locations.py`

**Step 1: Write failing test for get_location**

Add to `tests/test_locations.py`:

```python
import pytest
from skycli.locations import load_locations, save_locations, get_location


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
```

**Step 2: Run tests to verify they fail**

Run: `pytest tests/test_locations.py::test_get_location_returns_coordinates tests/test_locations.py::test_get_location_not_found -v`
Expected: FAIL with "cannot import name 'get_location'"

**Step 3: Add get_location implementation**

Add to `src/skycli/locations.py`:

```python
def get_location(name: str) -> tuple[float, float]:
    """Get coordinates for a saved location. Raises KeyError if not found."""
    data = load_locations()
    if name not in data["locations"]:
        raise KeyError(name)
    loc = data["locations"][name]
    return loc["lat"], loc["lon"]
```

**Step 4: Run tests to verify they pass**

Run: `pytest tests/test_locations.py -v`
Expected: 4 tests PASS

**Step 5: Write failing test for get_default_location**

Add to `tests/test_locations.py`:

```python
from skycli.locations import load_locations, save_locations, get_location, get_default_location


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
```

**Step 6: Run tests to verify they fail**

Run: `pytest tests/test_locations.py::test_get_default_location_returns_tuple tests/test_locations.py::test_get_default_location_returns_none -v`
Expected: FAIL with "cannot import name 'get_default_location'"

**Step 7: Add get_default_location implementation**

Add to `src/skycli/locations.py`:

```python
def get_default_location() -> tuple[str, float, float] | None:
    """Get the default location. Returns (name, lat, lon) or None."""
    data = load_locations()
    default_name = data.get("default")
    if not default_name:
        return None
    if default_name not in data["locations"]:
        return None
    loc = data["locations"][default_name]
    return default_name, loc["lat"], loc["lon"]
```

**Step 8: Run all tests to verify they pass**

Run: `pytest tests/test_locations.py -v`
Expected: 6 tests PASS

**Step 9: Commit**

```bash
git add src/skycli/locations.py tests/test_locations.py
git commit -m "feat(locations): add get_location and get_default_location"
```

---

## Task 3: Location Add Command

**Files:**
- Modify: `src/skycli/cli.py`
- Modify: `tests/test_locations.py`

**Step 1: Write failing test for location add**

Add to `tests/test_locations.py`:

```python
from click.testing import CliRunner
from skycli.cli import main


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
```

**Step 2: Run test to verify it fails**

Run: `pytest tests/test_locations.py::test_location_add_saves_location -v`
Expected: FAIL with "No such command 'location'"

**Step 3: Add location group and add command to CLI**

Modify `src/skycli/cli.py` - add import at top:

```python
from skycli.locations import (
    load_locations,
    save_locations,
    get_location,
    get_default_location,
)
```

Add after the `main` group definition (before `tonight`):

```python
@main.group()
def location() -> None:
    """Manage saved observation locations."""
    pass


def format_coord(lat: float, lon: float) -> str:
    """Format coordinates as human-readable string."""
    lat_dir = "N" if lat >= 0 else "S"
    lon_dir = "E" if lon >= 0 else "W"
    return f"{abs(lat):.4f}°{lat_dir}, {abs(lon):.4f}°{lon_dir}"


@location.command()
@click.argument("name")
@click.argument("lat", type=LATITUDE)
@click.argument("lon", type=LONGITUDE)
@click.option("--default", "set_default", is_flag=True, help="Set as default location")
def add(name: str, lat: float, lon: float, set_default: bool) -> None:
    """Add a saved location."""
    data = load_locations()

    if name in data["locations"]:
        raise click.ClickException(
            f"Location '{name}' already exists. Remove it first with: skycli location remove {name}"
        )

    data["locations"][name] = {"lat": lat, "lon": lon}
    if set_default:
        data["default"] = name
    save_locations(data)

    coord_str = format_coord(lat, lon)
    if set_default:
        click.echo(f"Saved location '{name}' ({coord_str}) as default")
    else:
        click.echo(f"Saved location '{name}' ({coord_str})")
```

**Step 4: Run test to verify it passes**

Run: `pytest tests/test_locations.py::test_location_add_saves_location -v`
Expected: PASS

**Step 5: Write failing test for duplicate add**

Add to `tests/test_locations.py`:

```python
def test_location_add_duplicate_fails(tmp_path, monkeypatch):
    """location add fails if name already exists."""
    monkeypatch.setattr("skycli.locations.CONFIG_DIR", tmp_path / "skycli")
    runner = CliRunner()

    runner.invoke(main, ["location", "add", "home", "40.7", "-74.0"])
    result = runner.invoke(main, ["location", "add", "home", "41.0", "-75.0"])

    assert result.exit_code != 0
    assert "already exists" in result.output.lower()
```

**Step 6: Run test to verify it passes (already implemented)**

Run: `pytest tests/test_locations.py::test_location_add_duplicate_fails -v`
Expected: PASS

**Step 7: Write failing test for add with --default**

Add to `tests/test_locations.py`:

```python
def test_location_add_with_default(tmp_path, monkeypatch):
    """location add --default sets as default."""
    monkeypatch.setattr("skycli.locations.CONFIG_DIR", tmp_path / "skycli")
    runner = CliRunner()

    result = runner.invoke(main, ["location", "add", "home", "40.7", "-74.0", "--default"])

    assert result.exit_code == 0
    assert "default" in result.output.lower()

    name, lat, lon = get_default_location()
    assert name == "home"
```

**Step 8: Run test to verify it passes (already implemented)**

Run: `pytest tests/test_locations.py::test_location_add_with_default -v`
Expected: PASS

**Step 9: Run all tests**

Run: `pytest tests/test_locations.py -v`
Expected: 9 tests PASS

**Step 10: Commit**

```bash
git add src/skycli/cli.py tests/test_locations.py
git commit -m "feat(cli): add location add command"
```

---

## Task 4: Location List Command

**Files:**
- Modify: `src/skycli/cli.py`
- Modify: `tests/test_locations.py`

**Step 1: Write failing test for location list**

Add to `tests/test_locations.py`:

```python
def test_location_list_shows_locations(tmp_path, monkeypatch):
    """location list shows all saved locations."""
    monkeypatch.setattr("skycli.locations.CONFIG_DIR", tmp_path / "skycli")
    runner = CliRunner()

    runner.invoke(main, ["location", "add", "home", "40.7", "-74.0", "--default"])
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
```

**Step 2: Run tests to verify they fail**

Run: `pytest tests/test_locations.py::test_location_list_shows_locations tests/test_locations.py::test_location_list_empty -v`
Expected: FAIL with "No such command 'list'"

**Step 3: Add list command**

Add to `src/skycli/cli.py` after `add` command:

```python
@location.command("list")
def list_locations() -> None:
    """List all saved locations."""
    data = load_locations()

    if not data["locations"]:
        click.echo("No saved locations. Add one with: skycli location add <name> <lat> <lon>")
        return

    for name, coords in data["locations"].items():
        marker = "* " if name == data.get("default") else "  "
        coord_str = format_coord(coords["lat"], coords["lon"])
        click.echo(f"{marker}{name}  {coord_str}")
```

**Step 4: Run tests to verify they pass**

Run: `pytest tests/test_locations.py::test_location_list_shows_locations tests/test_locations.py::test_location_list_empty -v`
Expected: PASS

**Step 5: Commit**

```bash
git add src/skycli/cli.py tests/test_locations.py
git commit -m "feat(cli): add location list command"
```

---

## Task 5: Location Remove Command

**Files:**
- Modify: `src/skycli/cli.py`
- Modify: `tests/test_locations.py`

**Step 1: Write failing tests for location remove**

Add to `tests/test_locations.py`:

```python
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

    runner.invoke(main, ["location", "add", "home", "40.7", "-74.0", "--default"])
    runner.invoke(main, ["location", "remove", "home"])

    assert get_default_location() is None
```

**Step 2: Run tests to verify they fail**

Run: `pytest tests/test_locations.py::test_location_remove_deletes_location tests/test_locations.py::test_location_remove_not_found tests/test_locations.py::test_location_remove_clears_default -v`
Expected: FAIL with "No such command 'remove'"

**Step 3: Add remove command**

Add to `src/skycli/cli.py` after `list_locations` command:

```python
@location.command()
@click.argument("name")
def remove(name: str) -> None:
    """Remove a saved location."""
    data = load_locations()

    if name not in data["locations"]:
        raise click.ClickException(f"Location '{name}' not found.")

    del data["locations"][name]
    if data.get("default") == name:
        data["default"] = None
    save_locations(data)

    click.echo(f"Removed location '{name}'")
```

**Step 4: Run tests to verify they pass**

Run: `pytest tests/test_locations.py::test_location_remove_deletes_location tests/test_locations.py::test_location_remove_not_found tests/test_locations.py::test_location_remove_clears_default -v`
Expected: PASS

**Step 5: Commit**

```bash
git add src/skycli/cli.py tests/test_locations.py
git commit -m "feat(cli): add location remove command"
```

---

## Task 6: Location Set-Default Command

**Files:**
- Modify: `src/skycli/cli.py`
- Modify: `tests/test_locations.py`

**Step 1: Write failing tests for set-default**

Add to `tests/test_locations.py`:

```python
def test_location_set_default(tmp_path, monkeypatch):
    """location set-default changes the default."""
    monkeypatch.setattr("skycli.locations.CONFIG_DIR", tmp_path / "skycli")
    runner = CliRunner()

    runner.invoke(main, ["location", "add", "home", "40.7", "-74.0"])
    runner.invoke(main, ["location", "add", "cabin", "44.26", "-72.58"])
    result = runner.invoke(main, ["location", "set-default", "cabin"])

    assert result.exit_code == 0

    name, _, _ = get_default_location()
    assert name == "cabin"


def test_location_set_default_not_found(tmp_path, monkeypatch):
    """location set-default fails if name doesn't exist."""
    monkeypatch.setattr("skycli.locations.CONFIG_DIR", tmp_path / "skycli")
    runner = CliRunner()

    result = runner.invoke(main, ["location", "set-default", "nowhere"])

    assert result.exit_code != 0
    assert "not found" in result.output.lower()
```

**Step 2: Run tests to verify they fail**

Run: `pytest tests/test_locations.py::test_location_set_default tests/test_locations.py::test_location_set_default_not_found -v`
Expected: FAIL with "No such command 'set-default'"

**Step 3: Add set-default command**

Add to `src/skycli/cli.py` after `remove` command:

```python
@location.command("set-default")
@click.argument("name")
def set_default(name: str) -> None:
    """Set the default location."""
    data = load_locations()

    if name not in data["locations"]:
        raise click.ClickException(
            f"Location '{name}' not found. Add it first with: skycli location add {name} <lat> <lon>"
        )

    data["default"] = name
    save_locations(data)

    click.echo(f"Default location set to '{name}'")
```

**Step 4: Run tests to verify they pass**

Run: `pytest tests/test_locations.py::test_location_set_default tests/test_locations.py::test_location_set_default_not_found -v`
Expected: PASS

**Step 5: Run all location tests**

Run: `pytest tests/test_locations.py -v`
Expected: 17 tests PASS

**Step 6: Commit**

```bash
git add src/skycli/cli.py tests/test_locations.py
git commit -m "feat(cli): add location set-default command"
```

---

## Task 7: Tonight Integration

**Files:**
- Modify: `src/skycli/cli.py`
- Modify: `tests/test_cli.py`

**Step 1: Write failing test for tonight with --location**

Add to `tests/test_cli.py`:

```python
from skycli.locations import save_locations


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
```

**Step 2: Run tests to verify they fail**

Run: `pytest tests/test_cli.py::test_tonight_with_location_flag tests/test_cli.py::test_tonight_with_short_location_flag -v`
Expected: FAIL with "No such option: --location"

**Step 3: Modify tonight command**

Update the `tonight` command in `src/skycli/cli.py`:

```python
@main.command()
@click.option("--lat", type=LATITUDE, default=None, help="Latitude (-90 to 90)")
@click.option("--lon", type=LONGITUDE, default=None, help="Longitude (-180 to 180)")
@click.option("-l", "--location", "location_name", type=str, default=None, help="Use saved location")
@click.option("--date", type=click.DateTime(formats=["%Y-%m-%d"]), default=None, help="Date (YYYY-MM-DD)")
@click.option("--at", "at_time", type=str, default=None, help="Time (HH:MM)")
@click.option("--only", "only_sections", type=str, default=None, help="Only show these sections (comma-separated)")
@click.option("--exclude", "exclude_sections", type=str, default=None, help="Hide these sections (comma-separated)")
@click.option("--json", "json_output", is_flag=True, help="Output as JSON")
@click.option("--no-color", is_flag=True, help="Disable colored output")
def tonight(
    lat: Optional[float],
    lon: Optional[float],
    location_name: Optional[str],
    date: Optional[datetime],
    at_time: Optional[str],
    only_sections: Optional[str],
    exclude_sections: Optional[str],
    json_output: bool,
    no_color: bool,
) -> None:
    """Show what's visible in the night sky tonight."""
    # Resolve location
    if lat is not None and lon is not None:
        pass  # Use explicit coordinates
    elif location_name:
        try:
            lat, lon = get_location(location_name)
        except KeyError:
            raise click.ClickException(
                f"Location '{location_name}' not found. Run 'skycli location list' to see saved locations."
            )
    elif default := get_default_location():
        _, lat, lon = default
    else:
        raise click.UsageError(
            "Location required. Use --lat/--lon, --location <name>, or set a default with:\n"
            "  skycli location add <name> <lat> <lon> --default"
        )

    # Parse section filters
    only = parse_sections(only_sections) if only_sections else None
    exclude = parse_sections(exclude_sections) if exclude_sections else None

    # Use provided date or today
    if date is None:
        date = datetime.now(timezone.utc)
    else:
        date = date.replace(tzinfo=timezone.utc)

    # Build the report
    report_data = build_report(
        lat=lat,
        lon=lon,
        date=date,
        at_time=at_time,
        only=only,
        exclude=exclude,
    )

    # Render output
    if json_output:
        output = render_json(report_data)
    else:
        output = render_report(report_data, no_color=no_color)

    click.echo(output)
```

**Step 4: Run tests to verify they pass**

Run: `pytest tests/test_cli.py::test_tonight_with_location_flag tests/test_cli.py::test_tonight_with_short_location_flag -v`
Expected: PASS

**Step 5: Write failing test for tonight with default**

Add to `tests/test_cli.py`:

```python
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
```

**Step 6: Run test to verify it passes (already implemented)**

Run: `pytest tests/test_cli.py::test_tonight_uses_default_location -v`
Expected: PASS

**Step 7: Write failing test for explicit override**

Add to `tests/test_cli.py`:

```python
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
```

**Step 8: Run test to verify it passes (already implemented)**

Run: `pytest tests/test_cli.py::test_tonight_explicit_overrides_default -v`
Expected: PASS

**Step 9: Write failing test for location not found**

Add to `tests/test_cli.py`:

```python
def test_tonight_location_not_found(tmp_path, monkeypatch):
    """tonight --location shows error for unknown location."""
    monkeypatch.setattr("skycli.locations.CONFIG_DIR", tmp_path / "skycli")
    save_locations({"default": None, "locations": {}})
    runner = CliRunner()

    result = runner.invoke(main, ["tonight", "--location", "nowhere"])

    assert result.exit_code != 0
    assert "not found" in result.output.lower()
```

**Step 10: Run test to verify it passes (already implemented)**

Run: `pytest tests/test_cli.py::test_tonight_location_not_found -v`
Expected: PASS

**Step 11: Write test for no location error**

Add to `tests/test_cli.py`:

```python
def test_tonight_no_location_shows_help(tmp_path, monkeypatch):
    """tonight with no location shows helpful error."""
    monkeypatch.setattr("skycli.locations.CONFIG_DIR", tmp_path / "skycli")
    save_locations({"default": None, "locations": {}})
    runner = CliRunner()

    result = runner.invoke(main, ["tonight"])

    assert result.exit_code != 0
    assert "location required" in result.output.lower()
```

**Step 12: Run test to verify it passes (already implemented)**

Run: `pytest tests/test_cli.py::test_tonight_no_location_shows_help -v`
Expected: PASS

**Step 13: Update existing test that expects required lat/lon**

Modify in `tests/test_cli.py` the test `test_tonight_requires_location`:

```python
def test_tonight_requires_location(tmp_path, monkeypatch):
    """Tonight command requires location (explicit or saved)."""
    monkeypatch.setattr("skycli.locations.CONFIG_DIR", tmp_path / "skycli")
    from skycli.locations import save_locations
    save_locations({"default": None, "locations": {}})

    runner = CliRunner()
    result = runner.invoke(main, ["tonight"])
    assert result.exit_code != 0
    assert "location required" in result.output.lower()
```

**Step 14: Run all CLI tests**

Run: `pytest tests/test_cli.py -v`
Expected: All tests PASS

**Step 15: Run full test suite**

Run: `pytest -v`
Expected: All tests PASS

**Step 16: Commit**

```bash
git add src/skycli/cli.py tests/test_cli.py
git commit -m "feat(cli): integrate location presets with tonight command"
```

---

## Task 8: Final Verification

**Step 1: Run full test suite**

Run: `pytest -v`
Expected: All tests PASS

**Step 2: Manual smoke test**

```bash
# Add a location
skycli location add home 40.7 -74.0 --default

# List locations
skycli location list

# Use default
skycli tonight --only planets

# Use explicit location
skycli tonight --location home --only moon

# Override with explicit coords
skycli tonight --lat -33.9 --lon 151.2 --only moon
```

**Step 3: Commit any final fixes if needed**

If tests pass and smoke test works, no commit needed.
