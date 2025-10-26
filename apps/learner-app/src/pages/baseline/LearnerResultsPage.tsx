/**
 * Learner-Facing Results Page
 * Simple, encouraging view of baseline assessment results
 * WCAG 2.1 AA compliant with reduced motion support
 */
import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion, useReducedMotion } from 'framer-motion';
import Confetti from 'react-confetti';
import { useWindowSize } from '@/hooks/useWindowSize';
import type { BaselineResults, Domain } from '@/types/baseline';

export function LearnerResultsPage() {
  const { sessionId } = useParams<{ sessionId: string }>();
  const navigate = useNavigate();
  const [results, setResults] = useState<BaselineResults | null>(null);
  const [loading, setLoading] = useState(true);
  const [showConfetti, setShowConfetti] = useState(true);
  const prefersReducedMotion = useReducedMotion();
  const { width, height } = useWindowSize();

  useEffect(() => {
    loadResults();
    // Stop confetti after 5 seconds
    if (!prefersReducedMotion) {
      setTimeout(() => setShowConfetti(false), 5000);
    } else {
      setShowConfetti(false);
    }
  }, [sessionId, prefersReducedMotion]);

  const loadResults = async () => {
    try {
      // TODO: Replace with actual API call
      // const data = await BaselineAPI.getResults(sessionId!);
      
      // Mock data for now
      const mockResults: BaselineResults = {
        sessionId: sessionId!,
        learnerId: 'learner-123',
        gradeBand: 'K-5',
        completedAt: new Date(),
        totalTimeMs: 1200000, // 20 minutes
        itemsAttempted: 28,
        accuracyRate: 0.75,
        domainScores: {
          reading: 3.5,
          math: 4.1,
          science: 3.8,
          sel: 4.2,
        },
        abilityEstimates: {
          reading: -0.2,
          math: 0.3,
          science: 0.1,
          sel: 0.4,
        },
        standardErrors: {
          reading: 0.28,
          math: 0.25,
          science: 0.32,
          sel: 0.27,
        },
        subDomainScores: {},
        strengths: [
          'Reading comprehension - understanding stories',
          'Math word problems - solving real-world math',
          'Science observation - noticing details',
        ],
        gaps: [
          'Reading phonics - sounding out new words',
          'Math facts - quick recall of addition',
        ],
        scaffolds: ['text_to_speech', 'visual_supports', 'extended_time'],
        startingLevels: {
          reading: 'Grade 3 Level 2',
          math: 'Grade 4 Level 1',
          science: 'Grade 3 Level 3',
          sel: 'Grade 4 Level 2',
        },
        averageTimePerItem: 42857,
        hesitationRate: 0.32,
        completionRate: 1.0,
        readingFluency: {
          wordsPerMinute: 95,
          accuracy: 92,
          expression: 7.2,
          automaticity: 6.8,
        },
        confidenceIntervals: {
          reading: { lower: 3.2, upper: 3.8 },
          math: { lower: 3.8, upper: 4.4 },
          science: { lower: 3.5, upper: 4.1 },
          sel: { lower: 3.9, upper: 4.5 },
        },
        modelVersion: '1.0.0',
        itemPoolVersion: '2025-01',
      };
      
      setResults(mockResults);
    } catch (error) {
      console.error('Error loading results:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-4 border-purple-600 mx-auto mb-4" role="status" aria-label="Loading"></div>
          <p className="text-gray-600 text-lg">Loading your results...</p>
        </div>
      </div>
    );
  }

  if (!results) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50">
        <div className="max-w-md p-8 bg-white rounded-xl shadow-lg">
          <p className="text-center text-gray-600">
            Results not found. Please try again later.
          </p>
          <button
            onClick={() => navigate('/assessment')}
            className="mt-4 w-full px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors"
          >
            Back to Assessment
          </button>
        </div>
      </div>
    );
  }

  const domains: Domain[] = ['reading', 'math', 'science', 'sel'];
  const domainLabels: Partial<Record<Domain, string>> = {
    reading: '📖 Reading',
    math: '🔢 Math',
    science: '🔬 Science',
    sel: '🧠 Learning Skills',
    speech: '🗣️ Speech',
    writing: '✍️ Writing',
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50 py-8">
      {showConfetti && !prefersReducedMotion && (
        <Confetti
          width={width}
          height={height}
          recycle={false}
          numberOfPieces={500}
        />
      )}

      <div className="max-w-4xl mx-auto px-4 space-y-8">
        {/* Hero Section */}
        <MotionWrapper
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          <div className="bg-white/80 backdrop-blur rounded-2xl shadow-lg border-2 border-purple-200 p-8 text-center">
            <MotionWrapper
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ delay: 0.3, type: 'spring', stiffness: 200 }}
              className="text-6xl mb-4"
              role="img"
              aria-label="Celebration"
            >
              🎉
            </MotionWrapper>
            <h1 className="text-3xl md:text-4xl font-bold mb-2 text-gray-800">
              You did it!
            </h1>
            <p className="text-lg text-gray-600">
              You answered <strong className="text-purple-600">{results.itemsAttempted}</strong> questions and we found your perfect starting spots.
            </p>
          </div>
        </MotionWrapper>

        {/* Domain Cards */}
        <div className="grid md:grid-cols-2 gap-6">
          {domains
            .filter(domain => results.domainScores?.[domain] !== undefined)
            .map((domain, index) => {
              const gradeLevel = results.domainScores[domain] ?? 0;
              const theta = results.abilityEstimates[domain] ?? 0;
              return (
            <MotionWrapper
              key={domain}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.4 + index * 0.1 }}
            >
              <DomainResultCard
                domain={domain}
                label={domainLabels[domain] || domain}
                gradeLevel={gradeLevel}
                theta={theta}
                strengths={results.strengths.filter(s => 
                  s.toLowerCase().includes(domain)
                )}
                gradeBand={results.gradeBand}
              />
            </MotionWrapper>
          );
          })}
        </div>

        {/* Reading Fluency (if available) */}
        {results.readingFluency && (
          <MotionWrapper
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.8 }}
          >
            <ReadingFluencyCard fluency={results.readingFluency} />
          </MotionWrapper>
        )}

        {/* Your Supports */}
        {results.scaffolds.length > 0 && (
          <MotionWrapper
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 1.0 }}
          >
            <div className="bg-white rounded-2xl shadow-lg p-6">
              <h2 className="text-2xl font-bold mb-2 flex items-center gap-2">
                <span role="img" aria-label="Tools">🛠️</span>
                <span>Your Learning Supports</span>
              </h2>
              <p className="text-sm text-gray-600 mb-4">
                We'll give you these helpful tools to make learning easier:
              </p>
              <div className="grid gap-3">
                {results.scaffolds.map((scaffold, idx) => (
                  <ScaffoldBadge key={idx} scaffold={scaffold} />
                ))}
              </div>
            </div>
          </MotionWrapper>
        )}

        {/* Next Steps */}
        <MotionWrapper
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 1.2 }}
        >
          <div className="bg-gradient-to-r from-purple-50 to-pink-50 rounded-2xl shadow-lg border-2 border-purple-200 p-6">
            <h2 className="text-2xl font-bold mb-4 text-gray-800">What happens next?</h2>
            <div className="space-y-4">
              <NextStep number={1}>
                We'll start your lessons at the right level for you.
              </NextStep>
              <NextStep number={2}>
                You'll get helpful supports like read-aloud when you need them.
              </NextStep>
              <NextStep number={3}>
                We'll check your progress every few weeks and adjust.
              </NextStep>
              <div className="pt-4">
                <button
                  onClick={() => navigate('/learning')}
                  className="w-full px-6 py-3 bg-purple-600 text-white text-lg font-semibold rounded-lg hover:bg-purple-700 transition-colors shadow-md hover:shadow-lg focus:outline-none focus:ring-4 focus:ring-purple-300"
                >
                  Start Learning! 🚀
                </button>
              </div>
            </div>
          </div>
        </MotionWrapper>
      </div>
    </div>
  );
}

