"""
Tests for Brain Memory System

Tests episodic memory storage, semantic memory extraction,
pattern recognition, Bayesian updating, and memory retrieval.
"""

import json
from datetime import datetime, timedelta
from unittest.mock import AsyncMock, MagicMock, patch

import pytest
from sqlalchemy import text
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.brain_memory import (
    BrainMemory,
    EpisodicMemory,
    MemoryRetrieval,
    PatternEvidence,
    SemanticMemory,
)


@pytest.fixture
def mock_db():
    """Mock database session."""
    db = AsyncMock(spec=AsyncSession)
    db.execute = AsyncMock()
    db.commit = AsyncMock()
    return db


@pytest.fixture
def mock_ai_client():
    """Mock OpenAI client for embeddings."""
    client = MagicMock()

    # Mock embeddings response
    mock_response = MagicMock()
    mock_response.data = [MagicMock(embedding=[0.1] * 1536)]
    client.embeddings.create = AsyncMock(return_value=mock_response)

    return client


@pytest.fixture
def brain_memory(mock_db, mock_ai_client):
    """Create BrainMemory instance with mocked dependencies."""
    return BrainMemory(db=mock_db, ai_client=mock_ai_client)


# ====================================================================
# EPISODIC MEMORY TESTS
# ====================================================================


@pytest.mark.asyncio
async def test_store_episode_breakthrough(brain_memory, mock_db, mock_ai_client):
    """Test storing a breakthrough episodic memory."""
    brain_id = "brain_test_001"
    event_type = "breakthrough"
    context = {
        "subject": "math",
        "topic": "fractions",
        "difficulty": 5,
        "learner_state": {"frustration_level": "medium"},
        "success_rate": 0.92,
    }
    outcome = "Learner understood fraction division with visual models"
    lessons_learned = [
        "Visual representations very effective",
        "Step-by-step approach builds confidence",
    ]

    episode = await brain_memory.store_episode(
        brain_id=brain_id,
        event_type=event_type,
        context=context,
        outcome=outcome,
        lessons_learned=lessons_learned,
        db=mock_db,
    )

    # Verify episode created
    assert episode.brain_id == brain_id
    assert episode.event_type == event_type
    assert episode.importance_score >= 0.9  # Breakthrough = high importance
    assert episode.embedding_vector is not None
    assert len(episode.embedding_vector) == 1536

    # Verify AI client called for embedding
    mock_ai_client.embeddings.create.assert_called_once()

    # Verify database insert called
    mock_db.execute.assert_called_once()
    mock_db.commit.assert_called_once()


@pytest.mark.asyncio
async def test_store_episode_routine(brain_memory, mock_db):
    """Test storing a routine interaction (lower importance)."""
    episode = await brain_memory.store_episode(
        brain_id="brain_test_001",
        event_type="routine_interaction",
        context={"subject": "math", "difficulty": 3},
        outcome="Completed practice problems",
        lessons_learned=[],
        db=mock_db,
    )

    # Routine interactions have lower importance
    assert episode.importance_score <= 0.4


@pytest.mark.asyncio
async def test_calculate_importance_emotional_event(brain_memory):
    """Test importance calculation for emotional events."""
    importance = brain_memory._calculate_importance(
        event_type="emotional_event",
        context={"learner_state": {"frustration_level": "very_high"}, "success_rate": 0.15},
        outcome="Learner became distressed during difficult problem",
        lessons_learned=["Need more emotional support", "Break timing critical"],
    )

    # High importance due to emotional distress + low success + multiple lessons
    assert importance >= 0.85


@pytest.mark.asyncio
async def test_calculate_importance_typical_progress(brain_memory):
    """Test importance calculation for typical progress."""
    importance = brain_memory._calculate_importance(
        event_type="typical_progress",
        context={"success_rate": 0.75},
        outcome="Completed worksheet",
        lessons_learned=[],
    )

    # Medium importance for typical progress
    assert 0.4 <= importance <= 0.6


# ====================================================================
# PATTERN EXTRACTION TESTS
# ====================================================================


