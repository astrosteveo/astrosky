"""Report endpoint - wraps skycli build_report()."""

from datetime import datetime, timezone
from typing import Annotated

from fastapi import APIRouter, Query
from pydantic import BaseModel

from skycli.report import build_report


router = APIRouter(tags=["report"])


# Pydantic models matching skycli TypedDicts
class Location(BaseModel):
    lat: float
    lon: float


class SunTimes(BaseModel):
    sunrise: datetime
    sunset: datetime
    astronomical_twilight_start: datetime
    astronomical_twilight_end: datetime


class MoonInfo(BaseModel):
    phase_name: str
    illumination: float
    darkness_quality: str
    moonrise: datetime | None
    moonset: datetime | None


class PlanetInfo(BaseModel):
    name: str
    direction: str
    altitude: float
    rise_time: datetime | None
    set_time: datetime | None
    description: str


class ISSPass(BaseModel):
    start_time: datetime
    duration_minutes: int
    max_altitude: float
    start_direction: str
    end_direction: str
    brightness: str


class ShowerInfo(BaseModel):
    name: str
    zhr: int
    peak_date: str
    radiant_constellation: str
    is_peak: bool


class DSOInfo(BaseModel):
    id: str
    name: str
    constellation: str
    mag: float
    size: float
    type: str
    equipment: str
    tip: str
    altitude: float


class AstroEvent(BaseModel):
    type: str
    date: datetime
    title: str
    description: str
    bodies: list[str]


class ReportResponse(BaseModel):
    date: datetime
    location: Location
    sun: SunTimes
    moon: MoonInfo
    planets: list[PlanetInfo]
    iss_passes: list[ISSPass]
    meteors: list[ShowerInfo]
    deep_sky: list[DSOInfo]
    events: list[AstroEvent]


@router.get("/report", response_model=ReportResponse)
def get_report(
    lat: Annotated[float, Query(ge=-90, le=90, description="Latitude")],
    lon: Annotated[float, Query(ge=-180, le=180, description="Longitude")],
    date: Annotated[str | None, Query(description="ISO date (YYYY-MM-DD), defaults to today")] = None,
) -> ReportResponse:
    """Get sky report for location and date."""
    if date:
        report_date = datetime.fromisoformat(date).replace(tzinfo=timezone.utc)
    else:
        report_date = datetime.now(timezone.utc)

    report = build_report(lat, lon, report_date)
    return ReportResponse(**report)
