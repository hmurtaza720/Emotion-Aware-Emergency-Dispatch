from sqlalchemy import Boolean, Column, ForeignKey, Integer, String, Float, DateTime, JSON
from sqlalchemy.orm import relationship
from .database import Base
from datetime import datetime

class User(Base):
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True)
    username = Column(String, unique=True, index=True)
    email = Column(String, unique=True, index=True)
    hashed_password = Column(String)
    full_name = Column(String)
    role = Column(String, default="dispatcher")
    is_active = Column(Boolean, default=True)

    # Relationships
    settings = relationship("UserSettings", back_populates="user", uselist=False)
    calls = relationship("Call", back_populates="dispatcher")

class UserSettings(Base):
    __tablename__ = "user_settings"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"))
    
    # Preferences
    theme = Column(String, default="dark")
    notifications_enabled = Column(Boolean, default=True)
    auto_connect = Column(Boolean, default=True)
    default_state = Column(String, default="CA")
    
    # Audio Settings (Mocked for now as JSON or simple fields)
    mic_sensitivity = Column(Integer, default=75)
    speaker_volume = Column(Integer, default=90)

    user = relationship("User", back_populates="settings")

class Call(Base):
    __tablename__ = "calls"

    id = Column(Integer, primary_key=True, index=True)
    dispatcher_id = Column(Integer, ForeignKey("users.id"), nullable=True)
    
    caller_phone = Column(String, index=True)
    caller_name = Column(String, nullable=True)
    
    # Timestamps
    start_time = Column(DateTime, default=datetime.utcnow)
    end_time = Column(DateTime, nullable=True)
    
    # Metadata
    location_data = Column(JSON, nullable=True)  # Store {"lat": ..., "lng": ..., "address": ...}
    severity = Column(String, default="Routine")
    status = Column(String, default="Completed") # Connected, Completed, Dropped
    
    # Content
    transcript = Column(JSON, default=[]) # List of message objects
    audio_path = Column(String, nullable=True) # Path to .wav file
    
    summary = Column(String, nullable=True)

    dispatcher = relationship("User", back_populates="calls")
