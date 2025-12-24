"""Health check endpoint."""

from fastapi import APIRouter, Request
from slowapi import Limiter
from slowapi.util import get_remote_address

router = APIRouter(tags=["health"])
limiter = Limiter(key_func=get_remote_address)


@router.get("/health")
@limiter.limit("200/minute")  # Very generous for health checks
def health_check(request: Request) -> dict:
    """Return API health status."""
    return {"status": "ok", "version": "0.3.0"}
