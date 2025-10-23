# PROMPT 61: Advanced Subject Assessment System

## Overview
This is an **enhanced version** of PROMPT 58 that adds comprehensive subject-based assessments with AI-generated questions, detailed scoring, and advanced brain adaptation.

**Key Difference from PROMPT 58**:
- PROMPT 58: Quick 5-question preference/confidence assessment (UI already built)
- PROMPT 61: Detailed subject assessments with generated questions (NEW FEATURE)

## Recommendation: Two-Tier Assessment System

### Tier 1: Quick Assessment (PROMPT 58) ✅
**When**: First enrollment, every login
**Purpose**: Capture learning preferences, confidence, emotional state
**Questions**: 5 visual/emoji questions
**Duration**: 2-3 minutes
**Implementation**: Already complete in BaselineAssessment.tsx

### Tier 2: Comprehensive Assessment (PROMPT 61) 🆕
**When**: After Tier 1, every 90 days
**Purpose**: Measure actual subject knowledge and skills
**Questions**: 20+ generated questions across Math, Reading, Science
**Duration**: 20-30 minutes
**Implementation**: This prompt

---

## Integration Strategy

Both systems work together:

1. **First Login**: 
   - Quick Assessment (PROMPT 58) → Brain cloning with preferences
   - Redirect to Comprehensive Assessment (PROMPT 61) → Brain refinement with knowledge levels

2. **Regular Use**:
   - Every 90 days: Full Comprehensive Assessment
   - Any time: Quick Assessment to adjust preferences

3. **Brain Updates**:
   - Quick Assessment → Update preferences, engagement, learning style
   - Comprehensive Assessment → Update knowledge levels, strengths, weaknesses

---

## Part A: Database Schema (Add to PROMPT 58 schema)

### New Tables for Subject Assessments

**File**: `services/ai-inference-service/migrations/009_subject_assessment.sql`

```sql
-- Subject-specific assessments (extends assessment_schedules from PROMPT 58)
CREATE TABLE subject_assessments (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    schedule_id UUID NOT NULL REFERENCES assessment_schedules(id) ON DELETE CASCADE,
    learner_id UUID NOT NULL REFERENCES learners(id) ON DELETE CASCADE,
    
    -- Assessment Type
    assessment_level VARCHAR(20) NOT NULL DEFAULT 'comprehensive', -- comprehensive, quick
    
    -- Subject Coverage
    subjects_included TEXT[] NOT NULL, -- ['math', 'reading', 'science']
    total_questions INTEGER NOT NULL DEFAULT 0,
    questions_answered INTEGER DEFAULT 0,
    
    -- Timing
    estimated_duration_minutes INTEGER DEFAULT 30,
    actual_duration_seconds INTEGER,
    
    -- Status
    status VARCHAR(20) DEFAULT 'pending', -- pending, in_progress, completed, abandoned
    
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Individual subject questions (AI-generated)
CREATE TABLE subject_questions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    subject_assessment_id UUID NOT NULL REFERENCES subject_assessments(id) ON DELETE CASCADE,
    
    -- Subject Info
    subject VARCHAR(50) NOT NULL, -- math, reading, science
    domain VARCHAR(100), -- e.g., "Number Operations", "Comprehension"
    standard_code VARCHAR(100), -- Aligned to educational standards
    
    -- Question Content
    question_text TEXT NOT NULL,
    question_type VARCHAR(50) NOT NULL, -- multiple_choice, short_answer, problem_solving, passage_based
    
    -- For multiple choice
    options JSONB, -- ["Option A", "Option B", "Option C", "Option D"]
    correct_answer_index INTEGER, -- 0, 1, 2, or 3
    
    -- For short answer
    acceptable_answers JSONB, -- List of acceptable answer variations
    
    -- Difficulty & Targeting
    difficulty_level INTEGER CHECK (difficulty_level BETWEEN 1 AND 10),
    target_grade_level INTEGER,
    
    -- Learner Response
    learner_answer TEXT,
    is_correct BOOLEAN,
    time_spent_seconds INTEGER,
    attempts INTEGER DEFAULT 0,
    
    -- AI Evaluation
    ai_evaluation JSONB, -- Detailed AI feedback on answer
    -- Structure: {
    --   "correctness": "correct|partial|incorrect",
    --   "reasoning": "Student showed understanding of...",
    --   "misconceptions": ["..."],
    --   "suggestions": ["..."]
    -- }
    
    -- Ordering
    question_order INTEGER NOT NULL,
    
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    answered_at TIMESTAMP
);

-- Subject-specific results (extends assessment_results from PROMPT 58)
CREATE TABLE subject_results (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    subject_assessment_id UUID NOT NULL REFERENCES subject_assessments(id) ON DELETE CASCADE,
    assessment_result_id UUID REFERENCES assessment_results(id), -- Link to PROMPT 58 results
    
    -- Subject Breakdown
    subject VARCHAR(50) NOT NULL,
    
    -- Scoring
    raw_score INTEGER NOT NULL, -- e.g., 7 out of 10
    total_questions INTEGER NOT NULL,
    percentage_score DECIMAL(5,2),
    
    -- Level Determination
    assessed_grade_level DECIMAL(3,1), -- e.g., 5.5 (mid-5th grade)
    grade_level_label VARCHAR(50), -- "5th grade", "Advanced 5th grade"
    
    -- Domain Breakdown
    domain_scores JSONB, -- Performance by domain
    -- Structure: {
    --   "Number Operations": {"correct": 3, "total": 4, "percentage": 75},
    --   "Fractions": {"correct": 2, "total": 3, "percentage": 67}
    -- }
    
    -- Strengths & Weaknesses
    strengths TEXT[], -- Domains with >= 75% accuracy
    weaknesses TEXT[], -- Domains with < 50% accuracy
    emerging_skills TEXT[], -- 50-74% accuracy
    
    -- Recommendations
    recommended_activities JSONB,
    focus_areas TEXT[],
    differentiation_needed VARCHAR(50), -- below_level, on_level, above_level, advanced
    
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Brain model updates (tracks all adaptations)
CREATE TABLE brain_adaptations (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    learner_id UUID NOT NULL REFERENCES learners(id) ON DELETE CASCADE,
    brain_instance_id UUID REFERENCES brain_instances(id),
    
    -- What triggered the adaptation
    trigger_type VARCHAR(50) NOT NULL, -- quick_assessment, comprehensive_assessment, manual, iep_update
    trigger_id UUID, -- ID of the assessment or other trigger
    
    -- Changes Made
    adaptation_type VARCHAR(50) NOT NULL, -- preferences, knowledge_levels, full_retrain
    changes_applied JSONB NOT NULL,
    -- Structure: {
    --   "preferences": {
    --     "learning_style": {"from": "visual", "to": "kinesthetic"},
    --     "work_preference": {"from": "independent", "to": "collaborative"}
    --   },
    --   "knowledge_levels": {
    --     "math": {"from": "4.5", "to": "5.2"},
    --     "reading": {"from": "5.0", "to": "5.5"}
    --   },
    --   "new_strengths": ["fractions", "inference"],
    --   "focus_areas": ["geometry", "vocabulary"]
    -- }
    
    -- Model Info
    previous_model_version VARCHAR(100),
    new_model_version VARCHAR(100) NOT NULL,
    
    -- Performance Impact
    expected_improvement_areas TEXT[],
    
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Indexes
CREATE INDEX idx_subject_assessments_learner ON subject_assessments(learner_id, status);
CREATE INDEX idx_subject_questions_assessment ON subject_questions(subject_assessment_id, question_order);
CREATE INDEX idx_subject_results_subject ON subject_results(subject, assessed_grade_level);
CREATE INDEX idx_brain_adaptations_learner ON brain_adaptations(learner_id, created_at DESC);
CREATE INDEX idx_brain_adaptations_trigger ON brain_adaptations(trigger_type, trigger_id);
```

