"""Configuration via environment variables."""

import os


def get_cors_origins() -> list[str]:
    """Get CORS origins from environment or default."""
    origins_str = os.environ.get(
        "CORS_ORIGINS_STR",
        "http://localhost:5173,http://localhost:5174"
    )
    return [origin.strip() for origin in origins_str.split(",")]


# Simple config without pydantic for CORS
CORS_ORIGINS = get_cors_origins()
N2YO_API_KEY = os.environ.get("N2YO_API_KEY", "")
ENVIRONMENT = os.environ.get("ENVIRONMENT", "development")
