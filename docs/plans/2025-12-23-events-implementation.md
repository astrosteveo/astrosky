# Events Feature Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use agent-workflow:executing-plans to implement this plan task-by-task.

**Goal:** Add astronomical event predictions (conjunctions, oppositions, moon phases, equinoxes/solstices) using Astronomy Engine.

**Architecture:** New `events.py` source module calculates events, integrated into existing report pipeline. New `events` CLI command for dedicated 7-day view, plus events section in `tonight` output.

**Tech Stack:** astronomy-engine (pure Python, no dependencies), existing Click/Rich stack

---

## Task 1: Add astronomy-engine Dependency

**Files:**
- Modify: `pyproject.toml:25-30`

**Step 1: Add dependency to pyproject.toml**

Edit `pyproject.toml`, add `astronomy-engine` to dependencies:

```toml
dependencies = [
    "click>=8.1.0",
    "skyfield>=1.46",
    "rich>=13.0.0",
    "httpx>=0.25.0",
    "astronomy-engine>=2.1.0",
]
```

**Step 2: Install updated dependencies**

Run: `pip install -e ".[dev]"`
Expected: Successfully installed astronomy-engine

**Step 3: Verify import works**

Run: `python -c "import astronomy; print(astronomy.__version__)"`
Expected: Prints version number (e.g., "2.1.19")

**Step 4: Commit**

```bash
git add pyproject.toml
git commit -m "chore: add astronomy-engine dependency"
```

---

## Task 2: Create AstroEvent TypedDict and Basic Structure

**Files:**
- Create: `src/skycli/sources/events.py`
- Create: `tests/test_events.py`

**Step 1: Write test for event data structure**

Create `tests/test_events.py`:

```python
"""Tests for astronomical events calculations."""

from datetime import datetime, timezone

from skycli.sources.events import AstroEvent, get_upcoming_events


def test_get_upcoming_events_returns_list():
    """Basic smoke test - function returns a list."""
    date = datetime(2025, 12, 25, 12, 0, tzinfo=timezone.utc)
    result = get_upcoming_events(lat=40.7, lon=-74.0, start=date, days=7)
    assert isinstance(result, list)
```

**Step 2: Run test to verify it fails**

Run: `pytest tests/test_events.py::test_get_upcoming_events_returns_list -v`
Expected: FAIL with "ModuleNotFoundError" or "ImportError"

**Step 3: Create minimal events.py**

Create `src/skycli/sources/events.py`:

```python
"""Astronomical event calculations using Astronomy Engine."""

from datetime import datetime
from typing import TypedDict


class AstroEvent(TypedDict):
    """Information about an astronomical event."""

    type: str  # "conjunction", "opposition", "moon_phase", "equinox", "solstice"
    date: datetime
    title: str
    description: str
    bodies: list[str]


def get_upcoming_events(
    lat: float, lon: float, start: datetime, days: int = 7
) -> list[AstroEvent]:
    """Get astronomical events within the specified window.

    Returns empty list on any error (graceful degradation).
    """
    return []
```

**Step 4: Run test to verify it passes**

Run: `pytest tests/test_events.py::test_get_upcoming_events_returns_list -v`
Expected: PASS

**Step 5: Commit**

```bash
git add src/skycli/sources/events.py tests/test_events.py
git commit -m "feat(events): add AstroEvent structure and stub"
```

---

## Task 3: Implement Moon Phase Detection

**Files:**
- Modify: `src/skycli/sources/events.py`
- Modify: `tests/test_events.py`

**Step 1: Write test for full moon detection**

Add to `tests/test_events.py`:

```python
import time_machine


@time_machine.travel("2025-12-20 12:00:00Z")
def test_finds_full_moon_in_window():
    """Dec 25, 2025 has a Full Moon - should be found in 7-day window."""
    date = datetime(2025, 12, 20, 12, 0, tzinfo=timezone.utc)
    events = get_upcoming_events(lat=40.7, lon=-74.0, start=date, days=7)

    moon_events = [e for e in events if e["type"] == "moon_phase"]
    assert len(moon_events) >= 1

    full_moon = next((e for e in moon_events if "Full" in e["title"]), None)
    assert full_moon is not None
    assert full_moon["date"].day == 25  # Full Moon on Dec 25, 2025
```