@pytest.mark.asyncio
async def test_extract_patterns_visual_preference(brain_memory, mock_db):
    """Test extracting pattern: visual learning preference."""
    brain_id = "brain_test_001"

    # Mock database response: 3 episodes showing visual preference
    mock_rows = [
        (
            "ep_001",
            brain_id,
            datetime.utcnow() - timedelta(days=5),
            "breakthrough",
            json.dumps({"subject": "math", "topic": "fractions"}),
            "Success with visual fraction models",
            json.dumps(["Visual aids very effective"]),
            0.9,
            None,
            1.0,
            0,
            datetime.utcnow(),
        ),
        (
            "ep_002",
            brain_id,
            datetime.utcnow() - timedelta(days=3),
            "breakthrough",
            json.dumps({"subject": "math", "topic": "geometry"}),
            "Understood shapes with diagrams",
            json.dumps(["Visual aids very effective"]),
            0.85,
            None,
            1.0,
            0,
            datetime.utcnow(),
        ),
        (
            "ep_003",
            brain_id,
            datetime.utcnow() - timedelta(days=1),
            "breakthrough",
            json.dumps({"subject": "math", "topic": "decimals"}),
            "Learned decimals with visual number line",
            json.dumps(["Visual aids very effective"]),
            0.88,
            None,
            1.0,
            0,
            datetime.utcnow(),
        ),
    ]

    mock_result = MagicMock()
    mock_result.fetchall.return_value = mock_rows
    mock_db.execute.return_value = mock_result

    patterns = await brain_memory.extract_patterns(brain_id=brain_id, min_evidence=3, db=mock_db)

    # Should extract visual preference pattern
    assert len(patterns) >= 1

    # Find visual pattern
    visual_pattern = next((p for p in patterns if "visual" in p.statement.lower()), None)
    assert visual_pattern is not None
    assert visual_pattern.knowledge_type in ["preference", "strategy"]
    assert visual_pattern.confidence >= 0.7
    assert len(visual_pattern.supporting_evidence) == 3


@pytest.mark.asyncio
async def test_extract_patterns_insufficient_evidence(brain_memory, mock_db):
    """Test pattern extraction with insufficient evidence."""
    brain_id = "brain_test_001"

    # Mock only 2 episodes (below min_evidence threshold of 3)
    mock_rows = [
        (
            "ep_001",
            brain_id,
            datetime.utcnow(),
            "breakthrough",
            "{}",
            "outcome",
            "[]",
            0.8,
            None,
            1.0,
            0,
            datetime.utcnow(),
        ),
        (
            "ep_002",
            brain_id,
            datetime.utcnow(),
            "breakthrough",
            "{}",
            "outcome",
            "[]",
            0.8,
            None,
            1.0,
            0,
            datetime.utcnow(),
        ),
    ]

    mock_result = MagicMock()
    mock_result.fetchall.return_value = mock_rows
    mock_db.execute.return_value = mock_result

    patterns = await brain_memory.extract_patterns(brain_id=brain_id, min_evidence=3, db=mock_db)

    # Should not extract patterns with insufficient evidence
    assert len(patterns) == 0


@pytest.mark.asyncio
async def test_cluster_episodes_by_subject(brain_memory):
    """Test clustering episodes by subject and event type."""
    episodes = [
        EpisodicMemory(
            brain_id="brain_001",
            timestamp=datetime.utcnow(),
            event_type="breakthrough",
            context={"subject": "math"},
            outcome="Success",
            lessons_learned=["Lesson 1"],
            importance_score=0.9,
        ),
        EpisodicMemory(
            brain_id="brain_001",
            timestamp=datetime.utcnow(),
            event_type="breakthrough",
            context={"subject": "math"},
            outcome="Success",
            lessons_learned=["Lesson 1"],
            importance_score=0.9,
        ),
        EpisodicMemory(
            brain_id="brain_001",
            timestamp=datetime.utcnow(),
            event_type="breakthrough",
            context={"subject": "math"},
            outcome="Success",
            lessons_learned=["Lesson 1"],
            importance_score=0.9,
        ),
        EpisodicMemory(
            brain_id="brain_001",
            timestamp=datetime.utcnow(),
            event_type="struggle",
            context={"subject": "reading"},
            outcome="Difficulty",
            lessons_learned=["Lesson 2"],
            importance_score=0.8,
        ),
    ]

    clusters = brain_memory._cluster_episodes(episodes, min_cluster_size=3)

    # Should have 1 cluster (math breakthrough with 3 episodes)
    assert len(clusters) == 1
    assert len(clusters[0]) == 3
    assert all(ep.context["subject"] == "math" for ep in clusters[0])


# ====================================================================
# MEMORY RETRIEVAL TESTS
# ====================================================================


