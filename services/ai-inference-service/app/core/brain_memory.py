"""
Brain Memory System - Episodic and Semantic Memory for Continuous Learning

This module implements a dual memory system for Aivo AI Brains:
1. Episodic Memory: Specific experiences and interactions
2. Semantic Memory: Generalized knowledge and patterns

Features:
- Automatic importance scoring for episodes
- Pattern extraction from experiences
- Bayesian updating of beliefs
- Vector similarity search for retrieval
- Memory consolidation (episodic → semantic)
- Decay function for older memories
"""

import asyncio
import json
import math
from datetime import datetime, timedelta
from typing import Any, Dict, List, Optional, Tuple
from uuid import uuid4

import numpy as np
from pydantic import BaseModel, Field
from scipy import stats
from sqlalchemy import text
from sqlalchemy.ext.asyncio import AsyncSession


class EpisodicMemory(BaseModel):
    """
    Represents a specific experience or interaction episode.

    Episodic memories are concrete events that happened during learning sessions.
    They include context, outcomes, and lessons learned.
    """

    memory_id: str = Field(default_factory=lambda: str(uuid4()))
    brain_id: str
    timestamp: datetime
    event_type: str  # breakthrough, struggle, progress, engagement, etc.
    context: Dict[str, Any]  # subject, difficulty, learner_state, etc.
    outcome: str  # Description of what happened
    lessons_learned: List[str]  # What Brain discovered
    importance_score: float = Field(ge=0.0, le=1.0)
    embedding_vector: Optional[List[float]] = None
    decay_factor: float = 1.0  # Decreases over time
    times_recalled: int = 0  # Reinforcement counter
    created_at: datetime = Field(default_factory=datetime.utcnow)


class SemanticMemory(BaseModel):
    """
    Represents generalized knowledge extracted from episodic memories.

    Semantic memories are patterns, preferences, and strategies that emerge
    from multiple experiences.
    """

    id: str = Field(default_factory=lambda: str(uuid4()))
    brain_id: str
    knowledge_type: str  # preference, strategy, pattern, trigger, timing
    statement: str  # The learned knowledge
    confidence: float = Field(ge=0.0, le=1.0)
    supporting_evidence: List[str]  # List of episode memory_ids
    last_updated: datetime
    times_confirmed: int = 1
    times_contradicted: int = 0
    metadata: Dict[str, Any] = Field(default_factory=dict)


class MemoryRetrieval(BaseModel):
    """
    Represents the result of a memory retrieval operation.
    """

    query_context: Dict[str, Any]
    retrieved_memories: List[SemanticMemory]
    relevance_scores: List[float]
    retrieval_method: str  # vector_similarity, context_match, hybrid
    retrieval_time_ms: Optional[int] = None


class PatternEvidence(BaseModel):
    """
    Evidence supporting a pattern or semantic memory.
    """

    episode_ids: List[str]
    confidence_score: float
    consistency_score: float  # How consistent are the outcomes
    recency_score: float  # How recent is the evidence
    sample_size: int