---

## Part B: Enhanced Assessment Service

**File**: `services/ai-inference-service/app/services/subject_assessment_service.py`

```python
"""
Subject Assessment Service - Comprehensive knowledge assessment.

Works in conjunction with AssessmentService from PROMPT 58.
"""

import logging
from typing import Dict, List, Any, Optional
from datetime import datetime
from sqlalchemy.orm import Session
from sqlalchemy import and_

from app.models.assessment import Assessment, AssessmentResult
from app.services.ai_service import AIService

logger = logging.getLogger(__name__)


class SubjectAssessmentService:
    """
    Service for comprehensive subject-based assessments.
    
    Generates AI-powered questions, scores responses, and adapts brain models.
    """
    
    def __init__(self, db: Session, ai_service: AIService):
        self.db = db
        self.ai = ai_service
    
    async def create_comprehensive_assessment(
        self,
        learner_id: str,
        schedule_id: str,
        subjects: List[str] = None
    ) -> Dict[str, Any]:
        """
        Create comprehensive subject assessment.
        
        Args:
            learner_id: UUID of learner
            schedule_id: UUID of assessment schedule (from PROMPT 58)
            subjects: List of subjects to assess (default: ['math', 'reading', 'science'])
            
        Returns:
            Dict with assessment details and questions
        """
        from app.models.subject_assessment import SubjectAssessment, SubjectQuestion
        
        if subjects is None:
            subjects = ['math', 'reading', 'science']
        
        # Get learner info
        learner = self.db.query(Learner).filter(Learner.id == learner_id).first()
        if not learner:
            raise ValueError(f"Learner {learner_id} not found")
        
        # Create subject assessment record
        subject_assessment = SubjectAssessment(
            schedule_id=schedule_id,
            learner_id=learner_id,
            assessment_level='comprehensive',
            subjects_included=subjects,
            estimated_duration_minutes=len(subjects) * 10,  # 10 min per subject
            status='pending'
        )
        
        self.db.add(subject_assessment)
        self.db.commit()
        self.db.refresh(subject_assessment)
        
        # Generate questions for each subject
        all_questions = []
        
        for subject in subjects:
            questions = await self._generate_subject_questions(
                subject_assessment_id=str(subject_assessment.id),
                subject=subject,
                learner_grade=learner.grade_level,
                num_questions=10  # 10 per subject = 30 total
            )
            all_questions.extend(questions)
        
        # Update total questions
        subject_assessment.total_questions = len(all_questions)
        self.db.commit()
        
        logger.info(
            f"Created comprehensive assessment {subject_assessment.id} "
            f"for learner {learner.first_name} with {len(all_questions)} questions"
        )
        
        return {
            "assessment_id": str(subject_assessment.id),
            "total_questions": len(all_questions),
            "subjects": subjects,
            "estimated_minutes": subject_assessment.estimated_duration_minutes,
            "questions": [self._serialize_question(q) for q in all_questions]
        }
    
    async def _generate_subject_questions(
        self,
        subject_assessment_id: str,
        subject: str,
        learner_grade: int,
        num_questions: int = 10
    ) -> List[Any]:
        """
        Generate AI-powered questions for a subject.
        
        Creates questions spanning multiple difficulty levels and domains.
        """
        from app.models.subject_assessment import SubjectQuestion
        
        questions = []
        
        # Define domains for each subject
        domains = self._get_subject_domains(subject, learner_grade)
        
        # Generate questions across domains and difficulties
        for i in range(num_questions):
            domain = domains[i % len(domains)]
            difficulty = min(i + 1, 10)  # Progressive difficulty 1-10
            
            # Generate question using AI
            question_data = await self._ai_generate_question(
                subject=subject,
                domain=domain,
                grade_level=learner_grade,
                difficulty=difficulty
            )
            
            # Create question record
            question = SubjectQuestion(
                subject_assessment_id=subject_assessment_id,
                subject=subject,
                domain=domain,
                question_text=question_data['question'],
                question_type=question_data['type'],
                options=question_data.get('options'),
                correct_answer_index=question_data.get('correct_index'),
                acceptable_answers=question_data.get('acceptable_answers'),
                difficulty_level=difficulty,
                target_grade_level=learner_grade,
                question_order=len(questions) + 1
            )
            
            self.db.add(question)
            questions.append(question)
        
        self.db.commit()
        
        logger.info(f"Generated {len(questions)} {subject} questions")
        
        return questions
    
    def _get_subject_domains(self, subject: str, grade: int) -> List[str]:
        """Get relevant domains for a subject and grade level."""
        
        domains = {
            'math': [
                'Number Operations',
                'Fractions & Decimals',
                'Geometry',
                'Measurement',
                'Word Problems',
                'Patterns & Algebra',
                'Data & Graphs',
                'Time & Money'
            ],
            'reading': [
                'Literal Comprehension',
                'Inferential Thinking',
                'Vocabulary',
                'Main Idea',
                'Author\'s Purpose',
                'Text Structure',
                'Character Analysis',
                'Compare & Contrast'
            ],
            'science': [
                'Life Science',
                'Physical Science',
                'Earth Science',
                'Scientific Method',
                'Observation & Inquiry',
                'Ecosystems',
                'Matter & Energy',
                'Weather & Climate'
            ]
        }
        
        return domains.get(subject, ['General Knowledge'])
    
    async def _ai_generate_question(
        self,
        subject: str,
        domain: str,
        grade_level: int,
        difficulty: int
    ) -> Dict[str, Any]:
        """
        Use AI to generate a grade-appropriate question.
        
        Returns:
            {
                "question": "What is 47 + 38?",
                "type": "multiple_choice",
                "options": ["83", "85", "87", "89"],
                "correct_index": 1,
                "standard": "CCSS.MATH.2.NBT.B.5"
            }
        """
        
        prompt = f"""Generate a {subject} assessment question for grade {grade_level}.

Domain: {domain}
Difficulty: {difficulty}/10
Question Type: {"multiple_choice" if difficulty <= 7 else "short_answer"}

Requirements:
- Age-appropriate language
- Clear and unambiguous
- Aligned to grade {grade_level} standards
- Measures understanding, not just memorization

Format your response as JSON:
{{
    "question": "question text",
    "type": "multiple_choice",
    "options": ["A", "B", "C", "D"],
    "correct_index": 1,
    "explanation": "why this answer is correct",
    "standard": "aligned standard code"
}}

For short answer, use:
{{
    "question": "question text",
    "type": "short_answer",
    "acceptable_answers": ["answer1", "answer2"],
    "explanation": "what we're looking for"
}}"""
        
        try:
            # Call AI service
            response = await self.ai.generate_structured_response(
                prompt=prompt,
                expected_format="json"
            )
            
            # Parse and validate
            import json
            question_data = json.loads(response)
            
            # Add fallback if AI fails
            if not question_data.get('question'):
                raise ValueError("Invalid question generated")
            
            return question_data
            
        except Exception as e:
            logger.error(f"AI question generation failed: {e}")
            # Fallback to template questions
            return self._get_template_question(subject, domain, grade_level, difficulty)
    
    def _get_template_question(
        self,
        subject: str,
        domain: str,
        grade: int,
        difficulty: int
    ) -> Dict[str, Any]:
        """Fallback template questions when AI is unavailable."""
        
        templates = {
            'math': {
                'Number Operations': {
                    "question": f"What is 47 + 38?",
                    "type": "multiple_choice",
                    "options": ["83", "85", "87", "89"],
                    "correct_index": 1
                },
                'Fractions & Decimals': {
                    "question": f"What is 1/2 + 1/4?",
                    "type": "multiple_choice",
                    "options": ["1/6", "2/6", "3/4", "1/8"],
                    "correct_index": 2
                }
            },
            'reading': {
                'Vocabulary': {
                    "question": f"What does 'enormous' mean?",
                    "type": "multiple_choice",
                    "options": ["very small", "very large", "very fast", "very slow"],
                    "correct_index": 1
                }
            },
            'science': {
                'Life Science': {
                    "question": f"What do plants need to grow?",
                    "type": "multiple_choice",
                    "options": [
                        "Only water",
                        "Only sunlight",
                        "Water, sunlight, and air",
                        "Only soil"
                    ],
                    "correct_index": 2
                }
            }
        }
        
        return templates.get(subject, {}).get(
            domain,
            {
                "question": f"Sample {subject} question about {domain}",
                "type": "multiple_choice",
                "options": ["A", "B", "C", "D"],
                "correct_index": 0
            }
        )
    
    async def submit_answer(
        self,
        question_id: str,
        learner_answer: str,
        time_spent_seconds: int
    ) -> Dict[str, Any]:
        """
        Submit answer for a question and get immediate feedback.
        
        Returns:
            {
                "correct": true,
                "feedback": "Great job! You understood...",
                "explanation": "The correct answer is..."
            }
        """
        from app.models.subject_assessment import SubjectQuestion
        
        question = self.db.query(SubjectQuestion).filter(
            SubjectQuestion.id == question_id
        ).first()
        
        if not question:
            raise ValueError(f"Question {question_id} not found")
        
        # Record answer
        question.learner_answer = learner_answer
        question.time_spent_seconds = time_spent_seconds
        question.attempts += 1
        question.answered_at = datetime.utcnow()
        
        # Evaluate answer
        is_correct, evaluation = await self._evaluate_answer(question, learner_answer)
        
        question.is_correct = is_correct
        question.ai_evaluation = evaluation
        
        self.db.commit()
        
        return {
            "correct": is_correct,
            "feedback": evaluation.get('feedback'),
            "explanation": evaluation.get('explanation'),
            "suggestions": evaluation.get('suggestions', [])
        }
    
    async def _evaluate_answer(
        self,
        question: Any,
        learner_answer: str
    ) -> tuple[bool, Dict[str, Any]]:
        """
        Evaluate learner's answer using AI.
        
        Returns:
            (is_correct: bool, evaluation: dict)
        """
        
        # For multiple choice, simple check
        if question.question_type == 'multiple_choice':
            try:
                answer_index = int(learner_answer)
                is_correct = answer_index == question.correct_answer_index
                
                return is_correct, {
                    "correctness": "correct" if is_correct else "incorrect",
                    "feedback": "Correct!" if is_correct else "Not quite. Let's try to understand why.",
                    "explanation": f"The correct answer is: {question.options[question.correct_answer_index]}"
                }
            except:
                return False, {"correctness": "incorrect", "feedback": "Invalid answer format"}
        
        # For short answer, use AI to evaluate
        elif question.question_type == 'short_answer':
            # Check if answer matches acceptable answers first
            acceptable = question.acceptable_answers or []
            if learner_answer.lower().strip() in [a.lower().strip() for a in acceptable]:
                return True, {
                    "correctness": "correct",
                    "feedback": "Excellent! Your answer shows good understanding.",
                    "reasoning": "Answer matches expected response"
                }
            
            # Use AI for nuanced evaluation
            try:
                evaluation = await self.ai.evaluate_short_answer(
                    question=question.question_text,
                    expected_answers=acceptable,
                    learner_answer=learner_answer,
                    grade_level=question.target_grade_level
                )
                
                is_correct = evaluation.get('correctness') in ['correct', 'partial']
                
                return is_correct, evaluation
                
            except Exception as e:
                logger.error(f"AI evaluation failed: {e}")
                # Default to incorrect if evaluation fails
                return False, {
                    "correctness": "uncertain",
                    "feedback": "Your answer has been recorded for review."
                }
        
        return False, {"correctness": "unknown", "feedback": "Unable to evaluate"}
    
    async def complete_assessment(
        self,
        subject_assessment_id: str
    ) -> Dict[str, Any]:
        """
        Complete assessment and generate comprehensive results.
        
        Returns:
            {
                "overall_score": 75.5,
                "subject_results": {
                    "math": {...},
                    "reading": {...},
                    "science": {...}
                },
                "brain_adaptation_recommended": true,
                "changes_needed": {...}
            }
        """
        from app.models.subject_assessment import SubjectAssessment, SubjectQuestion, SubjectResult
        
        assessment = self.db.query(SubjectAssessment).filter(
            SubjectAssessment.id == subject_assessment_id
        ).first()
        
        if not assessment:
            raise ValueError(f"Assessment {subject_assessment_id} not found")
        
        # Get all questions
        questions = self.db.query(SubjectQuestion).filter(
            SubjectQuestion.subject_assessment_id == subject_assessment_id
        ).all()
        
        # Score by subject
        subject_results = {}
        
        for subject in assessment.subjects_included:
            result = await self._score_subject(
                subject_assessment_id,
                subject,
                [q for q in questions if q.subject == subject]
            )
            subject_results[subject] = result
        
        # Calculate overall score
        overall_score = sum(r['percentage_score'] for r in subject_results.values()) / len(subject_results)
        
        # Mark assessment complete
        assessment.status = 'completed'
        assessment.questions_answered = len([q for q in questions if q.learner_answer])
        assessment.actual_duration_seconds = sum(q.time_spent_seconds or 0 for q in questions)
        
        self.db.commit()
        
        # Determine if brain adaptation needed
        adaptation_needed, changes = self._analyze_adaptation_needs(
            assessment.learner_id,
            subject_results
        )
        
        logger.info(
            f"Completed assessment {subject_assessment_id}: "
            f"{overall_score:.1f}% overall"
        )
        
        return {
            "overall_score": round(overall_score, 1),
            "subject_results": subject_results,
            "brain_adaptation_recommended": adaptation_needed,
            "changes_needed": changes,
            "assessment_id": subject_assessment_id
        }
    
    async def _score_subject(
        self,
        assessment_id: str,
        subject: str,
        questions: List[Any]
    ) -> Dict[str, Any]:
        """Score a single subject and generate detailed results."""
        from app.models.subject_assessment import SubjectResult
        
        if not questions:
            return {"error": "No questions for subject"}
        
        # Calculate raw score
        correct = sum(1 for q in questions if q.is_correct)
        total = len(questions)
        percentage = (correct / total * 100) if total > 0 else 0
        
        # Score by domain
        domain_scores = {}
        for q in questions:
            if q.domain not in domain_scores:
                domain_scores[q.domain] = {"correct": 0, "total": 0}
            domain_scores[q.domain]["total"] += 1
            if q.is_correct:
                domain_scores[q.domain]["correct"] += 1
        
        # Add percentages
        for domain, scores in domain_scores.items():
            scores["percentage"] = (scores["correct"] / scores["total"] * 100) if scores["total"] > 0 else 0
        
        # Identify strengths and weaknesses
        strengths = [d for d, s in domain_scores.items() if s["percentage"] >= 75]
        weaknesses = [d for d, s in domain_scores.items() if s["percentage"] < 50]
        emerging = [d for d, s in domain_scores.items() if 50 <= s["percentage"] < 75]
        
        # Assess grade level
        # Calculate based on difficulty of correctly answered questions
        correct_difficulties = [q.difficulty_level for q in questions if q.is_correct]
        avg_difficulty = sum(correct_difficulties) / len(correct_difficulties) if correct_difficulties else 0
        
        # Map difficulty to grade level (simplified)
        assessed_grade = questions[0].target_grade_level + ((avg_difficulty - 5) / 2)
        
        # Determine differentiation need
        target_grade = questions[0].target_grade_level
        if assessed_grade < target_grade - 1:
            differentiation = "below_level"
        elif assessed_grade > target_grade + 1:
            differentiation = "above_level"
        elif assessed_grade > target_grade + 0.5:
            differentiation = "advanced"
        else:
            differentiation = "on_level"
        
        # Generate recommendations
        recommendations = await self._generate_recommendations(
            subject, strengths, weaknesses, emerging, differentiation
        )
        
        # Create result record
        result = SubjectResult(
            subject_assessment_id=assessment_id,
            subject=subject,
            raw_score=correct,
            total_questions=total,
            percentage_score=round(percentage, 2),
            assessed_grade_level=round(assessed_grade, 1),
            grade_level_label=self._grade_to_label(assessed_grade),
            domain_scores=domain_scores,
            strengths=strengths,
            weaknesses=weaknesses,
            emerging_skills=emerging,
            recommended_activities=recommendations,
            focus_areas=weaknesses,
            differentiation_needed=differentiation
        )
        
        self.db.add(result)
        self.db.commit()
        self.db.refresh(result)
        
        return {
            "subject": subject,
            "raw_score": correct,
            "total_questions": total,
            "percentage_score": round(percentage, 1),
            "assessed_grade_level": round(assessed_grade, 1),
            "grade_level_label": self._grade_to_label(assessed_grade),
            "domain_scores": domain_scores,
            "strengths": strengths,
            "weaknesses": weaknesses,
            "emerging_skills": emerging,
            "differentiation_needed": differentiation,
            "recommendations": recommendations
        }
    
    def _grade_to_label(self, grade_level: float) -> str:
        """Convert numeric grade to label."""
        grade = int(grade_level)
        decimal = grade_level - grade
        
        if grade <= 0:
            return "Kindergarten"
        
        suffix = "th"
        if grade in [1]:
            suffix = "st"
        elif grade in [2]:
            suffix = "nd"
        elif grade in [3]:
            suffix = "rd"
        
        label = f"{grade}{suffix} grade"
        
        if decimal >= 0.7:
            label = f"Advanced {label}"
        elif decimal >= 0.3:
            label = f"Mid {label}"
        elif decimal > 0:
            label = f"Early {label}"
        
        return label
    
    async def _generate_recommendations(
        self,
        subject: str,
        strengths: List[str],
        weaknesses: List[str],
        emerging: List[str],
        differentiation: str
    ) -> Dict[str, List[str]]:
        """Generate personalized activity recommendations."""
        
        recommendations = {
            "practice_activities": [],
            "challenge_activities": [],
            "support_strategies": []
        }
        
        # Add weakness-targeted activities
        for weakness in weaknesses:
            recommendations["practice_activities"].append(
                f"Extra practice in {weakness} with visual aids"
            )
            recommendations["support_strategies"].append(
                f"One-on-one support for {weakness}"
            )
        
        # Add emerging skill activities
        for skill in emerging:
            recommendations["practice_activities"].append(
                f"Reinforce {skill} with games and interactive lessons"
            )
        
        # Add challenge activities for strengths
        for strength in strengths:
            recommendations["challenge_activities"].append(
                f"Advanced {strength} activities"
            )
        
        return recommendations
    
    def _analyze_adaptation_needs(
        self,
        learner_id: str,
        subject_results: Dict[str, Any]
    ) -> tuple[bool, Dict[str, Any]]:
        """
        Analyze if brain model adaptation is needed.
        
        Returns:
            (needs_adaptation: bool, changes_dict: dict)
        """
        
        changes = {
            "knowledge_levels": {},
            "focus_areas": [],
            "strengths": []
        }
        
        needs_adaptation = False
        
        for subject, result in subject_results.items():
            # Record new knowledge level
            changes["knowledge_levels"][subject] = {
                "new_level": result["assessed_grade_level"],
                "label": result["grade_level_label"]
            }
            
            # Add weaknesses to focus areas
            changes["focus_areas"].extend([
                f"{subject}: {w}" for w in result.get("weaknesses", [])
            ])
            
            # Add strengths
            changes["strengths"].extend([
                f"{subject}: {s}" for s in result.get("strengths", [])
            ])
            
            # Adaptation needed if:
            # 1. Below 60% in any subject
            # 2. Significant grade level difference
            if result["percentage_score"] < 60:
                needs_adaptation = True
            
            if result.get("differentiation_needed") in ["below_level", "above_level", "advanced"]:
                needs_adaptation = True
        
        return needs_adaptation, changes
    
    async def adapt_brain_model(
        self,
        subject_assessment_id: str,
        changes: Dict[str, Any]
    ) -> str:
        """
        Adapt learner's brain model based on assessment results.
        
        Returns:
            new_model_version: str
        """
        from app.models.subject_assessment import SubjectAssessment
        from app.models.brain_adaptation import BrainAdaptation
        
        assessment = self.db.query(SubjectAssessment).filter(
            SubjectAssessment.id == subject_assessment_id
        ).first()
        
        if not assessment:
            raise ValueError(f"Assessment {subject_assessment_id} not found")
        
        learner = assessment.learner
        
        # Get current brain instance
        current_brain = self.db.query(BrainInstance).filter(
            and_(
                BrainInstance.learner_id == learner.id,
                BrainInstance.status == 'active'
            )
        ).first()
        
        # Create new version
        new_version = f"v{datetime.utcnow().strftime('%Y%m%d_%H%M%S')}_comprehensive"
        
        # Call brain cloning service to create adapted version
        # (This integrates with PROMPT 57's brain cloning)
        from app.services.brain_cloning_service import BrainCloningService
        
        cloning_service = BrainCloningService(self.db)
        
        new_brain = await cloning_service.adapt_existing_brain(
            brain_instance_id=str(current_brain.id) if current_brain else None,
            learner_id=str(learner.id),
            adaptation_data=changes,
            reason="comprehensive_assessment"
        )
        
        # Record adaptation
        adaptation = BrainAdaptation(
            learner_id=str(learner.id),
            brain_instance_id=str(new_brain.id),
            trigger_type='comprehensive_assessment',
            trigger_id=subject_assessment_id,
            adaptation_type='knowledge_levels',
            changes_applied=changes,
            previous_model_version=current_brain.version if current_brain else None,
            new_model_version=new_version,
            expected_improvement_areas=changes.get('focus_areas', [])
        )
        
        self.db.add(adaptation)
        self.db.commit()
        
        logger.info(
            f"✅ Adapted brain model for learner {learner.first_name} "
            f"to version {new_version}"
        )
        
        return new_version
    
    def _serialize_question(self, question: Any) -> Dict[str, Any]:
        """Convert question object to dict for API response."""
        return {
            "id": str(question.id),
            "subject": question.subject,
            "domain": question.domain,
            "question_text": question.question_text,
            "question_type": question.question_type,
            "options": question.options,
            "difficulty_level": question.difficulty_level,
            "question_order": question.question_order
        }


assessment_service = SubjectAssessmentService
```

