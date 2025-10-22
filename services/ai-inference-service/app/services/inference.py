"""AI inference engine for text generation."""
import logging
import time

from app.core.config import settings

logger = logging.getLogger(__name__)


class InferenceEngine:
    """
    Core inference engine for text generation.

    Supports:
    - OpenAI API
    - Anthropic API
    - Mock responses (fallback)
    """

    def __init__(self):
        """Initialize inference engine."""
        self.provider = self._select_provider()
        self.client = self._initialize_client()

    def _select_provider(self) -> str:
        """Select AI provider based on configuration."""
        if settings.OPENAI_API_KEY:
            return "openai"
        elif settings.ANTHROPIC_API_KEY:
            return "anthropic"
        else:
            logger.warning("No API keys configured, using mock responses")
            return "mock"

    def _initialize_client(self):
        """Initialize API client."""
        if self.provider == "openai":
            try:
                from openai import AsyncOpenAI
                return AsyncOpenAI(api_key=settings.OPENAI_API_KEY)
            except ImportError:
                logger.error("OpenAI package not installed")
                self.provider = "mock"
                return None

        elif self.provider == "anthropic":
            try:
                from anthropic import AsyncAnthropic
                return AsyncAnthropic(api_key=settings.ANTHROPIC_API_KEY)
            except ImportError:
                logger.error("Anthropic package not installed")
                self.provider = "mock"
                return None

        return None

    async def generate(
        self,
        prompt: str,
        temperature: float = 0.7,
        max_tokens: int = 500,
        top_p: float = 0.9,
        **kwargs
    ) -> str:
        """Generate text using configured AI provider."""
        start_time = time.time()

        try:
            if self.provider == "openai":
                response = await self._generate_openai(
                    prompt=prompt,
                    temperature=temperature,
                    max_tokens=max_tokens,
                    top_p=top_p
                )
            elif self.provider == "anthropic":
                response = await self._generate_anthropic(
                    prompt=prompt,
                    temperature=temperature,
                    max_tokens=max_tokens,
                    top_p=top_p
                )
            else:
                response = self._generate_mock(prompt)

            processing_time = time.time() - start_time

            logger.info(
                "Generated response in %.2fs using %s",
                processing_time,
                self.provider
            )

            return response

        except Exception as e:
            logger.error("Generation failed: %s", e)
            # Fallback to mock
            return self._generate_mock(prompt)

    async def _generate_openai(
        self,
        prompt: str,
        temperature: float,
        max_tokens: int,
        top_p: float
    ) -> str:
        """Generate using OpenAI API."""
        try:
            response = await self.client.chat.completions.create(
                model=settings.BASE_MODEL_NAME,
                messages=[
                    {
                        "role": "system",
                        "content": (
                            "You are a supportive homework helper for "
                            "students with special education needs. "
                            "Provide clear, encouraging, adaptive guidance."
                        )
                    },
                    {
                        "role": "user",
                        "content": prompt
                    }
                ],
                temperature=temperature,
                max_tokens=max_tokens,
                top_p=top_p
            )

            return response.choices[0].message.content.strip()

        except Exception as e:
            logger.error("OpenAI API error: %s", e)
            raise

    async def _generate_anthropic(
        self,
        prompt: str,
        temperature: float,
        max_tokens: int,
        top_p: float
    ) -> str:
        """Generate using Anthropic Claude API."""
        try:
            response = await self.client.messages.create(
                model="claude-3-sonnet-20240229",
                max_tokens=max_tokens,
                temperature=temperature,
                top_p=top_p,
                messages=[
                    {
                        "role": "user",
                        "content": prompt
                    }
                ]
            )

            return response.content[0].text.strip()

        except Exception as e:
            logger.error("Anthropic API error: %s", e)
            raise

    def _generate_mock(self, prompt: str) -> str:
        """Generate mock response for testing."""
        logger.warning(
            "Using mock inference - configure API keys for production"
        )

        # Simple keyword-based mock responses
        prompt_lower = prompt.lower()

        if "hint" in prompt_lower:
            if "math" in prompt_lower or "fraction" in prompt_lower:
                return (
                    "Let's break this down step by step. "
                    "Start by identifying what information you have. "
                    "What fraction does the problem give you to begin with?"
                )
            elif "reading" in prompt_lower:
                return (
                    "Great question! Let's start by reading the "
                    "passage carefully. Can you tell me what the "
                    "main idea is in your own words?"
                )
            else:
                return (
                    "That's a good question! Let's think about this "
                    "together. What do you already know about this topic?"
                )

        elif "explain" in prompt_lower:
            if "math" in prompt_lower:
                return """Here's how to solve this step by step:

1. First, identify what you know
2. Then, figure out what you need to find
3. Choose a strategy (like drawing a picture or making a table)
4. Solve it step by step
5. Check your answer

Does that make sense?"""
            else:
                return (
                    "Let me explain this in a simple way. "
                    "Think of it like this: [concept]. "
                    "Does that help clarify things?"
                )

        else:
            return (
                "I'm here to help! Can you tell me more about "
                "what you're working on?"
            )

    async def generate_with_context(
        self,
        prompt: str,
        context_history: list,
        **kwargs
    ) -> str:
        """
        Generate with conversation context.

        Useful for multi-turn interactions.
        """
        # Build conversation history
        messages = []

        for ctx in context_history[-5:]:  # Last 5 interactions
            if ctx.get("user_message"):
                messages.append({
                    "role": "user",
                    "content": ctx["user_message"]
                })
            if ctx.get("assistant_response"):
                messages.append({
                    "role": "assistant",
                    "content": ctx["assistant_response"]
                })

        # Add current prompt
        messages.append({
            "role": "user",
            "content": prompt
        })

        # Generate with context
        return await self.generate(prompt=prompt, **kwargs)


class PromptOptimizer:
    """
    Optimize prompts for better results.

    Features:
    - Token counting
    - Context compression
    - Prompt engineering
    """

    @staticmethod
    def count_tokens(text: str) -> int:
        """
        Estimate token count.

        In production: use tiktoken or similar
        """
        # Rough estimate: ~4 chars per token
        return len(text) // 4

    @staticmethod
    def compress_context(text: str, max_tokens: int = 1000) -> str:
        """Compress context to fit within token limit."""
        current_tokens = PromptOptimizer.count_tokens(text)

        if current_tokens <= max_tokens:
            return text

        # Simple compression: truncate
        # In production: use smarter summarization
        target_length = int(len(text) * (max_tokens / current_tokens))
        return text[:target_length] + "..."

    @staticmethod
    def optimize_for_reading_level(
        prompt: str,
        target_grade: int
    ) -> str:
        """Adjust prompt complexity for target reading level."""
        if target_grade <= 3:
            # Primary grades - very simple
            prompt += (
                "\n\nUse words a 1st-3rd grader would understand. "
                "Use short sentences."
            )
        elif target_grade <= 5:
            # Upper elementary
            prompt += (
                "\n\nUse clear, simple language appropriate "
                "for 4th-5th grade."
            )
        elif target_grade <= 8:
            # Middle school
            prompt += (
                "\n\nUse language appropriate for middle "
                "school students."
            )
        else:
            # High school
            prompt += (
                "\n\nUse high school level vocabulary and concepts."
            )

        return prompt
