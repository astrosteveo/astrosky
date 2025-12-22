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


def save_locations(data: dict) -> None:
    """Save locations to config file. Creates directory if needed."""
    CONFIG_DIR.mkdir(parents=True, exist_ok=True)
    config_file = CONFIG_DIR / LOCATIONS_FILE

    with open(config_file, "w") as f:
        json.dump(data, f, indent=2)


def get_location(name: str) -> tuple[float, float]:
    """Get coordinates for a saved location. Raises KeyError if not found."""
    data = load_locations()
    if name not in data["locations"]:
        raise KeyError(name)
    loc = data["locations"][name]
    return loc["lat"], loc["lon"]


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
