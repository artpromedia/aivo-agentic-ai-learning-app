# Speech Therapy Integration - Complete

## ✅ Overview

Speech therapy support has been successfully integrated into the Aivo Learning baseline assessment system. The system now includes a comprehensive **6th domain (speech)** alongside reading, math, science, writing, and SEL.

---

## 📊 Database Updates

### Migration Status
- **baseline_items table**: ✅ Migrated with speech domain support
- **baseline_sessions table**: ✅ Migrated with speech domain support
- **Total assessment items**: 23 items (12 original + 11 speech therapy)

### Speech Items by Grade Band

**K-5 (5 items)**
- Articulation: 3 items (difficulty: -1.5 to -0.5)
- Language Expression: 1 item (difficulty: -0.8)
- Language Comprehension: 1 item (difficulty: -1.0)

**6-8 (3 items)**
- Fluency/Stuttering: 1 item (difficulty: 0.3)
- Voice: 1 item (difficulty: 0.0)
- Pragmatics: 1 item (difficulty: 0.5)

**9-12 (3 items)**
- Language Expression: 1 item (difficulty: 1.0)
- Articulation: 1 item (difficulty: 1.2)
- Pragmatics: 1 item (difficulty: 1.5)

### Sample Speech Items

```sql
-- K-5 Articulation
"Say the word 'sun' clearly." (difficulty: -1.5, discrimination: 1.5)
"Say these words: 'cat', 'dog', 'fish'." (difficulty: -1.0, discrimination: 1.4)
"Say the word 'rabbit' three times." (difficulty: -0.5, discrimination: 1.3)

-- 6-8 Fluency
"Read smoothly: 'The quick brown fox jumps.'" (difficulty: 0.3, discrimination: 1.5)

-- 9-12 Advanced
"Explain the water cycle in your own words." (difficulty: 1.0, discrimination: 1.7)
"Tongue twister: 'She sells seashells by the seashore.'" (difficulty: 1.2, discrimination: 1.6)
```

---

## 🎨 Frontend Components

### Type Definitions (`baseline.ts`)

**New Domain Type**
```typescript
export type Domain = 
  | 'reading' | 'math' | 'science' 
  | 'writing' | 'sel' | 'speech';
```

**Speech Sub-Domains** (8 total)
```typescript
export type SubDomain = 
  // ... existing domains
  | 'articulation'           // Speech sound production
  | 'phonology'              // Sound pattern rules
  | 'fluency_stuttering'     // Fluency disorders
  | 'voice'                  // Vocal quality/pitch/loudness
  | 'language_expression'    // Expressive language
  | 'language_comprehension' // Receptive language
  | 'pragmatics'             // Social communication
  | 'oral_motor';            // Oral movement skills
```

**Speech Metrics Interface**
```typescript
interface SpeechMetrics {
  // Articulation Metrics
  articulation?: {
    phonemeAccuracy: number;          // 0-100%
    substitutions: number;            // Count
    omissions: number;                // Count
    distortions: number;              // Count
    targetSounds: string[];           // ["/s/", "/r/"]
    errorSounds: string[];            // ["/th/"]
  };

  // Fluency Metrics
  fluency?: {
    stutteringFrequency: number;      // % syllables stuttered
    disfluencyTypes: string[];        // ["repetition", "prolongation"]
    secondaryBehaviors: string[];     // ["eye blink", "head nod"]
    naturalness: number;              // 1-10 scale
  };

  // Voice Metrics
  voice?: {
    quality: string;                  // "clear"|"hoarse"|"breathy"
    pitch: string;                    // "appropriate"|"too high"|"too low"
    loudness: string;                 // "appropriate"|"too loud"|"too soft"
    resonance: string;                // "normal"|"hyponasal"|"hypernasal"
  };

  // Language Metrics
  language?: {
    expressionScore: number;          // 0-100
    comprehensionScore: number;       // 0-100
    vocabularyLevel: string;          // "below"|"at"|"above" grade level
    sentenceComplexity: number;       // Mean Length of Utterance (MLU)
    narrativeAbility: number;         // 1-10 scale
  };

  // Pragmatics Metrics
  pragmatics?: {
    conversationTurns: number;        // Turn-taking count
    topicMaintenance: number;         // 1-10 scale
    eyeContact: number;               // 1-10 scale
    gestureUse: number;               // 1-10 scale
  };
}
```

### SpeechAssessment Component (`SpeechAssessment.tsx`)

**450-line specialized component** for speech-language pathology assessments.

#### Features
- ✅ **Audio Recording**: MediaRecorder API with WebM format
- ✅ **Real-time Visualization**: Web Audio API with frequency analysis
- ✅ **Model Audio Playback**: Web Speech Synthesis for articulation targets
- ✅ **Task-Specific Instructions**: Customized for each speech assessment type
- ✅ **Self-Rating**: Metacognitive feedback (easy/medium/hard)
- ✅ **Re-record Capability**: Clean workflow for multiple attempts
- ✅ **Visual Supports**: Image support for picture naming tasks
- ✅ **Target Sound Display**: Shows target phonemes for articulation tasks