**Step 2: Run test to verify it fails**

Run: `pytest tests/test_events.py::test_finds_full_moon_in_window -v`
Expected: FAIL with assertion error (empty list)

**Step 3: Implement moon phase detection**

Update `src/skycli/sources/events.py`:

```python
"""Astronomical event calculations using Astronomy Engine."""

from datetime import datetime, timedelta
from typing import TypedDict

import astronomy


class AstroEvent(TypedDict):
    """Information about an astronomical event."""

    type: str  # "conjunction", "opposition", "moon_phase", "equinox", "solstice"
    date: datetime
    title: str
    description: str
    bodies: list[str]


# Traditional Full Moon names by month
FULL_MOON_NAMES = {
    1: "Wolf Moon",
    2: "Snow Moon",
    3: "Worm Moon",
    4: "Pink Moon",
    5: "Flower Moon",
    6: "Strawberry Moon",
    7: "Buck Moon",
    8: "Sturgeon Moon",
    9: "Harvest Moon",
    10: "Hunter's Moon",
    11: "Beaver Moon",
    12: "Cold Moon",
}


def _find_moon_phases(start: datetime, days: int) -> list[AstroEvent]:
    """Find Full Moon and New Moon events in the window."""
    events = []
    end = start + timedelta(days=days)

    start_time = astronomy.Time.Make(start.year, start.month, start.day, start.hour, start.minute, 0)

    # Search for Full Moon (phase 180°)
    full_moon = astronomy.SearchMoonPhase(180, start_time, days)
    if full_moon is not None:
        dt = full_moon.Utc()
        event_date = datetime(dt[0], dt[1], dt[2], dt[3], dt[4], int(dt[5]), tzinfo=start.tzinfo)
        if event_date <= end:
            name = FULL_MOON_NAMES.get(event_date.month, "Full Moon")
            events.append(AstroEvent(
                type="moon_phase",
                date=event_date,
                title=f"Full Moon ({name})",
                description="Moon fully illuminated",
                bodies=["Moon"],
            ))

    # Search for New Moon (phase 0°)
    new_moon = astronomy.SearchMoonPhase(0, start_time, days)
    if new_moon is not None:
        dt = new_moon.Utc()
        event_date = datetime(dt[0], dt[1], dt[2], dt[3], dt[4], int(dt[5]), tzinfo=start.tzinfo)
        if event_date <= end:
            events.append(AstroEvent(
                type="moon_phase",
                date=event_date,
                title="New Moon",
                description="Best time for deep sky observing",
                bodies=["Moon"],
            ))

    return events


def get_upcoming_events(
    lat: float, lon: float, start: datetime, days: int = 7
) -> list[AstroEvent]:
    """Get astronomical events within the specified window.

    Returns empty list on any error (graceful degradation).
    """
    try:
        events = []
        events.extend(_find_moon_phases(start, days))
        return sorted(events, key=lambda e: e["date"])
    except Exception:
        return []
```

**Step 4: Run test to verify it passes**

Run: `pytest tests/test_events.py::test_finds_full_moon_in_window -v`
Expected: PASS

**Step 5: Commit**

```bash
git add src/skycli/sources/events.py tests/test_events.py
git commit -m "feat(events): implement moon phase detection"
```

---

## Task 4: Implement Conjunction Detection

**Files:**
- Modify: `src/skycli/sources/events.py`
- Modify: `tests/test_events.py`

**Step 1: Write test for planet-Moon conjunction**

Add to `tests/test_events.py`:

```python
@time_machine.travel("2025-12-01 12:00:00Z")
def test_finds_planet_moon_conjunction():
    """Should find planet-Moon conjunctions within threshold."""
    date = datetime(2025, 12, 1, 12, 0, tzinfo=timezone.utc)
    events = get_upcoming_events(lat=40.7, lon=-74.0, start=date, days=30)

    conjunctions = [e for e in events if e["type"] == "conjunction"]
    # December 2025 has several planet-Moon conjunctions
    assert len(conjunctions) >= 1

    # Check structure
    conj = conjunctions[0]
    assert "Moon" in conj["bodies"] or len(conj["bodies"]) == 2
    assert "°" in conj["description"]  # Should include separation
```

