# GamePicker Component

AI-powered component that suggests 2-3 appropriate mini-games based on the learner's focus state, grade level, and game history.

## Quick Start

```typescript
import { GamePicker, type GameType } from '@/components/GamePicker';

function MyComponent() {
  const [gameHistory, setGameHistory] = useState<GameType[]>([]);

  return (
    <GamePicker
      focusState="wandering"
      theme="K5"
      previousGames={gameHistory}
      onGameSelected={(gameId) => {
        setGameHistory([...gameHistory, gameId]);
        // Navigate to game...
      }}
      onCancel={() => {
        // Close picker...
      }}
    />
  );
}
```

## Props

| Prop | Type | Description |
|------|------|-------------|
| `focusState` | `'focused' \| 'wandering' \| 'distracted'` | Current focus state from Focus Monitor |
| `theme` | `'K5' \| 'MS' \| 'HS'` | Current grade level theme |
| `previousGames` | `GameType[]` | Array of recently played games |
| `onGameSelected` | `(gameId: GameType) => void` | Callback when game is selected |
| `onCancel` | `() => void` | Callback when user cancels |

## Game Types

- `reaction`: Quick Reflex (⚡)
- `breathing`: Breathing Coach (🫁)
- `memory`: Memory Match (🧠)
- `pattern`: Pattern Finder (🔢)
- `sorting`: Quick Sort (🎯)

## AI Selection Rules

### Focus State
- **Distracted**: Shows relaxation and attention games (always includes breathing)
- **Wandering**: Shows cognitive and attention games
- **Focused**: Shows all games

### Theme
- **K5**: Only easy difficulty games
- **MS**: All difficulty levels
- **HS**: Medium and hard difficulty only

### History
- Avoids the last 3 played games
- Ensures variety in suggestions

## Features

- ✅ Smart game suggestions (2-3 games)
- ✅ Dynamic explanations
- ✅ Visual selection feedback
- ✅ Fully accessible
- ✅ Responsive design
- ✅ TypeScript support

## Testing

```bash
pnpm test GamePicker
```

## See Also

- [Full Documentation](../../../../PROMPT_22_GAME_PICKER_COMPLETE.md)
- [Focus Monitor](../FocusMonitor/README.md)
- [Theme System](../../../../docs/THEMING.md)