@pytest.mark.asyncio
async def test_recall_relevant_memories(brain_memory, mock_db):
    """Test recalling relevant semantic memories for current situation."""
    brain_id = "brain_test_001"
    current_situation = {
        "subject": "math",
        "topic": "fractions",
        "learner_state": {"frustration_level": "medium"},
    }

    # Mock semantic memories in database
    mock_rows = [
        (
            "sem_001",
            brain_id,
            "preference",
            "Learner responds very well to visual representations in math",
            0.85,
            json.dumps(["ep_001", "ep_002"]),
            datetime.utcnow(),
            3,
            0,
            json.dumps({"subject": "math", "topics": ["fractions"]}),
        ),
        (
            "sem_002",
            brain_id,
            "strategy",
            "Step-by-step breakdown works best",
            0.78,
            json.dumps(["ep_003"]),
            datetime.utcnow(),
            4,
            0,
            json.dumps({"subject": "math"}),
        ),
        (
            "sem_003",
            brain_id,
            "trigger",
            "Frustration rises after 3 consecutive errors",
            0.82,
            json.dumps(["ep_004"]),
            datetime.utcnow(),
            5,
            0,
            json.dumps({"states": ["frustrated"]}),
        ),
    ]

    mock_result = MagicMock()
    mock_result.fetchall.return_value = mock_rows
    mock_db.execute.return_value = mock_result

    retrieval = await brain_memory.recall_relevant_memories(
        brain_id=brain_id, current_situation=current_situation, top_k=3, db=mock_db
    )

    # Verify retrieval
    assert len(retrieval.retrieved_memories) <= 3
    assert len(retrieval.relevance_scores) == len(retrieval.retrieved_memories)
    assert retrieval.retrieval_method == "hybrid"
    assert retrieval.retrieval_time_ms is not None

    # Relevance scores should be sorted descending
    assert retrieval.relevance_scores == sorted(retrieval.relevance_scores, reverse=True)


@pytest.mark.asyncio
async def test_calculate_relevance_subject_match(brain_memory):
    """Test relevance calculation with subject match."""
    memory = SemanticMemory(
        brain_id="brain_001",
        knowledge_type="preference",
        statement="Visual aids effective",
        confidence=0.8,
        supporting_evidence=["ep_001"],
        last_updated=datetime.utcnow(),
        times_confirmed=3,
        metadata={"subject": "math"},
    )

    current_situation = {"subject": "math"}

    relevance = brain_memory._calculate_relevance(memory, current_situation)

    # Should have high relevance due to subject match
    assert relevance >= 0.6


@pytest.mark.asyncio
async def test_calculate_relevance_no_match(brain_memory):
    """Test relevance calculation with no context match."""
    memory = SemanticMemory(
        brain_id="brain_001",
        knowledge_type="preference",
        statement="Visual aids effective",
        confidence=0.5,
        supporting_evidence=["ep_001"],
        last_updated=datetime.utcnow() - timedelta(days=60),
        times_confirmed=2,
        metadata={"subject": "reading"},
    )

    current_situation = {"subject": "math"}

    relevance = brain_memory._calculate_relevance(memory, current_situation)

    # Should have lower relevance (no match, old, lower confidence)
    assert relevance <= 0.4


# ====================================================================
# BAYESIAN UPDATING TESTS
# ====================================================================


@pytest.mark.asyncio
async def test_update_belief_confirming_evidence(brain_memory, mock_db):
    """Test Bayesian update with confirming evidence."""
    brain_id = "brain_test_001"
    statement = "Visual aids very effective for math"

    # Mock existing semantic memory with 0.6 confidence
    mock_row = (
        "sem_001",
        brain_id,
        "strategy",
        statement,
        0.6,
        json.dumps(["ep_001", "ep_002"]),
        datetime.utcnow() - timedelta(days=5),
        2,
        0,
        json.dumps({}),
    )

    mock_result = MagicMock()
    mock_result.fetchone.return_value = mock_row
    mock_db.execute.return_value = mock_result

    updated_memory = await brain_memory.update_belief(
        brain_id=brain_id,
        statement=statement,
        new_evidence=True,  # Confirming
        episode_id="ep_003",
        db=mock_db,
    )

    # Confidence should increase
    assert updated_memory is not None
    assert updated_memory.confidence > 0.6
    assert updated_memory.confidence <= 0.95
    assert updated_memory.times_confirmed == 3
    assert "ep_003" in updated_memory.supporting_evidence


