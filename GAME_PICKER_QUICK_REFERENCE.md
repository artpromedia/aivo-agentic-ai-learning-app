# Game Picker Quick Reference

## Import

```typescript
import { GamePicker, type GameType } from '@/components/GamePicker';
```

## Basic Usage

```typescript
<GamePicker
  focusState="wandering"
  theme="K5"
  previousGames={[]}
  onGameSelected={(gameId) => console.log(gameId)}
  onCancel={() => console.log('Cancelled')}
/>
```

## Props

| Prop | Type | Description |
|------|------|-------------|
| `focusState` | `'focused' \| 'wandering' \| 'distracted'` | Current attention state |
| `theme` | `'K5' \| 'MS' \| 'HS'` | Grade level theme |
| `previousGames` | `GameType[]` | Recently played games |
| `onGameSelected` | `(gameId: GameType) => void` | Selection callback |
| `onCancel` | `() => void` | Cancel callback |

## Game Types

```typescript
type GameType = 'reaction' | 'breathing' | 'memory' | 'pattern' | 'sorting';
```

## Complete Example

```typescript
import { useState } from 'react';
import { GamePicker, type GameType } from '@/components/GamePicker';
import { useFocusMonitor } from '@/hooks/useFocusMonitor';
import { useTheme } from '@/hooks/useTheme';

function LearningPage() {
  const [showPicker, setShowPicker] = useState(false);
  const [history, setHistory] = useState<GameType[]>([]);
  const { focusState } = useFocusMonitor();
  const { theme } = useTheme();

  return (
    <>
      {showPicker && (
        <GamePicker
          focusState={focusState}
          theme={theme}
          previousGames={history}
          onGameSelected={(gameId) => {
            setHistory([...history, gameId]);
            setShowPicker(false);
            // Navigate to game...
          }}
          onCancel={() => setShowPicker(false)}
        />
      )}
    </>
  );
}
```

## AI Selection Rules

### By Focus State
- **Distracted**: Relaxation + Attention (breathing forced)
- **Wandering**: Cognitive + Attention
- **Focused**: All categories

### By Theme
- **K5**: Easy only
- **MS**: All difficulties
- **HS**: Medium + Hard only

### History
- Avoids last 3 played games
- Suggests 2-3 games per session

## Test IDs

- `game-picker`: Main container
- `game-card-{gameId}`: Game cards
- `play-{gameId}`: Play buttons
- `cancel-game-picker`: Cancel button

## Files

- Component: `apps/learner-app/src/components/GamePicker/GamePicker.tsx`
- Tests: `apps/learner-app/src/components/GamePicker/GamePicker.test.tsx`
- Docs: `PROMPT_22_GAME_PICKER_COMPLETE.md`
