"""Prompt templates for AI inference and hint generation."""
from typing import List


class PromptTemplates:
    """Prompt templates for different learning scenarios."""

    @staticmethod
    def get_hint_template(
        problem_context: str,
        current_attempt: str,
        complexity_level: str,
        learning_style: str,
        diagnoses: List[str],
        subject: str,
        grade_level: str
    ) -> str:
        """Generate a hint prompt template."""
        base_prompt = f"""You are an adaptive learning assistant helping a {grade_level} student with {subject}.

Problem Context: {problem_context}
Current Attempt: {current_attempt if current_attempt else 'Not started yet'}

Learning Profile:
- Learning Style: {learning_style}
- Complexity Level: {complexity_level}
- Diagnoses: {', '.join(diagnoses) if diagnoses else 'None'}

Generate a {complexity_level} hint that:
1. Guides without giving away the answer
2. Matches the {learning_style} learning style
3. Uses appropriate language for {grade_level} level
"""

        # Add diagnosis-specific adaptations
        if "adhd" in diagnoses:
            base_prompt += """
- Break information into small, clear chunks
- Use bullet points and numbered lists
- Keep sentences short and direct
"""

        if "asd" in diagnoses:
            base_prompt += """
- Use explicit, literal language
- Provide clear step-by-step instructions
- Include visual structure markers
"""

        if "dyslexia" in diagnoses:
            base_prompt += """
- Avoid long blocks of text
- Use clear, simple vocabulary
- Provide phonetic breakdowns if needed
"""

        if "anxiety" in diagnoses:
            base_prompt += """
- Use encouraging, supportive language
- Emphasize that mistakes are part of learning
- Provide reassurance and positive feedback
"""

        base_prompt += """
Generate the hint now, following these guidelines.
"""

        return base_prompt

    @staticmethod
    def get_explanation_template(
        concept: str,
        subject: str,
        grade_level: str,
        complexity_level: str,
        learning_style: str,
        diagnoses: List[str]
    ) -> str:
        """Generate an explanation prompt template."""
        base_prompt = f"""You are an expert tutor explaining {concept} to a {grade_level} student studying {subject}.

Learning Profile:
- Learning Style: {learning_style}
- Complexity Level: {complexity_level}
- Diagnoses: {', '.join(diagnoses) if diagnoses else 'None'}

Explain {concept} in a way that:
1. Matches a {complexity_level} complexity level
2. Suits a {learning_style} learner
3. Is appropriate for {grade_level}
4. Includes relevant examples and analogies
"""

        # Add learning style adaptations
        if learning_style == "visual":
            base_prompt += """
- Describe visual representations
- Use spatial language
- Suggest diagrams or charts
"""
        elif learning_style == "auditory":
            base_prompt += """
- Use rhythmic patterns
- Include mnemonic devices
- Suggest discussion or verbal practice
"""
        elif learning_style == "kinesthetic":
            base_prompt += """
- Include hands-on activities
- Use movement-based analogies
- Suggest interactive practice
"""

        # Add diagnosis adaptations
        if "adhd" in diagnoses:
            base_prompt += """
- Keep explanation concise
- Use engaging, dynamic language
- Break into manageable sections
"""

        if "asd" in diagnoses:
            base_prompt += """
- Use concrete, specific examples
- Maintain consistent structure
- Avoid figurative language unless explained
"""

        base_prompt += """
Provide your explanation now.
"""

        return base_prompt

    @staticmethod
    def get_assessment_template(
        question: str,
        subject: str,
        grade_level: str,
        diagnoses: List[str]
    ) -> str:
        """Generate an assessment prompt template."""
        base_prompt = f"""Generate a {grade_level} level {subject} question based on: {question}

The question should:
1. Be clear and unambiguous
2. Match {grade_level} difficulty
3. Be accessible to students with: {', '.join(diagnoses) if diagnoses else 'typical needs'}

Special Considerations:
"""

        if "dyslexia" in diagnoses:
            base_prompt += "- Minimize reading load\n"
            base_prompt += "- Use simple, clear language\n"

        if "adhd" in diagnoses:
            base_prompt += "- Keep question concise\n"
            base_prompt += "- Avoid multi-step complexity\n"

        if "asd" in diagnoses:
            base_prompt += "- Use literal language\n"
            base_prompt += "- Provide explicit instructions\n"

        base_prompt += """
Generate the question now.
"""

        return base_prompt

    @staticmethod
    def get_feedback_template(
        student_response: str,
        correct_answer: str,
        subject: str,
        grade_level: str,
        is_correct: bool,
        diagnoses: List[str]
    ) -> str:
        """Generate a feedback prompt template."""
        status = "correct" if is_correct else "incorrect"

        base_prompt = f"""Provide feedback for a {grade_level} student's {status} answer in {subject}.

Student Response: {student_response}
Correct Answer: {correct_answer}
Status: {status}

Generate feedback that:
1. Is encouraging and constructive
2. Explains why the answer is {status}
3. Guides toward understanding if incorrect
4. Appropriate for students with: {', '.join(diagnoses) if diagnoses else 'typical needs'}
"""

        if "anxiety" in diagnoses:
            base_prompt += """
- Use very positive, supportive language
- Emphasize growth and learning
- Minimize stress-inducing language
"""

        if "adhd" in diagnoses:
            base_prompt += """
- Keep feedback brief and focused
- Use clear, direct language
- Highlight specific actions to take
"""

        base_prompt += """
Provide your feedback now.
"""

        return base_prompt