**Step 2: Run test to verify it fails**

Run: `pytest tests/test_events.py::test_finds_planet_moon_conjunction -v`
Expected: FAIL with assertion error

**Step 3: Implement conjunction detection**

Add to `src/skycli/sources/events.py` (after `_find_moon_phases`):

```python
PLANETS = [
    astronomy.Body.Mercury,
    astronomy.Body.Venus,
    astronomy.Body.Mars,
    astronomy.Body.Jupiter,
    astronomy.Body.Saturn,
    astronomy.Body.Uranus,
    astronomy.Body.Neptune,
]

PLANET_NAMES = {
    astronomy.Body.Mercury: "Mercury",
    astronomy.Body.Venus: "Venus",
    astronomy.Body.Mars: "Mars",
    astronomy.Body.Jupiter: "Jupiter",
    astronomy.Body.Saturn: "Saturn",
    astronomy.Body.Uranus: "Uranus",
    astronomy.Body.Neptune: "Neptune",
}

CONJUNCTION_THRESHOLD = 5.0  # degrees


def _angle_between(body1: astronomy.Body, body2: astronomy.Body, time: astronomy.Time) -> float:
    """Calculate angular separation between two bodies."""
    vec1 = astronomy.GeoVector(body1, time, True)
    vec2 = astronomy.GeoVector(body2, time, True)
    return astronomy.AngleBetween(vec1, vec2)


def _find_conjunctions(start: datetime, days: int) -> list[AstroEvent]:
    """Find conjunctions between planets and Moon."""
    events = []
    start_time = astronomy.Time.Make(start.year, start.month, start.day, start.hour, start.minute, 0)

    # Check each day for close approaches
    for day_offset in range(days):
        check_time = astronomy.Time.Make(
            start.year, start.month, start.day + day_offset, 12, 0, 0
        )

        # Planet-Moon conjunctions
        for planet in PLANETS:
            angle = _angle_between(planet, astronomy.Body.Moon, check_time)
            if angle <= CONJUNCTION_THRESHOLD:
                dt = check_time.Utc()
                event_date = datetime(dt[0], dt[1], dt[2], 12, 0, 0, tzinfo=start.tzinfo)
                planet_name = PLANET_NAMES[planet]
                events.append(AstroEvent(
                    type="conjunction",
                    date=event_date,
                    title=f"{planet_name}-Moon Conjunction",
                    description=f"{planet_name} {angle:.1f}° from Moon",
                    bodies=[planet_name, "Moon"],
                ))

        # Planet-Planet conjunctions (avoid duplicates)
        for i, planet1 in enumerate(PLANETS):
            for planet2 in PLANETS[i + 1:]:
                angle = _angle_between(planet1, planet2, check_time)
                if angle <= CONJUNCTION_THRESHOLD:
                    dt = check_time.Utc()
                    event_date = datetime(dt[0], dt[1], dt[2], 12, 0, 0, tzinfo=start.tzinfo)
                    name1 = PLANET_NAMES[planet1]
                    name2 = PLANET_NAMES[planet2]
                    events.append(AstroEvent(
                        type="conjunction",
                        date=event_date,
                        title=f"{name1}-{name2} Conjunction",
                        description=f"{name1} {angle:.1f}° from {name2}",
                        bodies=[name1, name2],
                    ))

    # Deduplicate events on same day for same bodies
    seen = set()
    unique_events = []
    for event in events:
        key = (event["date"].date(), tuple(sorted(event["bodies"])))
        if key not in seen:
            seen.add(key)
            unique_events.append(event)

    return unique_events
```

Update `get_upcoming_events`:

