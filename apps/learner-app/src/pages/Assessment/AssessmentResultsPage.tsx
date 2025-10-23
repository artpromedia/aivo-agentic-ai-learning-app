/**
 * Assessment Results Page
 * 
 * Shows:
 * - Overall score and breakdown
 * - Brain model updates
 * - Strengths and areas to focus on
 * - Encouraging message
 * - Next assessment date
 */

import { useEffect, useState } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import confetti from 'canvas-confetti';
import { assessmentApi } from '@/api/assessmentApi';

interface AssessmentResults {
  assessment_id: string;
  completed_at: string;
  results: {
    overall_score: number;
    subjects: {
      [key: string]: {
        score: number;
        level: string;
        strengths: string[];
        weaknesses: string[];
        questions_correct: number;
        questions_total: number;
      };
    };
    recommended_level: string;
  };
  brain_model_updated: boolean;
  new_brain_model_version: string;
  next_assessment_date: string;
  message: string;
}

interface SubjectCardProps {
  subject: string;
  data: {
    score: number;
    level: string;
    questions_correct: number;
    questions_total: number;
  };
}

export function AssessmentResultsPage() {
  const { assessmentId } = useParams<{ assessmentId: string }>();
  const navigate = useNavigate();
  const location = useLocation();

  const [results, setResults] = useState<AssessmentResults | null>(
    location.state?.results || null
  );
  const [loading, setLoading] = useState(!results);

  useEffect(() => {
    if (!results) {
      loadResults();
    } else {
      celebrateCompletion(results.results.overall_score);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const loadResults = async () => {
    try {
      setLoading(true);
      const response = await assessmentApi.getResults(assessmentId!);
      setResults(response.data);
      celebrateCompletion(response.data.results.overall_score);
    } catch (error) {
      console.error('Failed to load results:', error);
      alert('Failed to load assessment results');
    } finally {
      setLoading(false);
    }
  };

  const celebrateCompletion = (_score: number) => {
    // Trigger confetti based on score
    confetti({
      particleCount: 100,
      spread: 70,
      origin: { y: 0.6 }
    });

    setTimeout(() => {
      confetti({
        particleCount: 50,
        angle: 60,
        spread: 55,
        origin: { x: 0 }
      });
      confetti({
        particleCount: 50,
        angle: 120,
        spread: 55,
        origin: { x: 1 }
      });
    }, 250);
  };

  const handleContinue = () => {
    navigate('/subjects');
  };

  if (loading || !results) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-xl">Loading results...</div>
      </div>
    );
  }

  const { overall_score, subjects } = results.results;

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 to-pink-50 py-8 px-4">
      <div className="max-w-4xl mx-auto space-y-8">
        {/* Header */}
        <div className="text-center">
          <div className="text-6xl mb-4">🏆</div>
          <h1 className="text-4xl font-bold mb-2">
            Assessment Complete! 🎉
          </h1>
          <p className="text-xl text-gray-600">
            {results.message}
          </p>
        </div>

        {/* Overall Score */}
        <div className="bg-gradient-to-r from-blue-500 to-purple-600 text-white p-8 rounded-xl shadow-xl">
          <div className="text-center space-y-4">
            <p className="text-sm uppercase font-medium opacity-90">
              Overall Score
            </p>
            <div className="text-6xl font-bold">
              {Math.round(overall_score)}%
            </div>
            <div className="w-full bg-white/30 rounded-full h-2">
              <div 
                className="bg-white h-2 rounded-full transition-all duration-1000"
                style={{ width: `${overall_score}%` }}
              />
            </div>
            <p className="text-lg opacity-90">
              {getScoreMessage(overall_score)}
            </p>
          </div>
        </div>

        {/* Brain Update Alert */}
        {results.brain_model_updated && (
          <div className="bg-green-50 border-2 border-green-500 p-6 rounded-lg">
            <div className="flex items-start gap-4">
              <div className="text-4xl">⚡</div>
              <div className="flex-1">
                <h3 className="text-xl font-bold text-green-800 mb-2">
                  Your Learning Brain Has Been Updated! 🧠✨
                </h3>
                <p className="text-green-700">
                  Based on your assessment, we've personalized your AI learning brain 
                  to match your current level: <strong>{results.results.recommended_level}</strong>
                </p>
                <p className="text-sm text-green-600 mt-2">
                  Model Version: {results.new_brain_model_version}
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Subject Breakdown */}
        <div>
          <h2 className="text-2xl font-bold mb-4">Subject Breakdown</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {Object.entries(subjects).map(([subject, data]) => (
              <SubjectCard
                key={subject}
                subject={subject}
                data={data}
              />
            ))}
          </div>
        </div>

        {/* Strengths */}
        <div>
          <div className="flex items-center gap-2 mb-4">
            <span className="text-2xl">✅</span>
            <h2 className="text-2xl font-bold">Your Strengths</h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {Object.entries(subjects).map(([subject, data]) => 
              data.strengths.map((strength, idx) => (
                <div
                  key={`${subject}-${idx}`}
                  className="bg-green-50 p-4 rounded-md border border-green-200"
                >
                  <div className="flex items-center gap-2">
                    <span className="px-2 py-1 bg-green-500 text-white text-xs rounded">
                      {subject}
                    </span>
                    <span className="font-medium">{strength}</span>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Areas to Focus */}
        <div>
          <div className="flex items-center gap-2 mb-4">
            <span className="text-2xl">🎯</span>
            <h2 className="text-2xl font-bold">Let's Work On</h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {Object.entries(subjects).map(([subject, data]) => 
              data.weaknesses.map((weakness, idx) => (
                <div
                  key={`${subject}-${idx}`}
                  className="bg-orange-50 p-4 rounded-md border border-orange-200"
                >
                  <div className="flex items-center gap-2">
                    <span className="px-2 py-1 bg-orange-500 text-white text-xs rounded">
                      {subject}
                    </span>
                    <span className="font-medium">{weakness}</span>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        <hr className="border-gray-300" />

        {/* Next Assessment */}
        <div className="bg-blue-50 p-6 rounded-lg border border-blue-200">
          <div className="flex items-center gap-4">
            <span className="text-3xl">📅</span>
            <div>
              <p className="font-semibold text-blue-800">
                Next Progress Check
              </p>
              <p className="text-blue-700">
                {formatDate(results.next_assessment_date)} (90 days from now)
              </p>
              <p className="text-sm text-blue-600 mt-1">
                We'll check in to see how much you've grown!
              </p>
            </div>
          </div>
        </div>

        {/* Continue Button */}
        <button
          onClick={handleContinue}
          className="w-full bg-blue-500 hover:bg-blue-600 text-white font-bold py-4 px-6 rounded-lg text-lg transition-colors flex items-center justify-center gap-2"
        >
          Start Learning! 🚀
        </button>
      </div>
    </div>
  );
}

function SubjectCard({ subject, data }: SubjectCardProps) {
  const getColor = (score: number) => {
    if (score >= 90) return 'green';
    if (score >= 75) return 'blue';
    if (score >= 60) return 'yellow';
    return 'orange';
  };

  const color = getColor(data.score);
  const colorClasses = {
    green: 'border-green-200 bg-green-50',
    blue: 'border-blue-200 bg-blue-50',
    yellow: 'border-yellow-200 bg-yellow-50',
    orange: 'border-orange-200 bg-orange-50'
  };

  return (
    <div className={`bg-white p-6 rounded-lg shadow-md border-2 ${colorClasses[color]}`}>
      <div className="space-y-3">
        <div className="flex justify-between items-center">
          <h3 className="font-bold text-lg">{subject}</h3>
          <span className={`px-3 py-1 bg-${color}-500 text-white rounded font-bold`}>
            {Math.round(data.score)}%
          </span>
        </div>

        <div className="w-full bg-gray-200 rounded-full h-2">
          <div 
            className={`bg-${color}-500 h-2 rounded-full transition-all duration-500`}
            style={{ width: `${data.score}%` }}
          />
        </div>

        <p className="text-sm text-gray-600">
          {data.questions_correct} of {data.questions_total} correct
        </p>

        <hr className="border-gray-200" />

        <div>
          <p className="text-xs text-gray-500 mb-1">Your Level</p>
          <p className={`font-semibold text-${color}-700`}>
            {data.level}
          </p>
        </div>
      </div>
    </div>
  );
}

function getScoreMessage(score: number): string {
  if (score >= 90) return "Outstanding performance! 🌟";
  if (score >= 80) return "Great work! 🎉";
  if (score >= 70) return "Good job! 👍";
  if (score >= 60) return "Nice effort! 💪";
  return "Keep learning! 🌱";
}

function formatDate(dateString: string): string {
  const date = new Date(dateString);
  return date.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });
}