@pytest.mark.asyncio
async def test_update_belief_contradicting_evidence(brain_memory, mock_db):
    """Test Bayesian update with contradicting evidence."""
    brain_id = "brain_test_001"
    statement = "Visual aids very effective for math"

    # Mock existing semantic memory with 0.8 confidence
    mock_row = (
        "sem_001",
        brain_id,
        "strategy",
        statement,
        0.8,
        json.dumps(["ep_001", "ep_002", "ep_003"]),
        datetime.utcnow() - timedelta(days=5),
        3,
        0,
        json.dumps({}),
    )

    mock_result = MagicMock()
    mock_result.fetchone.return_value = mock_row
    mock_db.execute.return_value = mock_result

    updated_memory = await brain_memory.update_belief(
        brain_id=brain_id,
        statement=statement,
        new_evidence=False,  # Contradicting
        episode_id="ep_004",
        db=mock_db,
    )

    # Confidence should decrease
    assert updated_memory is not None
    assert updated_memory.confidence < 0.8
    assert updated_memory.confidence >= 0.05
    assert updated_memory.times_contradicted == 1


@pytest.mark.asyncio
async def test_update_belief_nonexistent(brain_memory, mock_db):
    """Test updating belief that doesn't exist."""
    # Mock no results
    mock_result = MagicMock()
    mock_result.fetchone.return_value = None
    mock_db.execute.return_value = mock_result

    updated_memory = await brain_memory.update_belief(
        brain_id="brain_001",
        statement="Nonexistent statement",
        new_evidence=True,
        episode_id="ep_001",
        db=mock_db,
    )

    # Should return None
    assert updated_memory is None


# ====================================================================
# MEMORY CONSOLIDATION TESTS
# ====================================================================


@pytest.mark.asyncio
async def test_consolidate_memories(brain_memory, mock_db):
    """Test nightly memory consolidation."""
    brain_id = "brain_test_001"

    # Mock recent episodes for pattern extraction
    mock_episodes = [
        (
            f"ep_{i:03d}",
            brain_id,
            datetime.utcnow() - timedelta(days=i),
            "breakthrough",
            json.dumps({"subject": "math"}),
            "Success",
            json.dumps(["Lesson learned"]),
            0.9,
            None,
            1.0,
            0,
            datetime.utcnow(),
        )
        for i in range(5)
    ]

    # Mock decay result
    mock_decay_result = MagicMock()
    mock_decay_result.rowcount = 15

    # Mock prune result
    mock_prune_result = MagicMock()
    mock_prune_result.rowcount = 3

    mock_result = MagicMock()
    mock_result.fetchall.return_value = mock_episodes

    # Setup mock to return different results for different queries
    async def mock_execute(query, params=None):
        if "SELECT memory_id" in str(query):
            return mock_result
        elif "UPDATE" in str(query):
            return mock_decay_result
        elif "DELETE" in str(query):
            return mock_prune_result
        return MagicMock()

    mock_db.execute.side_effect = mock_execute

    stats = await brain_memory.consolidate_memories(brain_id=brain_id, db=mock_db)

    # Verify consolidation stats
    assert "patterns_extracted" in stats
    assert "episodes_decayed" in stats
    assert "episodes_pruned" in stats
    assert "duration_seconds" in stats
    assert stats["episodes_decayed"] == 15
    assert stats["episodes_pruned"] == 3


@pytest.mark.asyncio
async def test_calculate_pattern_confidence(brain_memory):
    """Test pattern confidence calculation."""
    episodes = [
        EpisodicMemory(
            brain_id="brain_001",
            timestamp=datetime.utcnow() - timedelta(days=i),
            event_type="breakthrough",
            context={"subject": "math"},
            outcome="Success with visual aids",
            lessons_learned=["Visual aids effective"],
            importance_score=0.9,
        )
        for i in range(5)
    ]

    confidence = brain_memory._calculate_pattern_confidence(episodes)

    # Should have high confidence with 5 consistent episodes
    assert confidence >= 0.7


@pytest.mark.asyncio
async def test_calculate_consistency(brain_memory):
    """Test consistency score calculation."""
    # All successful episodes
    consistent_episodes = [
        EpisodicMemory(
            brain_id="brain_001",
            timestamp=datetime.utcnow(),
            event_type="breakthrough",
            context={},
            outcome="Learner understood and succeeded",
            lessons_learned=[],
            importance_score=0.9,
        )
        for _ in range(5)
    ]

    consistency = brain_memory._calculate_consistency(consistent_episodes)
    assert consistency >= 0.8

    # Mixed outcomes
    mixed_episodes = [
        EpisodicMemory(
            brain_id="brain_001",
            timestamp=datetime.utcnow(),
            event_type="breakthrough",
            context={},
            outcome="Success" if i % 2 == 0 else "Struggled",
            lessons_learned=[],
            importance_score=0.9,
        )
        for i in range(10)
    ]

    consistency = brain_memory._calculate_consistency(mixed_episodes)
    assert 0.4 <= consistency <= 0.6


