/**
 * Recommendations Section Component
 * Personalized recommendations based on assessment results
 */
import type { BaselineResults, Domain } from '../../../../../learner-app/src/types/baseline';

export function RecommendationsSection({ 
  results,
  childName 
}: { 
  results: BaselineResults;
  childName: string;
}) {
  const recommendations = generateRecommendations(results);

  return (
    <div className="space-y-6">
      {/* Scaffolds */}
      {results.scaffolds.length > 0 && (
        <div>
          <h4 className="font-semibold mb-3 text-gray-900">🛠️ Learning Supports in Place</h4>
          <div className="grid md:grid-cols-2 gap-3">
            {results.scaffolds.map((scaffold, idx) => (
              <ScaffoldCard key={idx} scaffold={scaffold} />
            ))}
          </div>
        </div>
      )}

      {/* Starting Levels */}
      <div>
        <h4 className="font-semibold mb-3 text-gray-900">📚 Instructional Starting Points</h4>
        <div className="grid md:grid-cols-2 gap-4">
          {Object.entries(results.startingLevels || {}).map(([domain, level]) => (
            <div key={domain} className="p-3 rounded-lg border bg-white">
              <div className="font-medium capitalize text-gray-900">{domain}</div>
              <div className="text-sm text-gray-600">{level as string}</div>
            </div>
          ))}
        </div>
      </div>

      {/* Custom Recommendations */}
      {recommendations.length > 0 && (
        <div>
          <h4 className="font-semibold mb-3 text-gray-900">💡 Personalized Recommendations</h4>
          <div className="space-y-3">
            {recommendations.map((rec, idx) => (
              <div key={idx} className="flex items-start gap-3 p-4 rounded-lg border bg-gradient-to-r from-blue-50 to-purple-50">
                <div className="text-2xl" role="img" aria-label={rec.title}>{rec.icon}</div>
                <div>
                  <div className="font-medium mb-1 text-gray-900">{rec.title}</div>
                  <p className="text-sm text-gray-600">{rec.description}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

function ScaffoldCard({ scaffold }: { scaffold: string }) {
  const scaffoldInfo: Record<string, { icon: string; title: string; description: string }> = {
    text_to_speech: {
      icon: '🔊',
      title: 'Text-to-Speech',
      description: 'Content will be read aloud automatically',
    },
    chunked_steps: {
      icon: '📋',
      title: 'Step-by-Step Instructions',
      description: 'Tasks broken into manageable pieces',
    },
    visual_supports: {
      icon: '🖼️',
      title: 'Visual Supports',
      description: 'Diagrams, pictures, and graphic organizers',
    },
    extended_time: {
      icon: '⏱️',
      title: 'Extended Time',
      description: 'Additional time for assignments and assessments',
    },
    simplified_language: {
      icon: '💬',
      title: 'Simplified Language',
      description: 'Content presented with clearer vocabulary',
    },
    speech_therapy: {
      icon: '🗣️',
      title: 'Speech Therapy Support',
      description: 'Targeted intervention for articulation',
    },
  };

  const info = scaffoldInfo[scaffold] || {
    icon: '🛠️',
    title: scaffold.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase()),
    description: 'Custom learning support',
  };

  return (
    <div className="flex items-start gap-3 p-3 rounded-lg border bg-white hover:shadow-md transition-shadow">
      <div className="text-2xl" role="img" aria-label={info.title}>{info.icon}</div>
      <div>
        <div className="font-medium text-gray-900">{info.title}</div>
        <div className="text-sm text-gray-600">{info.description}</div>
      </div>
    </div>
  );
}

function generateRecommendations(results: BaselineResults): Array<{ icon: string; title: string; description: string }> {
  const recs: Array<{ icon: string; title: string; description: string }> = [];

  // Reading recommendations
  if (results.domainScores.reading < results.domainScores.math - 1) {
    recs.push({
      icon: '📖',
      title: 'Increase reading practice',
      description: 'Consider 20 minutes of independent reading daily at their level to build fluency and comprehension.',
    });
  }

  // Math recommendations
  if (results.domainScores.math < results.domainScores.reading - 1) {
    recs.push({
      icon: '🔢',
      title: 'Strengthen math foundations',
      description: 'Focus on conceptual understanding with hands-on activities and visual models.',
    });
  }

  // Speech therapy recommendations
  if (results.speechMetrics && results.speechMetrics.articulation.phonemeAccuracy < 85) {
    recs.push({
      icon: '🗣️',
      title: 'Speech-language support',
      description: 'Consult with a speech-language pathologist to address articulation patterns.',
    });
  }

  // Engagement recommendations
  if (results.hesitationRate > 0.5) {
    recs.push({
      icon: '🎯',
      title: 'Build confidence',
      description: 'Start with slightly easier material to build confidence before advancing.',
    });
  }

  // Science recommendations
  if (results.domainScores.science < 3.0) {
    recs.push({
      icon: '🔬',
      title: 'Hands-on science exploration',
      description: 'Engage with age-appropriate experiments and nature observations to build scientific thinking.',
    });
  }

  return recs;
}
