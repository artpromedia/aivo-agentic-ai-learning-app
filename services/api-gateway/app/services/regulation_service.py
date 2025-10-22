"""Self-regulation service for activity management."""
import logging
from typing import List, Optional

from app.schemas.regulation import (
    RegulationActivity,
    ActivityType,
    EmotionType
)

logger = logging.getLogger(__name__)


class RegulationService:
    """Service for self-regulation activities."""

    def __init__(self):
        self._activities = self._load_activities()

    def _load_activities(self) -> List[RegulationActivity]:
        """Load all available regulation activities."""

        activities = [
            # Breathing Activities
            RegulationActivity(
                id="box-breathing",
                type=ActivityType.BREATHING,
                name="Box Breathing",
                description="Breathe in for 4, hold for 4, out for 4, hold 4",
                duration=120,
                instructions=[
                    "Sit comfortably with your feet on the floor",
                    "Breathe in slowly through your nose for 4 counts",
                    "Hold your breath for 4 counts",
                    "Breathe out slowly through your mouth for 4 counts",
                    "Hold for 4 counts",
                    "Repeat 4 times"
                ],
                icon="wind",
                difficulty="easy",
                best_for=["anxious", "stressed", "overwhelmed"]
            ),
            RegulationActivity(
                id="belly-breathing",
                type=ActivityType.BREATHING,
                name="Belly Breathing",
                description="Deep breathing using your diaphragm",
                duration=180,
                instructions=[
                    "Place one hand on your chest, one on your belly",
                    "Breathe in through your nose, feel belly rise",
                    "Breathe out through your mouth, belly falls",
                    "Count to 3 as you breathe in",
                    "Count to 3 as you breathe out",
                    "Repeat 5 times"
                ],
                icon="wind",
                difficulty="easy",
                best_for=["anxious", "angry", "frustrated"]
            ),
            RegulationActivity(
                id="five-finger-breathing",
                type=ActivityType.BREATHING,
                name="Five Finger Breathing",
                description="Trace your hand while breathing",
                duration=90,
                instructions=[
                    "Hold one hand up in front of you",
                    "Use your other finger to trace up and down",
                    "Breathe in as you trace up a finger",
                    "Breathe out as you trace down",
                    "Trace all 5 fingers",
                    "Repeat if needed"
                ],
                icon="hand",
                difficulty="easy",
                best_for=["anxious", "overwhelmed"]
            ),
            # Movement Activities
            RegulationActivity(
                id="body-scan",
                type=ActivityType.MOVEMENT,
                name="Body Scan",
                description="Notice and release tension in your body",
                duration=240,
                instructions=[
                    "Sit or lie down comfortably",
                    "Start at your toes - wiggle them",
                    "Move up to your legs - tense and relax",
                    "Notice your belly rising and falling",
                    "Relax your arms and shoulders",
                    "Finish with your face - smile and relax"
                ],
                icon="body",
                difficulty="medium",
                best_for=["tired", "tense", "stressed"]
            ),
            RegulationActivity(
                id="shake-it-out",
                type=ActivityType.MOVEMENT,
                name="Shake It Out",
                description="Release energy through movement",
                duration=60,
                instructions=[
                    "Stand up with space around you",
                    "Shake your hands for 10 seconds",
                    "Shake your arms for 10 seconds",
                    "Jump and shake your whole body",
                    "Take a deep breath",
                    "Notice how you feel"
                ],
                icon="shake",
                difficulty="easy",
                best_for=["angry", "frustrated", "excited"]
            ),
            RegulationActivity(
                id="wall-pushes",
                type=ActivityType.MOVEMENT,
                name="Wall Pushes",
                description="Push against wall for proprioceptive input",
                duration=90,
                instructions=[
                    "Find a clear wall space",
                    "Place both hands on the wall",
                    "Push as hard as you can for 10 seconds",
                    "Rest for 5 seconds",
                    "Repeat 3 times",
                    "Take deep breaths between pushes"
                ],
                icon="hand-back-fist",
                difficulty="easy",
                best_for=["angry", "overwhelmed", "anxious"]
            ),
            # Sensory Activities
            RegulationActivity(
                id="five-four-three-two-one",
                type=ActivityType.SENSORY,
                name="5-4-3-2-1 Grounding",
                description="Use your senses to stay present",
                duration=180,
                instructions=[
                    "Name 5 things you can see",
                    "Name 4 things you can touch",
                    "Name 3 things you can hear",
                    "Name 2 things you can smell",
                    "Name 1 thing you can taste",
                    "Take a deep breath"
                ],
                icon="eye",
                difficulty="easy",
                best_for=["anxious", "overwhelmed", "panicked"]
            ),
            RegulationActivity(
                id="cold-water-reset",
                type=ActivityType.SENSORY,
                name="Cold Water Reset",
                description="Splash cold water to calm nervous system",
                duration=60,
                instructions=[
                    "Go to a sink or water fountain",
                    "Splash cold water on your face",
                    "Hold cold water on your wrists",
                    "Take 3 deep breaths",
                    "Notice the cooling sensation",
                    "Dry off and return"
                ],
                icon="droplet",
                difficulty="easy",
                best_for=["angry", "overwhelmed", "panicked"]
            ),
            RegulationActivity(
                id="quiet-corner",
                type=ActivityType.SENSORY,
                name="Quiet Corner Time",
                description="Take a break in a calm space",
                duration=300,
                instructions=[
                    "Find a quiet, comfortable spot",
                    "Dim the lights if possible",
                    "Sit or lie down comfortably",
                    "Close your eyes or look at calm images",
                    "Breathe slowly",
                    "Stay until you feel calmer"
                ],
                icon="home",
                difficulty="easy",
                best_for=["overwhelmed", "tired", "overstimulated"]
            ),
            # Grounding Activities
            RegulationActivity(
                id="count-backwards",
                type=ActivityType.GROUNDING,
                name="Count Backwards",
                description="Focus your mind with counting",
                duration=90,
                instructions=[
                    "Choose a number (like 100)",
                    "Count backwards by 3s or 7s",
                    "Say the numbers out loud or in your head",
                    "If you lose track, start over",
                    "Count until you feel calmer",
                    "Take a deep breath when done"
                ],
                icon="calculator",
                difficulty="medium",
                best_for=["anxious", "racing thoughts"]
            ),
            RegulationActivity(
                id="alphabet-game",
                type=ActivityType.GROUNDING,
                name="Alphabet Game",
                description="Name things from A to Z",
                duration=180,
                instructions=[
                    "Choose a category (animals, foods, etc.)",
                    "Name something starting with A",
                    "Continue through the alphabet",
                    "Say them out loud or write them down",
                    "Go as far as you can",
                    "Celebrate your focus!"
                ],
                icon="a",
                difficulty="medium",
                best_for=["anxious", "distracted"]
            ),
            # Visualization Activities
            RegulationActivity(
                id="safe-place",
                type=ActivityType.VISUALIZATION,
                name="Safe Place Visualization",
                description="Imagine a calm, safe place",
                duration=240,
                instructions=[
                    "Close your eyes or focus on one spot",
                    "Think of a place where you feel safe",
                    "Imagine what you see there",
                    "Imagine what you hear",
                    "Imagine how it feels",
                    "Stay there as long as you need"
                ],
                icon="heart",
                difficulty="medium",
                best_for=["anxious", "scared", "overwhelmed"]
            ),
            RegulationActivity(
                id="balloon-worries",
                type=ActivityType.VISUALIZATION,
                name="Balloon Worries",
                description="Let your worries float away",
                duration=180,
                instructions=[
                    "Think of something worrying you",
                    "Imagine putting it in a balloon",
                    "Picture the balloon floating up",
                    "Watch it get smaller and smaller",
                    "Let it disappear into the sky",
                    "Take a deep breath of relief"
                ],
                icon="balloon",
                difficulty="medium",
                best_for=["anxious", "worried", "stressed"]
            )
        ]

        logger.info("Loaded %d regulation activities", len(activities))
        return activities

    def get_all_activities(self) -> List[RegulationActivity]:
        """Get all available activities."""
        return self._activities

    def get_activity_by_id(
        self,
        activity_id: str
    ) -> Optional[RegulationActivity]:
        """Get specific activity by ID."""
        for activity in self._activities:
            if activity.id == activity_id:
                return activity
        return None

    def get_recommendations(
        self,
        emotion: EmotionType
    ) -> List[RegulationActivity]:
        """Get recommended activities for emotion."""

        # Map emotions to activity recommendations
        emotion_value = emotion.value if hasattr(emotion, 'value') else emotion

        recommendations = [
            activity for activity in self._activities
            if emotion_value in activity.best_for
        ]

        # Sort by difficulty (easy first)
        difficulty_order = {"easy": 0, "medium": 1, "advanced": 2}
        recommendations.sort(
            key=lambda x: difficulty_order.get(x.difficulty, 1)
        )

        logger.info(
            "Found %d recommendations for emotion %s",
            len(recommendations), emotion_value
        )

        return recommendations[:5]  # Return top 5 recommendations