```python
def get_upcoming_events(
    lat: float, lon: float, start: datetime, days: int = 7
) -> list[AstroEvent]:
    """Get astronomical events within the specified window.

    Returns empty list on any error (graceful degradation).
    """
    try:
        events = []
        events.extend(_find_moon_phases(start, days))
        events.extend(_find_conjunctions(start, days))
        return sorted(events, key=lambda e: e["date"])
    except Exception:
        return []
```

**Step 4: Run test to verify it passes**

Run: `pytest tests/test_events.py::test_finds_planet_moon_conjunction -v`
Expected: PASS

**Step 5: Commit**

```bash
git add src/skycli/sources/events.py tests/test_events.py
git commit -m "feat(events): implement conjunction detection"
```

---

## Task 5: Implement Opposition Detection

**Files:**
- Modify: `src/skycli/sources/events.py`
- Modify: `tests/test_events.py`

**Step 1: Write test for opposition**

Add to `tests/test_events.py`:

```python
@time_machine.travel("2025-01-01 12:00:00Z")
def test_finds_opposition_for_outer_planets():
    """Oppositions only occur for outer planets (Mars and beyond)."""
    date = datetime(2025, 1, 1, 12, 0, tzinfo=timezone.utc)
    # Look far ahead - oppositions are rare
    events = get_upcoming_events(lat=40.7, lon=-74.0, start=date, days=365)

    oppositions = [e for e in events if e["type"] == "opposition"]

    # Any oppositions found should be outer planets only
    for opp in oppositions:
        body = opp["bodies"][0]
        assert body in ["Mars", "Jupiter", "Saturn", "Uranus", "Neptune"]


def test_no_opposition_for_inner_planets():
    """Mercury and Venus never have oppositions."""
    date = datetime(2025, 1, 1, 12, 0, tzinfo=timezone.utc)
    events = get_upcoming_events(lat=40.7, lon=-74.0, start=date, days=365)

    oppositions = [e for e in events if e["type"] == "opposition"]
    inner_planet_opps = [o for o in oppositions if o["bodies"][0] in ["Mercury", "Venus"]]
    assert len(inner_planet_opps) == 0
```

**Step 2: Run test to verify it fails**

Run: `pytest tests/test_events.py::test_finds_opposition_for_outer_planets -v`
Expected: PASS (vacuously true - no oppositions found yet)

Run: `pytest tests/test_events.py::test_no_opposition_for_inner_planets -v`
Expected: PASS (vacuously true)

**Step 3: Implement opposition detection**

Add to `src/skycli/sources/events.py`:

```python
OUTER_PLANETS = [
    astronomy.Body.Mars,
    astronomy.Body.Jupiter,
    astronomy.Body.Saturn,
    astronomy.Body.Uranus,
    astronomy.Body.Neptune,
]


def _find_oppositions(start: datetime, days: int) -> list[AstroEvent]:
    """Find planetary oppositions (outer planets only)."""
    events = []
    start_time = astronomy.Time.Make(start.year, start.month, start.day, start.hour, start.minute, 0)

    for planet in OUTER_PLANETS:
        try:
            opposition = astronomy.SearchRelativeLongitude(planet, 180, start_time)
            if opposition is not None:
                dt = opposition.Utc()
                event_date = datetime(dt[0], dt[1], dt[2], dt[3], dt[4], int(dt[5]), tzinfo=start.tzinfo)

                # Check if within our window
                end_date = start + timedelta(days=days)
                if start <= event_date <= end_date:
                    planet_name = PLANET_NAMES[planet]
                    events.append(AstroEvent(
                        type="opposition",
                        date=event_date,
                        title=f"{planet_name} at Opposition",
                        description=f"{planet_name} opposite the Sun - best viewing",
                        bodies=[planet_name],
                    ))
        except Exception:
            continue

    return events
```

Update `get_upcoming_events`:

```python
def get_upcoming_events(
    lat: float, lon: float, start: datetime, days: int = 7
) -> list[AstroEvent]:
    """Get astronomical events within the specified window.

    Returns empty list on any error (graceful degradation).
    """
    try:
        events = []
        events.extend(_find_moon_phases(start, days))
        events.extend(_find_conjunctions(start, days))
        events.extend(_find_oppositions(start, days))
        return sorted(events, key=lambda e: e["date"])
    except Exception:
        return []
```

