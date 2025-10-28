"""Sensory profile schemas for request/response validation."""
from pydantic import BaseModel, Field
from typing import Optional, List, Dict
from datetime import datetime


class VisualSettings(BaseModel):
    """Visual accommodation settings."""
    reduce_animations: bool = False
    reduce_motion: bool = False
    high_contrast: bool = False
    dark_mode: bool = False
    reduced_clutter: bool = False
    font_size: str = Field(
        "medium",
        pattern=r'^(small|medium|large|extra-large)$'
    )
    font_family: str = Field(
        "standard",
        pattern=r'^(standard|dyslexic|comic-sans|open-dyslexic)$'
    )
    line_spacing: str = Field("normal", pattern=r'^(normal|wide|extra-wide)$')
    color_scheme: str = Field(
        "default",
        pattern=r'^(default|warm|cool|grayscale|high-contrast)$'
    )
    flashing_content: str = Field(
        "allow",
        pattern=r'^(allow|reduce|remove)$'
    )


class AuditorySettings(BaseModel):
    """Auditory accommodation settings."""
    mute_all_sounds: bool = False
    sound_volume: int = Field(70, ge=0, le=100)
    no_background_music: bool = False
    no_sound_effects: bool = False
    text_to_speech_enabled: bool = False
    text_to_speech_speed: float = Field(1.0, ge=0.5, le=2.0)
    text_to_speech_voice: str = Field(
        "female",
        pattern=r'^(male|female|child)$'
    )
    audio_descriptions: bool = False


class MotorSettings(BaseModel):
    """Motor accommodation settings."""
    larger_click_targets: bool = False
    no_double_click: bool = False
    no_drag_and_drop: bool = False
    increase_spacing: bool = False
    sticky_keys: bool = False
    keyboard_only: bool = False
    touch_accommodations: bool = False
    hover_delay: int = Field(0, ge=0, le=2000)


class CognitiveSettings(BaseModel):
    """Cognitive accommodation settings."""
    one_thing_at_a_time: bool = False
    no_popups: bool = False
    no_autoplay: bool = False
    simplify_instructions: bool = False
    show_progress_indicator: bool = True
    limit_choices: int = Field(0, ge=0, le=10)
    extended_time: bool = False
    time_multiplier: float = Field(1.0, ge=1.0, le=3.0)
    break_reminders: bool = False
    break_frequency: int = Field(30, ge=5, le=120)


class EnvironmentSettings(BaseModel):
    """Environment settings."""
    full_screen_mode: bool = False
    minimize_distractions: bool = False
    hide_chat: bool = False
    hide_notifications: bool = False
    white_noise: bool = False


class TriggerSettings(BaseModel):
    """Trigger/sensitivity settings."""
    avoid_colors: List[str] = []
    avoid_patterns: bool = False
    avoid_flashing: bool = False
    content_warnings: List[str] = []


class SensoryProfileCreate(BaseModel):
    """Schema for creating sensory profile."""
    name: Optional[str] = None
    preset_id: Optional[str] = None
    visual: Optional[VisualSettings] = None
    auditory: Optional[AuditorySettings] = None
    motor: Optional[MotorSettings] = None
    cognitive: Optional[CognitiveSettings] = None
    environment: Optional[EnvironmentSettings] = None
    triggers: Optional[TriggerSettings] = None


class SensoryProfileUpdate(BaseModel):
    """Schema for updating sensory profile."""
    name: Optional[str] = None
    visual: Optional[VisualSettings] = None
    auditory: Optional[AuditorySettings] = None
    motor: Optional[MotorSettings] = None
    cognitive: Optional[CognitiveSettings] = None
    environment: Optional[EnvironmentSettings] = None
    triggers: Optional[TriggerSettings] = None


class SensoryProfileResponse(BaseModel):
    """Schema for sensory profile response."""
    id: str
    user_id: str
    name: Optional[str] = None
    preset_id: Optional[str] = None
    visual: Dict
    auditory: Dict
    motor: Dict
    cognitive: Dict
    environment: Dict
    triggers: Optional[Dict] = None
    created_at: datetime
    updated_at: datetime
    
    class Config:
        from_attributes = True


class SensoryPreset(BaseModel):
    """Schema for sensory profile preset."""
    id: str
    name: str
    description: str
    icon: str
    recommended_for: List[str]
    profile: SensoryProfileCreate
