"""
Question Quality Validator
Validates AI-generated questions for pedagogical soundness, bias, and clarity
"""

import json
import re
from datetime import datetime
from typing import Any, Dict, List, Optional, Tuple

from sqlalchemy import text
from sqlalchemy.orm import Session


class QuestionQualityValidator:
    """
    Validates AI-generated questions before use in assessments
    """

    # Quality thresholds
    MIN_STEM_LENGTH = 10
    MAX_STEM_LENGTH = 300
    MIN_OPTIONS = 2
    MAX_OPTIONS = 6
    MIN_OPTION_LENGTH = 2
    MAX_OPTION_LENGTH = 150

    # Bias keywords to flag for review
    BIAS_KEYWORDS = [
        "obviously",
        "clearly",
        "simply",
        "just",
        "merely",
        "always",
        "never",
        "all",
        "none",
        "everyone",
        "no one",
        "rich",
        "poor",
        "expensive",
        "cheap",
    ]

    # Cultural sensitivity flags
    CULTURAL_FLAGS = [
        "christmas",
        "easter",
        "halloween",
        "thanksgiving",
        "mother",
        "father",
        "mom",
        "dad",
        "parents",
    ]

    @staticmethod
    def validate_question(
        question: Dict[str, Any], strict_mode: bool = False
    ) -> Tuple[bool, List[str], Dict[str, Any]]:
        """
        Comprehensive question validation

        Args:
            question: Generated question dict
            strict_mode: If True, fail on warnings. If False, only fail on errors

        Returns:
            (is_valid, issues_list, quality_metrics)
        """
        issues = []
        warnings = []
        quality_metrics = {
            "overallScore": 0,
            "clarityScore": 0,
            "biasScore": 0,
            "pedagogicalScore": 0,
            "accessibilityScore": 0,
            "validationTimestamp": datetime.utcnow().isoformat(),
        }

        # 1. Structure validation
        structure_valid, structure_issues = QuestionQualityValidator._validate_structure(question)
        issues.extend(structure_issues)

        if not structure_valid:
            return False, issues, quality_metrics

        # 2. Content clarity
        clarity_score, clarity_issues = QuestionQualityValidator._validate_clarity(question)
        quality_metrics["clarityScore"] = clarity_score
        issues.extend([f"Clarity: {issue}" for issue in clarity_issues if "ERROR" in issue])
        warnings.extend([f"Clarity: {issue}" for issue in clarity_issues if "WARNING" in issue])

        # 3. Bias detection
        bias_score, bias_issues = QuestionQualityValidator._detect_bias(question)
        quality_metrics["biasScore"] = bias_score
        issues.extend([f"Bias: {issue}" for issue in bias_issues if "ERROR" in issue])
        warnings.extend([f"Bias: {issue}" for issue in bias_issues if "WARNING" in issue])

        # 4. Pedagogical quality
        pedagogy_score, pedagogy_issues = QuestionQualityValidator._validate_pedagogy(question)
        quality_metrics["pedagogicalScore"] = pedagogy_score
        issues.extend([f"Pedagogy: {issue}" for issue in pedagogy_issues if "ERROR" in issue])
        warnings.extend([f"Pedagogy: {issue}" for issue in pedagogy_issues if "WARNING" in issue])

        # 5. Accessibility
        accessibility_score, accessibility_issues = (
            QuestionQualityValidator._validate_accessibility(question)
        )
        quality_metrics["accessibilityScore"] = accessibility_score
        issues.extend(
            [f"Accessibility: {issue}" for issue in accessibility_issues if "ERROR" in issue]
        )
        warnings.extend(
            [f"Accessibility: {issue}" for issue in accessibility_issues if "WARNING" in issue]
        )

        # Calculate overall score (weighted average)
        quality_metrics["overallScore"] = round(
            (
                clarity_score * 0.3
                + bias_score * 0.2
                + pedagogy_score * 0.3
                + accessibility_score * 0.2
            ),
            2,
        )

        # Determine if valid
        is_valid = len(issues) == 0 and (not strict_mode or len(warnings) == 0)
        all_issues = issues + (warnings if strict_mode else [])

        return is_valid, all_issues, quality_metrics

    @staticmethod
    def _validate_structure(question: Dict[str, Any]) -> Tuple[bool, List[str]]:
        """Validate basic question structure"""
        issues = []

        # Required fields
        required_fields = [
            "stem",
            "item_type",
            "estimated_difficulty",
            "estimated_discrimination",
        ]
        for field in required_fields:
            if field not in question:
                issues.append(f"ERROR: Missing required field: {field}")

        if issues:
            return False, issues

        # Stem validation
        stem = question["stem"]
        if len(stem) < QuestionQualityValidator.MIN_STEM_LENGTH:
            issues.append(
                f"ERROR: Stem too short ({len(stem)} chars, "
                f"min {QuestionQualityValidator.MIN_STEM_LENGTH})"
            )
        if len(stem) > QuestionQualityValidator.MAX_STEM_LENGTH:
            issues.append(
                f"ERROR: Stem too long ({len(stem)} chars, "
                f"max {QuestionQualityValidator.MAX_STEM_LENGTH})"
            )

        # Options validation (for MC questions)
        if question["item_type"] in ["single_choice", "multi_select", "yes_no"]:
            if "options" not in question or not question["options"]:
                issues.append("ERROR: Multiple choice question missing options")
            else:
                options = question["options"]
                if len(options) < QuestionQualityValidator.MIN_OPTIONS:
                    issues.append(
                        f"ERROR: Too few options ({len(options)}, "
                        f"min {QuestionQualityValidator.MIN_OPTIONS})"
                    )
                if len(options) > QuestionQualityValidator.MAX_OPTIONS:
                    issues.append(
                        f"ERROR: Too many options ({len(options)}, "
                        f"max {QuestionQualityValidator.MAX_OPTIONS})"
                    )

                # Check for correct answer
                correct_count = sum(1 for opt in options if opt.get("correct", False))
                if question["item_type"] == "single_choice" and correct_count != 1:
                    issues.append(
                        f"ERROR: Single choice must have exactly 1 correct answer "
                        f"(found {correct_count})"
                    )
                if question["item_type"] == "multi_select" and correct_count < 2:
                    issues.append(
                        f"ERROR: Multi-select must have at least 2 correct answers "
                        f"(found {correct_count})"
                    )
                if correct_count == 0:
                    issues.append("ERROR: No correct answer marked")

        # IRT parameters validation
        difficulty = question.get("estimated_difficulty", 0)
        discrimination = question.get("estimated_discrimination", 1)
        guessing = question.get("estimated_guessing", 0.25)

        if difficulty < -4 or difficulty > 4:
            issues.append(f"ERROR: Difficulty out of range: {difficulty} (must be -4 to 4)")
        if discrimination < 0.5 or discrimination > 3:
            issues.append(
                f"ERROR: Discrimination out of range: {discrimination} (must be 0.5 to 3)"
            )
        if guessing < 0 or guessing > 0.5:
            issues.append(f"ERROR: Guessing parameter out of range: {guessing} (must be 0 to 0.5)")

        return len(issues) == 0, issues

    @staticmethod
    def _validate_clarity(question: Dict[str, Any]) -> Tuple[float, List[str]]:
        """Validate question clarity and readability"""
        issues = []
        score = 100.0

        stem = question["stem"]

        # Check for question mark
        if "?" not in stem and not stem.endswith(":"):
            issues.append("WARNING: Stem should end with '?' or ':'")
            score -= 10

        # Check for double negatives
        if re.search(r"\b(not|no|never|neither)\b.*\b(not|no|never|neither)\b", stem.lower()):
            issues.append("WARNING: Possible double negative detected")
            score -= 15

        # Check for excessive length
        words = stem.split()
        if len(words) > 50:
            issues.append(f"WARNING: Stem is quite long ({len(words)} words)")
            score -= 10

        # Check for complex vocabulary (for K-5)
        grade_band = question.get("grade_band", "K-5")
        if grade_band == "K-5":
            complex_words = [
                "subsequently",
                "furthermore",
                "nevertheless",
                "consequently",
                "moreover",
                "therefore",
                "however",
                "although",
            ]
            found_complex = [w for w in complex_words if w in stem.lower()]
            if found_complex:
                issues.append(f"WARNING: Complex vocabulary for K-5: {', '.join(found_complex)}")
                score -= 15

        # Check options clarity
        if "options" in question:
            for i, opt in enumerate(question["options"]):
                label = opt.get("label", "")
                if len(label) < QuestionQualityValidator.MIN_OPTION_LENGTH:
                    issues.append(f"WARNING: Option {i + 1} very short")
                    score -= 5
                if len(label) > QuestionQualityValidator.MAX_OPTION_LENGTH:
                    issues.append(f"WARNING: Option {i + 1} very long")
                    score -= 5

        return max(0, score), issues

    @staticmethod
    def _detect_bias(question: Dict[str, Any]) -> Tuple[float, List[str]]:
        """Detect potential bias in question content"""
        issues = []
        score = 100.0

        stem = question["stem"]
        full_text = stem

        # Include stimulus and options in bias check
        if question.get("stimulus"):
            full_text += " " + question["stimulus"]
        if "options" in question:
            full_text += " " + " ".join([opt.get("label", "") for opt in question["options"]])

        full_text_lower = full_text.lower()

        # Check for bias keywords
        found_bias = [
            word for word in QuestionQualityValidator.BIAS_KEYWORDS if word in full_text_lower
        ]
        if found_bias:
            issues.append(f"WARNING: Potentially biased language: {', '.join(found_bias)}")
            score -= 15 * len(found_bias)

        # Check for cultural assumptions
        found_cultural = [
            word for word in QuestionQualityValidator.CULTURAL_FLAGS if word in full_text_lower
        ]
        if found_cultural:
            issues.append(
                f"WARNING: Cultural assumptions may limit accessibility: "
                f"{', '.join(found_cultural)}"
            )
            score -= 10 * len(found_cultural)

        # Check for gender bias
        gender_terms = ["he", "she", "his", "her", "him"]
        gender_count = sum(1 for term in gender_terms if f" {term} " in f" {full_text_lower} ")
        if gender_count > 2:
            issues.append("WARNING: Consider using gender-neutral language")
            score -= 10

        # Check for economic assumptions
        economic_terms = [
            "buy",
            "purchase",
            "afford",
            "expensive",
            "vacation",
            "restaurant",
        ]
        found_economic = [term for term in economic_terms if term in full_text_lower]
        if found_economic:
            issues.append(f"WARNING: Economic assumptions: {', '.join(found_economic)}")
            score -= 10

        # Check for stereotype risk
        stereotype_patterns = [
            (
                r"\b(boys|males)\b.*\b(strong|sports|math|science)\b",
                "Gender stereotype (boys/strength/STEM)",
            ),
            (
                r"\b(girls|females)\b.*\b(pretty|caring|reading|writing)\b",
                "Gender stereotype (girls/caring/language)",
            ),
        ]
        for pattern, desc in stereotype_patterns:
            if re.search(pattern, full_text_lower):
                issues.append(f"ERROR: Potential stereotype: {desc}")
                score -= 25

        return max(0, score), issues

    @staticmethod
    def _validate_pedagogy(question: Dict[str, Any]) -> Tuple[float, List[str]]:
        """Validate pedagogical quality"""
        issues = []
        score = 100.0

        # Check for cognitive level alignment
        cognitive_level = question.get("cognitive_level", "understand")
        valid_levels = [
            "remember",
            "understand",
            "apply",
            "analyze",
            "evaluate",
            "create",
        ]
        if cognitive_level not in valid_levels:
            issues.append(f"WARNING: Invalid cognitive level: {cognitive_level}")
            score -= 15

        # Check if question tests understanding vs. recall
        stem = question["stem"].lower()
        recall_verbs = ["what is", "who is", "when did", "where is", "define"]
        is_recall = any(verb in stem for verb in recall_verbs)

        if is_recall and cognitive_level in ["apply", "analyze", "evaluate", "create"]:
            issues.append("WARNING: Cognitive level mismatch - question appears to test recall")
            score -= 20

        # Check for standards alignment
        if "standards_alignment" not in question or not question["standards_alignment"]:
            issues.append("WARNING: No standards alignment specified")
            score -= 15

        # Check for distractors quality (MC questions)
        if "options" in question and question["item_type"] == "single_choice":
            options = question["options"]
            correct_opt = next((opt for opt in options if opt.get("correct")), None)
            incorrect_opts = [opt for opt in options if not opt.get("correct")]

            if correct_opt and incorrect_opts:
                # Check if distractors are plausible
                correct_len = len(correct_opt.get("label", ""))
                for opt in incorrect_opts:
                    opt_len = len(opt.get("label", ""))
                    # If one option is much longer/shorter, it's a giveaway
                    if abs(opt_len - correct_len) > correct_len * 0.5:
                        issues.append("WARNING: Option length varies significantly (giveaway)")
                        score -= 10
                        break

                # Check for "all of the above" or "none of the above"
                all_labels = [opt.get("label", "").lower() for opt in options]
                if any(
                    "all of the above" in label or "none of the above" in label
                    for label in all_labels
                ):
                    issues.append(
                        "WARNING: 'All/None of the above' options are generally discouraged"
                    )
                    score -= 10

        # Check for hint quality
        if "hint_text" not in question or not question["hint_text"]:
            issues.append("WARNING: No hint provided (recommended for neurodiverse learners)")
            score -= 10
        elif question.get("hint_text"):
            hint = question["hint_text"].lower()
            # Check if hint gives away answer
            if "options" in question:
                for opt in question["options"]:
                    if opt.get("correct") and opt.get("label", "").lower() in hint:
                        issues.append("ERROR: Hint reveals the correct answer")
                        score -= 30
                        break

        return max(0, score), issues

    @staticmethod
    def _validate_accessibility(question: Dict[str, Any]) -> Tuple[float, List[str]]:
        """Validate accessibility features"""
        issues = []
        score = 100.0

        # Check for accessibility features
        if "accessibility_features" not in question:
            issues.append("WARNING: No accessibility features specified")
            score -= 20
        else:
            features = question["accessibility_features"]
            if not features.get("reading_level"):
                issues.append("WARNING: Reading level not specified")
                score -= 10

        # Check for neurodiverse-friendly flag
        if not question.get("neurodiverse_friendly", False):
            issues.append("WARNING: Not marked as neurodiverse-friendly")
            score -= 15

        # Check stem readability
        stem = question["stem"]
        sentences = stem.split(".")
        if len(sentences) > 3:
            issues.append("WARNING: Multiple sentences in stem may be confusing")
            score -= 10

        # Check for visual support suggestions
        grade_band = question.get("grade_band", "K-5")
        if grade_band == "K-5":
            has_visual = question.get("stimulus_type") == "image" or (
                question.get("accessibility_features", {}).get("visual_supports", False)
            )
            if not has_visual:
                issues.append("WARNING: K-5 question should include visual supports")
                score -= 15

        return max(0, score), issues