**Step 4: Run all opposition tests**

Run: `pytest tests/test_events.py -k opposition -v`
Expected: PASS

**Step 5: Commit**

```bash
git add src/skycli/sources/events.py tests/test_events.py
git commit -m "feat(events): implement opposition detection"
```

---

## Task 6: Implement Seasonal Events (Equinoxes/Solstices)

**Files:**
- Modify: `src/skycli/sources/events.py`
- Modify: `tests/test_events.py`

**Step 1: Write test for solstice**

Add to `tests/test_events.py`:

```python
@time_machine.travel("2025-12-15 12:00:00Z")
def test_finds_solstice_in_december():
    """December has winter solstice around Dec 21."""
    date = datetime(2025, 12, 15, 12, 0, tzinfo=timezone.utc)
    events = get_upcoming_events(lat=40.7, lon=-74.0, start=date, days=10)

    seasonal = [e for e in events if e["type"] == "solstice"]
    assert len(seasonal) == 1
    assert "Winter" in seasonal[0]["title"] or "Solstice" in seasonal[0]["title"]
    assert seasonal[0]["date"].day in [20, 21, 22]  # Usually Dec 21
```

**Step 2: Run test to verify it fails**

Run: `pytest tests/test_events.py::test_finds_solstice_in_december -v`
Expected: FAIL with assertion error

**Step 3: Implement seasonal event detection**

Add to `src/skycli/sources/events.py`:

```python
def _find_seasonal_events(start: datetime, days: int) -> list[AstroEvent]:
    """Find equinoxes and solstices in the window."""
    events = []
    end = start + timedelta(days=days)

    # Get seasons for the year(s) we're interested in
    years_to_check = {start.year, end.year}

    for year in years_to_check:
        seasons = astronomy.Seasons(year)

        seasonal_events = [
            (seasons.mar_equinox, "equinox", "March Equinox", "Day and night equal length"),
            (seasons.jun_solstice, "solstice", "June Solstice (Summer)", "Longest day in Northern Hemisphere"),
            (seasons.sep_equinox, "equinox", "September Equinox", "Day and night equal length"),
            (seasons.dec_solstice, "solstice", "December Solstice (Winter)", "Shortest day in Northern Hemisphere"),
        ]

        for time, event_type, title, description in seasonal_events:
            dt = time.Utc()
            event_date = datetime(dt[0], dt[1], dt[2], dt[3], dt[4], int(dt[5]), tzinfo=start.tzinfo)

            if start <= event_date <= end:
                events.append(AstroEvent(
                    type=event_type,
                    date=event_date,
                    title=title,
                    description=description,
                    bodies=["Sun"],
                ))

    return events
```

Update `get_upcoming_events`:

```python
def get_upcoming_events(
    lat: float, lon: float, start: datetime, days: int = 7
) -> list[AstroEvent]:
    """Get astronomical events within the specified window.

    Returns empty list on any error (graceful degradation).
    """
    try:
        events = []
        events.extend(_find_moon_phases(start, days))
        events.extend(_find_conjunctions(start, days))
        events.extend(_find_oppositions(start, days))
        events.extend(_find_seasonal_events(start, days))
        return sorted(events, key=lambda e: e["date"])
    except Exception:
        return []
```

**Step 4: Run test to verify it passes**

Run: `pytest tests/test_events.py::test_finds_solstice_in_december -v`
Expected: PASS

**Step 5: Commit**

```bash
git add src/skycli/sources/events.py tests/test_events.py
git commit -m "feat(events): implement seasonal event detection"
```

---

## Task 7: Add Graceful Degradation Test

**Files:**
- Modify: `tests/test_events.py`

**Step 1: Write test for graceful degradation**

Add to `tests/test_events.py`:

```python
def test_graceful_degradation_on_error(monkeypatch):
    """Should return empty list if astronomy-engine fails."""
    def mock_seasons(year):
        raise RuntimeError("Simulated failure")

    monkeypatch.setattr("astronomy.Seasons", mock_seasons)

    date = datetime(2025, 12, 15, 12, 0, tzinfo=timezone.utc)
    events = get_upcoming_events(lat=40.7, lon=-74.0, start=date, days=7)

    # Should not raise, should return list (may be partial or empty)
    assert isinstance(events, list)
```