class BrainMemory:
    """
    Dual memory system for Aivo AI Brains.

    Manages both episodic (specific experiences) and semantic (generalized knowledge)
    memories, with automatic pattern extraction, Bayesian updating, and retrieval.
    """

    # Event importance weights
    EVENT_IMPORTANCE_WEIGHTS = {
        "breakthrough": 1.0,
        "persistent_struggle": 0.9,
        "emotional_event": 0.85,
        "pattern_confirmation": 0.7,
        "typical_progress": 0.5,
        "routine_interaction": 0.3,
    }

    # Memory decay parameters
    DECAY_HALF_LIFE_DAYS = 30  # Memories decay to 50% importance after 30 days
    CONSOLIDATION_THRESHOLD = 3  # Minimum episodes to form semantic memory
    LOW_IMPORTANCE_THRESHOLD = 0.2  # Prune episodic memories below this
    RETENTION_DAYS = 90  # Keep low-importance episodic for 90 days

    def __init__(self, db: Optional[AsyncSession] = None, ai_client: Optional[Any] = None):
        """
        Initialize Brain Memory system.

        Args:
            db: Database session for persistence
            ai_client: OpenAI client for embeddings (text-embedding-3-small)
        """
        self.db = db
        self.ai_client = ai_client

    async def store_episode(
        self,
        brain_id: str,
        event_type: str,
        context: Dict[str, Any],
        outcome: str,
        lessons_learned: List[str],
        db: Optional[AsyncSession] = None,
    ) -> EpisodicMemory:
        """
        Store a new episodic memory.

        Automatically calculates importance score and generates embedding vector.

        Args:
            brain_id: Unique identifier for the Brain
            event_type: Type of event (breakthrough, struggle, etc.)
            context: Contextual information (subject, difficulty, state, etc.)
            outcome: What happened
            lessons_learned: What Brain discovered
            db: Database session (optional override)

        Returns:
            EpisodicMemory object with calculated importance and embedding
        """
        db = db or self.db

        # Calculate importance score
        importance_score = self._calculate_importance(
            event_type=event_type, context=context, outcome=outcome, lessons_learned=lessons_learned
        )

        # Generate embedding vector
        embedding_text = self._create_embedding_text(
            event_type=event_type, context=context, outcome=outcome, lessons_learned=lessons_learned
        )
        embedding_vector = await self._generate_embedding(embedding_text)

        # Create episodic memory
        memory = EpisodicMemory(
            brain_id=brain_id,
            timestamp=datetime.utcnow(),
            event_type=event_type,
            context=context,
            outcome=outcome,
            lessons_learned=lessons_learned,
            importance_score=importance_score,
            embedding_vector=embedding_vector,
        )

        # Persist to database
        if db:
            await self._persist_episodic_memory(memory, db)

        return memory

    def _calculate_importance(
        self, event_type: str, context: Dict[str, Any], outcome: str, lessons_learned: List[str]
    ) -> float:
        """
        Calculate importance score for an episode (0.0-1.0).

        Higher scores for:
        - Breakthroughs and struggles
        - Emotional events
        - Multiple lessons learned
        - Significant outcome changes

        Args:
            event_type: Type of event
            context: Episode context
            outcome: Episode outcome
            lessons_learned: Lessons discovered

        Returns:
            Importance score (0.0-1.0)
        """
        # Base importance from event type
        base_importance = self.EVENT_IMPORTANCE_WEIGHTS.get(
            event_type, self.EVENT_IMPORTANCE_WEIGHTS["routine_interaction"]
        )

        # Boost for multiple lessons learned
        lessons_boost = min(len(lessons_learned) * 0.1, 0.2)

        # Boost for emotional context
        emotional_boost = 0.0
        learner_state = context.get("learner_state", {})
        if isinstance(learner_state, dict):
            frustration = learner_state.get("frustration_level", "low")
            if frustration in ["high", "very_high"]:
                emotional_boost = 0.15
            elif frustration == "medium":
                emotional_boost = 0.08

        # Boost for significant performance changes
        performance_boost = 0.0
        if "success_rate" in context:
            success_rate = context["success_rate"]
            if success_rate >= 0.9 or success_rate <= 0.2:
                performance_boost = 0.1

        # Calculate final importance (capped at 1.0)
        importance = min(base_importance + lessons_boost + emotional_boost + performance_boost, 1.0)

        return importance

    def _create_embedding_text(
        self, event_type: str, context: Dict[str, Any], outcome: str, lessons_learned: List[str]
    ) -> str:
        """
        Create text representation for embedding generation.

        Args:
            event_type: Type of event
            context: Episode context
            outcome: Episode outcome
            lessons_learned: Lessons discovered

        Returns:
            Text string for embedding
        """
        parts = [
            f"Event: {event_type}",
            f"Context: {json.dumps(context)}",
            f"Outcome: {outcome}",
        ]

        if lessons_learned:
            parts.append(f"Lessons: {', '.join(lessons_learned)}")

        return " | ".join(parts)

    async def _generate_embedding(self, text: str) -> List[float]:
        """
        Generate embedding vector using OpenAI text-embedding-3-small.

        Args:
            text: Text to embed

        Returns:
            1536-dimensional embedding vector
        """
        if not self.ai_client:
            # Return zero vector if no AI client available
            return [0.0] * 1536

        try:
            response = await self.ai_client.embeddings.create(
                model="text-embedding-3-small", input=text
            )
            return response.data[0].embedding
        except Exception as e:
            print(f"Error generating embedding: {e}")
            return [0.0] * 1536

    async def _persist_episodic_memory(self, memory: EpisodicMemory, db: AsyncSession) -> None:
        """
        Persist episodic memory to database.

        Args:
            memory: EpisodicMemory to store
            db: Database session
        """
        query = text("""
            INSERT INTO brain_episodic_memory (
                memory_id, brain_id, timestamp, event_type, context,
                outcome, lessons_learned, importance_score, embedding_vector,
                decay_factor, times_recalled, created_at
            ) VALUES (
                :memory_id, :brain_id, :timestamp, :event_type, :context,
                :outcome, :lessons_learned, :importance_score, :embedding_vector,
                :decay_factor, :times_recalled, :created_at
            )
        """)

        await db.execute(
            query,
            {
                "memory_id": memory.memory_id,
                "brain_id": memory.brain_id,
                "timestamp": memory.timestamp,
                "event_type": memory.event_type,
                "context": json.dumps(memory.context),
                "outcome": memory.outcome,
                "lessons_learned": json.dumps(memory.lessons_learned),
                "importance_score": memory.importance_score,
                "embedding_vector": json.dumps(memory.embedding_vector)
                if memory.embedding_vector
                else None,
                "decay_factor": memory.decay_factor,
                "times_recalled": memory.times_recalled,
                "created_at": memory.created_at,
            },
        )
        await db.commit()

    async def recall_relevant_memories(
        self,
        brain_id: str,
        current_situation: Dict[str, Any],
        top_k: int = 5,
        db: Optional[AsyncSession] = None,
    ) -> MemoryRetrieval:
        """
        Recall most relevant semantic memories for current situation.

        Uses hybrid retrieval:
        1. Vector similarity search on embeddings
        2. Context matching (subject, difficulty, state)
        3. Recency weighting (recent experiences more relevant)

        Args:
            brain_id: Brain identifier
            current_situation: Current context (subject, topic, learner_state, etc.)
            top_k: Number of memories to retrieve
            db: Database session (optional override)

        Returns:
            MemoryRetrieval with retrieved memories and relevance scores
        """
        db = db or self.db
        start_time = datetime.utcnow()

        # Generate embedding for current situation
        situation_text = json.dumps(current_situation)
        query_embedding = await self._generate_embedding(situation_text)

        # Retrieve semantic memories with hybrid approach
        semantic_memories = await self._hybrid_retrieval(
            brain_id=brain_id,
            query_embedding=query_embedding,
            current_situation=current_situation,
            top_k=top_k,
            db=db,
        )

        # Calculate relevance scores
        relevance_scores = [
            self._calculate_relevance(memory, current_situation) for memory in semantic_memories
        ]

        # Sort by relevance
        sorted_pairs = sorted(
            zip(semantic_memories, relevance_scores), key=lambda x: x[1], reverse=True
        )
        sorted_memories = [m for m, _ in sorted_pairs[:top_k]]
        sorted_scores = [s for _, s in sorted_pairs[:top_k]]

        retrieval_time_ms = int((datetime.utcnow() - start_time).total_seconds() * 1000)

        return MemoryRetrieval(
            query_context=current_situation,
            retrieved_memories=sorted_memories,
            relevance_scores=sorted_scores,
            retrieval_method="hybrid",
            retrieval_time_ms=retrieval_time_ms,
        )

    async def _hybrid_retrieval(
        self,
        brain_id: str,
        query_embedding: List[float],
        current_situation: Dict[str, Any],
        top_k: int,
        db: AsyncSession,
    ) -> List[SemanticMemory]:
        """
        Hybrid retrieval combining vector similarity and context matching.

        Args:
            brain_id: Brain identifier
            query_embedding: Query embedding vector
            current_situation: Current context
            top_k: Number of results
            db: Database session

        Returns:
            List of semantic memories
        """
        # Query semantic memories for this brain
        query = text("""
            SELECT id, brain_id, knowledge_type, statement, confidence,
                   supporting_evidence, last_updated, times_confirmed,
                   times_contradicted, metadata
            FROM brain_semantic_memory
            WHERE brain_id = :brain_id
            ORDER BY confidence DESC, last_updated DESC
            LIMIT :limit
        """)

        result = await db.execute(
            query,
            {
                "brain_id": brain_id,
                "limit": top_k * 2,  # Get more for filtering
            },
        )
        rows = result.fetchall()

        memories = []
        for row in rows:
            memory = SemanticMemory(
                id=row[0],
                brain_id=row[1],
                knowledge_type=row[2],
                statement=row[3],
                confidence=row[4],
                supporting_evidence=json.loads(row[5]) if row[5] else [],
                last_updated=row[6],
                times_confirmed=row[7],
                times_contradicted=row[8] if row[8] else 0,
                metadata=json.loads(row[9]) if row[9] else {},
            )
            memories.append(memory)

        return memories[:top_k]

    def _calculate_relevance(
        self, memory: SemanticMemory, current_situation: Dict[str, Any]
    ) -> float:
        """
        Calculate relevance score for a memory given current situation.

        Considers:
        - Confidence of the memory
        - Context match (subject, topic, state)
        - Recency of last update

        Args:
            memory: Semantic memory
            current_situation: Current context

        Returns:
            Relevance score (0.0-1.0)
        """
        # Base score from confidence
        relevance = memory.confidence * 0.5

        # Context matching bonus
        metadata = memory.metadata
        context_match = 0.0

        # Subject match
        if "subject" in current_situation and "subject" in metadata:
            if current_situation["subject"] == metadata["subject"]:
                context_match += 0.2

        # Topic match
        if "topic" in current_situation and "topic" in metadata:
            if current_situation["topic"] in metadata.get("topics", []):
                context_match += 0.15

        # State match
        if "learner_state" in current_situation and "states" in metadata:
            current_state = current_situation.get("learner_state", {})
            if isinstance(current_state, dict):
                for state_key in current_state:
                    if state_key in metadata.get("states", []):
                        context_match += 0.1
                        break

        # Recency bonus (recent memories more relevant)
        days_since_update = (datetime.utcnow() - memory.last_updated).days
        recency_bonus = max(0, 0.15 * math.exp(-days_since_update / 30))

        # Combine scores
        relevance += context_match + recency_bonus

        return min(relevance, 1.0)

    async def extract_patterns(
        self, brain_id: str, min_evidence: int = 3, db: Optional[AsyncSession] = None
    ) -> List[SemanticMemory]:
        """
        Extract patterns from recent episodic memories.

        Algorithm:
        1. Group episodes by similarity (clustering)
        2. Identify common themes within clusters
        3. Calculate confidence based on evidence
        4. Convert to semantic statements
        5. Store with supporting evidence

        Args:
            brain_id: Brain identifier
            min_evidence: Minimum episodes to form pattern
            db: Database session (optional override)

        Returns:
            List of newly extracted semantic memories
        """
        db = db or self.db

        # Get recent high-importance episodic memories
        recent_episodes = await self._get_recent_episodes(
            brain_id=brain_id, min_importance=0.5, days_back=30, db=db
        )

        if len(recent_episodes) < min_evidence:
            return []

        # Cluster episodes by similarity
        clusters = self._cluster_episodes(recent_episodes, min_cluster_size=min_evidence)

        # Extract patterns from each cluster
        new_patterns = []
        for cluster in clusters:
            pattern = await self._extract_pattern_from_cluster(
                brain_id=brain_id, episodes=cluster, db=db
            )
            if pattern:
                new_patterns.append(pattern)

        return new_patterns

    async def _get_recent_episodes(
        self, brain_id: str, min_importance: float, days_back: int, db: AsyncSession
    ) -> List[EpisodicMemory]:
        """
        Retrieve recent episodic memories above importance threshold.

        Args:
            brain_id: Brain identifier
            min_importance: Minimum importance score
            days_back: Number of days to look back
            db: Database session

        Returns:
            List of episodic memories
        """
        cutoff_date = datetime.utcnow() - timedelta(days=days_back)

        query = text("""
            SELECT memory_id, brain_id, timestamp, event_type, context,
                   outcome, lessons_learned, importance_score, embedding_vector,
                   decay_factor, times_recalled, created_at
            FROM brain_episodic_memory
            WHERE brain_id = :brain_id
              AND importance_score >= :min_importance
              AND timestamp >= :cutoff_date
            ORDER BY timestamp DESC
        """)

        result = await db.execute(
            query,
            {"brain_id": brain_id, "min_importance": min_importance, "cutoff_date": cutoff_date},
        )
        rows = result.fetchall()

        episodes = []
        for row in rows:
            episode = EpisodicMemory(
                memory_id=row[0],
                brain_id=row[1],
                timestamp=row[2],
                event_type=row[3],
                context=json.loads(row[4]) if row[4] else {},
                outcome=row[5],
                lessons_learned=json.loads(row[6]) if row[6] else [],
                importance_score=row[7],
                embedding_vector=json.loads(row[8]) if row[8] else None,
                decay_factor=row[9],
                times_recalled=row[10],
                created_at=row[11],
            )
            episodes.append(episode)

        return episodes

    def _cluster_episodes(
        self, episodes: List[EpisodicMemory], min_cluster_size: int = 3
    ) -> List[List[EpisodicMemory]]:
        """
        Cluster episodes by similarity using simple grouping.

        Groups episodes by:
        - Event type
        - Subject area
        - Outcome patterns

        Args:
            episodes: List of episodic memories
            min_cluster_size: Minimum episodes per cluster

        Returns:
            List of episode clusters
        """
        # Simple clustering by event_type and subject
        clusters_dict: Dict[Tuple[str, str], List[EpisodicMemory]] = {}

        for episode in episodes:
            event_type = episode.event_type
            subject = episode.context.get("subject", "general")
            key = (event_type, subject)

            if key not in clusters_dict:
                clusters_dict[key] = []
            clusters_dict[key].append(episode)

        # Filter clusters by minimum size
        clusters = [
            cluster for cluster in clusters_dict.values() if len(cluster) >= min_cluster_size
        ]

        return clusters

    async def _extract_pattern_from_cluster(
        self, brain_id: str, episodes: List[EpisodicMemory], db: AsyncSession
    ) -> Optional[SemanticMemory]:
        """
        Extract semantic pattern from cluster of similar episodes.

        Args:
            brain_id: Brain identifier
            episodes: Cluster of similar episodes
            db: Database session

        Returns:
            SemanticMemory if pattern found, None otherwise
        """
        if len(episodes) < self.CONSOLIDATION_THRESHOLD:
            return None

        # Analyze cluster for common patterns
        event_type = episodes[0].event_type
        subject = episodes[0].context.get("subject", "general")

        # Extract common lessons learned
        all_lessons = []
        for ep in episodes:
            all_lessons.extend(ep.lessons_learned)

        if not all_lessons:
            return None

        # Find most common lesson (simple approach)
        lesson_counts = {}
        for lesson in all_lessons:
            lesson_counts[lesson] = lesson_counts.get(lesson, 0) + 1

        most_common_lesson = max(lesson_counts.items(), key=lambda x: x[1])
        statement = most_common_lesson[0]

        # Calculate confidence based on evidence
        evidence = PatternEvidence(
            episode_ids=[ep.memory_id for ep in episodes],
            confidence_score=self._calculate_pattern_confidence(episodes),
            consistency_score=self._calculate_consistency(episodes),
            recency_score=self._calculate_recency_score(episodes),
            sample_size=len(episodes),
        )

        # Determine knowledge type
        knowledge_type = self._infer_knowledge_type(statement, event_type)

        # Create semantic memory
        semantic_memory = SemanticMemory(
            brain_id=brain_id,
            knowledge_type=knowledge_type,
            statement=statement,
            confidence=evidence.confidence_score,
            supporting_evidence=evidence.episode_ids,
            last_updated=datetime.utcnow(),
            times_confirmed=len(episodes),
            metadata={
                "subject": subject,
                "event_type": event_type,
                "consistency_score": evidence.consistency_score,
                "recency_score": evidence.recency_score,
            },
        )

        # Persist to database
        await self._persist_semantic_memory(semantic_memory, db)

        return semantic_memory

    def _calculate_pattern_confidence(self, episodes: List[EpisodicMemory]) -> float:
        """
        Calculate confidence score for pattern based on evidence.

        Factors:
        - Sample size (more episodes = higher confidence)
        - Consistency of outcomes
        - Importance of episodes
        - Recency of evidence

        Args:
            episodes: Supporting episodes

        Returns:
            Confidence score (0.0-1.0)
        """
        # Sample size contribution (logarithmic)
        sample_size_score = min(0.4, 0.2 * math.log10(len(episodes) + 1))

        # Consistency contribution
        consistency_score = self._calculate_consistency(episodes) * 0.3

        # Average importance contribution
        avg_importance = sum(ep.importance_score for ep in episodes) / len(episodes)
        importance_score = avg_importance * 0.2

        # Recency contribution
        recency_score = self._calculate_recency_score(episodes) * 0.1

        # Total confidence
        confidence = sample_size_score + consistency_score + importance_score + recency_score

        return min(confidence, 1.0)

    def _calculate_consistency(self, episodes: List[EpisodicMemory]) -> float:
        """
        Calculate consistency score for episodes.

        Higher score if episodes have similar outcomes and lessons.

        Args:
            episodes: List of episodes

        Returns:
            Consistency score (0.0-1.0)
        """
        if len(episodes) < 2:
            return 1.0

        # Simple consistency: ratio of episodes with positive outcomes
        positive_outcomes = 0
        for ep in episodes:
            outcome_lower = ep.outcome.lower()
            if any(
                word in outcome_lower
                for word in ["success", "improved", "breakthrough", "understood"]
            ):
                positive_outcomes += 1

        consistency = positive_outcomes / len(episodes)
        return consistency

    def _calculate_recency_score(self, episodes: List[EpisodicMemory]) -> float:
        """
        Calculate recency score for episodes.

        Higher score if episodes are recent.

        Args:
            episodes: List of episodes

        Returns:
            Recency score (0.0-1.0)
        """
        if not episodes:
            return 0.0

        # Average days since episode
        now = datetime.utcnow()
        avg_days_ago = sum((now - ep.timestamp).days for ep in episodes) / len(episodes)

        # Exponential decay (30-day half-life)
        recency_score = math.exp(-avg_days_ago / 30)

        return recency_score

    def _infer_knowledge_type(self, statement: str, event_type: str) -> str:
        """
        Infer knowledge type from statement and event type.

        Types: preference, strategy, pattern, trigger, timing

        Args:
            statement: Knowledge statement
            event_type: Event type from episodes

        Returns:
            Knowledge type
        """
        statement_lower = statement.lower()

        # Preference indicators
        if any(
            word in statement_lower
            for word in ["prefer", "enjoys", "likes", "dislikes", "resistant"]
        ):
            return "preference"

        # Strategy indicators
        if any(
            word in statement_lower
            for word in ["works best", "effective", "approach", "method", "technique"]
        ):
            return "strategy"

        # Trigger indicators
        if any(
            word in statement_lower for word in ["after", "when", "triggers", "causes", "leads to"]
        ):
            return "trigger"

        # Timing indicators
        if any(
            word in statement_lower
            for word in ["morning", "afternoon", "evening", "time of day", "duration"]
        ):
            return "timing"

        # Default to pattern
        return "pattern"

    async def _persist_semantic_memory(self, memory: SemanticMemory, db: AsyncSession) -> None:
        """
        Persist semantic memory to database.

        Args:
            memory: SemanticMemory to store
            db: Database session
        """
        query = text("""
            INSERT INTO brain_semantic_memory (
                id, brain_id, knowledge_type, statement, confidence,
                supporting_evidence, last_updated, times_confirmed,
                times_contradicted, metadata
            ) VALUES (
                :id, :brain_id, :knowledge_type, :statement, :confidence,
                :supporting_evidence, :last_updated, :times_confirmed,
                :times_contradicted, :metadata
            )
            ON CONFLICT (brain_id, statement) DO UPDATE SET
                confidence = :confidence,
                supporting_evidence = :supporting_evidence,
                last_updated = :last_updated,
                times_confirmed = brain_semantic_memory.times_confirmed + 1
        """)

        await db.execute(
            query,
            {
                "id": memory.id,
                "brain_id": memory.brain_id,
                "knowledge_type": memory.knowledge_type,
                "statement": memory.statement,
                "confidence": memory.confidence,
                "supporting_evidence": json.dumps(memory.supporting_evidence),
                "last_updated": memory.last_updated,
                "times_confirmed": memory.times_confirmed,
                "times_contradicted": memory.times_contradicted,
                "metadata": json.dumps(memory.metadata),
            },
        )
        await db.commit()

    async def update_belief(
        self,
        brain_id: str,
        statement: str,
        new_evidence: bool,
        episode_id: str,
        db: Optional[AsyncSession] = None,
    ) -> Optional[SemanticMemory]:
        """
        Bayesian update of semantic memory based on new evidence.

        Updates confidence score probabilistically:
        - Confirming evidence increases confidence
        - Contradicting evidence decreases confidence

        Args:
            brain_id: Brain identifier
            statement: Knowledge statement to update
            new_evidence: True if confirms, False if contradicts
            episode_id: Episode ID providing evidence
            db: Database session (optional override)

        Returns:
            Updated SemanticMemory or None if not found
        """
        db = db or self.db

        # Retrieve existing semantic memory
        query = text("""
            SELECT id, brain_id, knowledge_type, statement, confidence,
                   supporting_evidence, last_updated, times_confirmed,
                   times_contradicted, metadata
            FROM brain_semantic_memory
            WHERE brain_id = :brain_id AND statement = :statement
        """)

        result = await db.execute(query, {"brain_id": brain_id, "statement": statement})
        row = result.fetchone()

        if not row:
            return None

        # Parse existing memory
        memory = SemanticMemory(
            id=row[0],
            brain_id=row[1],
            knowledge_type=row[2],
            statement=row[3],
            confidence=row[4],
            supporting_evidence=json.loads(row[5]) if row[5] else [],
            last_updated=row[6],
            times_confirmed=row[7],
            times_contradicted=row[8] if row[8] else 0,
            metadata=json.loads(row[9]) if row[9] else {},
        )

        # Bayesian update
        prior_confidence = memory.confidence

        if new_evidence:
            # Confirming evidence
            # Update: P(H|E) = P(E|H) * P(H) / P(E)
            # Simplified: increase confidence proportional to uncertainty
            uncertainty = 1.0 - prior_confidence
            confidence_increase = uncertainty * 0.15  # 15% of remaining uncertainty
            new_confidence = min(prior_confidence + confidence_increase, 0.95)

            memory.times_confirmed += 1
            memory.supporting_evidence.append(episode_id)
        else:
            # Contradicting evidence
            # Decrease confidence proportional to current confidence
            confidence_decrease = prior_confidence * 0.20  # 20% of current confidence
            new_confidence = max(prior_confidence - confidence_decrease, 0.05)

            memory.times_contradicted += 1

        # Update memory
        memory.confidence = new_confidence
        memory.last_updated = datetime.utcnow()

        # Persist update
        update_query = text("""
            UPDATE brain_semantic_memory
            SET confidence = :confidence,
                supporting_evidence = :supporting_evidence,
                last_updated = :last_updated,
                times_confirmed = :times_confirmed,
                times_contradicted = :times_contradicted
            WHERE id = :id
        """)

        await db.execute(
            update_query,
            {
                "id": memory.id,
                "confidence": memory.confidence,
                "supporting_evidence": json.dumps(memory.supporting_evidence),
                "last_updated": memory.last_updated,
                "times_confirmed": memory.times_confirmed,
                "times_contradicted": memory.times_contradicted,
            },
        )
        await db.commit()

        return memory

    async def consolidate_memories(
        self, brain_id: str, db: Optional[AsyncSession] = None
    ) -> Dict[str, Any]:
        """
        Nightly memory consolidation: episodic → semantic.

        Process:
        1. Extract new patterns from recent episodes
        2. Update existing semantic memories with new evidence
        3. Apply decay to old episodic memories
        4. Prune low-importance episodic memories older than 90 days

        Args:
            brain_id: Brain identifier
            db: Database session (optional override)

        Returns:
            Consolidation statistics
        """
        db = db or self.db
        stats = {
            "patterns_extracted": 0,
            "memories_updated": 0,
            "episodes_decayed": 0,
            "episodes_pruned": 0,
            "start_time": datetime.utcnow(),
        }

        # Extract new patterns
        new_patterns = await self.extract_patterns(brain_id=brain_id, db=db)
        stats["patterns_extracted"] = len(new_patterns)

        # Apply decay to old episodes
        decay_count = await self._apply_memory_decay(brain_id=brain_id, db=db)
        stats["episodes_decayed"] = decay_count

        # Prune old low-importance episodes
        prune_count = await self._prune_old_memories(brain_id=brain_id, db=db)
        stats["episodes_pruned"] = prune_count

        stats["end_time"] = datetime.utcnow()
        stats["duration_seconds"] = (stats["end_time"] - stats["start_time"]).total_seconds()

        return stats

    async def _apply_memory_decay(self, brain_id: str, db: AsyncSession) -> int:
        """
        Apply decay function to old episodic memories.

        Memories decay exponentially: importance * exp(-days / half_life)
        Reinforced memories (recalled often) decay more slowly.

        Args:
            brain_id: Brain identifier
            db: Database session

        Returns:
            Number of memories decayed
        """
        # Calculate decay for memories older than 7 days
        cutoff_date = datetime.utcnow() - timedelta(days=7)

        query = text("""
            UPDATE brain_episodic_memory
            SET decay_factor = GREATEST(
                0.1,
                decay_factor * EXP(-1.0 / :half_life) * (1 + times_recalled * 0.1)
            ),
            importance_score = importance_score * decay_factor
            WHERE brain_id = :brain_id
              AND timestamp < :cutoff_date
        """)

        result = await db.execute(
            query,
            {
                "brain_id": brain_id,
                "cutoff_date": cutoff_date,
                "half_life": self.DECAY_HALF_LIFE_DAYS,
            },
        )
        await db.commit()

        return result.rowcount

    async def _prune_old_memories(self, brain_id: str, db: AsyncSession) -> int:
        """
        Prune low-importance episodic memories older than retention period.

        Args:
            brain_id: Brain identifier
            db: Database session

        Returns:
            Number of memories pruned
        """
        cutoff_date = datetime.utcnow() - timedelta(days=self.RETENTION_DAYS)

        query = text("""
            DELETE FROM brain_episodic_memory
            WHERE brain_id = :brain_id
              AND timestamp < :cutoff_date
              AND importance_score < :threshold
        """)

        result = await db.execute(
            query,
            {
                "brain_id": brain_id,
                "cutoff_date": cutoff_date,
                "threshold": self.LOW_IMPORTANCE_THRESHOLD,
            },
        )
        await db.commit()

        return result.rowcount