---

## Part C: Frontend Components

### 1. Comprehensive Assessment Page

**File**: `apps/learner-app/src/pages/ComprehensiveAssessment.tsx`

```typescript
import { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { useTheme } from '@aivo/ui';
import axios from 'axios';
import { BigButton } from '../components/BigButton';
import { PageWrapper } from '../components/PageWrapper';
import { ProgressBar } from '../components/ProgressBar';

interface Question {
  id: string;
  subject: string;
  domain: string;
  question_text: string;
  question_type: 'multiple_choice' | 'short_answer';
  options?: string[];
  difficulty_level: number;
  question_order: number;
}

interface AssessmentData {
  assessment_id: string;
  total_questions: number;
  subjects: string[];
  estimated_minutes: number;
  questions: Question[];
}

export function ComprehensiveAssessment() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { themeConfig } = useTheme();
  const [searchParams] = useSearchParams();
  const scheduleId = searchParams.get('schedule_id');
  
  const [assessment, setAssessment] = useState<AssessmentData | null>(null);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [startTime, setStartTime] = useState(Date.now());
  
  useEffect(() => {
    loadAssessment();
  }, []);
  
  const loadAssessment = async () => {
    try {
      const response = await axios.post(
        `${import.meta.env.VITE_API_URL}/api/v1/assessments/comprehensive/create`,
        {
          learner_id: user.id,
          schedule_id: scheduleId,
          subjects: ['math', 'reading', 'science']
        }
      );
      
      setAssessment(response.data);
      setStartTime(Date.now());
    } catch (error) {
      console.error('Failed to load assessment:', error);
    } finally {
      setLoading(false);
    }
  };
  
  const handleAnswer = async (answer: string) => {
    if (!assessment) return;
    
    const question = assessment.questions[currentIndex];
    const timeSpent = Math.floor((Date.now() - startTime) / 1000);
    
    // Submit answer to backend
    setSubmitting(true);
    try {
      const response = await axios.post(
        `${import.meta.env.VITE_API_URL}/api/v1/assessments/comprehensive/answer`,
        {
          question_id: question.id,
          learner_answer: answer,
          time_spent_seconds: timeSpent
        }
      );
      
      // Show feedback
      const { correct, feedback } = response.data;
      
      // Save answer
      setAnswers(prev => ({ ...prev, [question.id]: answer }));
      
      // Move to next or complete
      if (currentIndex < assessment.questions.length - 1) {
        setCurrentIndex(prev => prev + 1);
        setStartTime(Date.now());
      } else {
        // Assessment complete
        await completeAssessment();
      }
    } catch (error) {
      console.error('Failed to submit answer:', error);
    } finally {
      setSubmitting(false);
    }
  };
  
  const completeAssessment = async () => {
    try {
      const response = await axios.post(
        `${import.meta.env.VITE_API_URL}/api/v1/assessments/comprehensive/complete`,
        {
          assessment_id: assessment?.assessment_id
        }
      );
      
      // Navigate to results with assessment data
      navigate(`/comprehensive-results?assessment_id=${assessment?.assessment_id}`);
    } catch (error) {
      console.error('Failed to complete assessment:', error);
    }
  };
  
  if (loading) {
    return (
      <PageWrapper>
        <div className="flex items-center justify-center min-h-screen">
          <div className="text-center">
            <div className="text-6xl mb-4">🧠</div>
            <p className="text-xl font-bold">Preparing your assessment...</p>
          </div>
        </div>
      </PageWrapper>
    );
  }
  
  if (!assessment) {
    return (
      <PageWrapper>
        <div className="text-center py-12">
          <p className="text-xl">Unable to load assessment</p>
          <BigButton onClick={() => navigate('/subjects')} variant="primary">
            Go Back
          </BigButton>
        </div>
      </PageWrapper>
    );
  }
  
  const question = assessment.questions[currentIndex];
  const progress = ((currentIndex + 1) / assessment.total_questions) * 100;
  
  return (
    <PageWrapper>
      <div className="max-w-4xl mx-auto py-8">
        {/* Progress Bar */}
        <div className="mb-8">
          <div className="flex justify-between mb-2">
            <span className="text-sm font-bold" style={{ color: themeConfig.colors.text }}>
              Question {currentIndex + 1} of {assessment.total_questions}
            </span>
            <span className="text-sm font-bold" style={{ color: themeConfig.colors.primary }}>
              {question.subject} - {question.domain}
            </span>
          </div>
          <ProgressBar value={progress} color={themeConfig.colors.primary} />
        </div>
        
        {/* Question Card */}
        <div className="bg-white rounded-3xl p-8 shadow-xl mb-8">
          <div className="mb-6">
            <span
              className="inline-block px-4 py-2 rounded-full text-sm font-bold mb-4"
              style={{
                backgroundColor: `${themeConfig.colors.primary}20`,
                color: themeConfig.colors.primary
              }}
            >
              Difficulty: {question.difficulty_level}/10
            </span>
          </div>
          
          <h2
            className="text-2xl font-bold mb-8"
            style={{ color: themeConfig.colors.text }}
          >
            {question.question_text}
          </h2>
          
          {/* Multiple Choice Options */}
          {question.question_type === 'multiple_choice' && question.options && (
            <div className="grid gap-4">
              {question.options.map((option, index) => (
                <BigButton
                  key={index}
                  onClick={() => handleAnswer(String(index))}
                  variant={index % 2 === 0 ? 'primary' : 'success'}
                  size="xl"
                  disabled={submitting}
                  className="text-left justify-start px-6"
                >
                  <span className="font-bold mr-4">{String.fromCharCode(65 + index)}.</span>
                  {option}
                </BigButton>
              ))}
            </div>
          )}
          
          {/* Short Answer */}
          {question.question_type === 'short_answer' && (
            <div>
              <textarea
                className="w-full p-4 rounded-xl border-2 text-lg"
                style={{
                  borderColor: themeConfig.colors.primary,
                  fontSize: themeConfig.fontSize.base
                }}
                rows={4}
                placeholder="Type your answer here..."
                onBlur={(e) => handleAnswer(e.target.value)}
              />
              <BigButton
                onClick={() => {
                  const textarea = document.querySelector('textarea');
                  if (textarea) handleAnswer(textarea.value);
                }}
                variant="primary"
                size="lg"
                disabled={submitting}
                className="mt-4"
              >
                Submit Answer
              </BigButton>
            </div>
          )}
        </div>
        
        {/* Subject Progress */}
        <div className="flex gap-4 justify-center">
          {assessment.subjects.map(subject => {
            const subjectQuestions = assessment.questions.filter(q => q.subject === subject);
            const answered = subjectQuestions.filter(q => answers[q.id]).length;
            const total = subjectQuestions.length;
            
            return (
              <div
                key={subject}
                className="bg-white rounded-xl px-6 py-3 shadow"
              >
                <p className="text-sm font-bold text-gray-600 capitalize">{subject}</p>
                <p className="text-xl font-bold" style={{ color: themeConfig.colors.primary }}>
                  {answered}/{total}
                </p>
              </div>
            );
          })}
        </div>
      </div>
    </PageWrapper>
  );
}
```

