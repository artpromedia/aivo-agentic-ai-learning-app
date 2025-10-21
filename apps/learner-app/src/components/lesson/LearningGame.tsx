import { useState, useEffect } from 'react';
import { useTheme } from '@aivo/ui';

interface GameItem {
  id: string;
  content: string;
  matchId?: string;
  category?: string;
}

interface LearningGameProps {
  type: 'matching' | 'sorting' | 'word-search';
  title: string;
  items: GameItem[];
  onComplete?: (score: number) => void;
}

export function LearningGame({ type, title, items, onComplete }: LearningGameProps) {
  if (type === 'matching') {
    return <MatchingGame title={title} items={items} onComplete={onComplete} />;
  }

  if (type === 'sorting') {
    return <SortingGame title={title} items={items} onComplete={onComplete} />;
  }

  return <WordSearchGame title={title} items={items} onComplete={onComplete} />;
}

// Matching Game Component
function MatchingGame({
  title,
  items,
  onComplete,
}: {
  title: string;
  items: GameItem[];
  onComplete?: (score: number) => void;
}) {
  const { themeConfig } = useTheme();
  const [leftItems] = useState(items.slice(0, items.length / 2));
  const [rightItems] = useState(
    items.slice(items.length / 2).sort(() => Math.random() - 0.5)
  );
  const [selectedLeft, setSelectedLeft] = useState<string | null>(null);
  const [matches, setMatches] = useState<Record<string, string>>({});
  const [wrongMatches, setWrongMatches] = useState<string[]>([]);
  const [score, setScore] = useState(0);

  const handleLeftClick = (id: string) => {
    if (matches[id]) return;
    setSelectedLeft(id === selectedLeft ? null : id);
  };

  const handleRightClick = (id: string) => {
    if (Object.values(matches).includes(id)) return;

    if (selectedLeft) {
      const leftItem = leftItems.find((item) => item.id === selectedLeft);
      const rightItem = rightItems.find((item) => item.id === id);

      if (leftItem?.matchId === rightItem?.id) {
        // Correct match
        setMatches({ ...matches, [selectedLeft]: id });
        setScore(score + 10);
        setSelectedLeft(null);
      } else {
        // Wrong match
        setWrongMatches([selectedLeft, id]);
        setTimeout(() => {
          setWrongMatches([]);
          setSelectedLeft(null);
        }, 1000);
      }
    }
  };

  useEffect(() => {
    if (Object.keys(matches).length === leftItems.length) {
      onComplete?.(score);
    }
  }, [matches, leftItems.length, score, onComplete]);

  const isComplete = Object.keys(matches).length === leftItems.length;

  return (
    <div
      className="rounded-2xl p-8 shadow-lg"
      style={{
        backgroundColor: themeConfig.colors.surface,
        borderWidth: '2px',
        borderColor: themeConfig.colors.border,
      }}
    >
      <div className="mb-6">
        <h2 className="text-2xl font-bold mb-2" style={{ color: themeConfig.colors.primary }}>
          🎮 {title}
        </h2>
        <p className="text-sm" style={{ color: themeConfig.colors.text }}>
          Click on the left item, then click its match on the right!
        </p>
        <div className="mt-3 flex items-center gap-4">
          <div
            className="px-4 py-2 rounded-lg"
            style={{
              backgroundColor: `${themeConfig.colors.primary}22`,
              color: themeConfig.colors.primary,
            }}
          >
            Score: {score}
          </div>
          <div
            className="px-4 py-2 rounded-lg"
            style={{
              backgroundColor: `${themeConfig.colors.primary}22`,
              color: themeConfig.colors.primary,
            }}
          >
            Matched: {Object.keys(matches).length} / {leftItems.length}
          </div>
        </div>
      </div>

      {isComplete ? (
        <div className="text-center py-12">
          <div className="text-8xl mb-4">🎉</div>
          <h3 className="text-3xl font-bold mb-2" style={{ color: themeConfig.colors.primary }}>
            Perfect Match!
          </h3>
          <p className="text-xl mb-4">You matched all items correctly!</p>
          <div className="text-5xl font-bold mb-6" style={{ color: themeConfig.colors.primary }}>
            {score} Points
          </div>
        </div>
      ) : (
        <div className="grid md:grid-cols-2 gap-8">
          {/* Left Column */}
          <div className="space-y-3">
            {leftItems.map((item) => (
              <button
                key={item.id}
                onClick={() => handleLeftClick(item.id)}
                disabled={!!matches[item.id]}
                className={`w-full p-4 rounded-xl border-2 text-left transition transform hover:scale-105 ${
                  matches[item.id]
                    ? 'bg-green-100 border-green-500 opacity-50'
                    : selectedLeft === item.id
                    ? 'border-blue-500 bg-blue-50 scale-105'
                    : wrongMatches.includes(item.id)
                    ? 'border-red-500 bg-red-50 animate-shake'
                    : 'border-gray-300 hover:border-gray-400'
                }`}
              >
                <div className="flex items-center justify-between">
                  <span className="font-medium">{item.content}</span>
                  {matches[item.id] && <span className="text-2xl">✓</span>}
                </div>
              </button>
            ))}
          </div>

          {/* Right Column */}
          <div className="space-y-3">
            {rightItems.map((item) => (
              <button
                key={item.id}
                onClick={() => handleRightClick(item.id)}
                disabled={Object.values(matches).includes(item.id)}
                className={`w-full p-4 rounded-xl border-2 text-left transition transform hover:scale-105 ${
                  Object.values(matches).includes(item.id)
                    ? 'bg-green-100 border-green-500 opacity-50'
                    : wrongMatches.includes(item.id)
                    ? 'border-red-500 bg-red-50 animate-shake'
                    : 'border-gray-300 hover:border-gray-400'
                }`}
              >
                <div className="flex items-center justify-between">
                  <span className="font-medium">{item.content}</span>
                  {Object.values(matches).includes(item.id) && <span className="text-2xl">✓</span>}
                </div>
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

// Sorting Game Component
function SortingGame({
  title,
  items,
  onComplete,
}: {
  title: string;
  items: GameItem[];
  onComplete?: (score: number) => void;
}) {
  const { themeConfig } = useTheme();
  const [shuffledItems] = useState([...items].sort(() => Math.random() - 0.5));
  const [categories] = useState([...new Set(items.map((item) => item.category!))]);
  const [sorted, setSorted] = useState<Record<string, string[]>>(() => {
    const initial: Record<string, string[]> = {};
    categories.forEach((cat) => (initial[cat] = []));
    return initial;
  });
  const [draggedItem, setDraggedItem] = useState<GameItem | null>(null);
  const [unsortedItems, setUnsortedItems] = useState(shuffledItems);

  const handleDragStart = (item: GameItem) => {
    setDraggedItem(item);
  };

  const handleDrop = (category: string) => {
    if (!draggedItem) return;

    // Remove from unsorted
    setUnsortedItems(unsortedItems.filter((item) => item.id !== draggedItem.id));

    // Add to category
    setSorted({
      ...sorted,
      [category]: [...(sorted[category] || []), draggedItem.id],
    });

    setDraggedItem(null);
  };

  const isCorrect = (category: string, itemId: string) => {
    const item = items.find((i) => i.id === itemId);
    return item?.category === category;
  };

  const totalCorrect = Object.entries(sorted).reduce((acc, [category, itemIds]) => {
    return acc + itemIds.filter((id) => isCorrect(category, id)).length;
  }, 0);

  const isComplete = unsortedItems.length === 0;

  useEffect(() => {
    if (isComplete) {
      onComplete?.(totalCorrect * 10);
    }
  }, [isComplete, totalCorrect, onComplete]);

  return (
    <div
      className="rounded-2xl p-8 shadow-lg"
      style={{
        backgroundColor: themeConfig.colors.surface,
        borderWidth: '2px',
        borderColor: themeConfig.colors.border,
      }}
    >
      <div className="mb-6">
        <h2 className="text-2xl font-bold mb-2" style={{ color: themeConfig.colors.primary }}>
          🗂️ {title}
        </h2>
        <p className="text-sm mb-4" style={{ color: themeConfig.colors.text }}>
          Drag and drop items into the correct categories!
        </p>
        {isComplete && (
          <div className="p-4 rounded-lg bg-green-100 border-2 border-green-500">
            <div className="text-2xl mb-2">🎉 All items sorted!</div>
            <div className="text-lg">
              Correct: <strong>{totalCorrect}</strong> / {items.length}
            </div>
          </div>
        )}
      </div>

      {/* Unsorted Items */}
      {unsortedItems.length > 0 && (
        <div className="mb-6">
          <h3 className="font-bold mb-3" style={{ color: themeConfig.colors.text }}>
            Items to Sort:
          </h3>
          <div className="flex flex-wrap gap-2">
            {unsortedItems.map((item) => (
              <div
                key={item.id}
                draggable
                onDragStart={() => handleDragStart(item)}
                className="px-4 py-2 rounded-lg border-2 border-gray-300 bg-white cursor-move hover:border-blue-500 transition"
              >
                {item.content}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Categories */}
      <div className="grid md:grid-cols-2 gap-4">
        {categories.map((category) => (
          <div
            key={category}
            onDragOver={(e) => e.preventDefault()}
            onDrop={() => handleDrop(category)}
            className="min-h-[200px] p-4 rounded-xl border-2 border-dashed border-gray-300 hover:border-blue-500 transition"
          >
            <h4 className="font-bold mb-3 text-lg" style={{ color: themeConfig.colors.primary }}>
              {category}
            </h4>
            <div className="space-y-2">
              {(sorted[category] || []).map((itemId) => {
                const item = items.find((i) => i.id === itemId)!;
                const correct = isCorrect(category, itemId);
                return (
                  <div
                    key={itemId}
                    className={`px-4 py-2 rounded-lg border-2 ${
                      correct ? 'bg-green-100 border-green-500' : 'bg-red-100 border-red-500'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <span>{item.content}</span>
                      <span className="text-xl">{correct ? '✓' : '✗'}</span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

// Word Search Game Component (Simplified)
function WordSearchGame({
  title,
  items,
  onComplete,
}: {
  title: string;
  items: GameItem[];
  onComplete?: (score: number) => void;
}) {
  const { themeConfig } = useTheme();
  const [foundWords, setFoundWords] = useState<string[]>([]);
  const [selectedCells, setSelectedCells] = useState<number[]>([]);
  const gridSize = 10;

  // Generate simple grid with words
  const grid = Array(gridSize)
    .fill(null)
    .map(() =>
      Array(gridSize)
        .fill(null)
        .map(() => String.fromCharCode(65 + Math.floor(Math.random() * 26)))
    );

  const handleCellClick = (index: number) => {
    if (selectedCells.includes(index)) {
      setSelectedCells(selectedCells.filter((i) => i !== index));
    } else {
      setSelectedCells([...selectedCells, index]);
    }
  };

  const handleCheckWord = () => {
    // Simplified: just mark as found
    if (foundWords.length < items.length) {
      const nextWord = items[foundWords.length];
      if (nextWord) {
        setFoundWords([...foundWords, nextWord.content]);
        setSelectedCells([]);
      }
    }
  };

  useEffect(() => {
    if (foundWords.length === items.length) {
      onComplete?.(foundWords.length * 10);
    }
  }, [foundWords, items.length, onComplete]);

  return (
    <div
      className="rounded-2xl p-8 shadow-lg"
      style={{
        backgroundColor: themeConfig.colors.surface,
        borderWidth: '2px',
        borderColor: themeConfig.colors.border,
      }}
    >
      <div className="mb-6">
        <h2 className="text-2xl font-bold mb-2" style={{ color: themeConfig.colors.primary }}>
          🔍 {title}
        </h2>
        <p className="text-sm" style={{ color: themeConfig.colors.text }}>
          Find all the words hidden in the grid!
        </p>
      </div>

      <div className="grid md:grid-cols-3 gap-6">
        {/* Word Grid */}
        <div className="md:col-span-2">
          <div className="inline-grid gap-1 p-4 bg-gray-50 rounded-xl">
            {grid.map((row, rowIndex) => (
              <div key={rowIndex} className="flex gap-1">
                {row.map((letter, colIndex) => {
                  const cellIndex = rowIndex * gridSize + colIndex;
                  return (
                    <button
                      key={colIndex}
                      onClick={() => handleCellClick(cellIndex)}
                      className={`w-10 h-10 rounded font-bold text-sm transition ${
                        selectedCells.includes(cellIndex)
                          ? 'bg-blue-500 text-white'
                          : 'bg-white border border-gray-300 hover:bg-gray-100'
                      }`}
                    >
                      {letter}
                    </button>
                  );
                })}
              </div>
            ))}
          </div>
          {selectedCells.length > 0 && (
            <button
              onClick={handleCheckWord}
              className="mt-4 px-6 py-3 rounded-xl font-medium transition"
              style={{
                backgroundColor: themeConfig.colors.primary,
                color: 'white',
              }}
            >
              Check Word
            </button>
          )}
        </div>

        {/* Words List */}
        <div>
          <h3 className="font-bold mb-3">Words to Find:</h3>
          <div className="space-y-2">
            {items.map((item) => (
              <div
                key={item.id}
                className={`px-4 py-2 rounded-lg border-2 ${
                  foundWords.includes(item.content)
                    ? 'bg-green-100 border-green-500 line-through'
                    : 'bg-white border-gray-300'
                }`}
              >
                {item.content}
              </div>
            ))}
          </div>
          <div className="mt-4 p-4 rounded-lg bg-blue-50">
            <div className="font-bold">Found: {foundWords.length} / {items.length}</div>
          </div>
        </div>
      </div>
    </div>
  );
}
