"""
Baseline Assessment Question Generator
AI-powered dynamic question generation with multi-provider support
Supports OpenAI GPT-4, Anthropic Claude, and Google Gemini with automatic fallback
"""

import hashlib
import json
import os
from datetime import datetime
from typing import Any, Dict, List, Optional

from sqlalchemy import text
from sqlalchemy.orm import Session

from app.services.curriculum_service import CurriculumService
from app.services.multi_provider_ai import MultiProviderAIService

# Initialize multi-provider AI service with fallback support
ai_service = MultiProviderAIService()


class BaselineQuestionGenerator:
    """
    AI agent for generating adaptive baseline assessment questions
    """

    # Curriculum standards mapping
    CURRICULUM_STANDARDS = {
        "K-5": {
            "reading": [
                "CCSS.ELA-LITERACY.RF.K-5.3: Know and apply grade-level phonics",
                "CCSS.ELA-LITERACY.RL.K-5.1: Ask and answer questions about details",
                "CCSS.ELA-LITERACY.RL.K-5.2: Determine central ideas or themes",
            ],
            "math": [
                "CCSS.MATH.CONTENT.K-5.NBT: Number & Operations in Base Ten",
                "CCSS.MATH.CONTENT.K-5.OA: Operations & Algebraic Thinking",
                "CCSS.MATH.CONTENT.K-5.MD: Measurement & Data",
            ],
            "science": [
                "NGSS.K-5-PS: Physical Sciences",
                "NGSS.K-5-LS: Life Sciences",
                "NGSS.K-5-ESS: Earth and Space Sciences",
            ],
        },
        "6-8": {
            "reading": [
                "CCSS.ELA-LITERACY.RL.6-8.2: Determine themes and analyze",
                "CCSS.ELA-LITERACY.RL.6-8.4: Determine meaning of words",
                "CCSS.ELA-LITERACY.RL.6-8.6: Explain author point of view",
            ],
            "math": [
                "CCSS.MATH.CONTENT.6-8.EE: Expressions & Equations",
                "CCSS.MATH.CONTENT.6-8.G: Geometry",
                "CCSS.MATH.CONTENT.6-8.SP: Statistics & Probability",
            ],
            "science": [
                "NGSS.MS-PS: Physical Sciences",
                "NGSS.MS-LS: Life Sciences",
                "NGSS.MS-ESS: Earth and Space Sciences",
            ],
        },
        "9-12": {
            "reading": [
                "CCSS.ELA-LITERACY.RL.9-12.3: Analyze complex characters",
                "CCSS.ELA-LITERACY.RL.9-12.5: Analyze structure of texts",
                "CCSS.ELA-LITERACY.RL.9-12.9: Analyze how texts draw on works",
            ],
            "math": [
                "CCSS.MATH.CONTENT.HSA: High School Algebra",
                "CCSS.MATH.CONTENT.HSF: High School Functions",
                "CCSS.MATH.CONTENT.HSG: High School Geometry",
            ],
            "science": [
                "NGSS.HS-PS: Physical Sciences",
                "NGSS.HS-LS: Life Sciences",
                "NGSS.HS-ESS: Earth and Space Sciences",
            ],
        },
    }

    @staticmethod
    def generate_question(
        db: Session,
        learner_id: str,
        domain: str,
        sub_domain: str,
        grade_band: str,
        target_difficulty: float,
        current_theta: float,
        session_id: str,
        district_curriculum: Optional[Dict] = None,
        accessibility_needs: Optional[Dict] = None,
    ) -> Dict[str, Any]:
        """
        Generate a dynamic question using AI with district curriculum
        integration

        Args:
            db: Database session
            learner_id: Learner identifier
            domain: Subject domain (reading, math, science, etc.)
            sub_domain: Specific sub-domain
            grade_band: K-5, 6-8, or 9-12
            target_difficulty: IRT difficulty parameter (-3 to +3)
            current_theta: Current ability estimate
            session_id: Assessment session ID
            district_curriculum: District-specific curriculum standards
            accessibility_needs: Learner accessibility requirements

        Returns:
            Generated question with IRT parameters
        """

        # Get learner profile
        learner_profile = BaselineQuestionGenerator._get_learner_profile(db, learner_id)

        # Get district curriculum if not provided
        if not district_curriculum:
            curriculum_data = CurriculumService.get_district_curriculum(db, learner_id)
            district_curriculum = curriculum_data.get("standards", {})

        # Get specific standards for this domain/sub-domain
        # Note: district_id not in learners table yet, using default
        district_id = "default-district"

        relevant_standards = CurriculumService.get_standards_for_domain(
            db=db,
            district_id=district_id,
            domain=domain,
            grade_band=grade_band,
            sub_domain=sub_domain,
        )

        # Get questions already asked in this session
        asked_questions = BaselineQuestionGenerator._get_session_questions(db, session_id)

        # Check cache for similar question
        cached_question = BaselineQuestionGenerator._check_question_cache(
            db=db,
            domain=domain,
            sub_domain=sub_domain,
            grade_band=grade_band,
            target_difficulty=target_difficulty,
            asked_questions=asked_questions,
        )

        if cached_question:
            print(f"✓ Using cached question: {cached_question['id']}")
            return cached_question

        # Build prompt for AI agent with curriculum standards
        prompt = BaselineQuestionGenerator._build_generation_prompt(
            learner_profile=learner_profile,
            domain=domain,
            sub_domain=sub_domain,
            grade_band=grade_band,
            target_difficulty=target_difficulty,
            current_theta=current_theta,
            district_curriculum=relevant_standards,
            accessibility_needs=accessibility_needs,
            asked_questions=asked_questions,
        )

        # Generate question using Claude
        generated_question = BaselineQuestionGenerator._call_ai_agent(prompt)

        # Check if it's a mock question - DO NOT cache mock questions
        if "Mock Question" in generated_question.get("stem", ""):
            print("⚠️  Mock question detected - NOT caching to database")
            # Validate but don't cache
            validated_question = BaselineQuestionGenerator._validate_and_calibrate(
                generated_question=generated_question,
                target_difficulty=target_difficulty,
                domain=domain,
                sub_domain=sub_domain,
                grade_band=grade_band,
            )
            return validated_question

        # Validate and estimate IRT parameters
        validated_question = BaselineQuestionGenerator._validate_and_calibrate(
            generated_question=generated_question,
            target_difficulty=target_difficulty,
            domain=domain,
            sub_domain=sub_domain,
            grade_band=grade_band,
        )

        # Cache the question for future use
        item_id = BaselineQuestionGenerator._cache_question(db, validated_question)

        # Map question to curriculum standards
        if "standards_alignment" in generated_question:
            CurriculumService.map_item_to_standards(
                db=db,
                item_id=item_id,
                standard_codes=generated_question["standards_alignment"],
                alignment_strength="primary",
                verified_by="ai-generated",
            )

        return validated_question

    @staticmethod
    def _get_learner_profile(db: Session, learner_id: str) -> Dict[str, Any]:
        """Fetch learner profile with relevant context"""
        try:
            result = db.execute(
                text("""
                    SELECT
                        first_name, last_name, date_of_birth, grade_level,
                        has_iep, diagnoses, accommodations,
                        current_reading_level
                    FROM learners
                    WHERE id = :learner_id
                """),
                {"learner_id": learner_id},
            ).fetchone()

            if not result:
                return {"first_name": "Student", "age": 0, "grade_level": "unknown"}

            # Parse JSON fields
            import json

            diagnoses = json.loads(result[5]) if result[5] else []
            accommodations = json.loads(result[6]) if result[6] else []

            return {
                "first_name": result[0] or "Student",
                "age": BaselineQuestionGenerator._calculate_age(result[2]),
                "grade_level": result[3] or "unknown",
                "has_iep": bool(result[4]),
                "diagnoses": diagnoses,
                "accommodations": accommodations,
                "reading_level": result[7],
            }
        except Exception:
            # Return default profile if learner table doesn't exist
            return {"first_name": "Student", "age": 10, "grade_level": "5"}

    @staticmethod
    def _calculate_age(date_of_birth: str) -> int:
        """Calculate age from date of birth"""
        if not date_of_birth:
            return 0
        try:
            dob = datetime.fromisoformat(date_of_birth.replace("Z", "+00:00"))
            today = datetime.now()
            age = today.year - dob.year
            if (today.month, today.day) < (dob.month, dob.day):
                age -= 1
            return age
        except Exception:
            return 0

    @staticmethod
    def _get_session_questions(db: Session, session_id: str) -> List[str]:
        """Get list of question stems already asked in this session"""
        try:
            results = db.execute(
                text("""
                    SELECT DISTINCT bi.stem
                    FROM baseline_responses br
                    JOIN baseline_items bi ON br.item_id = bi.id
                    WHERE br.session_id = :session_id
                """),
                {"session_id": session_id},
            ).fetchall()

            return [row[0] for row in results]
        except Exception:
            return []

    @staticmethod
    def _check_question_cache(
        db: Session,
        domain: str,
        sub_domain: str,
        grade_band: str,
        target_difficulty: float,
        asked_questions: List[str],
    ) -> Optional[Dict[str, Any]]:
        """
        Check if we have a suitable cached question
        Look for questions within 0.5 difficulty range that haven't been asked
        """
        difficulty_range = 0.5

        # Handle empty asked_questions list
        if not asked_questions:
            asked_questions = [""]

        try:
            # Build dynamic NOT IN clause for asked questions
            if asked_questions:
                placeholders = ",".join([f":asked_{i}" for i in range(len(asked_questions))])
                not_in_clause = f"AND stem NOT IN ({placeholders})"
                params = {
                    "domain": domain,
                    "sub_domain": sub_domain,
                    "grade_band": grade_band,
                    "min_diff": target_difficulty - difficulty_range,
                    "max_diff": target_difficulty + difficulty_range,
                    "target_difficulty": target_difficulty,
                }
                # Add asked questions to params
                for i, q in enumerate(asked_questions):
                    params[f"asked_{i}"] = q
            else:
                not_in_clause = ""
                params = {
                    "domain": domain,
                    "sub_domain": sub_domain,
                    "grade_band": grade_band,
                    "min_diff": target_difficulty - difficulty_range,
                    "max_diff": target_difficulty + difficulty_range,
                    "target_difficulty": target_difficulty,
                }

            query = f"""
                SELECT
                    id, stem, options_json, difficulty, discrimination,
                    guessing, sub_domain, item_type, stimulus,
                    stimulus_type, hint_text, cognitive_level,
                    estimated_time_seconds, read_aloud_enabled,
                    allow_calculator
                FROM baseline_items
                WHERE domain = :domain
                  AND sub_domain = :sub_domain
                  AND grade_band = :grade_band
                  AND difficulty BETWEEN :min_diff AND :max_diff
                  {not_in_clause}
                  AND status = 'active'
                ORDER BY ABS(difficulty - :target_difficulty)
                LIMIT 1
            """

            result = db.execute(text(query), params).fetchone()

            if result:
                options = json.loads(result[2]) if result[2] else []
                return {
                    "id": result[0],
                    "stem": result[1],
                    "options": options,
                    "parameters": {
                        "difficulty": result[3],
                        "discrimination": result[4],
                        "guessing": result[5],
                        "cognitiveLevel": result[11],
                        "estimatedTime": result[12],
                    },
                    "domain": domain,
                    "subDomain": result[6],
                    "type": result[7],
                    "stimulus": result[8],
                    "stimulusType": result[9],
                    "hintText": result[10],
                    "readAloud": bool(result[13]),
                    "allowCalculator": bool(result[14]),
                    "gradeBand": grade_band,
                    "cached": True,
                }

            return None
        except Exception as e:
            print(f"⚠️ Cache check failed: {e}")
            return None

    @staticmethod
    def _build_generation_prompt(
        learner_profile: Dict,
        domain: str,
        sub_domain: str,
        grade_band: str,
        target_difficulty: float,
        current_theta: float,
        district_curriculum: Optional[List[Dict]],
        accessibility_needs: Optional[Dict],
        asked_questions: List[str],
    ) -> str:
        """Build comprehensive prompt for Claude with curriculum standards"""

        # Format district curriculum standards for prompt
        if district_curriculum and isinstance(district_curriculum, list):
            standards_text = "\n".join(
                [
                    f"- {std['code']}: {std['title']}\n  {std['description']}"
                    for std in district_curriculum[:5]
                ]
            )
        else:
            # Fallback to built-in standards if none provided
            standards = BaselineQuestionGenerator.CURRICULUM_STANDARDS.get(grade_band, {}).get(
                domain, []
            )
            standards_text = "\n".join(f"- {std}" for std in standards)

        # Map difficulty to descriptive level
        if target_difficulty < -0.5:
            difficulty_level = "easy"
        elif target_difficulty < 0.5:
            difficulty_level = "medium"
        else:
            difficulty_level = "hard"

        asked_preview = "\n".join(f"- {q[:100]}..." for q in asked_questions[:5])

        prompt = f"""You are an expert educational assessment designer specializing in creating adaptive, neurodiverse-friendly assessment questions.

# LEARNER CONTEXT
- Age: {learner_profile.get("age", "unknown")} years old
- Grade Level: {learner_profile.get("grade_level", "unknown")}
- Grade Band: {grade_band}
- Has IEP: {learner_profile.get("has_iep", False)}
- Learning Preferences: {learner_profile.get("learning_preferences", "Not specified")}
- Reading Level: {learner_profile.get("reading_level", "grade-level")}
- Strengths: {learner_profile.get("strengths", "To be determined")}
- Challenges: {learner_profile.get("challenges", "To be determined")}

# ASSESSMENT REQUIREMENTS
- Domain: {domain.title()}
- Sub-domain: {sub_domain.replace("_", " ").title()}
- Target Difficulty: {difficulty_level} (IRT b={target_difficulty:.2f})
- Current Ability Estimate: θ={current_theta:.2f}

# DISTRICT CURRICULUM STANDARDS
Align your question with these specific standards:

{standards_text}

# ACCESSIBILITY REQUIREMENTS
- Use clear, concise language appropriate for {grade_band}
- Avoid cultural bias or assumptions
- Include visual supports where helpful
- Provide scaffolding for neurodiverse learners
{f"- Specific needs: {json.dumps(accessibility_needs)}" if accessibility_needs else ""}

# QUESTIONS TO AVOID
Do not create questions similar to these already asked:
{asked_preview if asked_questions else "None yet"}

# TASK
Generate ONE high-quality assessment question that:
1. Directly assesses one or more of the standards listed above
2. Is appropriate for the learner's profile and ability level
3. Follows accessibility best practices
4. Uses engaging, authentic contexts

**Question Type**: Choose the most appropriate:
- single_choice (4 options, 1 correct)
- multi_select (4 options, 2-3 correct)
- yes_no (simple binary choice)

**Pedagogical Quality**:
- Tests genuine understanding
- Appropriate difficulty for target theta
- Culturally responsive and inclusive
- Accessible to neurodiverse learners

# IMPORTANT: STIMULUS REQUIREMENTS
- For READING COMPREHENSION: MUST include a story/passage (2-4 sentences) in "stimulus" field
- The "stem" should be the QUESTION about the passage, NOT the passage itself
- Example for reading:
  * stimulus: "The red fox jumped over the fence. It was looking for food."
  * stem: "What was the fox looking for?"
- For MATH word problems: Include the problem scenario in "stimulus" if helpful
- For other questions: Set "stimulus" to null if not needed

# OUTPUT FORMAT
Return ONLY valid JSON (no markdown, no extra text):

{{
  "stem": "The question itself - what you're asking the student",
  "stimulus": "The reading passage, math problem, or null",
  "stimulus_type": "text",
  "item_type": "single_choice",
  "sub_domain": "{sub_domain}",
  "options": [
    {{"id": "a", "label": "Option text", "correct": true, "rationale": "Why this is correct"}},
    {{"id": "b", "label": "Option text", "correct": false, "rationale": "Why this is wrong"}},
    {{"id": "c", "label": "Option text", "correct": false, "rationale": "Why this is wrong"}},
    {{"id": "d", "label": "Option text", "correct": false, "rationale": "Why this is wrong"}}
  ],
  "correct_answer_explanation": "Why this answer is correct",
  "hint_text": "Helpful guidance without revealing answer",
  "estimated_difficulty": {target_difficulty:.2f},
  "estimated_discrimination": 1.5,
  "estimated_guessing": 0.25,
  "cognitive_level": "understand",
  "estimated_time_seconds": 45,
  "standards_alignment": ["STANDARD.CODE.1", "STANDARD.CODE.2"],
  "accessibility_features": {{
    "reading_level": "Grade X",
    "visual_supports": false,
    "scaffolding_included": true
  }},
  "neurodiverse_friendly": true
}}

Generate the question now:"""

        return prompt

    @staticmethod
    def _call_ai_agent(prompt: str) -> Dict[str, Any]:
        """
        Call AI provider to generate question
        Uses multi-provider service with automatic fallback
        """
        try:
            # Generate question using multi-provider service
            question_data, metadata = ai_service.generate_question(
                prompt=prompt, temperature=0.7, max_tokens=2000
            )

            # Log provider info
            print(
                f"✓ Question generated using {metadata['provider_used']} "
                f"({metadata['model_used']}) in {metadata['latency_ms']:.0f}ms"
            )

            if metadata.get("fallback_occurred"):
                print(
                    f"⚠️  Fallback occurred. Chain: {' → '.join(metadata.get('fallback_chain', []))}"
                )

            return question_data

        except Exception as e:
            print(f"❌ AI generation error: {e}")
            raise

    @staticmethod
    def _validate_and_calibrate(
        generated_question: Dict[str, Any],
        target_difficulty: float,
        domain: str,
        sub_domain: str,
        grade_band: str,
    ) -> Dict[str, Any]:
        """
        Validate generated question and adjust IRT parameters
        """

        # Ensure required fields
        required_fields = [
            "stem",
            "item_type",
            "estimated_difficulty",
            "estimated_discrimination",
        ]
        for field in required_fields:
            if field not in generated_question:
                raise ValueError(f"Missing required field: {field}")

        # Validate IRT parameters
        difficulty = generated_question["estimated_difficulty"]
        discrimination = generated_question["estimated_discrimination"]
        guessing = generated_question.get("estimated_guessing", 0.25)

        # Clamp values to valid ranges
        difficulty = max(-4.0, min(4.0, difficulty))
        discrimination = max(0.5, min(2.5, discrimination))
        guessing = max(0.0, min(0.5, guessing))

        # Adjust difficulty toward target
        adjusted_difficulty = 0.7 * difficulty + 0.3 * target_difficulty

        # Create validated question object
        stem_hash = hashlib.md5(generated_question["stem"].encode()).hexdigest()[:12]
        validated = {
            "id": f"ai-gen-{domain}-{grade_band}-{stem_hash}",
            "stem": generated_question["stem"],
            "stimulus": generated_question.get("stimulus"),
            "stimulusType": generated_question.get("stimulus_type"),
            "type": generated_question["item_type"],
            "options": generated_question.get("options", []),
            "correctAnswerExplanation": generated_question.get("correct_answer_explanation"),
            "hintText": generated_question.get("hint_text"),
            "parameters": {
                "difficulty": round(adjusted_difficulty, 2),
                "discrimination": round(discrimination, 2),
                "guessing": round(guessing, 2),
                "estimatedTime": generated_question.get("estimated_time_seconds", 45),
                "cognitiveLevel": generated_question.get("cognitive_level", "understand"),
            },
            "domain": domain,
            "subDomain": sub_domain,
            "gradeBand": grade_band,
            "readAloud": True,
            "allowCalculator": False,
            "generatedAt": datetime.utcnow().isoformat(),
            "cached": False,
        }

        return validated

    @staticmethod
    def _cache_question(db: Session, question: Dict[str, Any]):
        """
        Cache generated question in database for future use
        """

        try:
            options_json = json.dumps(question.get("options", []))

            # Format correct answer for correct_answer_json column
            correct_options = [
                opt["id"] for opt in question.get("options", []) if opt.get("correct")
            ]
            correct_answer_json = json.dumps({"correct_options": correct_options})

            db.execute(
                text("""
                    INSERT INTO baseline_items (
                        id, item_type, domain, sub_domain, grade_band,
                        stem, stimulus, stimulus_type, options_json,
                        correct_answer_json,
                        difficulty, discrimination, guessing,
                        cognitive_level, estimated_time_seconds,
                        hint_text,
                        read_aloud_enabled, allow_calculator,
                        status, created_at
                    ) VALUES (
                        :id, :item_type, :domain, :sub_domain, :grade_band,
                        :stem, :stimulus, :stimulus_type, :options_json,
                        :correct_answer_json,
                        :difficulty, :discrimination, :guessing,
                        :cognitive_level, :estimated_time,
                        :hint_text,
                        1, 0,
                        'active', CURRENT_TIMESTAMP
                    )
                """),
                {
                    "id": question["id"],
                    "item_type": question["type"],
                    "domain": question["domain"],
                    "sub_domain": question["subDomain"],
                    "grade_band": question["gradeBand"],
                    "stem": question["stem"],
                    "stimulus": question.get("stimulus"),
                    "stimulus_type": question.get("stimulusType"),
                    "options_json": options_json,
                    "correct_answer_json": correct_answer_json,
                    "difficulty": question["parameters"]["difficulty"],
                    "discrimination": question["parameters"]["discrimination"],
                    "guessing": question["parameters"]["guessing"],
                    "cognitive_level": question["parameters"]["cognitiveLevel"],
                    "estimated_time": question["parameters"]["estimatedTime"],
                    "hint_text": question.get("hintText"),
                },
            )

            db.commit()
            print(f"✓ Cached generated question: {question['id']}")

            return question["id"]

        except Exception as e:
            db.rollback()
            print(f"⚠️ Failed to cache question: {e}")
            # Non-fatal error, question can still be used
            return question["id"]