**Step 2: Run test**

Run: `pytest tests/test_events.py::test_graceful_degradation_on_error -v`
Expected: PASS (already implemented graceful degradation)

**Step 3: Commit**

```bash
git add tests/test_events.py
git commit -m "test(events): add graceful degradation test"
```

---

## Task 8: Integrate Events into Report

**Files:**
- Modify: `src/skycli/report.py`
- Modify: `tests/test_report.py`

**Step 1: Write test for events in report**

Add to `tests/test_report.py`:

```python
import time_machine


@time_machine.travel("2025-12-20 12:00:00Z")
def test_report_includes_events():
    """Report should include events section."""
    from datetime import datetime, timezone
    from skycli.report import build_report

    date = datetime(2025, 12, 20, 20, 0, tzinfo=timezone.utc)
    report = build_report(lat=40.7, lon=-74.0, date=date)

    assert "events" in report
    assert isinstance(report["events"], list)
```

**Step 2: Run test to verify it fails**

Run: `pytest tests/test_report.py::test_report_includes_events -v`
Expected: FAIL (events returns empty or key assertion fails)

**Step 3: Integrate events into report.py**

Modify `src/skycli/report.py`:

```python
"""Report orchestration - collects data from all sources."""

from datetime import datetime
from typing import Any

from skycli.sources.sun_moon import get_sun_times, get_moon_info
from skycli.sources.planets import get_visible_planets
from skycli.sources.iss import get_iss_passes
from skycli.sources.meteors import get_active_showers
from skycli.sources.deep_sky import get_visible_dso
from skycli.sources.events import get_upcoming_events


SECTION_MAP = {
    "moon": "moon",
    "planets": "planets",
    "iss": "iss_passes",
    "meteors": "meteors",
    "deepsky": "deep_sky",
    "events": "events",
}


def _should_include(section: str, only: list[str] | None, exclude: list[str] | None) -> bool:
    """Determine if a section should be included based on filters."""
    if only is not None:
        return section in only
    if exclude is not None:
        return section not in exclude
    return True


def build_report(
    lat: float,
    lon: float,
    date: datetime,
    at_time: str | None = None,
    only: list[str] | None = None,
    exclude: list[str] | None = None,
) -> dict[str, Any]:
    """Build a complete sky report for the given location and time."""

    # Always get sun times (needed for context)
    sun_times = get_sun_times(lat, lon, date)

    # Always get moon info (needed for header)
    moon_info = get_moon_info(lat, lon, date)

    # Build report structure
    report: dict[str, Any] = {
        "date": date,
        "location": {"lat": lat, "lon": lon},
        "sun": sun_times,
        "moon": moon_info,
        "planets": [],
        "iss_passes": [],
        "meteors": [],
        "deep_sky": [],
        "events": [],
    }

    # Planets
    if _should_include("planets", only, exclude):
        report["planets"] = get_visible_planets(lat, lon, date)

    # ISS passes
    if _should_include("iss", only, exclude):
        report["iss_passes"] = get_iss_passes(lat, lon, date)

    # Meteor showers
    if _should_include("meteors", only, exclude):
        report["meteors"] = get_active_showers(date)

    # Deep sky objects
    if _should_include("deepsky", only, exclude):
        report["deep_sky"] = get_visible_dso(lat, lon, date)

    # Astronomical events (next 2 days for tonight report)
    if _should_include("events", only, exclude):
        report["events"] = get_upcoming_events(lat, lon, date, days=2)

    return report
```

**Step 4: Run test to verify it passes**

Run: `pytest tests/test_report.py::test_report_includes_events -v`
Expected: PASS

**Step 5: Commit**

```bash
git add src/skycli/report.py tests/test_report.py
git commit -m "feat(events): integrate events into report"
```

---

## Task 9: Add Events Display Rendering

**Files:**
- Modify: `src/skycli/display.py`
- Modify: `tests/test_display.py`