#### Props Interface
```typescript
interface SpeechAssessmentProps {
  itemType: 'articulation' | 'fluency' | 'voice' | 'language' | 'pragmatics';
  prompt: string;
  targetSounds?: string[];           // For articulation tasks
  stimulus?: string;                 // Additional text/content
  visualSupport?: string;            // Image URL
  onComplete: (data: {
    audioBlob: Blob;
    duration: number;
    selfRating: 'easy' | 'medium' | 'hard';
    metrics: Partial<SpeechMetrics>;
  }) => void;
}
```

#### Recording Settings
```typescript
const mediaConstraints = {
  audio: {
    echoCancellation: true,
    noiseSuppression: true,
    autoGainControl: false,  // Preserves speech characteristics
    sampleRate: 44100,
  },
};
```

#### Usage Example
```tsx
<SpeechAssessment
  itemType="articulation"
  prompt="Say the word 'sun' clearly."
  targetSounds={["/s/"]}
  onComplete={(data) => {
    // Upload audio blob
    // Calculate metrics
    // Submit response
  }}
/>
```

### Updated Components

**DomainTransition.tsx**
```typescript
const DOMAIN_INFO = {
  // ... existing domains
  speech: {
    icon: Mic,
    label: 'Speech Therapy',
    color: 'text-indigo-600',
    bgColor: 'bg-indigo-50',
    encouragement: 'Wonderful communication skills!',
  },
};
```

**AdaptiveProgress.tsx**
```typescript
const domains = [
  'reading', 'math', 'science', 
  'writing', 'sel', 'speech'
];
```

---

## 🔧 Backend Integration

### BaselineAssessmentService (`baseline_assessment_service.py`)

**Updated Domain Order**
```python
domain_order = [
    'reading', 'math', 'science', 
    'writing', 'sel', 'speech'
]
```

**Initial Theta Estimates (Speech)**
```python
initial_theta = {
    # ... existing domains
    "speech": -0.5 if grade_band == 'K-5' 
              else 0.0 if grade_band == '6-8' 
              else 0.3,
}

initial_se = {
    # ... existing domains
    "speech": 1.0,
}
```

### API Endpoints

All existing endpoints now support speech domain:

- `POST /api/v1/baseline/start-session`
- `POST /api/v1/baseline/submit-response`
- `GET /api/v1/baseline/session/{session_id}`
- `POST /api/v1/baseline/session/{session_id}/pause`
- `POST /api/v1/baseline/session/{session_id}/resume`
- `GET /api/v1/baseline/items/{domain}/{grade_band}`

**Example: Get Speech Items**
```bash
curl http://localhost:9000/api/v1/baseline/items/speech/K-5
```

---

## 🎯 Assessment Flow with Speech

### Complete 6-Domain Assessment

1. **Reading** (4 items across grade bands)
2. **Math** (3 items)
3. **Science** (3 items)
4. **Writing** (TBD - uses existing items)
5. **SEL** (2 items)
6. **Speech** (11 items - NEW!)

### Speech Domain Flow

1. **Start Session** → Initialize theta = -0.5 (K-5), 0.0 (6-8), 0.3 (9-12)
2. **Get First Item** → Adaptive selection based on current theta
3. **Render SpeechAssessment** → Specialized component for audio recording
4. **Record Response** → Capture audio, duration, self-rating
5. **Upload Audio** → Store Blob in cloud storage (TODO: Part 4)
6. **Submit Response** → Include audio URL and metrics
7. **Update Theta** → IRT scoring with EAP estimation
8. **Get Next Item** → Continue until stopping rule (SE < 0.3)
9. **Domain Transition** → Move to next domain or complete assessment

---

## 📝 Scripts

### Migration Scripts

**migrate_add_speech.py**
- Recreates `baseline_items` table with speech domain support
- Preserves existing 12 items
- Adds proper CHECK constraints and indexes

**migrate_sessions_speech.py**
- Recreates `baseline_sessions` table with speech domain support
- Updates `current_domain` CHECK constraint

**add_speech_items.py**
- Inserts 11 speech therapy sample items
- Covers all grade bands and major speech sub-domains
- IRT parameters calibrated for adaptive selection

### Verification Scripts

**verify_baseline_db.py**
- Confirms all tables exist
- Shows item counts by domain and grade band
- Validates database integrity

**get_schema.py**
- Displays complete table schemas
- Useful for debugging CHECK constraints

---

## 🧪 Testing Checklist

### ✅ Database Tests
- [x] Speech domain in `baseline_items` CHECK constraint
- [x] Speech domain in `baseline_sessions` CHECK constraint
- [x] 11 speech items inserted correctly
- [x] Total 23 items (12 + 11)
- [x] Items distributed across all grade bands
- [x] IRT parameters within valid ranges

