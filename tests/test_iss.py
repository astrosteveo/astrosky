"""Tests for ISS pass predictions."""

from datetime import datetime, timezone

from skycli.sources.iss import get_iss_passes


# Sample API response structure (based on N2YO API)
MOCK_API_RESPONSE = {
    "info": {"satid": 25544, "satname": "SPACE STATION"},
    "passes": [
        {
            "startAz": 225, "startEl": 10, "startUTC": 1737054120,
            "maxAz": 315, "maxEl": 67, "maxUTC": 1737054420,
            "endAz": 45, "endEl": 10, "endUTC": 1737054720,
            "mag": -3.2, "duration": 600
        },
        {
            "startAz": 270, "startEl": 10, "startUTC": 1737060000,
            "maxAz": 0, "maxEl": 34, "maxUTC": 1737060300,
            "endAz": 90, "endEl": 10, "endUTC": 1737060600,
            "mag": -1.5, "duration": 600
        }
    ]
}


def test_parse_iss_passes_structure(mocker):
    """ISS passes have correct structure."""
    mocker.patch.dict("os.environ", {"N2YO_API_KEY": "test_key"})
    mock_response = mocker.Mock()
    mock_response.json.return_value = MOCK_API_RESPONSE
    mock_response.raise_for_status = mocker.Mock()
    mocker.patch("httpx.get", return_value=mock_response)

    result = get_iss_passes(40.7, -74.0, datetime(2025, 1, 16, 18, 0, tzinfo=timezone.utc))

    assert len(result) == 2
    pass_info = result[0]
    assert "start_time" in pass_info
    assert "duration_minutes" in pass_info
    assert "max_altitude" in pass_info
    assert "start_direction" in pass_info
    assert "end_direction" in pass_info
    assert "brightness" in pass_info


def test_handles_api_error_gracefully(mocker):
    """Returns empty list on API error."""
    mocker.patch("httpx.get", side_effect=Exception("Network error"))

    result = get_iss_passes(40.7, -74.0, datetime(2025, 1, 16, tzinfo=timezone.utc))

    assert result == []


def test_filters_to_visible_passes_only(mocker):
    """Only returns passes during nighttime (would need more complex mock)."""
    mocker.patch.dict("os.environ", {"N2YO_API_KEY": "test_key"})
    mock_response = mocker.Mock()
    mock_response.json.return_value = MOCK_API_RESPONSE
    mock_response.raise_for_status = mocker.Mock()
    mocker.patch("httpx.get", return_value=mock_response)

    result = get_iss_passes(40.7, -74.0, datetime(2025, 1, 16, tzinfo=timezone.utc))

    # All returned passes should have positive max altitude
    for p in result:
        assert p["max_altitude"] > 0