### 2. Add Route

**File**: `apps/learner-app/src/App.tsx`

```typescript
import { ComprehensiveAssessment } from './pages/ComprehensiveAssessment';

// Add route
<Route path="/comprehensive-assessment" element={
  <ProtectedRoute allowedRoles={['learner']}>
    <ComprehensiveAssessment />
  </ProtectedRoute>
} />

<Route path="/comprehensive-results" element={
  <ProtectedRoute allowedRoles={['learner']}>
    <ComprehensiveResults />
  </ProtectedRoute>
} />
```

---

## Implementation Checklist

### Phase 1: Database & Models
- [ ] Create `009_subject_assessment.sql` migration
- [ ] Run migration on database
- [ ] Create SQLAlchemy models
- [ ] Test database schema

### Phase 2: Backend Service
- [ ] Create `SubjectAssessmentService`
- [ ] Implement question generation (AI + templates)
- [ ] Implement answer evaluation
- [ ] Implement scoring logic
- [ ] Implement brain adaptation integration
- [ ] Create API endpoints
- [ ] Test with Postman/cURL

### Phase 3: Frontend
- [ ] Create `ComprehensiveAssessment.tsx`
- [ ] Create `ComprehensiveResults.tsx`
- [ ] Add routes to App.tsx
- [ ] Test question flow
- [ ] Test answer submission
- [ ] Test completion and results

### Phase 4: Integration
- [ ] Link PROMPT 58 quick assessment → PROMPT 61 comprehensive
- [ ] Test brain adaptation workflow
- [ ] Test 90-day scheduling
- [ ] Verify progress tracking

### Phase 5: Testing
- [ ] E2E test for complete flow
- [ ] Test AI question generation
- [ ] Test scoring accuracy
- [ ] Test brain model updates

---

## Success Criteria

✅ Quick assessment (PROMPT 58) triggers comprehensive assessment  
✅ 30 questions generated across 3 subjects  
✅ Questions have varying difficulty levels  
✅ Answers evaluated correctly (MC and short answer)  
✅ Detailed results with domain breakdowns  
✅ Brain model adapted based on results  
✅ Assessment history tracks both types  
✅ 90-day cycle continues automatically  

---

## Notes

- This system **extends** PROMPT 58, doesn't replace it
- Two-tier approach: Quick → Comprehensive
- Uses AI for question generation with template fallbacks
- Integrates with existing brain cloning service (PROMPT 57)
- More detailed than PROMPT 58 but takes longer to complete
- Consider implementing "adaptive testing" where difficulty adjusts based on answers
