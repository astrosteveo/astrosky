"""Tests for FastAPI endpoints."""

import sys
from pathlib import Path
from datetime import datetime, timezone

import time_machine
from fastapi.testclient import TestClient

# Add api directory to Python path
api_path = Path(__file__).parent.parent / "api"
sys.path.insert(0, str(api_path))

from app.main import app


client = TestClient(app)

NYC_LAT = 40.7128
NYC_LON = -74.0060


def test_health_endpoint():
    """Health endpoint returns version info."""
    response = client.get("/api/health")

    assert response.status_code == 200
    data = response.json()
    assert "status" in data
    assert data["status"] == "ok"
    assert "version" in data
    assert data["version"] == "0.3.0"


@time_machine.travel("2025-01-15 22:00:00", tick=False)
def test_report_endpoint_returns_complete_structure():
    """Report endpoint returns all expected sections."""
    response = client.get(f"/api/report?lat={NYC_LAT}&lon={NYC_LON}")

    assert response.status_code == 200
    data = response.json()

    # Verify all sections are present
    assert "date" in data
    assert "location" in data
    assert "sun" in data
    assert "moon" in data
    assert "planets" in data
    assert "iss_passes" in data
    assert "meteors" in data
    assert "deep_sky" in data
    assert "events" in data


@time_machine.travel("2025-01-15 22:00:00", tick=False)
def test_report_endpoint_validates_latitude():
    """Report endpoint rejects invalid latitude."""
    # Latitude > 90
    response = client.get(f"/api/report?lat=100&lon={NYC_LON}")
    assert response.status_code == 422

    # Latitude < -90
    response = client.get(f"/api/report?lat=-100&lon={NYC_LON}")
    assert response.status_code == 422


@time_machine.travel("2025-01-15 22:00:00", tick=False)
def test_report_endpoint_validates_longitude():
    """Report endpoint rejects invalid longitude."""
    # Longitude > 180
    response = client.get(f"/api/report?lat={NYC_LAT}&lon=200")
    assert response.status_code == 422

    # Longitude < -180
    response = client.get(f"/api/report?lat={NYC_LAT}&lon=-200")
    assert response.status_code == 422


@time_machine.travel("2025-01-15 22:00:00", tick=False)
def test_report_endpoint_requires_lat_lon():
    """Report endpoint requires both lat and lon parameters."""
    # Missing both
    response = client.get("/api/report")
    assert response.status_code == 422

    # Missing lon
    response = client.get(f"/api/report?lat={NYC_LAT}")
    assert response.status_code == 422

    # Missing lat
    response = client.get(f"/api/report?lon={NYC_LON}")
    assert response.status_code == 422


@time_machine.travel("2025-01-15 22:00:00", tick=False)
def test_report_endpoint_accepts_custom_date():
    """Report endpoint accepts ISO date parameter."""
    date_str = "2025-06-15"
    response = client.get(f"/api/report?lat={NYC_LAT}&lon={NYC_LON}&date={date_str}")

    assert response.status_code == 200
    data = response.json()

    # Verify date was used
    assert data["date"].startswith(date_str)


@time_machine.travel("2025-01-15 22:00:00", tick=False)
def test_report_endpoint_returns_valid_moon_data():
    """Report endpoint returns valid moon phase data."""
    response = client.get(f"/api/report?lat={NYC_LAT}&lon={NYC_LON}")

    assert response.status_code == 200
    data = response.json()

    moon = data["moon"]
    assert "phase_name" in moon
    assert "illumination" in moon
    assert "darkness_quality" in moon
    assert 0 <= moon["illumination"] <= 100
    assert moon["darkness_quality"] in ["Excellent", "Good", "Fair", "Poor"]


@time_machine.travel("2025-01-15 22:00:00", tick=False)
def test_report_endpoint_returns_valid_sun_data():
    """Report endpoint returns valid sun times data."""
    response = client.get(f"/api/report?lat={NYC_LAT}&lon={NYC_LON}")

    assert response.status_code == 200
    data = response.json()

    sun = data["sun"]
    assert "sunrise" in sun
    assert "sunset" in sun
    assert "astronomical_twilight_start" in sun
    assert "astronomical_twilight_end" in sun


@time_machine.travel("2025-01-15 22:00:00", tick=False)
def test_report_endpoint_returns_planets_list():
    """Report endpoint returns list of planets."""
    response = client.get(f"/api/report?lat={NYC_LAT}&lon={NYC_LON}")

    assert response.status_code == 200
    data = response.json()

    planets = data["planets"]
    assert isinstance(planets, list)

    # Should have at least some planets visible
    if len(planets) > 0:
        planet = planets[0]
        assert "name" in planet
        assert "altitude" in planet
        assert "direction" in planet
        assert "description" in planet


@time_machine.travel("2025-01-15 22:00:00", tick=False)
def test_report_endpoint_returns_iss_passes_list():
    """Report endpoint returns ISS passes (empty if no API key)."""
    response = client.get(f"/api/report?lat={NYC_LAT}&lon={NYC_LON}")

    assert response.status_code == 200
    data = response.json()

    # ISS passes should be a list (may be empty without API key)
    assert isinstance(data["iss_passes"], list)


@time_machine.travel("2025-08-12 22:00:00", tick=False)
def test_report_endpoint_returns_meteor_showers():
    """Report endpoint returns active meteor showers."""
    response = client.get(f"/api/report?lat={NYC_LAT}&lon={NYC_LON}&date=2025-08-12")

    assert response.status_code == 200
    data = response.json()

    meteors = data["meteors"]
    assert isinstance(meteors, list)

    # Perseids should be active in mid-August
    if len(meteors) > 0:
        meteor = meteors[0]
        assert "name" in meteor
        assert "zhr" in meteor
        assert "peak_date" in meteor
        assert "is_peak" in meteor


@time_machine.travel("2025-01-15 22:00:00", tick=False)
def test_report_endpoint_returns_deep_sky_objects():
    """Report endpoint returns visible deep sky objects."""
    response = client.get(f"/api/report?lat={NYC_LAT}&lon={NYC_LON}")

    assert response.status_code == 200
    data = response.json()

    dsos = data["deep_sky"]
    assert isinstance(dsos, list)

    # Should have some DSOs visible
    if len(dsos) > 0:
        dso = dsos[0]
        assert "id" in dso
        assert "name" in dso
        assert "constellation" in dso
        assert "mag" in dso
        assert "type" in dso
        assert "equipment" in dso
        assert "tip" in dso
        assert "altitude" in dso


@time_machine.travel("2025-01-15 22:00:00", tick=False)
def test_report_endpoint_returns_events():
    """Report endpoint returns astronomical events."""
    response = client.get(f"/api/report?lat={NYC_LAT}&lon={NYC_LON}")

    assert response.status_code == 200
    data = response.json()

    events = data["events"]
    assert isinstance(events, list)


def test_cors_middleware_configured():
    """CORS middleware is configured (TestClient doesn't trigger CORS headers)."""
    # Note: TestClient doesn't trigger CORS middleware like a real browser would
    # This test just verifies the endpoint is accessible
    response = client.get(f"/api/report?lat={NYC_LAT}&lon={NYC_LON}")
    assert response.status_code == 200


@time_machine.travel("2025-01-15 22:00:00", tick=False)
def test_report_endpoint_location_returned():
    """Report endpoint returns the requested location."""
    response = client.get(f"/api/report?lat={NYC_LAT}&lon={NYC_LON}")

    assert response.status_code == 200
    data = response.json()

    location = data["location"]
    assert location["lat"] == NYC_LAT
    assert location["lon"] == NYC_LON
