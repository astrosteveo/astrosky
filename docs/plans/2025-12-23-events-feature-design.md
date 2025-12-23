# Astronomical Events Feature Design

**Date:** 2025-12-23
**Status:** Approved

## Overview

Add astronomical event predictions to AstroSky using the Astronomy Engine library. Events will be accessible both as part of the `tonight` report and via a dedicated `events` command.

## Event Types

- **Conjunctions:** Planet-Moon and planet-planet (≤5° separation)
- **Oppositions:** Mars, Jupiter, Saturn, Uranus, Neptune
- **Moon phases:** Full Moon, New Moon
- **Seasonal:** Equinoxes, Solstices

## Architecture

### New Files
- `src/skycli/sources/events.py` - Event calculations using Astronomy Engine

### Modified Files
- `pyproject.toml` - Add `astronomy-engine` dependency
- `src/skycli/cli.py` - Add new `events` command
- `src/skycli/report.py` - Wire up events source for `tonight`
- `src/skycli/display.py` - Render events section

### Data Structure

```python
class AstroEvent(TypedDict):
    type: str          # "conjunction", "opposition", "moon_phase", "equinox", "solstice"
    date: datetime
    title: str         # "Jupiter-Moon Conjunction"
    description: str   # "Jupiter 3.2° from Moon"
    bodies: list[str]  # ["Jupiter", "Moon"]
```

## CLI Interface

### `tonight` Command (Modified)

Events section shows events happening in next 24-48 hours. Controlled by existing `--only`/`--exclude` flags.

### `events` Command (New)

```
astrosky events --lat 40.7 --lon -74.0
astrosky events -l nyc                    # use saved location
astrosky events --days 14                 # extend to 2 weeks
astrosky events --type conjunction        # filter by type
```

**Options:**
- `--days N` - Look ahead N days (default: 7, max: 30)
- `--type TYPE` - Filter to specific event type (conjunction/opposition/moon/seasonal)
- Same location options as `tonight`

**Output Example:**
```
UPCOMING EVENTS (Dec 23 - Dec 30)
  Dec 25  Full Moon (Cold Moon)
  Dec 25  Jupiter-Moon Conjunction · 4.1° apart · Look E after sunset
  Dec 28  Saturn-Moon Conjunction · 2.8° apart · Look SW at dusk
```

## Event Calculation Logic

```python
def get_upcoming_events(lat: float, lon: float, start: datetime, days: int = 7) -> list[AstroEvent]:
    events = []

    # 1. Moon phases - astronomy.SearchMoonPhase()
    #    Find next Full Moon (180°) and New Moon (0°) within window

    # 2. Conjunctions - iterate planet pairs + planet-Moon
    #    Use astronomy.SearchRelativeLongitude() for close approaches
    #    Filter to ≤5° angular separation

    # 3. Oppositions - outer planets only
    #    Use astronomy.SearchRelativeLongitude(body, 180°)

    # 4. Equinoxes/Solstices - astronomy.Seasons()
    #    Filter seasonal markers to window

    return sorted(events, key=lambda e: e["date"])
```

**Graceful degradation:** If astronomy-engine import fails, return empty list.

## Testing Strategy

### New Test File: `tests/test_events.py`

```python
# Moon phases
test_finds_full_moon_in_window()
test_finds_new_moon_in_window()
test_no_moon_phase_when_outside_window()

# Conjunctions
test_finds_planet_moon_conjunction()
test_finds_planet_planet_conjunction()
test_ignores_separation_above_threshold()

# Oppositions
test_finds_mars_opposition()
test_no_opposition_for_inner_planets()

# Seasonal
test_finds_solstice_in_december()
test_finds_equinox_in_march()

# Integration
test_events_sorted_by_date()
test_graceful_degradation_on_import_error()
```

### CLI Tests (in `test_cli.py`)
- `test_events_command_basic()`
- `test_events_with_days_option()`
- `test_tonight_includes_events_section()`

**Approach:**
- Use `time-machine` to freeze dates
- Test against known astronomical events
- No mocking needed - Astronomy Engine is deterministic
