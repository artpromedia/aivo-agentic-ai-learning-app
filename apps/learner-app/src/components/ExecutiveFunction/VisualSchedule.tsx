/**
 * Visual Schedule Component
 * 
 * Sequential schedule showing daily activities with current activity highlighting.
 * Helps with routine predictability, transitions, and time awareness.
 * 
 * Features:
 * - Current activity highlighted
 * - Completed activities marked with checkmark
 * - Upcoming activities shown
 * - Progress bar tracking
 * - Optional time estimates
 * - Optional drag-and-drop reordering
 */

import React, { useState } from 'react';
import { VisualSchedule as IVisualSchedule, ScheduleItem } from '@aivo/types';
import { Card, Button } from '@aivo/ui';

export const VisualSchedule: React.FC<{
  schedule: IVisualSchedule;
  onChange?: (schedule: IVisualSchedule) => void;
  onComplete?: () => void;
}> = ({ schedule, onChange, onComplete }) => {
  const [draggedItem, setDraggedItem] = useState<string | null>(null);

  const currentItem = schedule.items.find(
    (item) => item.status === 'current'
  );

  const handleCompleteItem = (itemId: string) => {
    const updatedItems = schedule.items.map((item) => {
      if (item.id === itemId) {
        return { ...item, status: 'completed' as const };
      }
      return item;
    });

    // Find next item and mark as current
    const currentIndex = updatedItems.findIndex((i) => i.id === itemId);
    if (currentIndex >= 0 && currentIndex < updatedItems.length - 1) {
      const nextItem = updatedItems[currentIndex + 1];
      if (nextItem) {
        nextItem.status = 'current';
      }
    }

    const updatedSchedule = {
      ...schedule,
      items: updatedItems,
      currentIndex: Math.min(currentIndex + 1, updatedItems.length - 1),
    };

    if (onChange) {
      onChange(updatedSchedule);
    }

    // Check if all complete
    if (updatedItems.every((i) => i.status === 'completed') && onComplete) {
      setTimeout(onComplete, 500);
    }
  };

  const handleDragStart = (itemId: string) => {
    if (schedule.allowReordering) {
      setDraggedItem(itemId);
    }
  };

  const handleDragOver = (e: React.DragEvent, targetId: string) => {
    e.preventDefault();
    if (!schedule.allowReordering || !draggedItem) return;

    const items = [...schedule.items];
    const draggedIndex = items.findIndex((i) => i.id === draggedItem);
    const targetIndex = items.findIndex((i) => i.id === targetId);

    if (draggedIndex !== -1 && targetIndex !== -1 && draggedIndex !== targetIndex) {
      const [removed] = items.splice(draggedIndex, 1);
      if (removed) {
        items.splice(targetIndex, 0, removed);

        // Update order property
        items.forEach((item, index) => {
          item.order = index;
        });

        if (onChange) {
          onChange({ ...schedule, items });
        }
      }
    }
  };

  const handleDragEnd = () => {
    setDraggedItem(null);
  };

  const completedCount = schedule.items.filter(
    (i) => i.status === 'completed'
  ).length;
  const progress = (completedCount / schedule.items.length) * 100;

  const totalTime = schedule.items.reduce((sum, item) => sum + (item.duration || 0), 0);

  return (
    <div className="space-y-6" data-testid="visual-schedule">
      {/* Header */}
      <Card>
        <div className="flex items-center justify-between mb-4">
          <div>
            <h2 className="text-2xl font-bold dark:text-white">{schedule.name}</h2>
            <div className="text-sm text-neutral-600 dark:text-neutral-400 mt-1">
              {completedCount} of {schedule.items.length} activities done
              {schedule.showTimeEstimates && totalTime > 0 && (
                <> • {totalTime} minutes total</>
              )}
            </div>
          </div>

          {currentItem && (
            <div className="text-right">
              <div className="text-sm text-neutral-600 dark:text-neutral-400">Up Next:</div>
              <div className="text-lg font-bold flex items-center gap-2 dark:text-white">
                <span className="text-3xl">{currentItem.icon}</span>
                {currentItem.activity}
              </div>
            </div>
          )}
        </div>

        {/* Progress Bar */}
        <div className="w-full bg-neutral-200 dark:bg-neutral-700 rounded-full h-4">
          <div
            className="bg-green-500 dark:bg-green-600 h-4 rounded-full transition-all duration-500"
            style={{ width: `${progress}%` }}
          />
        </div>
      </Card>

      {/* Schedule Items */}
      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
        {schedule.items
          .sort((a, b) => a.order - b.order)
          .map((item, index) => (
            <ScheduleItemCard
              key={item.id}
              item={item}
              index={index}
              showTime={schedule.showTimeEstimates}
              onComplete={() => handleCompleteItem(item.id)}
              draggable={schedule.allowReordering && item.status === 'upcoming'}
              onDragStart={() => handleDragStart(item.id)}
              onDragOver={(e) => handleDragOver(e, item.id)}
              onDragEnd={handleDragEnd}
              isDragging={draggedItem === item.id}
            />
          ))}
      </div>

      {/* All Complete */}
      {completedCount === schedule.items.length && (
        <Card className="bg-green-50 dark:bg-green-900/30 border-2 border-green-300 dark:border-green-700 text-center py-8">
          <div className="text-6xl mb-4">🎉</div>
          <div className="text-2xl font-bold text-green-900 dark:text-green-300 mb-2">
            Schedule Complete!
          </div>
          <div className="text-green-700 dark:text-green-400">
            You finished all your activities for today!
          </div>
        </Card>
      )}

      {/* Help Text */}
      {schedule.allowReordering && (
        <div className="text-xs text-neutral-500 dark:text-neutral-400 text-center">
          💡 You can drag and drop upcoming activities to reorder them
        </div>
      )}
    </div>
  );
};