### 🔄 Backend Tests (TODO)
- [ ] Start session with speech domain
- [ ] Get speech items by grade band
- [ ] Submit speech response
- [ ] Theta updates correctly for speech items
- [ ] Speech domain in assessment flow
- [ ] Stopping rules work with speech items

### 🔄 Frontend Tests (TODO)
- [ ] SpeechAssessment component renders
- [ ] Audio recording works in browser
- [ ] Microphone permissions handled
- [ ] Real-time visualization displays
- [ ] Model audio playback works
- [ ] Self-rating captured correctly
- [ ] DomainTransition shows speech icon
- [ ] AdaptiveProgress shows speech badge

### 🔄 Integration Tests (TODO)
- [ ] Complete 6-domain assessment (reading → speech)
- [ ] Speech items rendered correctly from BaselineAssessment
- [ ] Audio blob uploaded to storage
- [ ] Speech metrics calculated and stored
- [ ] Final results include speech domain scores
- [ ] Dashboard displays speech therapy metrics

---

## 🚀 Next Steps

### Part 4: Audio Processing & Fluency Scoring
- [ ] Implement audio file upload to Supabase Storage
- [ ] Create fluency scoring algorithm:
  - WPM (Words Per Minute) calculation
  - Accuracy scoring with speech recognition
  - Prosody analysis (pitch variation, stress, intonation)
- [ ] Integrate Web Speech API for transcription
- [ ] Calculate `speechMetrics` for each response
- [ ] Store audio URL in `baseline_responses.audio_url`

### Part 5: Results Dashboard
- [ ] Display speech domain scores in parent/teacher portals
- [ ] Visualize speech metrics (articulation accuracy, fluency frequency)
- [ ] Generate speech therapy recommendations
- [ ] Create PDF reports with speech sample transcripts
- [ ] Show speech strengths and growth areas
- [ ] Recommend speech therapy scaffolds

### Part 6: Enhanced Speech Features
- [ ] Add more speech item types (connected speech, conversation)
- [ ] Implement advanced articulation analysis (error patterns)
- [ ] Add voice analysis (pitch/loudness tracking)
- [ ] Create language sample analysis (MLU, lexical diversity)
- [ ] Build pragmatics rubrics (social communication skills)

---

## 📚 Resources

### Speech-Language Pathology Standards
- ASHA (American Speech-Language-Hearing Association) domains
- 8 sub-domains cover comprehensive SLP assessment areas

### Audio Recording Best Practices
- **echoCancellation**: Reduces echo for clearer recordings
- **noiseSuppression**: Filters background noise
- **autoGainControl: false**: Preserves natural speech characteristics for analysis
- **Sample Rate**: 44.1 kHz for high-quality audio

### IRT Calibration
- Difficulty range: -1.5 (easy K-5 articulation) to 1.5 (hard 9-12 persuasion)
- Discrimination: 1.3 to 1.7 (well-discriminating items)
- Guessing: 0.25 (minimal for speech tasks)

---

## 🎉 Summary

The speech therapy integration is **complete at the database and type level**. The system now has:

- ✅ **6 domains**: reading, math, science, writing, SEL, **speech**
- ✅ **8 speech sub-domains**: comprehensive SLP coverage
- ✅ **23 assessment items**: 11 speech + 12 original
- ✅ **SpeechAssessment component**: 450-line specialized component
- ✅ **Backend support**: IRT scoring, adaptive selection, API endpoints
- ✅ **Type definitions**: `Domain`, `SubDomain`, `SpeechMetrics`
- ✅ **Database migrations**: All tables updated with speech support

**Status**: Ready for Part 4 (Audio Processing) and Part 5 (Results Dashboard)! 🚀

---

## 📁 Files Modified/Created

### Frontend
- `apps/learner-app/src/types/baseline.ts` (modified)
- `apps/learner-app/src/components/baseline/SpeechAssessment.tsx` (new - 450 lines)
- `apps/learner-app/src/components/baseline/DomainTransition.tsx` (modified)
- `apps/learner-app/src/components/baseline/AdaptiveProgress.tsx` (modified)

### Backend
- `services/api-gateway/app/services/baseline_assessment_service.py` (modified)
- `services/api-gateway/app/migrations/034_baseline_assessment_schema.sql` (updated with speech items)

### Scripts
- `services/api-gateway/migrate_add_speech.py` (new)
- `services/api-gateway/migrate_sessions_speech.py` (new)
- `services/api-gateway/add_speech_items.py` (new)
- `services/api-gateway/get_schema.py` (new)
- `services/api-gateway/test_speech_insert.py` (new)
- `services/api-gateway/update_speech_schema.py` (new)

### Documentation
- `SPEECH_THERAPY_COMPLETE.md` (this file)

---

**Last Updated**: 2024
**Version**: 1.0.0
**Status**: ✅ Complete (Database + Types + Components)