@pytest.mark.asyncio
async def test_infer_knowledge_type(brain_memory):
    """Test knowledge type inference from statement."""
    # Preference
    assert (
        brain_memory._infer_knowledge_type("Learner prefers visual explanations", "breakthrough")
        == "preference"
    )

    # Strategy
    assert (
        brain_memory._infer_knowledge_type("Step-by-step approach works best", "breakthrough")
        == "strategy"
    )

    # Trigger
    assert (
        brain_memory._infer_knowledge_type("Frustration triggers after 3 errors", "emotional_event")
        == "trigger"
    )

    # Timing
    assert (
        brain_memory._infer_knowledge_type(
            "Focuses better in morning sessions", "pattern_confirmation"
        )
        == "timing"
    )

    # Default to pattern
    assert (
        brain_memory._infer_knowledge_type("General observation about learning", "typical_progress")
        == "pattern"
    )


# ====================================================================
# EMBEDDING TESTS
# ====================================================================


@pytest.mark.asyncio
async def test_generate_embedding_success(brain_memory, mock_ai_client):
    """Test successful embedding generation."""
    text = "Test embedding text"

    embedding = await brain_memory._generate_embedding(text)

    assert embedding is not None
    assert len(embedding) == 1536
    mock_ai_client.embeddings.create.assert_called_once_with(
        model="text-embedding-3-small", input=text
    )


@pytest.mark.asyncio
async def test_generate_embedding_no_client():
    """Test embedding generation without AI client."""
    memory = BrainMemory(db=None, ai_client=None)

    embedding = await memory._generate_embedding("test")

    # Should return zero vector
    assert embedding == [0.0] * 1536


@pytest.mark.asyncio
async def test_generate_embedding_error(brain_memory, mock_ai_client):
    """Test embedding generation with API error."""
    mock_ai_client.embeddings.create.side_effect = Exception("API Error")

    embedding = await brain_memory._generate_embedding("test")

    # Should return zero vector on error
    assert embedding == [0.0] * 1536


# ====================================================================
# INTEGRATION TESTS
# ====================================================================


@pytest.mark.asyncio
async def test_full_memory_workflow(brain_memory, mock_db, mock_ai_client):
    """Test complete workflow: store episode → extract pattern → retrieve."""
    brain_id = "brain_test_001"

    # Step 1: Store multiple related episodes
    for i in range(3):
        await brain_memory.store_episode(
            brain_id=brain_id,
            event_type="breakthrough",
            context={"subject": "math", "topic": "fractions"},
            outcome=f"Success with visual aids (attempt {i + 1})",
            lessons_learned=["Visual aids very effective"],
            db=mock_db,
        )

    # Verify episodes stored
    assert mock_db.execute.call_count == 3

    # Step 2: Extract patterns (mock database response)
    mock_rows = [
        (
            f"ep_{i:03d}",
            brain_id,
            datetime.utcnow(),
            "breakthrough",
            json.dumps({"subject": "math"}),
            "Success",
            json.dumps(["Visual aids very effective"]),
            0.9,
            None,
            1.0,
            0,
            datetime.utcnow(),
        )
        for i in range(3)
    ]

    mock_result = MagicMock()
    mock_result.fetchall.return_value = mock_rows
    mock_db.execute.return_value = mock_result

    patterns = await brain_memory.extract_patterns(brain_id=brain_id, min_evidence=3, db=mock_db)

    # Should extract pattern
    assert len(patterns) >= 1

    # Step 3: Retrieve for similar situation
    mock_semantic_rows = [
        (
            "sem_001",
            brain_id,
            "strategy",
            "Visual aids very effective",
            0.85,
            json.dumps(["ep_001", "ep_002", "ep_003"]),
            datetime.utcnow(),
            3,
            0,
            json.dumps({"subject": "math"}),
        ),
    ]

    mock_result.fetchall.return_value = mock_semantic_rows

    retrieval = await brain_memory.recall_relevant_memories(
        brain_id=brain_id,
        current_situation={"subject": "math", "topic": "fractions"},
        top_k=5,
        db=mock_db,
    )

    # Should retrieve relevant memory
    assert len(retrieval.retrieved_memories) >= 1
    assert retrieval.retrieved_memories[0].confidence >= 0.8