class QuestionReviewWorkflow:
    """
    Manages expert educator review workflow
    """

    @staticmethod
    def submit_for_review(
        db: Session,
        item_id: str,
        review_priority: str = "normal",
        automated_validation_results: Optional[Dict] = None,
    ) -> str:
        """
        Submit AI-generated question for expert review

        Args:
            item_id: Question ID
            review_priority: 'low', 'normal', 'high', 'urgent'
            automated_validation_results: Results from automated validation

        Returns:
            Review request ID
        """
        review_id = f"review-{datetime.utcnow().strftime('%Y%m%d%H%M%S')}-{item_id[:8]}"

        db.execute(
            text("""
                INSERT INTO question_review_queue (
                    id, item_id, status, priority,
                    submitted_at, automated_validation_json
                ) VALUES (
                    :id, :item_id, 'pending', :priority,
                    CURRENT_TIMESTAMP, :validation_json
                )
            """),
            {
                "id": review_id,
                "item_id": item_id,
                "priority": review_priority,
                "validation_json": (
                    json.dumps(automated_validation_results)
                    if automated_validation_results
                    else None
                ),
            },
        )

        db.commit()

        return review_id

    @staticmethod
    def assign_reviewer(db: Session, review_id: str, reviewer_id: str):
        """Assign expert educator to review"""
        db.execute(
            text("""
                UPDATE question_review_queue
                SET status = 'in_review',
                    reviewer_id = :reviewer_id,
                    review_started_at = CURRENT_TIMESTAMP
                WHERE id = :review_id
            """),
            {"review_id": review_id, "reviewer_id": reviewer_id},
        )
        db.commit()

    @staticmethod
    def submit_review(
        db: Session,
        review_id: str,
        reviewer_id: str,
        approved: bool,
        feedback: str,
        quality_ratings: Dict[str, int],
        suggested_revisions: Optional[Dict] = None,
    ):
        """
        Submit expert review

        Args:
            review_id: Review request ID
            reviewer_id: Reviewer identifier
            approved: True if question is approved for use
            feedback: Reviewer comments
            quality_ratings: Dict with ratings for clarity, pedagogy, bias, etc.
            suggested_revisions: Suggested changes to the question
        """
        status = "approved" if approved else "needs_revision"

        db.execute(
            text("""
                UPDATE question_review_queue
                SET status = :status,
                    review_completed_at = CURRENT_TIMESTAMP,
                    approved = :approved,
                    reviewer_feedback = :feedback,
                    quality_ratings_json = :ratings_json,
                    suggested_revisions_json = :revisions_json
                WHERE id = :review_id AND reviewer_id = :reviewer_id
            """),
            {
                "review_id": review_id,
                "reviewer_id": reviewer_id,
                "status": status,
                "approved": 1 if approved else 0,
                "feedback": feedback,
                "ratings_json": json.dumps(quality_ratings),
                "revisions_json": (
                    json.dumps(suggested_revisions) if suggested_revisions else None
                ),
            },
        )

        # Update item status
        item_id = db.execute(
            text("SELECT item_id FROM question_review_queue WHERE id = :id"),
            {"id": review_id},
        ).fetchone()[0]

        new_status = "active" if approved else "needs_revision"

        db.execute(
            text("""
                UPDATE baseline_items
                SET status = :status,
                    updated_at = CURRENT_TIMESTAMP
                WHERE id = :item_id
            """),
            {"item_id": item_id, "status": new_status},
        )

        db.commit()

    @staticmethod
    def get_pending_reviews(
        db: Session,
        domain: Optional[str] = None,
        priority: Optional[str] = None,
        limit: int = 20,
    ) -> List[Dict[str, Any]]:
        """Get questions pending expert review"""
        query = """
            SELECT
                qrq.id, qrq.item_id, qrq.priority, qrq.submitted_at,
                qrq.automated_validation_json,
                bi.domain, bi.grade_band, bi.stem
            FROM question_review_queue qrq
            JOIN baseline_items bi ON qrq.item_id = bi.id
            WHERE qrq.status = 'pending'
        """

        params = {}

        if domain:
            query += " AND bi.domain = :domain"
            params["domain"] = domain

        if priority:
            query += " AND qrq.priority = :priority"
            params["priority"] = priority

        query += " ORDER BY qrq.priority DESC, qrq.submitted_at ASC LIMIT :limit"
        params["limit"] = limit

        results = db.execute(text(query), params).fetchall()

        reviews = []
        for row in results:
            reviews.append(
                {
                    "reviewId": row[0],
                    "itemId": row[1],
                    "priority": row[2],
                    "submittedAt": row[3],
                    "automatedValidation": json.loads(row[4]) if row[4] else None,
                    "domain": row[5],
                    "gradeBand": row[6],
                    "stem": row[7],
                }
            )

        return reviews
