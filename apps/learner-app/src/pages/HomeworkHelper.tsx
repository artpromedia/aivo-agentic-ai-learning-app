/**
 * Homework Helper Demo Page
 * Showcases the homework upload and input interface
 */

import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { HomeworkUpload } from '../components/HomeworkHelper';
import type { HomeworkSession } from '@aivo/types';

export default function HomeworkHelperPage() {
  const [currentSession, setCurrentSession] = useState<HomeworkSession | null>(null);
  const navigate = useNavigate();

  const handleSessionCreated = (session: HomeworkSession) => {
    console.log('Homework session created:', session);
    setCurrentSession(session);
  };

  const handleContinueToGuidance = () => {
    if (currentSession) {
      navigate(`/homework-helper/${currentSession.id}`);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-purple-50 dark:from-neutral-900 dark:to-neutral-800 py-8 px-4">
      <div className="max-w-4xl mx-auto">
        {!currentSession ? (
          <HomeworkUpload
            learnerId="demo_learner_123"
            onSessionCreated={handleSessionCreated}
          />
        ) : (
          <div className="bg-white dark:bg-neutral-800 rounded-2xl shadow-xl p-8">
            <div className="text-center mb-6">
              <div className="text-6xl mb-4">🎉</div>
              <h2 className="text-3xl font-bold mb-2">Session Created!</h2>
              <p className="text-neutral-600 dark:text-neutral-400">
                Your homework session has been created successfully.
              </p>
            </div>

            <div className="space-y-4 mb-6">
              <div className="bg-neutral-50 dark:bg-neutral-900 rounded-xl p-4">
                <h3 className="font-semibold mb-2">Session Details</h3>
                <dl className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <dt className="text-neutral-600 dark:text-neutral-400">Session ID:</dt>
                    <dd className="font-mono">{currentSession.id}</dd>
                  </div>
                  <div className="flex justify-between">
                    <dt className="text-neutral-600 dark:text-neutral-400">Title:</dt>
                    <dd className="font-medium">{currentSession.title}</dd>
                  </div>
                  <div className="flex justify-between">
                    <dt className="text-neutral-600 dark:text-neutral-400">Input Method:</dt>
                    <dd className="capitalize">{currentSession.inputMethod}</dd>
                  </div>
                  <div className="flex justify-between">
                    <dt className="text-neutral-600 dark:text-neutral-400">Detected Subject:</dt>
                    <dd className="font-medium">{currentSession.detectedSubject || 'Analyzing...'}</dd>
                  </div>
                  <div className="flex justify-between">
                    <dt className="text-neutral-600 dark:text-neutral-400">Current Step:</dt>
                    <dd className="capitalize font-medium text-blue-600 dark:text-blue-400">
                      {currentSession.currentStep}
                    </dd>
                  </div>
                  <div className="flex justify-between">
                    <dt className="text-neutral-600 dark:text-neutral-400">Files:</dt>
                    <dd>{currentSession.files.length} uploaded</dd>
                  </div>
                </dl>
              </div>

              {currentSession.files.length > 0 && (
                <div className="bg-neutral-50 dark:bg-neutral-900 rounded-xl p-4">
                  <h3 className="font-semibold mb-2">Uploaded Files</h3>
                  <ul className="space-y-2 text-sm">
                    {currentSession.files.map((file) => (
                      <li key={file.id} className="flex items-center justify-between">
                        <span>{file.name}</span>
                        <span className="text-xs px-2 py-1 bg-blue-100 dark:bg-blue-900 text-blue-700 dark:text-blue-300 rounded">
                          OCR: {file.ocrStatus || 'pending'}
                        </span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {currentSession.problemStatement && (
                <div className="bg-neutral-50 dark:bg-neutral-900 rounded-xl p-4">
                  <h3 className="font-semibold mb-2">Problem Statement</h3>
                  <p className="text-sm">{currentSession.problemStatement}</p>
                </div>
              )}

              {currentSession.keyQuestions.length > 0 && (
                <div className="bg-neutral-50 dark:bg-neutral-900 rounded-xl p-4">
                  <h3 className="font-semibold mb-2">Key Questions</h3>
                  <ol className="list-decimal list-inside space-y-1 text-sm">
                    {currentSession.keyQuestions.map((question, i) => (
                      <li key={i}>{question}</li>
                    ))}
                  </ol>
                </div>
              )}
            </div>

            <div className="flex gap-4">
              <button
                onClick={() => setCurrentSession(null)}
                className="flex-1 px-6 py-3 bg-neutral-200 dark:bg-neutral-700 hover:bg-neutral-300 dark:hover:bg-neutral-600 rounded-xl font-medium transition-colors"
              >
                Start New Session
              </button>
              <button
                onClick={handleContinueToGuidance}
                className="flex-1 px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-medium transition-colors"
              >
                Continue to Guidance →
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
