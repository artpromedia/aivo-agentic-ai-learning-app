"""
Multi-Provider AI Service for Baseline Assessment
Priority: Aivo Brain → OpenAI → Anthropic → Gemini → Meta Llama → Mock
The Aivo Brain is trained on worldwide curriculum data and should be used first.
"""

import json
import logging
import os
import time
from typing import Any, Dict, List, Optional, Tuple

from app.services.aivo_brain_service import AivoBrainService, generate_question_sync

logger = logging.getLogger(__name__)


class MultiProviderAIService:
    """
    Multi-provider AI service with automatic fallback for baseline assessment
    question generation.

    Provider Priority (configurable):
    1. Primary provider (from environment or config)
    2. Secondary provider (fallback)
    3. Tertiary provider (fallback)
    4. Mock responses (ultimate fallback)
    """

    def __init__(
        self, primary_provider: Optional[str] = None, fallback_providers: Optional[List[str]] = None
    ):
        """
        Initialize multi-provider AI service

        Args:
            primary_provider: Preferred provider ('openai', 'anthropic', 'gemini', 'llama')
            fallback_providers: Ordered list of fallback providers
        """
        self.primary_provider = primary_provider or self._detect_primary_provider()
        self.fallback_providers = fallback_providers or self._default_fallback_chain()

        # Initialize all available clients
        self.clients = {}
        self._initialize_clients()

        logger.info(
            f"MultiProviderAI initialized: primary={self.primary_provider}, "
            f"fallbacks={self.fallback_providers}"
        )

    def _detect_primary_provider(self) -> str:
        """Detect primary provider from environment variables"""
        if os.getenv("OPENAI_API_KEY"):
            return "openai"
        elif os.getenv("ANTHROPIC_API_KEY"):
            return "anthropic"
        elif os.getenv("GOOGLE_API_KEY"):
            return "gemini"
        elif os.getenv("REPLICATE_API_TOKEN"):
            return "llama"
        else:
            logger.warning("No API keys found, will use mock responses")
            return "mock"

    def _default_fallback_chain(self) -> List[str]:
        """Create default fallback chain based on available API keys"""
        available = []

        if os.getenv("ANTHROPIC_API_KEY"):
            available.append("anthropic")
        if os.getenv("GOOGLE_API_KEY"):
            available.append("gemini")
        if os.getenv("OPENAI_API_KEY"):
            available.append("openai")
        if os.getenv("REPLICATE_API_TOKEN"):
            available.append("llama")

        # Remove primary from fallbacks
        primary = self._detect_primary_provider()
        return [p for p in available if p != primary]

    def _initialize_clients(self):
        """Initialize all available AI provider clients"""
        # OpenAI
        if os.getenv("OPENAI_API_KEY"):
            try:
                import openai

                self.clients["openai"] = openai.OpenAI(api_key=os.getenv("OPENAI_API_KEY"))
                logger.info("✓ OpenAI client initialized")
            except ImportError:
                logger.warning("OpenAI package not installed")
            except Exception as e:
                logger.error(f"Failed to initialize OpenAI: {e}")

        # Anthropic (Claude)
        if os.getenv("ANTHROPIC_API_KEY"):
            try:
                import anthropic

                self.clients["anthropic"] = anthropic.Anthropic(
                    api_key=os.getenv("ANTHROPIC_API_KEY")
                )
                logger.info("✓ Anthropic client initialized")
            except ImportError:
                logger.warning("Anthropic package not installed")
            except Exception as e:
                logger.error(f"Failed to initialize Anthropic: {e}")

        # Google Gemini
        if os.getenv("GOOGLE_API_KEY"):
            try:
                import google.generativeai as genai

                genai.configure(api_key=os.getenv("GOOGLE_API_KEY"))
                self.clients["gemini"] = genai
                logger.info("✓ Google Gemini client initialized")
            except ImportError:
                logger.warning("Google Generative AI package not installed")
            except Exception as e:
                logger.error(f"Failed to initialize Gemini: {e}")

        # Meta Llama via Replicate
        if os.getenv("REPLICATE_API_TOKEN"):
            try:
                import replicate

                self.clients["llama"] = replicate.Client(api_token=os.getenv("REPLICATE_API_TOKEN"))
                logger.info("✓ Meta Llama (Replicate) client initialized")
            except ImportError:
                logger.warning("Replicate package not installed")
            except Exception as e:
                logger.error(f"Failed to initialize Llama: {e}")

    def generate_question(
        self,
        prompt: str,
        temperature: float = 0.7,
        max_tokens: int = 2000,
        model_override: Optional[str] = None,
    ) -> Tuple[Dict[str, Any], Dict[str, Any]]:
        """
        Generate assessment question using multi-provider fallback

        Args:
            prompt: Generation prompt
            temperature: Sampling temperature
            max_tokens: Maximum tokens to generate
            model_override: Force specific model (e.g., 'gpt-4', 'claude-3-5-sonnet')

        Returns:
            Tuple of (generated_question_dict, metadata_dict)
            metadata includes: provider_used, model_used, fallback_occurred, etc.
        """
        providers_to_try = [self.primary_provider] + self.fallback_providers

        for i, provider in enumerate(providers_to_try):
            if provider not in self.clients and provider != "mock":
                continue

            try:
                start_time = time.time()

                if provider == "openai":
                    question, model = self._generate_openai(
                        prompt, temperature, max_tokens, model_override
                    )
                elif provider == "anthropic":
                    question, model = self._generate_anthropic(
                        prompt, temperature, max_tokens, model_override
                    )
                elif provider == "gemini":
                    question, model = self._generate_gemini(
                        prompt, temperature, max_tokens, model_override
                    )
                elif provider == "llama":
                    question, model = self._generate_llama(
                        prompt, temperature, max_tokens, model_override
                    )
                else:
                    question, model = self._generate_mock(prompt), "mock"

                latency_ms = (time.time() - start_time) * 1000

                metadata = {
                    "provider_used": provider,
                    "model_used": model,
                    "fallback_occurred": i > 0,
                    "fallback_chain": providers_to_try[: i + 1] if i > 0 else None,
                    "latency_ms": round(latency_ms, 2),
                    "timestamp": time.time(),
                }

                logger.info(
                    f"✓ Question generated using {provider} ({model}) in {latency_ms:.0f}ms"
                )

                return question, metadata

            except Exception as e:
                logger.warning(f"Provider {provider} failed: {e}. Trying fallback...")
                if i == len(providers_to_try) - 1:
                    # Last provider failed, use mock
                    logger.error("All providers failed, using mock response")
                    return self._generate_mock(prompt), {
                        "provider_used": "mock",
                        "model_used": "mock",
                        "fallback_occurred": True,
                        "fallback_chain": providers_to_try,
                        "error": "All providers failed",
                    }

        # Shouldn't reach here, but return mock as safety
        return self._generate_mock(prompt), {
            "provider_used": "mock",
            "model_used": "mock",
            "error": "Unexpected fallback path",
        }

    def _generate_openai(
        self, prompt: str, temperature: float, max_tokens: int, model_override: Optional[str]
    ) -> Tuple[Dict[str, Any], str]:
        """Generate using OpenAI GPT"""
        client = self.clients["openai"]

        # Model selection
        model = model_override or os.getenv("OPENAI_MODEL", "gpt-4-turbo")

        response = client.chat.completions.create(
            model=model,
            messages=[
                {
                    "role": "system",
                    "content": (
                        "You are an expert educational assessment designer. "
                        "Always return valid JSON only, no markdown."
                    ),
                },
                {"role": "user", "content": prompt},
            ],
            temperature=temperature,
            max_tokens=max_tokens,
            response_format={"type": "json_object"},
        )

        response_text = response.choices[0].message.content.strip()
        question = json.loads(response_text)

        return question, model

    def _generate_anthropic(
        self, prompt: str, temperature: float, max_tokens: int, model_override: Optional[str]
    ) -> Tuple[Dict[str, Any], str]:
        """Generate using Anthropic Claude"""
        client = self.clients["anthropic"]

        # Model selection
        model = model_override or os.getenv("ANTHROPIC_MODEL", "claude-3-5-sonnet-20241022")

        message = client.messages.create(
            model=model,
            max_tokens=max_tokens,
            temperature=temperature,
            system=(
                "You are an expert educational assessment designer. "
                "Always return valid JSON only, no markdown."
            ),
            messages=[{"role": "user", "content": prompt}],
        )

        response_text = message.content[0].text.strip()

        # Remove markdown code blocks if present
        if response_text.startswith("```json"):
            response_text = response_text[7:]
        if response_text.startswith("```"):
            response_text = response_text[3:]
        if response_text.endswith("```"):
            response_text = response_text[:-3]

        question = json.loads(response_text.strip())

        return question, model

    def _generate_gemini(
        self, prompt: str, temperature: float, max_tokens: int, model_override: Optional[str]
    ) -> Tuple[Dict[str, Any], str]:
        """Generate using Google Gemini"""
        genai = self.clients["gemini"]

        # Model selection
        model_name = model_override or os.getenv("GEMINI_MODEL", "gemini-1.5-pro-latest")

        model = genai.GenerativeModel(
            model_name=model_name,
            generation_config={
                "temperature": temperature,
                "max_output_tokens": max_tokens,
                "response_mime_type": "application/json",
            },
        )

        response = model.generate_content(
            f"You are an expert educational assessment designer. "
            f"Always return valid JSON only.\n\n{prompt}"
        )

        response_text = response.text.strip()
        question = json.loads(response_text)

        return question, model_name

    def _generate_llama(
        self, prompt: str, temperature: float, max_tokens: int, model_override: Optional[str]
    ) -> Tuple[Dict[str, Any], str]:
        """Generate using Meta Llama via Replicate"""
        client = self.clients["llama"]

        # Model selection - using Llama 3.1 70B Instruct
        model_name = model_override or os.getenv("LLAMA_MODEL", "meta/meta-llama-3.1-70b-instruct")

        # Prepare the prompt with system instruction
        full_prompt = (
            "You are an expert educational assessment designer. "
            "Always return valid JSON only, no markdown or explanatory text.\n\n"
            f"{prompt}"
        )

        # Run the model
        output = client.run(
            model_name,
            input={
                "prompt": full_prompt,
                "temperature": temperature,
                "max_tokens": max_tokens,
                "top_p": 0.9,
            },
        )

        # Replicate returns a generator, join the output
        response_text = "".join(output).strip()

        # Remove markdown code blocks if present
        if response_text.startswith("```json"):
            response_text = response_text[7:]
        if response_text.startswith("```"):
            response_text = response_text[3:]
        if response_text.endswith("```"):
            response_text = response_text[:-3]

        question = json.loads(response_text.strip())

        return question, model_name

    def _generate_mock(self, prompt: str) -> Dict[str, Any]:
        """Generate mock question (fallback)"""
        logger.warning("Using mock question generation")

        return {
            "stem": "What is 2 + 2? (Mock Question - No AI Provider Available)",
            "stimulus": None,
            "stimulus_type": None,
            "item_type": "single_choice",
            "sub_domain": "operations",
            "options": [
                {"id": "a", "label": "3", "correct": False},
                {"id": "b", "label": "4", "correct": True},
                {"id": "c", "label": "5", "correct": False},
                {"id": "d", "label": "6", "correct": False},
            ],
            "correct_answer_explanation": "2 + 2 = 4",
            "hint_text": "Count on your fingers",
            "estimated_difficulty": 0.0,
            "estimated_discrimination": 1.0,
            "estimated_guessing": 0.25,
            "cognitive_level": "remember",
            "estimated_time_seconds": 30,
            "standards_alignment": ["MOCK.STANDARD"],
            "accessibility_features": {
                "reading_level": "Grade 1",
                "visual_supports": False,
                "scaffolding_included": False,
            },
            "neurodiverse_friendly": True,
        }

    def get_available_providers(self) -> List[str]:
        """Get list of available providers"""
        return list(self.clients.keys())

    def get_provider_status(self) -> Dict[str, Any]:
        """Get status of all providers"""
        return {
            "primary": self.primary_provider,
            "fallbacks": self.fallback_providers,
            "available": list(self.clients.keys()),
            "clients_initialized": len(self.clients),
        }
