"""
Baseline Assessment Service
Handles adaptive item selection, IRT scoring, and session management
"""
import json
import math
import uuid
from datetime import datetime
from typing import Dict, List, Optional, Tuple, Any
from sqlalchemy import text
from sqlalchemy.orm import Session

# IRT Scoring Functions (Python implementation)

def calculate_probability(theta: float, a: float, b: float, c: float = 0.0) -> float:
    """3-Parameter Logistic Model: P(θ) = c + (1-c)/(1+e^(-a(θ-b)))"""
    return c + (1 - c) / (1 + math.exp(-a * (theta - b)))

def calculate_information(theta: float, a: float, b: float, c: float = 0.0) -> float:
    """Item Information Function"""
    p = calculate_probability(theta, a, b, c)
    if p == c:
        return 0.0
    return (a * a * p * (1 - p)) / ((p - c) ** 2)

def normal_pdf(x: float, mean: float, sd: float) -> float:
    """Normal probability density function"""
    coefficient = 1 / (sd * math.sqrt(2 * math.pi))
    exponent = -((x - mean) ** 2) / (2 * sd * sd)
    return coefficient * math.exp(exponent)

def estimate_ability_eap(
    responses: List[Dict[str, Any]],
    prior_mean: float = 0.0,
    prior_sd: float = 1.0,
    quadrature_points: int = 41
) -> Tuple[float, float]:
    """
    Estimate ability using Expected A Posteriori (EAP) method
    Returns: (theta, standard_error)
    """
    min_theta = prior_mean - 4 * prior_sd
    max_theta = prior_mean + 4 * prior_sd
    step = (max_theta - min_theta) / (quadrature_points - 1)
    
    theta_points = []
    posterior_weights = []
    
    for i in range(quadrature_points):
        theta = min_theta + i * step
        theta_points.append(theta)
        
        # Calculate likelihood
        log_likelihood = 0.0
        for response in responses:
            a = response['item']['a']
            b = response['item']['b']
            c = response['item']['c']
            p = calculate_probability(theta, a, b, c)
            log_likelihood += math.log(p) if response['correct'] else math.log(1 - p)
        
        # Prior density
        prior_density = normal_pdf(theta, prior_mean, prior_sd)
        
        # Posterior weight
        posterior_weights.append(math.exp(log_likelihood) * prior_density)
    
    # Normalize weights
    total_weight = sum(posterior_weights)
    if total_weight == 0:
        return prior_mean, prior_sd
    
    normalized_weights = [w / total_weight for w in posterior_weights]
    
    # Calculate EAP theta
    eap_theta = sum(theta_points[i] * normalized_weights[i] for i in range(quadrature_points))
    
    # Calculate variance
    variance = sum((theta_points[i] - eap_theta) ** 2 * normalized_weights[i] 
                   for i in range(quadrature_points))
    standard_error = math.sqrt(variance)
    
    return eap_theta, standard_error

def score_multi_select(
    selected_options: List[str],
    correct_options: List[str],
    max_points: float = 1.0
) -> float:
    """Partial credit scoring for multi-select items"""
    if not correct_options:
        return 0.0
    
    correct_selected = len([opt for opt in selected_options if opt in correct_options])
    incorrect_selected = len([opt for opt in selected_options if opt not in correct_options])
    total_correct = len(correct_options)
    
    raw_score = max(0.0, (correct_selected - incorrect_selected) / total_correct)
    return raw_score * max_points


