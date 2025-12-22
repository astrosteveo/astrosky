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
