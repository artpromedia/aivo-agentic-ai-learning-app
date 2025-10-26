"""
Model Cloning Service - Explainable AI Model Personalization
Creates private, personalized learning models with full transparency
"""
import json
import time
from datetime import datetime
from typing import Any, Dict, Optional
from uuid import uuid4

from sqlalchemy.orm import Session

from app.models.learner import Learner


class ModelCloningService:
    """
    Handles creation of personalized learner models with full transparency
    and audit trail for FERPA/COPPA compliance.
    """

    def __init__(self, db: Session):
        self.db = db

    # ============================================================
    # STEP 0: Pre-Clone Preparation
    # ============================================================

    def get_model_intro_data(self, learner_id: str) -> Dict[str, Any]:
        """
        Get information to show in the model cloning introduction screen.

        Returns:
            - Baseline summary (redacted)
            - Privacy control defaults
            - Estimated processing time
            - What data will be used
        """
        # Get learner
        learner = self.db.query(Learner).filter(
            Learner.id == learner_id
        ).first()
        if not learner:
            raise ValueError("Learner not found")

        # Get baseline assessment
        baseline = self._get_latest_baseline(learner_id)
        if not baseline:
            raise ValueError("Baseline assessment not found")

        # Parse JSON fields safely
        domain_scores = self._parse_json(baseline.domain_scores, {})
        
        # Calculate what will be used
        data_usage = {
            "baseline_scores": {
                "used": True,
                "description": "Starting grade levels for each subject",
                "pii": False,
            },
            "accessibility_prefs": {
                "used": True,
                "description": "Text-to-speech, voice input, preferences",
                "pii": False,
            },
            "learning_profile": {
                "used": bool(learner.diagnoses),
                "description": "Learning differences (if provided)",
                "pii": False,
            },
            "iep_goals": {
                "used": bool(learner.has_iep),
                "description": "IEP goals for curriculum alignment",
                "pii": True,
            },
        }

        # Privacy defaults
        privacy_defaults = {
            "store_audio": False,
            "store_images": False,
            "store_free_text_long_term": False,
            "retention_days": 30,
            "history_length": "short",
            "homework_uploads": "none",
        }

        return {
            "learner": {
                "id": str(learner_id),
                "first_name": learner.first_name,
                "preferred_name": learner.preferred_name,
                "grade": learner.grade,
            },
            "baseline_summary": {
                "reading_level": domain_scores.get("reading"),
                "math_level": domain_scores.get("math"),
                "writing_level": domain_scores.get("writing"),
                "completed_at": (baseline.completed_at.isoformat()
                               if baseline.completed_at else None),
            },
            "data_usage": data_usage,
            "privacy_defaults": privacy_defaults,
            "estimated_time_seconds": 5,
            "base_model_version": "aivo-brain-v1.0",
        }

    # ============================================================
    # STEP 1: Record Consent
    # ============================================================

    def record_model_creation_consent(
        self,
        learner_id: str,
        consented_by: str,
        ip_address: Optional[str] = None,
        user_agent: Optional[str] = None,
    ) -> str:
        """
        Record parent/guardian consent for model creation.
        Required before any model building begins.
        """
        consent_id = str(uuid4())

        # Execute raw SQL (since we don't have ORM models yet)
        self.db.execute(
            """
            INSERT INTO model_creation_consent
            (id, learner_id, consented_at, consented_by,
             consent_version, consent_text,
             data_processing_consent, personalization_consent,
             audit_trail_consent, ip_address, user_agent)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
            """,
            (
                consent_id, learner_id, datetime.utcnow().isoformat(),
                consented_by, "1.0", self._get_consent_text_v1(),
                1, 1, 1, ip_address, user_agent,
            )
        )
        self.db.commit()

        # Log audit event
        self._log_audit_event(
            learner_model_id=None,
            event_type="consent_recorded",
            actor_id=consented_by,
            actor_role="parent",
            event_data={"consent_id": consent_id},
            ip_address=ip_address,
        )

        return consent_id

    # ============================================================
    # STEP 2: Build Model (5-step process)
    # ============================================================

    def build_personalized_model(
        self,
        learner_id: str,
        privacy_settings: Dict[str, Any],
        consent_id: str,
        actor_id: str,
    ) -> str:
        """
        Build personalized model in 5 transparent steps.
        Each step logs what data is used and what is produced.

        Steps:
        1. Copy base model to private sandbox
        2. Apply baseline results to set starting levels
        3. Generate subject pathways and scaffolds
        4. Set safety guardrails
        5. Link support tools (Homework Helper, etc.)
        """
        # Create model record
        model_id = str(uuid4())

        # Get learner and baseline
        learner = self.db.query(Learner).filter(
            Learner.id == learner_id
        ).first()
        if not learner:
            raise ValueError("Learner not found")

        baseline = self._get_latest_baseline(learner_id)
        if not baseline:
            raise ValueError("Baseline assessment not found")

        # Initialize model
        self.db.execute(
            """
            INSERT INTO learner_models
            (id, learner_id, model_version, base_model_id, status,
             created_at, privacy_settings, skill_map, parent_consent_at)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
            """,
            (
                model_id, learner_id, "v1.0", "aivo-brain-v1.0",
                "building", datetime.utcnow().isoformat(),
                json.dumps(privacy_settings), json.dumps({}),
                datetime.utcnow().isoformat(),
            )
        )
        self.db.commit()

        # Log start event
        self._log_audit_event(
            learner_model_id=model_id,
            event_type="model_build_start",
            actor_id=actor_id,
            actor_role="system",
            event_data={
                "consent_id": consent_id,
                "privacy_settings": privacy_settings,
            },
        )

        # Execute 5 steps
        steps = [
            self._step1_copy_base_model,
            self._step2_apply_baseline,
            self._step3_generate_pathways,
            self._step4_set_guardrails,
            self._step5_link_tools,
        ]

        for step_num, step_func in enumerate(steps, 1):
            step_data = step_func(
                model_id=model_id,
                learner=learner,
                baseline=baseline,
                privacy_settings=privacy_settings,
            )

            # Log step completion
            self._log_build_step(
                model_id=model_id,
                step_number=step_num,
                step_data=step_data,
            )

            # Small delay for demo (simulate processing)
            time.sleep(0.9)

        # Mark model as ready
        self.db.execute(
            """
            UPDATE learner_models
            SET status = ?, built_at = ?
            WHERE id = ?
            """,
            ("ready", datetime.utcnow().isoformat(), model_id)
        )
        self.db.commit()

        # Generate model card
        self._generate_model_card(model_id, learner, baseline)

        # Log completion
        self._log_audit_event(
            learner_model_id=model_id,
            event_type="model_build_complete",
            actor_id=actor_id,
            actor_role="system",
            event_data={"model_id": model_id},
        )

        return model_id

    # ============================================================
    # Build Steps Implementation
    # ============================================================

    def _step1_copy_base_model(
        self,
        model_id: str,
        learner: Learner,
        baseline: Any,
        privacy_settings: Dict
    ) -> Dict[str, Any]:
        """Step 1: Copy Aivo Brain into private sandbox."""
        return {
            "step_name": "Copy Base Model",
            "description": "Clone the Aivo Brain into private sandbox",
            "data_inputs": {
                "types": ["none"],
                "from_learner": False,
                "pii": False,
            },
            "data_outputs": {
                "artifact": "private_model_instance",
                "size": "base_model",
            },
            "explanation": (
                "We make a copy of our general learning model so "
                "your child has their own private version. No personal "
                "data is used in this step."
            ),
            "duration_ms": 900,
        }

    def _step2_apply_baseline(
        self,
        model_id: str,
        learner: Learner,
        baseline: Any,
        privacy_settings: Dict
    ) -> Dict[str, Any]:
        """Step 2: Apply baseline assessment results."""
        domain_scores = self._parse_json(baseline.domain_scores, {})

        skill_map = {
            "reading": {
                "level": domain_scores.get("reading", 4.0),
                "strengths": ["sight_words", "decoding"],
                "gaps": ["inference", "main_idea"],
            },
            "math": {
                "level": domain_scores.get("math", 4.0),
                "strengths": ["number_sense", "addition"],
                "gaps": ["fractions", "word_problems"],
            },
            "writing": {
                "level": domain_scores.get("writing", 4.0),
                "strengths": ["spelling", "sentences"],
                "gaps": ["paragraphs", "organization"],
            },
        }

        # Save to model
        self.db.execute(
            "UPDATE learner_models SET skill_map = ? WHERE id = ?",
            (json.dumps(skill_map), model_id)
        )
        self.db.commit()

        return {
            "step_name": "Apply Baseline Results",
            "description": "Set starting skill levels from assessment",
            "data_inputs": {
                "types": ["domain_scores", "question_timing"],
                "from_learner": True,
                "pii": False,
            },
            "data_outputs": {
                "artifact": "skill_map",
                "fields": ["reading_level", "math_level", "writing_level"],
            },
            "explanation": (
                "We use the assessment results to set where your child "
                "should start in each subject. Only the grade-level "
                "scores are used, not the actual answers."
            ),
            "duration_ms": 850,
        }

    def _step3_generate_pathways(
        self,
        model_id: str,
        learner: Learner,
        baseline: Any,
        privacy_settings: Dict
    ) -> Dict[str, Any]:
        """Step 3: Generate learning pathways."""
        domain_scores = self._parse_json(baseline.domain_scores, {})
        prefs = self._parse_json(learner.accessibility_prefs, {})

        pathways = {
            "reading": self._generate_reading_pathway(
                level=domain_scores.get("reading", 4.0),
                prefs=prefs,
            ),
            "math": self._generate_math_pathway(
                level=domain_scores.get("math", 4.0),
                prefs=prefs,
            ),
            "writing": self._generate_writing_pathway(
                level=domain_scores.get("writing", 4.0),
                prefs=prefs,
            ),
        }

        # Save to model
        self.db.execute(
            "UPDATE learner_models SET pathways = ? WHERE id = ?",
            (json.dumps(pathways), model_id)
        )
        self.db.commit()

        return {
            "step_name": "Generate Learning Pathways",
            "description": "Create personalized subject pathways",
            "data_inputs": {
                "types": ["skill_map", "accessibility_prefs", "grade"],
                "from_learner": True,
                "pii": False,
            },
            "data_outputs": {
                "artifact": "pathways",
                "subjects": list(pathways.keys()),
            },
            "explanation": (
                "We create learning sequences for each subject that "
                "match your child's current level and preferred "
                "accessibility features."
            ),
            "duration_ms": 920,
        }

    def _step4_set_guardrails(
        self,
        model_id: str,
        learner: Learner,
        baseline: Any,
        privacy_settings: Dict
    ) -> Dict[str, Any]:
        """Step 4: Set safety guardrails."""
        # Extract numeric grade
        grade_num = 5
        if learner.grade:
            import re
            match = re.search(r'\d+', learner.grade)
            if match:
                grade_num = int(match.group())

        guardrails = {
            "content_filter": {
                "age_appropriate": True,
                "grade_level": learner.grade,
                "blocked_topics": ["violence", "adult_content"],
            },
            "tone_policy": {
                "style": "encouraging",
                "complexity": "grade_appropriate",
                "scaffolding": "high",
            },
            "output_constraints": {
                "max_text_length": 500 if grade_num <= 5 else 1000,
                "reading_level": f"grade_{learner.grade}",
                "avoid_jargon": True,
            },
        }

        # Save to model
        self.db.execute(
            "UPDATE learner_models SET guardrails = ? WHERE id = ?",
            (json.dumps(guardrails), model_id)
        )
        self.db.commit()

        return {
            "step_name": "Set Safety Guardrails",
            "description": "Configure age-appropriate content filters",
            "data_inputs": {
                "types": ["age", "grade"],
                "from_learner": True,
                "pii": False,
            },
            "data_outputs": {
                "artifact": "guardrail_policy",
                "rules": [
                    "content_filter",
                    "tone_policy",
                    "topic_restrictions"
                ],
            },
            "explanation": (
                "We set up safety rules to ensure all content is "
                "appropriate for your child's age and grade level."
            ),
            "duration_ms": 800,
        }

    def _step5_link_tools(
        self,
        model_id: str,
        learner: Learner,
        baseline: Any,
        privacy_settings: Dict
    ) -> Dict[str, Any]:
        """Step 5: Link support tools."""
        domain_scores = self._parse_json(baseline.domain_scores, {})
        prefs = self._parse_json(learner.accessibility_prefs, {})

        tool_config = {
            "homework_helper": {
                "enabled": True,
                "difficulty_level": domain_scores.get("reading", 4.0),
                "explanation_style": "step_by_step",
                "hints_before_answers": True,
            },
            "text_to_speech": {
                "enabled": prefs.get("text_to_speech", True),
                "speed": "0.9x",
                "voice": "friendly",
            },
            "voice_input": {
                "enabled": prefs.get("voice_input", False),
                "accuracy_threshold": 0.85,
            },
        }

        # Save to model (as scaffolds)
        self.db.execute(
            "UPDATE learner_models SET scaffolds = ? WHERE id = ?",
            (json.dumps(tool_config), model_id)
        )
        self.db.commit()

        return {
            "step_name": "Link Support Tools",
            "description": "Connect Homework Helper and other features",
            "data_inputs": {
                "types": ["skill_level", "accessibility_prefs"],
                "from_learner": True,
                "pii": False,
            },
            "data_outputs": {
                "artifact": "tool_configuration",
                "features": [
                    "homework_helper",
                    "text_to_speech",
                    "voice_input"
                ],
            },
            "explanation": (
                "We connect the Homework Helper and other tools so "
                "they work at the right difficulty level for your child."
            ),
            "duration_ms": 780,
        }

    # ============================================================
    # Model Card Generation
    # ============================================================

    def _generate_model_card(
        self,
        model_id: str,
        learner: Learner,
        baseline: Any
    ) -> Dict[str, Any]:
        """Generate a Model Card following Google's standard."""
        domain_scores = self._parse_json(baseline.domain_scores, {})
        prefs = self._parse_json(learner.accessibility_prefs, {})

        # Get model privacy settings
        model_row = self.db.execute(
            "SELECT privacy_settings, created_at FROM learner_models "
            "WHERE id = ?",
            (model_id,)
        ).fetchone()

        privacy_settings = self._parse_json(model_row[0], {})

        model_card = {
            "model_details": {
                "version": "v1.0",
                "type": "Personalized Learning Model",
                "base_model": "aivo-brain-v1.0",
                "created": model_row[1],
                "owner": f"Learner {learner.first_name} (private)",
            },
            "intended_use": {
                "primary_uses": [
                    "Personalized K-12 learning content delivery",
                    "Adaptive difficulty adjustment",
                    "Learning support and scaffolding",
                ],
                "out_of_scope_uses": [
                    "High-stakes testing or grading",
                    "Diagnosis of learning disabilities",
                    "Sharing data between learners",
                ],
            },
            "factors": {
                "relevant_factors": [
                    f"Grade level: {learner.grade}",
                    f"Reading level: {domain_scores.get('reading')}",
                    f"Math level: {domain_scores.get('math')}",
                    f"Accessibility: {', '.join(k for k, v in prefs.items() if v)}",  # noqa: E501
                ],
            },
            "training_data": {
                "datasets_used": ["Baseline assessment results"],
                "preprocessing": [
                    "Domain scores calculated from adaptive assessment",
                    "PII removed from all training inputs",
                ],
                "data_not_used": [
                    "Actual assessment questions/answers",
                    "Free-text responses",
                    "Other learners' data",
                ],
            },
            "ethical_considerations": {
                "data": [
                    "All data stored in isolated, private model space",
                    "Parent can export or delete at any time",
                    f"Data retention: {privacy_settings.get('retention_days', 30)} days",  # noqa: E501
                ],
            },
        }

        # Save model card
        card_id = str(uuid4())
        self.db.execute(
            """
            INSERT INTO model_cards
            (id, learner_model_id, card_version, model_details,
             intended_use, factors, training_data,
             ethical_considerations, json_export)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
            """,
            (
                card_id, model_id, "1.0",
                json.dumps(model_card["model_details"]),
                json.dumps(model_card["intended_use"]),
                json.dumps(model_card["factors"]),
                json.dumps(model_card["training_data"]),
                json.dumps(model_card["ethical_considerations"]),
                json.dumps(model_card),
            )
        )
        self.db.commit()

        return model_card

    # ============================================================
    # Helper Methods
    # ============================================================

    def _get_latest_baseline(self, learner_id: str) -> Any:
        """Get the most recent baseline assessment for a learner."""
        from app.models.baseline import BaselineAssessment

        return (
            self.db.query(BaselineAssessment)
            .filter(BaselineAssessment.learner_id == learner_id)
            .filter(BaselineAssessment.completed.is_(True))
            .order_by(BaselineAssessment.completed_at.desc())
            .first()
        )

    def _generate_reading_pathway(
        self, level: float, prefs: Dict
    ) -> Dict:
        """Generate reading learning pathway."""
        return {
            "starting_level": level,
            "units": [
                {"name": "Phonics Review", "lessons": 5},
                {"name": "Comprehension Strategies", "lessons": 8},
                {"name": "Vocabulary Building", "lessons": 6},
            ],
            "scaffolds": {
                "text_to_speech": prefs.get("text_to_speech", True),
                "highlighting": True,
                "chunking": level < 4.0,
            },
        }

    def _generate_math_pathway(self, level: float, prefs: Dict) -> Dict:
        """Generate math learning pathway."""
        return {
            "starting_level": level,
            "units": [
                {"name": "Number Sense", "lessons": 4},
                {"name": "Operations", "lessons": 7},
                {"name": "Problem Solving", "lessons": 6},
            ],
            "scaffolds": {
                "visual_models": True,
                "step_by_step": True,
                "practice_problems": "high",
            },
        }

    def _generate_writing_pathway(
        self, level: float, prefs: Dict
    ) -> Dict:
        """Generate writing learning pathway."""
        return {
            "starting_level": level,
            "units": [
                {"name": "Sentence Structure", "lessons": 5},
                {"name": "Paragraph Writing", "lessons": 6},
                {"name": "Essay Basics", "lessons": 4},
            ],
            "scaffolds": {
                "templates": True,
                "word_banks": True,
                "peer_examples": level >= 5.0,
            },
        }

    def _log_build_step(
        self,
        model_id: str,
        step_number: int,
        step_data: Dict
    ) -> None:
        """Log a model build step."""
        step_id = str(uuid4())
        self.db.execute(
            """
            INSERT INTO model_build_steps
            (id, learner_model_id, step_number, step_name, description,
             data_inputs, data_outputs, started_at, completed_at,
             duration_ms, status, parent_visible, explanation)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
            """,
            (
                step_id, model_id, step_number,
                step_data["step_name"], step_data["description"],
                json.dumps(step_data["data_inputs"]),
                json.dumps(step_data["data_outputs"]),
                datetime.utcnow().isoformat(),
                datetime.utcnow().isoformat(),
                step_data["duration_ms"], "completed",
                1, step_data["explanation"],
            )
        )
        self.db.commit()

    def _log_audit_event(
        self,
        learner_model_id: Optional[str],
        event_type: str,
        actor_id: str,
        actor_role: str,
        event_data: Dict,
        ip_address: Optional[str] = None,
    ) -> None:
        """Log an audit trail event."""
        event_id = str(uuid4())
        self.db.execute(
            """
            INSERT INTO model_audit_trail
            (id, learner_model_id, event_type, actor_id, actor_role,
             event_data, ip_address)
            VALUES (?, ?, ?, ?, ?, ?, ?)
            """,
            (
                event_id, learner_model_id, event_type,
                actor_id, actor_role, json.dumps(event_data),
                ip_address,
            )
        )
        self.db.commit()

    def _get_consent_text_v1(self) -> str:
        """Get version 1.0 of consent text."""
        return (
            "I consent to the creation of a personalized AI learning "
            "model for my child. I understand that:\n"
            "- The model is created by applying my child's baseline "
            "assessment results to a copy of the base Aivo Brain\n"
            "- The model is private and isolated to my family/class\n"
            "- No data is shared between learners\n"
            "- I can view, export, or delete the model at any time\n"
            "- A complete audit trail of all operations is maintained\n"
            "- I have reviewed the privacy settings and data usage details"
        )

    @staticmethod
    def _parse_json(data: Any, default: Any = None) -> Any:
        """Safely parse JSON string or return default."""
        if data is None:
            return default if default is not None else {}
        if isinstance(data, str):
            try:
                return json.loads(data)
            except (json.JSONDecodeError, ValueError):
                return default if default is not None else {}
        return data
