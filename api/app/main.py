"""FastAPI application for AstroSky API."""

from fastapi import FastAPI, Request
from fastapi.middleware.cors import CORSMiddleware
from slowapi import Limiter, _rate_limit_exceeded_handler
from slowapi.util import get_remote_address
from slowapi.errors import RateLimitExceeded

from app.config import CORS_ORIGINS
from app.routers import health, report


# Rate limiter configuration
# Generous limits for amateur astronomers while protecting against abuse
limiter = Limiter(key_func=get_remote_address)

app = FastAPI(
    title="AstroSky API",
    description="Real-time night sky information",
    version="0.3.0",
)

# Add rate limiter to app state
app.state.limiter = limiter
app.add_exception_handler(RateLimitExceeded, _rate_limit_exceeded_handler)

# CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=CORS_ORIGINS,
    allow_credentials=True,
    allow_methods=["GET"],
    allow_headers=["*"],
)

# Routers
app.include_router(health.router, prefix="/api")
app.include_router(report.router, prefix="/api")
