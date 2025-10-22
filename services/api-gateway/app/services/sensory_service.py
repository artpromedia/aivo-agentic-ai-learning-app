"""Sensory profile service for managing accommodations."""
import logging
from typing import List, Any, Dict

from app.schemas.sensory_profile import (
    SensoryPreset,
    SensoryProfileCreate,
    VisualSettings,
    AuditorySettings,
    MotorSettings,
    CognitiveSettings,
    EnvironmentSettings
)

logger = logging.getLogger(__name__)


def _visual(**overrides: Any) -> VisualSettings:
    """Create VisualSettings with defaults and overrides."""
    defaults: Dict[str, Any] = {
        "font_size": "medium",
        "font_family": "standard",
        "line_spacing": "normal",
        "color_scheme": "default",
        "flashing_content": "allow"
    }
    defaults.update(overrides)
    return VisualSettings(**defaults)


def _auditory(**overrides: Any) -> AuditorySettings:
    """Create AuditorySettings with defaults and overrides."""
    defaults: Dict[str, Any] = {
        "sound_volume": 70,
        "text_to_speech_speed": 1.0,
        "text_to_speech_voice": "female"
    }
    defaults.update(overrides)
    return AuditorySettings(**defaults)


def _motor(**overrides: Any) -> MotorSettings:
    """Create MotorSettings with defaults and overrides."""
    defaults: Dict[str, Any] = {"hover_delay": 0}
    defaults.update(overrides)
    return MotorSettings(**defaults)


def _cognitive(**overrides: Any) -> CognitiveSettings:
    """Create CognitiveSettings with defaults and overrides."""
    defaults: Dict[str, Any] = {
        "limit_choices": 0,
        "time_multiplier": 1.0,
        "break_frequency": 30
    }
    defaults.update(overrides)
    return CognitiveSettings(**defaults)


def _environment(**overrides: Any) -> EnvironmentSettings:
    """Create EnvironmentSettings with defaults and overrides."""
    return EnvironmentSettings(**overrides)


class SensoryService:
    """Service for sensory profile operations."""

    def get_presets(self) -> List[SensoryPreset]:
        """Get all available sensory profile presets."""

        presets = [
            SensoryPreset(
                id="asd-low-sensory",
                name="ASD Low Sensory",
                description=(
                    "Minimal animations, sounds, and visual clutter. "
                    "Best for sensory-sensitive learners."
                ),
                icon="volume-off",
                recommended_for=["ASD", "Sensory Processing Disorder"],
                profile=SensoryProfileCreate(
                    visual=_visual(
                        reduce_animations=True,
                        reduce_motion=True,
                        reduced_clutter=True,
                        font_size="large",
                        line_spacing="wide",
                        flashing_content="remove"
                    ),
                    auditory=_auditory(
                        mute_all_sounds=True,
                        sound_volume=0,
                        no_background_music=True,
                        no_sound_effects=True
                    ),
                    motor=_motor(
                        larger_click_targets=True,
                        no_drag_and_drop=True
                    ),
                    cognitive=_cognitive(
                        one_thing_at_a_time=True,
                        no_popups=True,
                        simplify_instructions=True
                    ),
                    environment=_environment(
                        minimize_distractions=True,
                        hide_chat=True,
                        hide_notifications=True
                    )
                )
            ),
            SensoryPreset(
                id="adhd-focus",
                name="ADHD Focus Mode",
                description=(
                    "Reduced distractions with break reminders. "
                    "Helps maintain attention."
                ),
                icon="target",
                recommended_for=["ADHD"],
                profile=SensoryProfileCreate(
                    visual=_visual(
                        reduced_clutter=True,
                        font_size="large"
                    ),
                    auditory=_auditory(
                        no_background_music=True,
                        sound_volume=50
                    ),
                    motor=_motor(),
                    cognitive=_cognitive(
                        one_thing_at_a_time=True,
                        no_autoplay=True,
                        show_progress_indicator=True,
                        break_reminders=True,
                        break_frequency=20
                    ),
                    environment=_environment(
                        full_screen_mode=True,
                        minimize_distractions=True
                    )
                )
            ),
            SensoryPreset(
                id="dyslexia-friendly",
                name="Dyslexia-Friendly",
                description=(
                    "Dyslexic font, wide spacing, and text-to-speech "
                    "support."
                ),
                icon="font",
                recommended_for=["Dyslexia", "Reading Disabilities"],
                profile=SensoryProfileCreate(
                    visual=_visual(
                        font_size="large",
                        font_family="dyslexic",
                        line_spacing="extra-wide"
                    ),
                    auditory=_auditory(
                        text_to_speech_enabled=True,
                        text_to_speech_speed=0.9
                    ),
                    motor=_motor(),
                    cognitive=_cognitive(
                        simplify_instructions=True,
                        extended_time=True,
                        time_multiplier=1.5
                    ),
                    environment=_environment()
                )
            ),
            SensoryPreset(
                id="vision-support",
                name="Vision Support",
                description=(
                    "High contrast, large text, and screen reader "
                    "compatibility."
                ),
                icon="eye",
                recommended_for=["Visual Impairment", "Low Vision"],
                profile=SensoryProfileCreate(
                    visual=_visual(
                        high_contrast=True,
                        font_size="extra-large",
                        line_spacing="extra-wide",
                        color_scheme="high-contrast"
                    ),
                    auditory=_auditory(
                        text_to_speech_enabled=True,
                        audio_descriptions=True
                    ),
                    motor=_motor(
                        larger_click_targets=True,
                        keyboard_only=True
                    ),
                    cognitive=_cognitive(),
                    environment=_environment()
                )
            ),
            SensoryPreset(
                id="motor-support",
                name="Motor Support",
                description=(
                    "Large targets, keyboard navigation, "
                    "no drag-and-drop."
                ),
                icon="hand-pointer",
                recommended_for=["Motor Disabilities", "Cerebral Palsy"],
                profile=SensoryProfileCreate(
                    visual=_visual(),
                    auditory=_auditory(),
                    motor=_motor(
                        larger_click_targets=True,
                        no_double_click=True,
                        no_drag_and_drop=True,
                        increase_spacing=True,
                        keyboard_only=True,
                        touch_accommodations=True
                    ),
                    cognitive=_cognitive(
                        extended_time=True,
                        time_multiplier=2.0
                    ),
                    environment=_environment()
                )
            ),
            SensoryPreset(
                id="anxiety-friendly",
                name="Anxiety-Friendly",
                description=(
                    "Calm colors, no timers, positive reinforcement. "
                    "Reduces stress."
                ),
                icon="heart",
                recommended_for=["Anxiety", "Stress"],
                profile=SensoryProfileCreate(
                    visual=_visual(
                        color_scheme="warm",
                        reduce_animations=True
                    ),
                    auditory=_auditory(
                        sound_volume=40,
                        no_sound_effects=True
                    ),
                    motor=_motor(),
                    cognitive=_cognitive(
                        no_popups=True,
                        extended_time=True,
                        break_reminders=True
                    ),
                    environment=_environment(
                        minimize_distractions=True,
                        hide_notifications=True
                    )
                )
            )
        ]

        logger.info("Retrieved %d sensory presets", len(presets))
        return presets