class BaselineAssessmentService:
    """Service for managing adaptive baseline assessments"""
    
    @staticmethod
    def start_session(
        db: Session,
        learner_id: str,
        grade_band: str,
        audio_enabled: bool = False,
        tts_enabled: bool = False,
        device_info: Optional[Dict] = None
    ) -> Dict[str, Any]:
        """
        Start a new baseline assessment session or resume existing
        Returns: {session_id, first_item, ability_estimates, resumed}
        """
        # Check for existing active session
        existing = db.execute(
            text("""
                SELECT id, current_domain, ability_estimates_json, standard_errors_json
                FROM baseline_sessions
                WHERE learner_id = :learner_id
                AND status IN ('not_started', 'in_progress', 'paused')
                ORDER BY created_at DESC
                LIMIT 1
            """),
            {"learner_id": learner_id}
        ).fetchone()
        
        if existing:
            session_id = existing[0]
            current_domain = existing[1]
            ability_estimates = json.loads(existing[2] or '{}')
            standard_errors = json.loads(existing[3] or '{}')
            
            # Resume session
            db.execute(
                text("""
                    UPDATE baseline_sessions
                    SET status = 'in_progress', resumed_at = :now
                    WHERE id = :session_id
                """),
                {"session_id": session_id, "now": datetime.utcnow()}
            )
            db.commit()
            
            # Get next item
            current_theta = ability_estimates.get(current_domain, 0.0)
            current_se = standard_errors.get(current_domain, 1.0)
            next_item = BaselineAssessmentService._get_next_item(
                db, session_id, current_domain, current_theta, current_se
            )
            
            return {
                "session_id": session_id,
                "resumed": True,
                "current_domain": current_domain,
                "first_item": next_item,
                "ability_estimates": ability_estimates,
                "standard_errors": standard_errors
            }
        
        # Create new session
        session_id = str(uuid.uuid4())
        
        # Initial theta based on grade band
        initial_theta = {
            "reading": -0.5 if grade_band == 'K-5' else 0.0 if grade_band == '6-8' else 0.3,
            "math": -0.5 if grade_band == 'K-5' else 0.0 if grade_band == '6-8' else 0.3,
            "science": -0.5 if grade_band == 'K-5' else 0.0 if grade_band == '6-8' else 0.3,
            "writing": -0.5 if grade_band == 'K-5' else 0.0 if grade_band == '6-8' else 0.3,
            "sel": 0.0,
            "speech": -0.5 if grade_band == 'K-5' else 0.0 if grade_band == '6-8' else 0.3
        }
        
        initial_se = {
            "reading": 1.0,
            "math": 1.0,
            "science": 1.0,
            "writing": 1.0,
            "sel": 1.0,
            "speech": 1.0
        }
        
        db.execute(
            text("""
                INSERT INTO baseline_sessions (
                    id, learner_id, grade_band, status, started_at, current_domain,
                    audio_recording_enabled, text_to_speech_enabled,
                    ability_estimates_json, standard_errors_json, total_items_planned
                ) VALUES (
                    :id, :learner_id, :grade_band, 'in_progress', :now, 'reading',
                    :audio_enabled, :tts_enabled, :estimates, :errors, 60
                )
            """),
            {
                "id": session_id,
                "learner_id": learner_id,
                "grade_band": grade_band,
                "now": datetime.utcnow(),
                "audio_enabled": 1 if audio_enabled else 0,
                "tts_enabled": 1 if tts_enabled else 0,
                "estimates": json.dumps(initial_theta),
                "errors": json.dumps(initial_se)
            }
        )
        db.commit()
        
        # Get first item (reading domain)
        first_item = BaselineAssessmentService._get_next_item(
            db, session_id, 'reading', initial_theta['reading'], initial_se['reading']
        )
        
        return {
            "session_id": session_id,
            "resumed": False,
            "current_domain": "reading",
            "first_item": first_item,
            "ability_estimates": initial_theta,
            "standard_errors": initial_se
        }
    
    @staticmethod
    def _get_next_item(
        db: Session,
        session_id: str,
        domain: str,
        current_theta: float,
        current_se: float
    ) -> Optional[Dict[str, Any]]:
        """
        Select next item using maximum information criterion
        """
        # Get session info
        session = db.execute(
            text("SELECT grade_band FROM baseline_sessions WHERE id = :id"),
            {"id": session_id}
        ).fetchone()
        
        if not session:
            return None
        
        grade_band = session[0]
        
        # Get used item IDs
        used_items = db.execute(
            text("""
                SELECT item_id FROM baseline_responses
                WHERE session_id = :session_id
            """),
            {"session_id": session_id}
        ).fetchall()
        
        used_item_ids = [row[0] for row in used_items]
        
        # Get available items
        query = """
            SELECT id, item_type, stem, stimulus, stimulus_type, options_json,
                   difficulty, discrimination, guessing, estimated_time_seconds,
                   cognitive_level, read_aloud_enabled, allow_calculator
            FROM baseline_items
            WHERE domain = :domain
            AND grade_band = :grade_band
            AND status = 'active'
        """
        
        if used_item_ids:
            placeholders = ','.join(['?' for _ in used_item_ids])
            query += f" AND id NOT IN ({placeholders})"
            params = {"domain": domain, "grade_band": grade_band}
            # SQLite doesn't support named params with IN clause well, so we use positional
            result = db.execute(
                text(query.replace('?', ':item_' + str(used_item_ids.index(used_item_ids[0])) if used_item_ids else '')),
                {**params, **{f"item_{i}": item_id for i, item_id in enumerate(used_item_ids)}}
            ).fetchall()
        else:
            result = db.execute(
                text(query),
                {"domain": domain, "grade_band": grade_band}
            ).fetchall()
        
        if not result:
            return None
        
        # Calculate information for each item and select maximum
        best_item = None
        max_info = -1
        
        for row in result:
            item_id, item_type, stem, stimulus, stim_type, options_json, \
            difficulty, discrimination, guessing, est_time, cog_level, \
            read_aloud, calculator = row
            
            info = calculate_information(current_theta, discrimination, difficulty, guessing or 0.0)
            
            if info > max_info:
                max_info = info
                best_item = {
                    "id": item_id,
                    "type": item_type,
                    "stem": stem,
                    "stimulus": stimulus,
                    "stimulusType": stim_type,
                    "options": json.loads(options_json) if options_json else None,
                    "parameters": {
                        "difficulty": difficulty,
                        "discrimination": discrimination,
                        "guessing": guessing or 0.0,
                        "estimatedTime": est_time,
                        "cognitiveLevel": cog_level
                    },
                    "readAloud": bool(read_aloud),
                    "allowCalculator": bool(calculator),
                    "domain": domain,
                    "gradeBand": grade_band
                }
        
        if best_item:
            # Update exposure count
            db.execute(
                text("""
                    UPDATE baseline_items
                    SET exposure_count = exposure_count + 1,
                        last_used_at = :now
                    WHERE id = :item_id
                """),
                {"item_id": best_item["id"], "now": datetime.utcnow()}
            )
            db.commit()
        
        return best_item
    
    @staticmethod
    def submit_response(
        db: Session,
        session_id: str,
        item_id: str,
        response_data: Dict[str, Any],
        engagement_metrics: Dict[str, Any],
        time_started: datetime,
        time_submitted: datetime
    ) -> Dict[str, Any]:
        """
        Submit item response, update theta estimate, return next item
        """
        # Get session and item
        session = db.execute(
            text("""
                SELECT learner_id, current_domain, ability_estimates_json,
                       standard_errors_json, items_answered, domains_completed_json,
                       min_items_per_domain, max_items_per_domain, target_standard_error
                FROM baseline_sessions WHERE id = :id
            """),
            {"id": session_id}
        ).fetchone()
        
        item = db.execute(
            text("""
                SELECT item_type, domain, options_json, difficulty, discrimination, guessing, points
                FROM baseline_items WHERE id = :id
            """),
            {"id": item_id}
        ).fetchone()
        
        if not session or not item:
            raise ValueError("Session or item not found")
        
        learner_id, current_domain, estimates_json, errors_json, items_answered, \
        domains_json, min_items, max_items, target_se = session
        
        ability_estimates = json.loads(estimates_json)
        standard_errors = json.loads(errors_json)
        domains_completed = json.loads(domains_json)
        
        item_type, item_domain, options_json, difficulty, discrimination, guessing, points = item
        options = json.loads(options_json) if options_json else []
        
        # Score the response
        correct = False
        score = 0.0
        max_score = points
        
        if item_type in ['yes_no', 'single_choice']:
            selected = response_data.get('selectedOptions', [])
            if selected:
                correct_option = next((opt['id'] for opt in options if opt.get('correct')), None)
                correct = selected[0] == correct_option
                score = max_score if correct else 0.0
        
        elif item_type == 'multi_select':
            selected = response_data.get('selectedOptions', [])
            correct_ids = [opt['id'] for opt in options if opt.get('correct')]
            score = score_multi_select(selected, correct_ids, max_score)
            correct = score == max_score
        
        # Save response
        response_id = str(uuid.uuid4())
        current_theta = ability_estimates.get(item_domain, 0.0)
        current_se = standard_errors.get(item_domain, 1.0)
        
        db.execute(
            text("""
                INSERT INTO baseline_responses (
                    id, session_id, item_id, selected_options_json, constructed_response,
                    audio_url, self_rating, time_started, time_submitted,
                    time_spent_ms, engagement_metrics_json, hesitation_count,
                    skipped, used_hint, used_read_aloud, correct, score, max_score,
                    theta_at_response, se_at_response, item_difficulty, item_discrimination
                ) VALUES (
                    :id, :session_id, :item_id, :selected, :constructed,
                    :audio, :rating, :time_start, :time_end,
                    :time_spent, :engagement, :hesitation,
                    :skipped, :hint, :read_aloud, :correct, :score, :max_score,
                    :theta, :se, :difficulty, :discrimination
                )
            """),
            {
                "id": response_id,
                "session_id": session_id,
                "item_id": item_id,
                "selected": json.dumps(response_data.get('selectedOptions')),
                "constructed": response_data.get('constructedResponse'),
                "audio": response_data.get('audioUrl'),
                "rating": response_data.get('selfRating'),
                "time_start": time_started,
                "time_end": time_submitted,
                "time_spent": int((time_submitted - time_started).total_seconds() * 1000),
                "engagement": json.dumps(engagement_metrics),
                "hesitation": engagement_metrics.get('hesitationCount', 0),
                "skipped": 1 if engagement_metrics.get('skipped') else 0,
                "hint": 1 if engagement_metrics.get('usedHint') else 0,
                "read_aloud": 1 if engagement_metrics.get('usedReadAloud') else 0,
                "correct": 1 if correct else 0,
                "score": score,
                "max_score": max_score,
                "theta": current_theta,
                "se": current_se,
                "difficulty": difficulty,
                "discrimination": discrimination
            }
        )
        db.commit()
        
        # Update ability estimate
        domain_responses = db.execute(
            text("""
                SELECT correct, item_difficulty, item_discrimination
                FROM baseline_responses br
                JOIN baseline_items bi ON br.item_id = bi.id
                WHERE br.session_id = :session_id AND bi.domain = :domain
            """),
            {"session_id": session_id, "domain": item_domain}
        ).fetchall()
        
        responses_for_irt = [
            {
                "correct": bool(r[0]),
                "item": {"a": r[2], "b": r[1], "c": guessing or 0.0}
            }
            for r in domain_responses
        ]
        
        new_theta, new_se = estimate_ability_eap(responses_for_irt, current_theta, 1.0)
        
        ability_estimates[item_domain] = new_theta
        standard_errors[item_domain] = new_se
        
        # Update session
        db.execute(
            text("""
                UPDATE baseline_sessions
                SET ability_estimates_json = :estimates,
                    standard_errors_json = :errors,
                    items_answered = :items_answered
                WHERE id = :id
            """),
            {
                "id": session_id,
                "estimates": json.dumps(ability_estimates),
                "errors": json.dumps(standard_errors),
                "items_answered": items_answered + 1
            }
        )
        db.commit()
        
        # Check stopping criteria
        domain_item_count = len(domain_responses)
        should_stop = (
            domain_item_count >= max_items or
            (domain_item_count >= min_items and new_se <= target_se)
        )
        
        if should_stop:
            # Move to next domain
            domain_order = ['reading', 'math', 'science', 'writing', 'sel', 'speech']
            current_idx = domain_order.index(current_domain)
            
            if current_idx < len(domain_order) - 1:
                next_domain = domain_order[current_idx + 1]
                domains_completed.append(current_domain)
                
                db.execute(
                    text("""
                        UPDATE baseline_sessions
                        SET current_domain = :next_domain,
                            domains_completed_json = :completed
                        WHERE id = :id
                    """),
                    {
                        "id": session_id,
                        "next_domain": next_domain,
                        "completed": json.dumps(domains_completed)
                    }
                )
                db.commit()
                
                # Get first item of next domain
                next_item = BaselineAssessmentService._get_next_item(
                    db, session_id, next_domain,
                    ability_estimates.get(next_domain, 0.0),
                    standard_errors.get(next_domain, 1.0)
                )
                
                return {
                    "scored": True,
                    "correct": correct,
                    "score": score,
                    "maxScore": max_score,
                    "updatedTheta": new_theta,
                    "updatedSE": new_se,
                    "shouldStopDomain": True,
                    "nextDomain": next_domain,
                    "nextItem": next_item,
                    "assessmentComplete": False
                }
            else:
                # All domains complete
                domains_completed.append(current_domain)
                db.execute(
                    text("""
                        UPDATE baseline_sessions
                        SET status = 'completed',
                            completed_at = :now,
                            domains_completed_json = :completed
                        WHERE id = :id
                    """),
                    {
                        "id": session_id,
                        "now": datetime.utcnow(),
                        "completed": json.dumps(domains_completed)
                    }
                )
                db.commit()
                
                return {
                    "scored": True,
                    "correct": correct,
                    "score": score,
                    "maxScore": max_score,
                    "updatedTheta": new_theta,
                    "updatedSE": new_se,
                    "shouldStopDomain": True,
                    "assessmentComplete": True,
                    "nextItem": None
                }
        
        # Continue in same domain
        next_item = BaselineAssessmentService._get_next_item(
            db, session_id, current_domain, new_theta, new_se
        )
        
        return {
            "scored": True,
            "correct": correct,
            "score": score,
            "maxScore": max_score,
            "updatedTheta": new_theta,
            "updatedSE": new_se,
            "shouldStopDomain": False,
            "nextItem": next_item,
            "assessmentComplete": False
        }
