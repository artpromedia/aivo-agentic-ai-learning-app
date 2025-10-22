"""AI inference engine for text generation."""
from typing import Dict, Any, Optional
from openai import AsyncOpenAI
from anthropic import AsyncAnthropic

from app.core.config import settings
from app.models.brain_instance import (
    BrainInstance,
    InferenceRequest,
    InferenceResponse
)


class InferenceEngine:
    """Handles AI inference using OpenAI or Anthropic."""

    def __init__(self):
        """Initialize inference engine."""
        self.openai_client = None
        self.anthropic_client = None

        if settings.OPENAI_API_KEY:
            self.openai_client = AsyncOpenAI(api_key=settings.OPENAI_API_KEY)

        if settings.ANTHROPIC_API_KEY:
            self.anthropic_client = AsyncAnthropic(
                api_key=settings.ANTHROPIC_API_KEY
            )

    async def generate(
        self,
        brain: BrainInstance,
        inference_request: InferenceRequest
    ) -> InferenceResponse:
        """Generate AI response using brain instance."""
        # Use brain's model parameters
        temperature = (
            inference_request.temperature
            or brain.model_params.get("temperature")
            or settings.DEFAULT_TEMPERATURE
        )
        max_tokens = (
            inference_request.max_tokens
            or brain.model_params.get("max_tokens")
            or settings.DEFAULT_MAX_TOKENS
        )

        # Build context-aware prompt
        full_prompt = self._build_prompt(
            inference_request.prompt,
            brain,
            inference_request.context
        )

        # Choose provider based on configuration
        if self.openai_client and "gpt" in settings.BASE_MODEL_NAME.lower():
            response_text, tokens_used, response_time = (
                await self._generate_openai(
                    full_prompt,
                    temperature,
                    max_tokens
                )
            )
        elif self.anthropic_client:
            response_text, tokens_used, response_time = (
                await self._generate_anthropic(
                    full_prompt,
                    temperature,
                    max_tokens
                )
            )
        else:
            # Fallback to mock response
            response_text = "AI inference service not configured."
            tokens_used = 0
            response_time = 0.0

        return InferenceResponse(
            brain_id=brain.brain_id,
            response_text=response_text,
            tokens_used=tokens_used,
            response_time_ms=response_time,
            complexity_level=brain.learning_profile.preferred_complexity,
            metadata={
                "model": settings.BASE_MODEL_NAME,
                "temperature": temperature,
                "max_tokens": max_tokens
            }
        )

    def _build_prompt(
        self,
        base_prompt: str,
        brain: BrainInstance,
        context: Optional[Dict[str, Any]]
    ) -> str:
        """Build context-aware prompt."""
        # Add learner profile context
        profile = brain.learning_profile
        context_parts = [
            f"Learning Style: {profile.learning_style.value}",
            f"Grade Level: {profile.grade_level}",
            f"Support Level: {profile.support_level}",
        ]

        if profile.diagnoses:
            diagnosis_str = ", ".join([d.value for d in profile.diagnoses])
            context_parts.append(f"Diagnoses: {diagnosis_str}")

        profile_context = "\n".join(context_parts)

        # Combine with base prompt
        full_prompt = f"""Context:
{profile_context}

{base_prompt}
"""

        return full_prompt

    async def _generate_openai(
        self,
        prompt: str,
        temperature: float,
        max_tokens: int
    ) -> tuple[str, int, float]:
        """Generate response using OpenAI."""
        import time
        start_time = time.time()

        response = await self.openai_client.chat.completions.create(
            model=settings.BASE_MODEL_NAME,
            messages=[{"role": "user", "content": prompt}],
            temperature=temperature,
            max_tokens=max_tokens
        )

        response_time = (time.time() - start_time) * 1000  # Convert to ms
        response_text = response.choices[0].message.content or ""
        tokens_used = response.usage.total_tokens if response.usage else 0

        return response_text, tokens_used, response_time

    async def _generate_anthropic(
        self,
        prompt: str,
        temperature: float,
        max_tokens: int
    ) -> tuple[str, int, float]:
        """Generate response using Anthropic."""
        import time
        start_time = time.time()

        response = await self.anthropic_client.messages.create(
            model="claude-3-opus-20240229",
            max_tokens=max_tokens,
            temperature=temperature,
            messages=[{"role": "user", "content": prompt}]
        )

        response_time = (time.time() - start_time) * 1000
        response_text = ""
        if response.content:
            response_text = response.content[0].text

        tokens_used = (
            response.usage.input_tokens + response.usage.output_tokens
            if response.usage else 0
        )

        return response_text, tokens_used, response_time