**Step 1: Write test for events rendering**

Add to `tests/test_display.py`:

```python
def test_render_events_section():
    """Events section should render properly."""
    from datetime import datetime, timezone
    from skycli.display import render_report

    data = {
        "date": datetime(2025, 12, 20, 20, 0, tzinfo=timezone.utc),
        "location": {"lat": 40.7, "lon": -74.0},
        "sun": {"sunrise": datetime(2025, 12, 20, 12, 0, tzinfo=timezone.utc),
                "sunset": datetime(2025, 12, 20, 21, 30, tzinfo=timezone.utc)},
        "moon": {"phase_name": "Waxing Gibbous", "illumination": 75, "darkness_quality": "Fair"},
        "planets": [],
        "iss_passes": [],
        "meteors": [],
        "deep_sky": [],
        "events": [
            {
                "type": "moon_phase",
                "date": datetime(2025, 12, 25, 12, 0, tzinfo=timezone.utc),
                "title": "Full Moon (Cold Moon)",
                "description": "Moon fully illuminated",
                "bodies": ["Moon"],
            }
        ],
    }

    output = render_report(data, no_color=True)
    assert "EVENTS" in output or "Full Moon" in output
```

**Step 2: Run test to verify it fails**

Run: `pytest tests/test_display.py::test_render_events_section -v`
Expected: FAIL (events not rendered yet)

**Step 3: Add events rendering to display.py**

Add to `src/skycli/display.py` (after deep sky section, before return):

```python
    # Events section
    if data.get("events"):
        console.print("[bold]UPCOMING EVENTS[/bold]")
        for event in data["events"]:
            date_str = event["date"].strftime("%b %d")
            console.print(f"  {date_str}  {event['title']}")
            if event["description"]:
                console.print(f"          {event['description']}")
        console.print()
```

**Step 4: Run test to verify it passes**

Run: `pytest tests/test_display.py::test_render_events_section -v`
Expected: PASS

**Step 5: Commit**

```bash
git add src/skycli/display.py tests/test_display.py
git commit -m "feat(events): add events display rendering"
```

---

## Task 10: Add `events` CLI Command

**Files:**
- Modify: `src/skycli/cli.py`
- Modify: `tests/test_cli.py`

**Step 1: Write test for events command**

Add to `tests/test_cli.py`:

```python
def test_events_command_basic(runner):
    """Events command should work with coordinates."""
    result = runner.invoke(main, ["events", "--lat", "40.7", "--lon", "-74.0"])
    assert result.exit_code == 0
    assert "UPCOMING EVENTS" in result.output or "No upcoming events" in result.output


def test_events_command_with_days(runner):
    """Events command should accept --days option."""
    result = runner.invoke(main, ["events", "--lat", "40.7", "--lon", "-74.0", "--days", "14"])
    assert result.exit_code == 0
```

**Step 2: Run test to verify it fails**

Run: `pytest tests/test_cli.py::test_events_command_basic -v`
Expected: FAIL with "No such command 'events'"

**Step 3: Add events command to cli.py**

Add to `src/skycli/cli.py`:

