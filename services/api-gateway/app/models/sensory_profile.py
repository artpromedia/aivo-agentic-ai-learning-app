"""Sensory profile model for accommodations."""
from sqlalchemy import Column, String, ForeignKey, JSON
from sqlalchemy.orm import relationship

from app.models.base import BaseModel


class SensoryProfile(BaseModel):
    """Sensory accommodation profile."""
    __tablename__ = "sensory_profiles"

    # Foreign Keys
    user_id = Column(String(36), ForeignKey("users.id"), nullable=False, index=True)
    
    # Profile Name
    name = Column(String(255), nullable=True)  # Optional custom name
    preset_id = Column(String(100), nullable=True)  # e.g., "asd-low-sensory"
    
    # Visual Accommodations
    visual = Column(JSON, nullable=False)
    # Example: {
    #   "reduce_animations": true,
    #   "reduce_motion": true,
    #   "high_contrast": false,
    #   "dark_mode": false,
    #   "reduced_clutter": true,
    #   "font_size": "large",
    #   "font_family": "dyslexic",
    #   "line_spacing": "wide",
    #   "color_scheme": "warm",
    #   "flashing_content": "remove"
    # }
    
    # Auditory Accommodations
    auditory = Column(JSON, nullable=False)
    # Example: {
    #   "mute_all_sounds": true,
    #   "sound_volume": 0,
    #   "no_background_music": true,
    #   "no_sound_effects": true,
    #   "text_to_speech_enabled": true,
    #   "text_to_speech_speed": 0.9,
    #   "text_to_speech_voice": "female",
    #   "audio_descriptions": true
    # }
    
    # Motor Accommodations
    motor = Column(JSON, nullable=False)
    # Example: {
    #   "larger_click_targets": true,
    #   "no_double_click": true,
    #   "no_drag_and_drop": true,
    #   "increase_spacing": true,
    #   "sticky_keys": false,
    #   "keyboard_only": false,
    #   "touch_accommodations": true,
    #   "hover_delay": 500
    # }
    
    # Cognitive Accommodations
    cognitive = Column(JSON, nullable=False)
    # Example: {
    #   "one_thing_at_a_time": true,
    #   "no_popups": true,
    #   "no_autoplay": true,
    #   "simplify_instructions": true,
    #   "show_progress_indicator": true,
    #   "limit_choices": 3,
    #   "extended_time": true,
    #   "time_multiplier": 1.5,
    #   "break_reminders": true,
    #   "break_frequency": 20
    # }
    
    # Environment
    environment = Column(JSON, nullable=False)
    # Example: {
    #   "full_screen_mode": true,
    #   "minimize_distractions": true,
    #   "hide_chat": true,
    #   "hide_notifications": true,
    #   "white_noise": false
    # }
    
    # Triggers
    triggers = Column(JSON, nullable=True)
    # Example: {
    #   "avoid_colors": ["#ff0000", "#ff6600"],
    #   "avoid_patterns": true,
    #   "avoid_flashing": true,
    #   "content_warnings": ["loud-noises", "crowds"]
    # }
    
    # Relationships
    user = relationship("User", back_populates="sensory_profiles")
    
    def __repr__(self):
        return f"<SensoryProfile {self.name or self.preset_id}>"