// ═════════════════════════════════════════════════════════
// SUB-COMPONENTS
// ═════════════════════════════════════════════════════════

function MotionWrapper({ children, ...props }: any) {
  const prefersReducedMotion = useReducedMotion();
  
  if (prefersReducedMotion) {
    return <div {...props}>{children}</div>;
  }
  
  return <motion.div {...props}>{children}</motion.div>;
}

function DomainResultCard({
  domain,
  label,
  gradeLevel,
  theta,
  strengths,
  gradeBand,
}: {
  domain: string;
  label: string;
  gradeLevel: number;
  theta: number;
  strengths: string[];
  gradeBand: string;
}) {
  // Calculate progress bar position (relative to grade band)
  const bandMin = gradeBand === 'K-5' ? 0 : gradeBand === '6-8' ? 5 : 8;
  const bandMax = gradeBand === 'K-5' ? 6 : gradeBand === '6-8' ? 9 : 13;
  const progress = ((gradeLevel - bandMin) / (bandMax - bandMin)) * 100;

  return (
    <div className="h-full bg-white rounded-2xl shadow-lg p-6 border border-gray-200">
      <h3 className="text-xl font-bold mb-4 text-gray-800">{label}</h3>
      
      <div className="space-y-4">
        {/* Grade Level Badge */}
        <div className="flex items-center gap-3">
          <div className="rounded-full bg-purple-100 px-4 py-2 text-2xl font-bold text-purple-600">
            Grade {gradeLevel.toFixed(1)}
          </div>
          <div className="text-sm text-gray-600">
            Your starting level
          </div>
        </div>

        {/* Progress Bar */}
        <div>
          <div className="flex justify-between text-xs text-gray-500 mb-2">
            <span>Grade {bandMin}</span>
            <span>Grade {bandMax}</span>
          </div>
          <div className="h-3 bg-gray-200 rounded-full overflow-hidden">
            <div
              className="h-full bg-gradient-to-r from-purple-500 to-pink-500 transition-all duration-500"
              style={{ width: `${Math.max(0, Math.min(100, progress))}%` }}
              role="progressbar"
              aria-valuenow={progress}
              aria-valuemin={0}
              aria-valuemax={100}
              aria-label={`Progress: ${progress.toFixed(0)}%`}
            />
          </div>
        </div>

        {/* Strengths */}
        {strengths.length > 0 && (
          <div className="pt-2">
            <p className="text-sm font-medium mb-2 text-gray-700">✨ You're great at:</p>
            <ul className="space-y-1">
              {strengths.map((strength, idx) => (
                <li key={idx} className="text-sm text-gray-600 pl-4 relative before:content-['•'] before:absolute before:left-0 before:text-purple-500">
                  {strength}
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>
    </div>
  );
}

function ReadingFluencyCard({ fluency }: { fluency: BaselineResults['readingFluency'] }) {
  if (!fluency) return null;

  return (
    <div className="bg-white rounded-2xl shadow-lg p-6">
      <h2 className="text-2xl font-bold mb-4 flex items-center gap-2">
        <span role="img" aria-label="Speaking">🗣️</span>
        <span>Your Reading Voice</span>
      </h2>
      
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <FluencyMetric
          label="Speed"
          value={fluency.wordsPerMinute}
          unit=" words/min"
          emoji="⚡"
        />
        <FluencyMetric
          label="Accuracy"
          value={Math.round(fluency.accuracy)}
          unit="%"
          emoji="🎯"
        />
        <FluencyMetric
          label="Expression"
          value={fluency.expression.toFixed(1)}
          unit="/10"
          emoji="🎭"
        />
        <FluencyMetric
          label="Smoothness"
          value={fluency.automaticity.toFixed(1)}
          unit="/10"
          emoji="🌊"
        />
      </div>

      {fluency.accuracy < 80 && (
        <div className="mt-4 p-3 rounded-lg bg-blue-50 border border-blue-200">
          <p className="text-sm text-blue-900">
            💡 <strong>Tip:</strong> We noticed some speech sounds that could use practice. 
            Your teacher will have fun activities to help!
          </p>
        </div>
      )}
    </div>
  );
}

function FluencyMetric({
  label,
  value,
  unit,
  emoji,
}: {
  label: string;
  value: number | string;
  unit: string;
  emoji: string;
}) {
  return (
    <div className="text-center">
      <div className="text-2xl mb-1" role="img" aria-label={label}>
        {emoji}
      </div>
      <div className="text-2xl font-bold text-purple-600">
        {value}<span className="text-sm text-gray-500">{unit}</span>
      </div>
      <div className="text-xs text-gray-500">{label}</div>
    </div>
  );
}

function ScaffoldBadge({ scaffold }: { scaffold: string }) {
  const scaffoldLabels: Record<string, { icon: string; label: string; description: string }> = {
    text_to_speech: {
      icon: '🔊',
      label: 'Read Aloud',
      description: 'Text will be read to you',
    },
    chunked_steps: {
      icon: '📋',
      label: 'Step-by-Step',
      description: 'Break tasks into smaller pieces',
    },
    visual_supports: {
      icon: '🖼️',
      label: 'Visual Helpers',
      description: 'Pictures and diagrams',
    },
    extended_time: {
      icon: '⏱️',
      label: 'Extra Time',
      description: 'No rush, take your time',
    },
    simplified_language: {
      icon: '💬',
      label: 'Simpler Words',
      description: 'Easier-to-read text',
    },
    speech_therapy: {
      icon: '🗣️',
      label: 'Speech Support',
      description: 'Practice speech sounds',
    },
  };

  const config = scaffoldLabels[scaffold] || {
    icon: '🛠️',
    label: scaffold.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase()),
    description: '',
  };

  return (
    <div className="flex items-start gap-3 p-3 rounded-lg border border-gray-200 bg-white hover:shadow-md transition-shadow">
      <div className="text-2xl" role="img" aria-label={config.label}>
        {config.icon}
      </div>
      <div>
        <div className="font-medium text-gray-800">{config.label}</div>
        <div className="text-sm text-gray-600">{config.description}</div>
      </div>
    </div>
  );
}

function NextStep({ number, children }: { number: number; children: React.ReactNode }) {
  return (
    <div className="flex items-start gap-3">
      <div className="flex-shrink-0 w-8 h-8 rounded-full bg-purple-600 text-white flex items-center justify-center font-bold">
        {number}
      </div>
      <p className="pt-1 text-gray-700">{children}</p>
    </div>
  );
}
