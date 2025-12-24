"""Database models for observations."""

from datetime import datetime
from sqlalchemy import Column, String, Float, DateTime, Text, Index
from app.database import Base


class Observation(Base):
    """An astronomical observation logged by a user."""

    __tablename__ = "observations"

    id = Column(String(50), primary_key=True)  # Client-generated ID
    device_id = Column(String(36), nullable=False, index=True)

    # What was observed
    object_type = Column(String(20), nullable=False)  # planet, moon, deep-sky, etc.
    object_id = Column(String(50), nullable=False)  # planet-mars, dso-M31, moon
    object_name = Column(String(100), nullable=False)
    object_details = Column(String(200))

    # When and where
    timestamp = Column(DateTime, nullable=False, default=datetime.utcnow)
    lat = Column(Float, nullable=False)
    lon = Column(Float, nullable=False)
    place_name = Column(String(200))

    # How
    equipment = Column(String(20), nullable=False)  # naked-eye, binoculars, telescope
    notes = Column(Text)

    # Metadata
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    # Index for geographic queries (nearby observations)
    __table_args__ = (
        Index('idx_location', 'lat', 'lon'),
        Index('idx_object', 'object_id'),
        Index('idx_timestamp', 'timestamp'),
    )
