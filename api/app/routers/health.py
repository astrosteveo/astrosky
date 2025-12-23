"""Health check endpoint."""

from fastapi import APIRouter

router = APIRouter(tags=["health"])


@router.get("/health")
def health_check() -> dict:
    """Return API health status."""
    return {"status": "ok", "version": "0.3.0"}
