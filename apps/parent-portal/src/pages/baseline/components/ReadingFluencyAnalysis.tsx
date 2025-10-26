/**
 * Reading Fluency Analysis Component
 * Displays reading fluency metrics and speech therapy analysis
 */
import type { BaselineResults } from '../../../../../learner-app/src/types/baseline';

export function ReadingFluencyAnalysis({ 
  fluency, 
  speechMetrics 
}: { 
  fluency: BaselineResults['readingFluency'];
  speechMetrics?: BaselineResults['speechMetrics'];
}) {
  if (!fluency) return null;

  const metrics = [
    { label: 'Words Per Minute', value: fluency.wordsPerMinute, benchmark: fluency.wordsPerMinute >= 100 ? 'above' : 'at' },
    { label: 'Accuracy', value: `${Math.round(fluency.accuracy)}%`, benchmark: fluency.accuracy >= 95 ? 'above' : 'at' },
    { label: 'Expression', value: `${fluency.expression.toFixed(1)}/10`, benchmark: fluency.expression >= 7 ? 'above' : 'at' },
    { label: 'Automaticity', value: `${fluency.automaticity.toFixed(1)}/10`, benchmark: fluency.automaticity >= 7 ? 'above' : 'at' },
  ];

  return (
    <div className="space-y-6">
      {/* Fluency Metrics Grid */}
      <div className="grid md:grid-cols-4 gap-4">
        {metrics.map((metric, idx) => (
          <div 
            key={idx} 
            className={`p-4 rounded-lg border-2 ${
              metric.benchmark === 'above' 
                ? 'border-green-300 bg-green-50' 
                : 'border-gray-200 bg-white'
            }`}
          >
            <div className="text-2xl font-bold mb-1 text-gray-900">{metric.value}</div>
            <div className="text-sm text-gray-600">{metric.label}</div>
            {metric.benchmark === 'above' && (
              <div className="text-xs text-green-600 font-medium mt-2">Above Expected</div>
            )}
          </div>
        ))}
      </div>

      {/* Speech Therapy Analysis */}
      {speechMetrics && speechMetrics.articulation && (
        <div className="p-4 rounded-lg border bg-purple-50 border-purple-200">
          <h4 className="font-semibold text-purple-900 mb-3 flex items-center gap-2">
            <span role="img" aria-label="Speaking">🗣️</span>
            <span>Speech & Articulation Analysis</span>
          </h4>

          <div className="grid md:grid-cols-2 gap-4 mb-4">
            <div>
              <div className="text-sm text-purple-700 mb-1">Phoneme Accuracy</div>
              <div className="flex items-center gap-2">
                <div className="flex-1 h-2 bg-purple-200 rounded-full overflow-hidden">
                  <div 
                    className="h-full bg-purple-600 transition-all duration-500"
                    style={{ width: `${speechMetrics.articulation.phonemeAccuracy}%` }}
                  />
                </div>
                <span className="text-sm font-medium">{Math.round(speechMetrics.articulation.phonemeAccuracy)}%</span>
              </div>
            </div>
          </div>

          {/* Error Sounds */}
          {speechMetrics.articulation.errorSounds && speechMetrics.articulation.errorSounds.length > 0 && (
            <div className="mb-4">
              <div className="text-sm font-medium text-purple-900 mb-2">
                Sounds Needing Practice
              </div>
              <div className="flex flex-wrap gap-2">
                {speechMetrics.articulation.errorSounds.map((sound: string, idx: number) => (
                  <span key={idx} className="text-xs px-2 py-1 rounded bg-purple-100 text-purple-800">
                    {sound}
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* Voice Quality */}
          {speechMetrics.voice && (
            <div className="mb-4">
              <div className="text-sm font-medium text-purple-900 mb-2">
                Voice Quality
              </div>
              <div className="grid grid-cols-2 gap-2 text-sm">
                <div>
                  <span className="text-purple-700">Quality:</span> {speechMetrics.voice.quality}
                </div>
                <div>
                  <span className="text-purple-700">Pitch:</span> {speechMetrics.voice.pitch}
                </div>
                <div>
                  <span className="text-purple-700">Loudness:</span> {speechMetrics.voice.loudness}
                </div>
                <div>
                  <span className="text-purple-700">Resonance:</span> {speechMetrics.voice.resonance}
                </div>
              </div>
            </div>
          )}

          {/* Referral Recommendation */}
          {speechMetrics.articulation.phonemeAccuracy < 85 && (
            <div className="mt-4 p-3 rounded bg-purple-100 border border-purple-300">
              <p className="text-sm text-purple-900">
                <strong>📋 Recommendation:</strong> Consider a speech-language evaluation to 
                support your child's communication development. These patterns are common and 
                highly treatable with targeted intervention.
              </p>
            </div>
          )}
        </div>
      )}

      {/* Language Metrics */}
      {speechMetrics && speechMetrics.language && (
        <div className="grid md:grid-cols-2 gap-4">
          <div className="p-4 rounded-lg border bg-blue-50 border-blue-200">
            <h5 className="font-semibold text-blue-900 mb-3">Language Skills</h5>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-blue-700">Expression:</span>
                <span className="font-medium">Grade {speechMetrics.language.expressionScore.toFixed(1)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-blue-700">Comprehension:</span>
                <span className="font-medium">Grade {speechMetrics.language.comprehensionScore.toFixed(1)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-blue-700">Vocabulary:</span>
                <span className="font-medium">Grade {speechMetrics.language.vocabularyLevel.toFixed(1)}</span>
              </div>
            </div>
          </div>

          {speechMetrics.pragmatics && (
            <div className="p-4 rounded-lg border bg-green-50 border-green-200">
              <h5 className="font-semibold text-green-900 mb-3">Social Communication</h5>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-green-700">Conversation Turns:</span>
                  <span className="font-medium">{speechMetrics.pragmatics.conversationTurns}/10</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-green-700">Topic Maintenance:</span>
                  <span className="font-medium">{speechMetrics.pragmatics.topicMaintenance}/10</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-green-700">Eye Contact:</span>
                  <span className="font-medium">{speechMetrics.pragmatics.eyeContact}/10</span>
                </div>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
