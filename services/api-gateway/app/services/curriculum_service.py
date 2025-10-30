"""
Curriculum Service
Manages district curriculum standards and learning objectives
"""

import json
from datetime import datetime
from typing import Any, Dict, List, Optional

from sqlalchemy import text
from sqlalchemy.orm import Session


class CurriculumService:
    """Service for curriculum management and standard tracking"""

    @staticmethod
    def get_district_curriculum(db: Session, learner_id: str) -> Dict[str, Any]:
        """
        Get curriculum standards for learner's district

        Returns:
            Dictionary with standards organized by domain and grade band
        """
        # Get learner's grade level (district_id not in schema yet)
        learner = db.execute(
            text("""
                SELECT grade_level
                FROM learners
                WHERE id = :learner_id
            """),
            {"learner_id": learner_id},
        ).fetchone()

        if not learner:
            # Use default
            district_id = "default-district"
            grade_level = 5
        else:
            district_id = "default-district"  # Will use when added
            grade_level = learner[0] or 5

        # Determine grade band
        if grade_level <= 5:
            grade_band = "K-5"
        elif grade_level <= 8:
            grade_band = "6-8"
        else:
            grade_band = "9-12"

        # Get standards for this district and grade band
        standards = db.execute(
            text("""
                SELECT 
                    id, standard_code, standard_framework, domain, sub_domain,
                    title, description, learning_objectives_json, cognitive_level,
                    priority
                FROM curriculum_standards
                WHERE district_id = :district_id
                  AND grade_band = :grade_band
                  AND active = 1
                ORDER BY domain, priority DESC, sub_domain
            """),
            {"district_id": district_id, "grade_band": grade_band},
        ).fetchall()

        # Organize by domain
        curriculum = {}
        for standard in standards:
            domain = standard[3]
            if domain not in curriculum:
                curriculum[domain] = []

            curriculum[domain].append(
                {
                    "id": standard[0],
                    "code": standard[1],
                    "framework": standard[2],
                    "subDomain": standard[4],
                    "title": standard[5],
                    "description": standard[6],
                    "learningObjectives": json.loads(standard[7]) if standard[7] else [],
                    "cognitiveLevel": standard[8],
                    "priority": standard[9],
                }
            )

        return {"districtId": district_id, "gradeBand": grade_band, "standards": curriculum}

    @staticmethod
    def get_standards_for_domain(
        db: Session,
        district_id: str,
        domain: str,
        grade_band: str,
        sub_domain: Optional[str] = None,
    ) -> List[Dict[str, Any]]:
        """Get specific standards for a domain/sub-domain"""

        query = """
            SELECT 
                id, standard_code, title, description, 
                learning_objectives_json, cognitive_level, priority
            FROM curriculum_standards
            WHERE district_id = :district_id
              AND domain = :domain
              AND grade_band = :grade_band
              AND active = 1
        """

        params = {"district_id": district_id, "domain": domain, "grade_band": grade_band}

        if sub_domain:
            query += " AND sub_domain = :sub_domain"
            params["sub_domain"] = sub_domain

        query += " ORDER BY priority DESC"

        results = db.execute(text(query), params).fetchall()

        standards = []
        for row in results:
            standards.append(
                {
                    "id": row[0],
                    "code": row[1],
                    "title": row[2],
                    "description": row[3],
                    "learningObjectives": json.loads(row[4]) if row[4] else [],
                    "cognitiveLevel": row[5],
                    "priority": row[6],
                }
            )

        return standards

    @staticmethod
    def track_standard_coverage(
        db: Session,
        learner_id: str,
        item_id: str,
        correct: bool,
        theta_estimate: float,
        standard_error: float,
    ):
        """
        Track which standards were assessed and update coverage
        """
        # Get standards aligned to this item
        item_standards = db.execute(
            text("""
                SELECT standard_id, alignment_strength
                FROM baseline_item_standards
                WHERE item_id = :item_id
            """),
            {"item_id": item_id},
        ).fetchall()

        for standard_id, alignment_strength in item_standards:
            # Only count primary alignments for accuracy
            weight = 1.0 if alignment_strength == "primary" else 0.5

            # Update or insert coverage record
            existing = db.execute(
                text("""
                    SELECT id, total_items_attempted, total_items_correct
                    FROM learner_standard_coverage
                    WHERE learner_id = :learner_id AND standard_id = :standard_id
                """),
                {"learner_id": learner_id, "standard_id": standard_id},
            ).fetchone()

            if existing:
                # Update existing record
                coverage_id = existing[0]
                attempted = existing[1] + weight
                correct_count = existing[2] + (weight if correct else 0)
                accuracy = (correct_count / attempted) * 100

                # Determine mastery status
                mastery_status = CurriculumService._determine_mastery(accuracy, attempted)

                db.execute(
                    text("""
                        UPDATE learner_standard_coverage
                        SET times_assessed = times_assessed + 1,
                            last_assessed_at = CURRENT_TIMESTAMP,
                            total_items_attempted = :attempted,
                            total_items_correct = :correct_count,
                            accuracy_rate = :accuracy,
                            theta_estimate = :theta,
                            standard_error = :se,
                            mastery_status = :mastery,
                            mastery_achieved_at = CASE 
                                WHEN :mastery = 'proficient' AND mastery_status != 'proficient' 
                                THEN CURRENT_TIMESTAMP 
                                ELSE mastery_achieved_at 
                            END,
                            updated_at = CURRENT_TIMESTAMP
                        WHERE id = :coverage_id
                    """),
                    {
                        "coverage_id": coverage_id,
                        "attempted": attempted,
                        "correct_count": correct_count,
                        "accuracy": accuracy,
                        "theta": theta_estimate,
                        "se": standard_error,
                        "mastery": mastery_status,
                    },
                )
            else:
                # Insert new record
                accuracy = 100.0 if correct else 0.0
                mastery_status = CurriculumService._determine_mastery(accuracy, weight)

                db.execute(
                    text("""
                        INSERT INTO learner_standard_coverage (
                            learner_id, standard_id, times_assessed,
                            first_assessed_at, last_assessed_at,
                            total_items_attempted, total_items_correct, accuracy_rate,
                            theta_estimate, standard_error, mastery_status
                        ) VALUES (
                            :learner_id, :standard_id, 1,
                            CURRENT_TIMESTAMP, CURRENT_TIMESTAMP,
                            :attempted, :correct_count, :accuracy,
                            :theta, :se, :mastery
                        )
                    """),
                    {
                        "learner_id": learner_id,
                        "standard_id": standard_id,
                        "attempted": weight,
                        "correct_count": weight if correct else 0,
                        "accuracy": accuracy,
                        "theta": theta_estimate,
                        "se": standard_error,
                        "mastery": mastery_status,
                    },
                )

        db.commit()

    @staticmethod
    def _determine_mastery(accuracy: float, attempts: float) -> str:
        """Determine mastery level based on accuracy and attempts"""
        if attempts < 2:
            return "emerging"
        elif accuracy >= 85:
            return "proficient"
        elif accuracy >= 70:
            return "developing"
        else:
            return "emerging"

    @staticmethod
    def get_learner_progress_report(
        db: Session, learner_id: str, domain: Optional[str] = None
    ) -> Dict[str, Any]:
        """
        Generate comprehensive progress report showing standard coverage
        """
        query = """
            SELECT 
                cs.domain, cs.sub_domain, cs.standard_code, cs.title,
                lsc.mastery_status, lsc.accuracy_rate, lsc.times_assessed,
                lsc.last_assessed_at, lsc.theta_estimate
            FROM curriculum_standards cs
            LEFT JOIN learner_standard_coverage lsc 
                ON cs.id = lsc.standard_id AND lsc.learner_id = :learner_id
            WHERE cs.district_id IN (
                SELECT district_id FROM learners WHERE id = :learner_id
                UNION SELECT 'default-district'
            )
        """

        params = {"learner_id": learner_id}

        if domain:
            query += " AND cs.domain = :domain"
            params["domain"] = domain

        query += " ORDER BY cs.domain, cs.sub_domain, cs.priority DESC"

        results = db.execute(text(query), params).fetchall()

        # Organize results
        report = {
            "learnerId": learner_id,
            "generatedAt": datetime.utcnow().isoformat() + "Z",
            "domains": {},
        }

        for row in results:
            dom = row[0]
            if dom not in report["domains"]:
                report["domains"][dom] = {
                    "standards": [],
                    "overallMastery": 0,
                    "assessedCount": 0,
                    "totalStandards": 0,
                }

            standard_data = {
                "subDomain": row[1],
                "code": row[2],
                "title": row[3],
                "masteryStatus": row[4] or "not_assessed",
                "accuracy": row[5],
                "timesAssessed": row[6] or 0,
                "lastAssessed": row[7],
                "thetaEstimate": row[8],
            }

            report["domains"][dom]["standards"].append(standard_data)
            report["domains"][dom]["totalStandards"] += 1

            if row[4]:  # If assessed
                report["domains"][dom]["assessedCount"] += 1
                if row[4] in ["proficient", "advanced"]:
                    report["domains"][dom]["overallMastery"] += 1

        # Calculate percentages
        for dom in report["domains"]:
            total = report["domains"][dom]["totalStandards"]
            if total > 0:
                assessed_pct = (report["domains"][dom]["assessedCount"] / total) * 100
                mastery_pct = (report["domains"][dom]["overallMastery"] / total) * 100
                report["domains"][dom]["coveragePercentage"] = round(assessed_pct, 1)
                report["domains"][dom]["masteryPercentage"] = round(mastery_pct, 1)

        return report

    @staticmethod
    def map_item_to_standards(
        db: Session,
        item_id: str,
        standard_codes: List[str],
        alignment_strength: str = "primary",
        verified_by: Optional[str] = None,
    ):
        """
        Map a generated item to curriculum standards
        """
        for code in standard_codes:
            # Find standard by code
            standard = db.execute(
                text("""
                    SELECT id FROM curriculum_standards
                    WHERE standard_code = :code
                    LIMIT 1
                """),
                {"code": code},
            ).fetchone()

            if standard:
                standard_id = standard[0]

                # Insert mapping
                db.execute(
                    text("""
                        INSERT OR IGNORE INTO baseline_item_standards (
                            item_id, standard_id, alignment_strength, verified_by, verified_at
                        ) VALUES (
                            :item_id, :standard_id, :alignment_strength, :verified_by,
                            CASE WHEN :verified_by IS NOT NULL THEN CURRENT_TIMESTAMP ELSE NULL END
                        )
                    """),
                    {
                        "item_id": item_id,
                        "standard_id": standard_id,
                        "alignment_strength": alignment_strength,
                        "verified_by": verified_by,
                    },
                )

        db.commit()

    @staticmethod
    def get_unassessed_standards(
        db: Session, learner_id: str, domain: str, grade_band: str, limit: int = 5
    ) -> List[Dict[str, Any]]:
        """
        Get priority standards that haven't been assessed yet
        Useful for guiding what to assess next
        """
        query = """
            SELECT 
                cs.id, cs.standard_code, cs.title, cs.description,
                cs.priority, cs.cognitive_level
            FROM curriculum_standards cs
            LEFT JOIN learner_standard_coverage lsc 
                ON cs.id = lsc.standard_id AND lsc.learner_id = :learner_id
            WHERE cs.district_id IN (
                SELECT district_id FROM learners WHERE id = :learner_id
                UNION SELECT 'default-district'
            )
            AND cs.domain = :domain
            AND cs.grade_band = :grade_band
            AND cs.active = 1
            AND (lsc.id IS NULL OR lsc.times_assessed < 2)
            ORDER BY 
                CASE cs.priority 
                    WHEN 'essential' THEN 1 
                    WHEN 'core' THEN 2 
                    ELSE 3 
                END,
                COALESCE(lsc.times_assessed, 0) ASC
            LIMIT :limit
        """

        results = db.execute(
            text(query),
            {"learner_id": learner_id, "domain": domain, "grade_band": grade_band, "limit": limit},
        ).fetchall()

        standards = []
        for row in results:
            standards.append(
                {
                    "id": row[0],
                    "code": row[1],
                    "title": row[2],
                    "description": row[3],
                    "priority": row[4],
                    "cognitiveLevel": row[5],
                }
            )

        return standards
