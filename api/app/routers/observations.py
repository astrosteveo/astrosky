"""API endpoints for observation logging."""

from datetime import datetime
from typing import Optional
from fastapi import APIRouter, Depends, HTTPException, Query
from pydantic import BaseModel, Field
from sqlalchemy.orm import Session
from sqlalchemy import and_, func

from app.database import get_db
from app.models import Observation

router = APIRouter()


# Pydantic models for request/response
class ObservationCreate(BaseModel):
    """Request body for creating an observation."""
    id: str = Field(..., description="Client-generated observation ID")
    device_id: str = Field(..., description="Anonymous device identifier")
    object_type: str = Field(..., description="Type: planet, moon, deep-sky, etc.")
    object_id: str = Field(..., description="Object identifier: planet-mars, dso-M31")
    object_name: str = Field(..., description="Display name")
    object_details: Optional[str] = None
    timestamp: datetime
    lat: float
    lon: float
    place_name: Optional[str] = None
    equipment: str = Field(..., description="naked-eye, binoculars, or telescope")
    notes: Optional[str] = None


class ObservationResponse(BaseModel):
    """Response model for an observation."""
    id: str
    device_id: str
    object_type: str
    object_id: str
    object_name: str
    object_details: Optional[str]
    timestamp: datetime
    lat: float
    lon: float
    place_name: Optional[str]
    equipment: str
    notes: Optional[str]
    created_at: datetime

    class Config:
        from_attributes = True


class SyncRequest(BaseModel):
    """Request body for syncing observations."""
    device_id: str
    observations: list[ObservationCreate]


class SyncResponse(BaseModel):
    """Response for sync operation."""
    synced: int
    device_observations: list[ObservationResponse]


class NearbyStats(BaseModel):
    """Statistics for nearby observations."""
    object_id: str
    object_name: str
    object_type: str
    observation_count: int
    latest_observation: datetime
    equipment_breakdown: dict[str, int]


@router.post("/observations/sync", response_model=SyncResponse)
def sync_observations(request: SyncRequest, db: Session = Depends(get_db)):
    """
    Sync observations from a device.
    - Upserts provided observations
    - Returns all observations for this device
    """
    synced_count = 0

    for obs_data in request.observations:
        # Check if observation already exists
        existing = db.query(Observation).filter(Observation.id == obs_data.id).first()

        if existing:
            # Update existing
            for key, value in obs_data.model_dump().items():
                setattr(existing, key, value)
        else:
            # Create new
            observation = Observation(**obs_data.model_dump())
            db.add(observation)
            synced_count += 1

    db.commit()

    # Return all observations for this device
    device_obs = db.query(Observation).filter(
        Observation.device_id == request.device_id
    ).order_by(Observation.timestamp.desc()).all()

    return SyncResponse(
        synced=synced_count,
        device_observations=[ObservationResponse.model_validate(o) for o in device_obs]
    )


@router.get("/observations/mine", response_model=list[ObservationResponse])
def get_my_observations(
    device_id: str = Query(..., description="Device identifier"),
    db: Session = Depends(get_db)
):
    """Get all observations for a device."""
    observations = db.query(Observation).filter(
        Observation.device_id == device_id
    ).order_by(Observation.timestamp.desc()).all()

    return [ObservationResponse.model_validate(o) for o in observations]


@router.get("/observations/nearby", response_model=list[NearbyStats])
def get_nearby_observations(
    lat: float = Query(..., description="Latitude"),
    lon: float = Query(..., description="Longitude"),
    radius_km: float = Query(50, description="Search radius in km"),
    days: int = Query(30, description="Look back this many days"),
    db: Session = Depends(get_db)
):
    """
    Get observation statistics for objects observed near a location.
    Returns aggregated stats, not individual observations (privacy).
    """
    # Approximate degree distance (1 degree ≈ 111km at equator)
    degree_radius = radius_km / 111.0

    cutoff_date = datetime.utcnow().replace(
        hour=0, minute=0, second=0, microsecond=0
    )
    from datetime import timedelta
    cutoff_date = cutoff_date - timedelta(days=days)

    # Query observations within radius and time window
    nearby = db.query(Observation).filter(
        and_(
            Observation.lat.between(lat - degree_radius, lat + degree_radius),
            Observation.lon.between(lon - degree_radius, lon + degree_radius),
            Observation.timestamp >= cutoff_date
        )
    ).all()

    # Aggregate by object
    stats_map: dict[str, NearbyStats] = {}

    for obs in nearby:
        if obs.object_id not in stats_map:
            stats_map[obs.object_id] = {
                "object_id": obs.object_id,
                "object_name": obs.object_name,
                "object_type": obs.object_type,
                "observation_count": 0,
                "latest_observation": obs.timestamp,
                "equipment_breakdown": {}
            }

        stats = stats_map[obs.object_id]
        stats["observation_count"] += 1

        if obs.timestamp > stats["latest_observation"]:
            stats["latest_observation"] = obs.timestamp

        eq = obs.equipment
        stats["equipment_breakdown"][eq] = stats["equipment_breakdown"].get(eq, 0) + 1

    return list(stats_map.values())


@router.delete("/observations/{observation_id}")
def delete_observation(
    observation_id: str,
    device_id: str = Query(..., description="Device identifier for verification"),
    db: Session = Depends(get_db)
):
    """Delete an observation (only if it belongs to this device)."""
    observation = db.query(Observation).filter(
        and_(
            Observation.id == observation_id,
            Observation.device_id == device_id
        )
    ).first()

    if not observation:
        raise HTTPException(status_code=404, detail="Observation not found")

    db.delete(observation)
    db.commit()

    return {"deleted": True}
