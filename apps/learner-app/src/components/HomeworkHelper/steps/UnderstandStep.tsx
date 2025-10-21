import { useState, FC } from 'react';
import { HomeworkSession } from '@aivo/types';
import { Card, Input, Button } from '@aivo/ui';

interface UnderstandStepProps {
  session: HomeworkSession;
  onComplete: () => void;
}

export const UnderstandStep: FC<UnderstandStepProps> = ({ session }) => {
  const [restatedProblem, setRestatedProblem] = useState('');
  const [givenInfo, setGivenInfo] = useState<string[]>(['']);
  const [findInfo, setFindInfo] = useState('');
  const [keyWords, setKeyWords] = useState<string[]>([]);

  const addGivenInfoField = () => {
    setGivenInfo([...givenInfo, '']);
  };

  const updateGivenInfo = (index: number, value: string) => {
    const updated = [...givenInfo];
    updated[index] = value;
    setGivenInfo(updated);
  };

  const addKeyWord = (word: string) => {
    if (word && !keyWords.includes(word.toLowerCase())) {
      setKeyWords([...keyWords, word.toLowerCase()]);
    }
  };

  const removeKeyWord = (word: string) => {
    setKeyWords(keyWords.filter((w) => w !== word));
  };

  // Suggested key words based on subject
  const suggestedKeyWords = {
    Math: [
      'solve',
      'calculate',
      'equation',
      'sum',
      'difference',
      'product',
      'quotient',
      'prove',
      'simplify',
    ],
    Science: [
      'observe',
      'hypothesis',
      'experiment',
      'analyze',
      'conclude',
      'variable',
      'control',
    ],
    ELA: [
      'analyze',
      'compare',
      'contrast',
      'summarize',
      'theme',
      'character',
      'evidence',
      'cite',
    ],
    History: ['cause', 'effect', 'significance', 'compare', 'analyze', 'period', 'event'],
  };

  const relevantKeyWords =
    session.detectedSubject && session.detectedSubject in suggestedKeyWords
      ? suggestedKeyWords[session.detectedSubject as keyof typeof suggestedKeyWords]
      : [];

  return (
    <div className="space-y-6" data-testid="understand-step">
      <div>
        <h2 className="text-2xl font-bold mb-2">🤔 Understand the Problem</h2>
        <p className="text-neutral-600 dark:text-neutral-400">
          Before solving, make sure you understand what the problem is asking.
        </p>
      </div>

      {/* Problem Statement */}
      <Card className="bg-blue-50 dark:bg-blue-900/20 border-blue-200 dark:border-blue-800">
        <h3 className="font-semibold mb-2">Original Problem:</h3>
        <div className="text-sm whitespace-pre-wrap">
          {session.extractedContent?.rawText || session.problemStatement}
        </div>
      </Card>

      {/* Restate in Own Words */}
      <div>
        <label className="block font-medium mb-2">1. Restate the problem in your own words:</label>
        <textarea
          className="w-full h-24 px-4 py-3 border-2 rounded-xl resize-none focus:border-blue-500 focus:outline-none dark:bg-neutral-800 dark:border-neutral-700 dark:text-white"
          placeholder="Write what you think the problem is asking..."
          value={restatedProblem}
          onChange={(e) => setRestatedProblem(e.target.value)}
          data-testid="restate-problem"
        />
        <p className="text-xs text-neutral-500 dark:text-neutral-400 mt-1">
          💡 Tip: Use simple language that makes sense to you
        </p>
      </div>

      {/* What is Given */}
      <div>
        <label className="block font-medium mb-2">2. What information is given?</label>
        <div className="space-y-2">
          {givenInfo.map((info, index) => (
            <div key={index} className="flex gap-2">
              <Input
                placeholder={`Given fact #${index + 1}`}
                value={info}
                onChange={(e) => updateGivenInfo(index, e.target.value)}
                data-testid={`given-info-${index}`}
              />
              {index === givenInfo.length - 1 && (
                <Button variant="outline" onClick={addGivenInfoField} data-testid="add-given-info">
                  +
                </Button>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* What to Find */}
      <div>
        <label className="block font-medium mb-2">
          3. What are you trying to find or prove?
        </label>
        <Input
          placeholder="What is the question asking for?"
          value={findInfo}
          onChange={(e) => setFindInfo(e.target.value)}
          data-testid="find-info"
        />
      </div>

      {/* Key Words */}
      <div>
        <label className="block font-medium mb-2">4. Identify key words or phrases:</label>

        {/* Selected Keywords */}
        <div className="flex flex-wrap gap-2 mb-3">
          {keyWords.map((word) => (
            <span
              key={word}
              className="px-3 py-1 bg-blue-100 dark:bg-blue-900/40 text-blue-800 dark:text-blue-200 rounded-full text-sm font-medium flex items-center gap-2"
            >
              {word}
              <button
                onClick={() => removeKeyWord(word)}
                className="hover:text-blue-900 dark:hover:text-blue-100"
                data-testid={`remove-keyword-${word}`}
              >
                ✕
              </button>
            </span>
          ))}
        </div>

        {/* Suggested Keywords */}
        {relevantKeyWords.length > 0 && (
          <div>
            <p className="text-xs text-neutral-600 dark:text-neutral-400 mb-2">
              Suggested key words:
            </p>
            <div className="flex flex-wrap gap-2">
              {relevantKeyWords.map((word) => (
                <button
                  key={word}
                  onClick={() => addKeyWord(word)}
                  disabled={keyWords.includes(word)}
                  className={`
                    px-3 py-1 rounded-full text-sm border-2 transition
                    ${
                      keyWords.includes(word)
                        ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/40 text-blue-700 dark:text-blue-300 opacity-50 cursor-not-allowed'
                        : 'border-neutral-300 dark:border-neutral-700 hover:border-blue-500 hover:bg-blue-50 dark:hover:bg-blue-900/40'
                    }
                  `}
                  data-testid={`suggest-keyword-${word}`}
                >
                  {word}
                </button>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Comprehension Check */}
      {restatedProblem && findInfo && (
        <Card className="bg-green-50 dark:bg-green-900/20 border-green-200 dark:border-green-800">
          <div className="flex items-start gap-3">
            <span className="text-2xl">✅</span>
            <div>
              <h4 className="font-semibold mb-2">Great start!</h4>
              <p className="text-sm">
                You&apos;ve identified what you know and what you need to find. Ready to move on to
                planning your approach?
              </p>
            </div>
          </div>
        </Card>
      )}
    </div>
  );
};