```python
from skycli.sources.events import get_upcoming_events


def render_events_standalone(events: list, start_date: datetime, days: int, no_color: bool = False) -> str:
    """Render events list for standalone command."""
    from io import StringIO
    from rich.console import Console

    output = StringIO()
    console = Console(file=output, force_terminal=not no_color, no_color=no_color, width=65)

    end_date = start_date + timedelta(days=days)
    date_range = f"{start_date.strftime('%b %d')} - {end_date.strftime('%b %d')}"

    if not events:
        console.print(f"[bold]UPCOMING EVENTS ({date_range})[/bold]")
        console.print("  No upcoming events in this period")
        return output.getvalue()

    console.print(f"[bold]UPCOMING EVENTS ({date_range})[/bold]")
    for event in events:
        date_str = event["date"].strftime("%b %d")
        console.print(f"  {date_str}  {event['title']}")
        if event["description"]:
            console.print(f"          {event['description']}")
    console.print()

    return output.getvalue()


@main.command()
@click.option("--lat", type=LATITUDE, default=None, help="Latitude (-90 to 90)")
@click.option("--lon", type=LONGITUDE, default=None, help="Longitude (-180 to 180)")
@click.option("-l", "--location", "location_name", type=str, default=None, help="Use saved location")
@click.option("--days", type=click.IntRange(1, 30), default=7, help="Days to look ahead (1-30)")
@click.option("--type", "event_type", type=click.Choice(["conjunction", "opposition", "moon", "seasonal"]), default=None, help="Filter by event type")
@click.option("--json", "json_output", is_flag=True, help="Output as JSON")
@click.option("--no-color", is_flag=True, help="Disable colored output")
def events(
    lat: Optional[float],
    lon: Optional[float],
    location_name: Optional[str],
    days: int,
    event_type: Optional[str],
    json_output: bool,
    no_color: bool,
) -> None:
    """Show upcoming astronomical events."""
    # Resolve location (same logic as tonight)
    if lat is not None and lon is not None:
        pass
    elif location_name:
        try:
            lat, lon = get_location(location_name)
        except KeyError:
            raise click.ClickException(
                f"Location '{location_name}' not found. Run 'astrosky location list' to see saved locations."
            )
    elif default := get_default_location():
        _, lat, lon = default
    else:
        raise click.UsageError(
            "Location required. Use --lat/--lon, --location <name>, or set a default with:\n"
            "  astrosky location add <name> <lat> <lon> --default"
        )

    start = datetime.now(timezone.utc)
    all_events = get_upcoming_events(lat, lon, start, days=days)

    # Filter by type if specified
    if event_type:
        type_map = {
            "conjunction": "conjunction",
            "opposition": "opposition",
            "moon": "moon_phase",
            "seasonal": ["equinox", "solstice"],
        }
        filter_types = type_map[event_type]
        if isinstance(filter_types, str):
            filter_types = [filter_types]
        all_events = [e for e in all_events if e["type"] in filter_types]

    if json_output:
        import json

        def serialize(obj):
            if isinstance(obj, datetime):
                return obj.isoformat()
            raise TypeError(f"Object of type {type(obj)} is not JSON serializable")

        click.echo(json.dumps(all_events, default=serialize, indent=2))
    else:
        output = render_events_standalone(all_events, start, days, no_color=no_color)
        click.echo(output)
```

Also add the import at the top:

```python
from datetime import datetime, timezone, timedelta
```

**Step 4: Run test to verify it passes**

Run: `pytest tests/test_cli.py::test_events_command_basic tests/test_cli.py::test_events_command_with_days -v`
Expected: PASS

**Step 5: Commit**

```bash
git add src/skycli/cli.py tests/test_cli.py
git commit -m "feat(events): add events CLI command"
```

---

## Task 11: Run Full Test Suite and Final Verification

**Step 1: Run all tests**

Run: `pytest -v`
Expected: All tests pass (68 existing + ~10 new = ~78 tests)

**Step 2: Manual verification**

Run: `astrosky tonight --lat 40.7 --lon -74.0`
Expected: Output includes UPCOMING EVENTS section

Run: `astrosky events --lat 40.7 --lon -74.0`
Expected: Shows events for next 7 days

Run: `astrosky events --lat 40.7 --lon -74.0 --days 30 --type moon`
Expected: Shows only moon phases for next 30 days

**Step 3: Final commit if any cleanup needed**

```bash
git status
# If clean, no action needed
```

---

## Summary

| Task | Description | Files |
|------|-------------|-------|
| 1 | Add dependency | pyproject.toml |
| 2 | Create structure | events.py, test_events.py |
| 3 | Moon phases | events.py, test_events.py |
| 4 | Conjunctions | events.py, test_events.py |
| 5 | Oppositions | events.py, test_events.py |
| 6 | Seasonal events | events.py, test_events.py |
| 7 | Graceful degradation | test_events.py |
| 8 | Report integration | report.py, test_report.py |
| 9 | Display rendering | display.py, test_display.py |
| 10 | CLI command | cli.py, test_cli.py |
| 11 | Final verification | - |