const ScheduleItemCard: React.FC<{
  item: ScheduleItem;
  index: number;
  showTime: boolean;
  onComplete: () => void;
  draggable: boolean;
  onDragStart: () => void;
  onDragOver: (e: React.DragEvent) => void;
  onDragEnd: () => void;
  isDragging: boolean;
}> = ({
  item,
  index,
  showTime,
  onComplete,
  draggable,
  onDragStart,
  onDragOver,
  onDragEnd,
  isDragging,
}) => {
  const getCardStyle = () => {
    switch (item.status) {
      case 'completed':
        return 'bg-green-50 dark:bg-green-900/30 border-green-300 dark:border-green-700 opacity-75';
      case 'current':
        return 'bg-blue-50 dark:bg-blue-900/30 border-blue-500 dark:border-blue-600 ring-4 ring-blue-200 dark:ring-blue-800 scale-105 shadow-lg';
      case 'upcoming':
        return 'bg-white dark:bg-neutral-800 border-neutral-200 dark:border-neutral-700 hover:border-neutral-300 dark:hover:border-neutral-600';
    }
  };

  return (
    <div
      draggable={draggable}
      onDragStart={onDragStart}
      onDragOver={onDragOver}
      onDragEnd={onDragEnd}
      className={`
        border-2 rounded-2xl p-4 transition-all cursor-grab active:cursor-grabbing
        ${getCardStyle()}
        ${isDragging ? 'opacity-50 scale-95' : ''}
      `}
      data-testid={`schedule-item-${item.id}`}
    >
      <div className="space-y-3">
        {/* Order Badge */}
        <div className="flex items-center justify-between">
          <div
            className={`
              w-8 h-8 rounded-full flex items-center justify-center font-bold text-sm
              ${item.status === 'completed'
                ? 'bg-green-500 text-white'
                : item.status === 'current'
                ? 'bg-blue-500 text-white animate-pulse'
                : 'bg-neutral-200 dark:bg-neutral-700 text-neutral-600 dark:text-neutral-400'
              }
            `}
          >
            {item.status === 'completed' ? '✓' : index + 1}
          </div>

          {showTime && item.duration && (
            <div className="text-xs text-neutral-600 dark:text-neutral-400">
              ⏱️ {item.duration} min
            </div>
          )}
        </div>

        {/* Icon */}
        <div className="text-center">
          <div className="text-5xl mb-2">{item.icon}</div>
          <div
            className={`font-semibold dark:text-white ${
              item.status === 'completed' ? 'line-through' : ''
            }`}
          >
            {item.activity}
          </div>
        </div>

        {/* Action Button */}
        {item.status === 'current' && (
          <Button
            variant="primary"
            fullWidth
            onClick={onComplete}
            data-testid={`complete-${item.id}`}
          >
            ✓ Mark Done
          </Button>
        )}

        {item.status === 'upcoming' && (
          <div className="text-center text-xs text-neutral-500 dark:text-neutral-400">
            Coming up...
          </div>
        )}

        {item.status === 'completed' && (
          <div className="text-center text-xs text-green-600 dark:text-green-400 font-medium">
            ✓ Completed
          </div>
        )}
      </div>
    </div>
  );
};

