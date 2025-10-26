/**
 * Parent/Guardian Results Dashboard
 * Detailed view with IRT metrics, recommendations, and downloadable report
 * WCAG 2.1 AA compliant with comprehensive accessibility features
 */
import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import type { BaselineResults, Domain } from '../../../../learner-app/src/types/baseline';
import { LoadingState, ErrorState } from './components/ResultsStates';
import { SummaryMetric } from './components/SummaryMetric';
import { SimpleTabs } from './components/SimpleTabs';
import { DomainAnalysis } from './components/DomainAnalysis';
import { ReadingFluencyAnalysis } from './components/ReadingFluencyAnalysis';
import { RecommendationsSection } from './components/RecommendationsSection';
import { IRTVisualization } from './components/IRTVisualization';

export function ChildResultsPage() {
  const { sessionId, childId } = useParams<{ sessionId: string; childId: string }>();
  const navigate = useNavigate();
  const [results, setResults] = useState<BaselineResults | null>(null);
  const [loading, setLoading] = useState(true);
  const [childName, setChildName] = useState('Your Child');
  const [showTechnical, setShowTechnical] = useState(false);

  useEffect(() => {
    loadResults();
  }, [sessionId]);

  const loadResults = async () => {
    try {
      // TODO: Replace with actual API call
      // const data = await BaselineAPI.getResults(sessionId!);
      
      // Mock data for demonstration
      const mockResults: BaselineResults = {
        sessionId: sessionId!,
        learnerId: childId!,
        gradeBand: 'K-5',
        completedAt: new Date(),
        totalTimeMs: 1200000,
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
        subDomainScores: {
          comprehension: 3.7,
          phonics: 3.2,
          fluency: 3.6,
          operations: 4.3,
          number_sense: 3.9,
          scientific_inquiry: 3.9,
          physical_science: 3.7,
          self_awareness: 4.0,
          relationship_skills: 3.8,
        },
        strengths: [
          'Reading comprehension - strong understanding of stories',
          'Math word problems - excellent real-world application',
          'Science observation - keen attention to detail',
          'SEL self-awareness - good emotional regulation',
        ],
        gaps: [
          'Reading phonics - needs support with decoding',
          'Math facts automaticity - practice basic operations',
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
        speechMetrics: {
          articulation: {
            phonemeAccuracy: 87,
            substitutions: 8,
            omissions: 2,
            distortions: 3,
            targetSounds: ['r', 'l', 'th', 's'],
            errorSounds: ['r', 'th'],
          },
          fluency: {
            stutteringFrequency: 2,
            disfluencyTypes: ['repetition'],
            secondaryBehaviors: [],
            naturalness: 8,
          },
          voice: {
            quality: 'Normal',
            pitch: 'Appropriate',
            loudness: 'Appropriate',
            resonance: 'Normal',
          },
          language: {
            expressionScore: 4.0,
            comprehensionScore: 4.2,
            vocabularyLevel: 4.1,
            sentenceComplexity: 3.8,
            narrativeAbility: 4.0,
          },
          pragmatics: {
            conversationTurns: 8,
            topicMaintenance: 9,
            eyeContact: 7,
            gestureUse: 8,
          },
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
      setChildName('Emma'); // Mock name
    } catch (error) {
      console.error('Error loading results:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleDownloadPDF = async () => {
    if (!results) return;
    alert('PDF download feature coming soon!');
    // await generatePDFReport(results, childName);
  };

  const handlePrint = () => {
    window.print();
  };

  if (loading) {
    return <LoadingState />;
  }

  if (!results) {
    return <ErrorState onRetry={() => navigate('/dashboard')} />;
  }

  const domains: Domain[] = ['reading', 'math', 'science', 'sel'];

  return (
    <div className="max-w-7xl mx-auto px-4 py-8 space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold mb-2 text-gray-900">
            {childName}'s Baseline Assessment Results
          </h1>
          <p className="text-gray-600">
            Completed on {new Date(results.completedAt).toLocaleDateString('en-US', {
              year: 'numeric',
              month: 'long',
              day: 'numeric',
            })}
          </p>
        </div>
        <div className="flex gap-2">
          <button
            onClick={handleDownloadPDF}
            className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors flex items-center gap-2"
          >
            📄 Download PDF
          </button>
          <button
            onClick={handlePrint}
            className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors flex items-center gap-2"
          >
            🖨️ Print
          </button>
        </div>
      </div>

      {/* Executive Summary */}
      <div className="bg-purple-50 border-2 border-purple-200 rounded-xl p-6">
        <h2 className="text-2xl font-bold mb-4 text-gray-900">Executive Summary</h2>
        <div className="grid md:grid-cols-3 gap-6">
          <SummaryMetric
            label="Overall Performance"
            value={getPerformanceSummary(results)}
            description="Compared to grade-level peers"
          />
          <SummaryMetric
            label="Time to Complete"
            value={formatDuration(results.totalTimeMs)}
            description={`${results.itemsAttempted} questions answered`}
          />
          <SummaryMetric
            label="Engagement"
            value={getEngagementLevel(results)}
            description="Persistence and effort shown"
          />
        </div>
      </div>

      {/* Domain Tabs */}
      <div className="bg-white rounded-xl shadow-lg border border-gray-200">
        <div className="p-6">
          <h2 className="text-2xl font-bold mb-2 text-gray-900">Subject-by-Subject Analysis</h2>
          <p className="text-gray-600 mb-4">
            Click each subject to see detailed breakdown
          </p>
          
          <SimpleTabs
            tabs={domains.map(domain => ({
              value: domain,
              label: getDomainLabel(domain),
              content: (
                <DomainAnalysis
                  domain={domain}
                  results={results}
                  showTechnical={showTechnical}
                />
              ),
            }))}
          />

          <div className="mt-6 flex justify-center">
            <button
              onClick={() => setShowTechnical(!showTechnical)}
              className="px-4 py-2 text-sm text-gray-600 hover:text-gray-900 hover:bg-gray-50 rounded-lg transition-colors"
            >
              {showTechnical ? '🔽 Hide' : '🔼 Show'} Technical Details (IRT Scale)
            </button>
          </div>
        </div>
      </div>

      {/* Reading Fluency & Speech Therapy (if available) */}
      {results.readingFluency && (
        <div className="bg-white rounded-xl shadow-lg border border-gray-200 p-6">
          <h2 className="text-2xl font-bold mb-2 text-gray-900">Reading Fluency & Speech Analysis</h2>
          <p className="text-gray-600 mb-4">
            Based on oral reading recording
          </p>
          <ReadingFluencyAnalysis 
            fluency={results.readingFluency}
            speechMetrics={results.speechMetrics}
          />
        </div>
      )}

      {/* Recommendations */}
      <div className="bg-white rounded-xl shadow-lg border border-gray-200 p-6">
        <h2 className="text-2xl font-bold mb-4 text-gray-900">
          Recommendations for Supporting {childName}
        </h2>
        <RecommendationsSection results={results} childName={childName} />
      </div>

      {/* IRT Visualization (Technical) */}
      {showTechnical && (
        <div className="bg-white rounded-xl shadow-lg border border-gray-200 p-6">
          <h2 className="text-2xl font-bold mb-2 text-gray-900">
            Technical Measurement Details (IRT Scale)
          </h2>
          <p className="text-gray-600 mb-4">
            For educators and specialists
          </p>
          <IRTVisualization results={results} />
        </div>
      )}
    </div>
  );
}

// ═════════════════════════════════════════════════════════
// Helper Functions
// ═════════════════════════════════════════════════════════

function getDomainLabel(domain: Domain): string {
  const labels: Partial<Record<Domain, string>> = {
    reading: '📖 Reading',
    math: '🔢 Math',
    science: '🔬 Science',
    sel: '🧠 SEL',
    speech: '🗣️ Speech',
    writing: '✍️ Writing',
  };
  return labels[domain] || domain;
}

function getPerformanceSummary(results: BaselineResults): string {
  const avgTheta = (
    (results.abilityEstimates?.reading ?? 0) +
    (results.abilityEstimates?.math ?? 0) +
    (results.abilityEstimates?.science ?? 0) +
    (results.abilityEstimates?.sel ?? 0)
  ) / 4;
  
  if (avgTheta > 0.5) return '✨ Above Grade Level';
  if (avgTheta > -0.5) return '✓ At Grade Level';
  return '📚 Developing';
}

function formatDuration(ms: number): string {
  const minutes = Math.floor(ms / 60000);
  if (minutes < 60) return `${minutes} minutes`;
  const hours = Math.floor(minutes / 60);
  const remainingMinutes = minutes % 60;
  return `${hours}h ${remainingMinutes}m`;
}

function getEngagementLevel(results: BaselineResults): string {
  const hesitationRate = results.hesitationRate || 0;
  const completionRate = results.completionRate || 1;
  
  if (completionRate >= 0.95 && hesitationRate < 0.3) return '🌟 Excellent';
  if (completionRate >= 0.85) return '✓ Good';
  return '~ Fair';
}

// Export helper functions for use in other files
export {
  getDomainLabel,
  getPerformanceSummary,
  formatDuration,
  getEngagementLevel,
};
