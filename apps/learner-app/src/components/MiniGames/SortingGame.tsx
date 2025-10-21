import React, { useEffect, useState, useMemo } from 'react';

interface SortingGameProps {
  onComplete: (score: number) => void;
  duration: number; // seconds
}

interface Item {
  id: number;
  value: string;
  category: string;
  color: string;
}

export const SortingGame: React.FC<SortingGameProps> = ({ onComplete, duration }) => {
  const categories = useMemo(() => ['Red', 'Blue', 'Green'], []);
  
  const items = useMemo((): Item[] => [
    { id: 1, value: '🍎', category: 'Red', color: 'bg-red-100' },
    { id: 2, value: '🌹', category: 'Red', color: 'bg-red-100' },
    { id: 3, value: '🍒', category: 'Red', color: 'bg-red-100' },
    { id: 4, value: '🔵', category: 'Blue', color: 'bg-blue-100' },
    { id: 5, value: '🦋', category: 'Blue', color: 'bg-blue-100' },
    { id: 6, value: '🌊', category: 'Blue', color: 'bg-blue-100' },
    { id: 7, value: '🍀', category: 'Green', color: 'bg-green-100' },
    { id: 8, value: '🌿', category: 'Green', color: 'bg-green-100' },
    { id: 9, value: '🥝', category: 'Green', color: 'bg-green-100' },
  ].sort(() => Math.random() - 0.5), []);

  const [unsorted, setUnsorted] = useState<Item[]>(items);
  const [sorted, setSorted] = useState<Record<string, Item[]>>({
    Red: [],
    Blue: [],
    Green: [],
  });
  const [draggedItem, setDraggedItem] = useState<Item | null>(null);
  const [timeRemaining, setTimeRemaining] = useState(duration);
  const [score, setScore] = useState(0);

  // Timer
  useEffect(() => {
    const timer = setInterval(() => {
      setTimeRemaining(prev => {
        if (prev <= 1) {
          clearInterval(timer);
          calculateFinalScore();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Check for completion
  useEffect(() => {
    if (unsorted.length === 0) {
      calculateFinalScore();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [unsorted]);

  const calculateFinalScore = () => {
    let correctPlacements = 0;
    let totalItems = 0;

    categories.forEach(category => {
      const categoryItems = sorted[category] ?? [];
      totalItems += categoryItems.length;
      categoryItems.forEach(item => {
        if (item.category === category) {
          correctPlacements++;
        }
      });
    });

    const accuracy = totalItems > 0 ? (correctPlacements / totalItems) * 100 : 0;
    const finalScore = Math.round(accuracy);
    onComplete(Math.min(100, finalScore));
  };

  const handleDragStart = (item: Item) => {
    setDraggedItem(item);
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
  };

  const handleDrop = (category: string) => {
    if (!draggedItem) return;

    // Remove from unsorted
    setUnsorted(prev => prev.filter(item => item.id !== draggedItem.id));
    
    // Remove from any existing category
    setSorted(prev => {
      const newSorted = { ...prev };
      Object.keys(newSorted).forEach(cat => {
        newSorted[cat] = (newSorted[cat] ?? []).filter(item => item.id !== draggedItem.id);
      });
      return newSorted;
    });

    // Add to new category
    setSorted(prev => ({
      ...prev,
      [category]: [...(prev[category] ?? []), draggedItem],
    }));

    // Update score
    if (draggedItem.category === category) {
      setScore(prev => prev + 10);
    }

    setDraggedItem(null);
  };

  const handleDropUnsorted = () => {
    if (!draggedItem) return;

    // Remove from any category
    setSorted(prev => {
      const newSorted = { ...prev };
      Object.keys(newSorted).forEach(cat => {
        newSorted[cat] = (newSorted[cat] ?? []).filter(item => item.id !== draggedItem.id);
      });
      return newSorted;
    });

    // Add back to unsorted if not already there
    setUnsorted(prev => {
      if (!prev.find(item => item.id === draggedItem.id)) {
        return [...prev, draggedItem];
      }
      return prev;
    });

    setDraggedItem(null);
  };

  const getCategoryColor = (category: string) => {
    switch (category) {
      case 'Red':
        return 'bg-red-50 border-red-300';
      case 'Blue':
        return 'bg-blue-50 border-blue-300';
      case 'Green':
        return 'bg-green-50 border-green-300';
      default:
        return 'bg-neutral-50 border-neutral-300';
    }
  };

  return (
    <div className="space-y-4" data-testid="sorting-game">
      {/* Stats */}
      <div className="flex items-center justify-between">
        <div className="text-lg font-semibold">
          ⏱️ Time: {timeRemaining}s
        </div>
        <div className="text-sm font-medium">
          Score: {score}
        </div>
      </div>

      {/* Instructions */}
      <div className="bg-blue-50 rounded-xl p-3 text-center">
        <p className="text-sm text-neutral-700">
          Drag items into the matching color categories
        </p>
      </div>

      {/* Unsorted Items */}
      <div
        className="min-h-24 border-2 border-dashed border-neutral-300 rounded-xl p-4 bg-neutral-50"
        onDragOver={handleDragOver}
        onDrop={handleDropUnsorted}
        data-testid="unsorted-zone"
      >
        <p className="text-xs text-neutral-600 mb-2">Items to Sort:</p>
        <div className="flex flex-wrap gap-2">
          {unsorted.map(item => (
            <div
              key={item.id}
              draggable
              onDragStart={() => handleDragStart(item)}
              className={`${item.color} px-4 py-2 rounded-lg cursor-move text-2xl hover:scale-110 transition-transform`}
              data-testid={`item-${item.id}`}
            >
              {item.value}
            </div>
          ))}
          {unsorted.length === 0 && (
            <p className="text-sm text-neutral-400 w-full text-center py-4">
              All items sorted!
            </p>
          )}
        </div>
      </div>

      {/* Category Bins */}
      <div className="grid grid-cols-3 gap-3">
        {categories.map(category => (
          <div
            key={category}
            className={`min-h-32 border-2 rounded-xl p-3 ${getCategoryColor(category)}`}
            onDragOver={handleDragOver}
            onDrop={() => handleDrop(category)}
            data-testid={`category-${category.toLowerCase()}`}
          >
            <p className="text-sm font-semibold mb-2 text-center">{category}</p>
            <div className="space-y-2">
              {(sorted[category] ?? []).map(item => (
                <div
                  key={item.id}
                  draggable
                  onDragStart={() => handleDragStart(item)}
                  className={`${item.color} px-3 py-2 rounded-lg cursor-move text-2xl text-center hover:scale-105 transition-transform`}
                >
                  {item.value}
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>

      {/* Completion */}
      {unsorted.length === 0 && (
        <div className="text-center p-4 bg-green-50 rounded-xl">
          <p className="text-2xl mb-2">🎉</p>
          <p className="text-lg font-semibold">All items sorted!</p>
          <p className="text-sm text-neutral-600">Final Score: {score}</p>
        </div>
      )}
    </div>
  );
};
