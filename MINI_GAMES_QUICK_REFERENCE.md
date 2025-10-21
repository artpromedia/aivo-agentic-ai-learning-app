# Mini-Games Quick Reference

## Import

```typescript
import {
  ReactionGame,
  BreathingGame,
  MemoryGame,
  PatternGame,
  SortingGame
} from '@/components/MiniGames';
```

## Quick Start

```typescript
<ReactionGame 
  onComplete={(score) => console.log(score)} 
  duration={120} 
/>
```

## All Games

| Game | Icon | Purpose | Duration | Difficulty |
|------|------|---------|----------|------------|
| ReactionGame | ⚡ | Attention | 2-3 min | Easy |
| BreathingGame | 🫁 | Relaxation | 3-5 min | Easy |
| MemoryGame | 🧠 | Cognitive | 3-4 min | Easy/Med/Hard |
| PatternGame | 🔢 | Cognitive | 3-4 min | Medium |
| SortingGame | 🎯 | Motor | 2-3 min | Easy |

## Props

```typescript
interface GameProps {
  onComplete: (score: number) => void; // Required
  duration: number;                     // Required (seconds)
  difficulty?: 'easy' | 'medium' | 'hard'; // Memory only
}
```

## Scoring

- **Reaction**: 0-100 (faster = higher)
- **Breathing**: 0-100 (more cycles = higher)
- **Memory**: 0-100 (accuracy + efficiency)
- **Pattern**: 0-100+ (correctness + streaks)
- **Sorting**: 0-100 (accuracy)

## Complete Example

```typescript
import { useState } from 'react';
import { GamePicker, type GameType } from '@/components/GamePicker';
import * as MiniGames from '@/components/MiniGames';

function GameBreak() {
  const [game, setGame] = useState<GameType | null>(null);

  const handleComplete = (score: number) => {
    console.log(`Score: ${score}`);
    setGame(null);
  };

  if (!game) {
    return (
      <GamePicker
        focusState="wandering"
        theme="K5"
        previousGames={[]}
        onGameSelected={setGame}
        onCancel={() => {}}
      />
    );
  }

  const GameComponent = {
    reaction: MiniGames.ReactionGame,
    breathing: MiniGames.BreathingGame,
    memory: MiniGames.MemoryGame,
    pattern: MiniGames.PatternGame,
    sorting: MiniGames.SortingGame,
  }[game];

  return <GameComponent onComplete={handleComplete} duration={120} />;
}
```

## Test IDs

### ReactionGame
- `reaction-game`: Main container
- `reaction-tap-area`: Clickable game area
- `try-again`: Retry button

### BreathingGame
- `breathing-game`: Main container
- `breathing-circle`: Animated circle

### MemoryGame
- `memory-game`: Main container
- `card-{index}`: Individual cards

### PatternGame
- `pattern-game`: Main container
- `option-{number}`: Answer options
- `submit-answer`: Submit button

### SortingGame
- `sorting-game`: Main container
- `item-{id}`: Draggable items
- `unsorted-zone`: Unsorted area
- `category-{color}`: Category bins

## Files

- `apps/learner-app/src/components/MiniGames/`
  - `ReactionGame.tsx`
  - `BreathingGame.tsx`
  - `MemoryGame.tsx`
  - `PatternGame.tsx`
  - `SortingGame.tsx`
  - `index.ts`

## Documentation

- Full docs: `PROMPT_23_MINI_GAMES_COMPLETE.md`
- Game Picker: `PROMPT_22_GAME_PICKER_COMPLETE.md`
