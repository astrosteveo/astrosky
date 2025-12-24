"""Configuration via environment variables."""

import os


def get_cors_origins() -> list[str]:
    """Get CORS origins from environment or default."""
    origins_str = os.environ.get(
        "CORS_ORIGINS_STR",
        "http://localhost:5173,http://localhost:5174"
    )
    return [origin.strip() for origin in origins_str.split(",")]


def get_cors_origin_regex() -> str | None:
    """Get CORS origin regex pattern for Vercel preview deployments."""
    # Allow all Vercel preview URLs for this project
    # Pattern matches: https://astrosky-*-*.vercel.app
    return os.environ.get(
        "CORS_ORIGIN_REGEX",
        r"https://astrosky(-[a-z0-9]+)*\.vercel\.app"
    )


# Simple config without pydantic for CORS
CORS_ORIGINS = get_cors_origins()
CORS_ORIGIN_REGEX = get_cors_origin_regex()
N2YO_API_KEY = os.environ.get("N2YO_API_KEY", "")
ENVIRONMENT = os.environ.get("ENVIRONMENT", "development")
