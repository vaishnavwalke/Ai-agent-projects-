import { useState } from 'react';
import { Home } from './components/Home';
import { PlayScreen } from './components/PlayScreen';
import type { PlayId } from './lib/storage';
import { nextDailyMode } from './lib/storage';

type Screen =
  | { name: 'home' }
  | { name: 'play'; mode: PlayId; isDaily: boolean; nonogramSize?: number };

export default function App() {
  const [screen, setScreen] = useState<Screen>({ name: 'home' });
  const [playKey, setPlayKey] = useState(0);

  if (screen.name === 'home') {
    return (
      <div className="app-shell">
        <Home
          onPlayDaily={() => {
            const m = nextDailyMode() ?? 'sudoku';
            setPlayKey((k) => k + 1);
            setScreen({ name: 'play', mode: m, isDaily: true });
          }}
          onPlayMode={(mode, opts) => {
            setPlayKey((k) => k + 1);
            setScreen({
              name: 'play',
              mode,
              isDaily: false,
              nonogramSize: opts?.size,
            });
          }}
        />
      </div>
    );
  }

  return (
    <div className="app-shell">
      <PlayScreen
        key={playKey}
        mode={screen.mode}
        isDaily={screen.isDaily}
        nonogramSize={screen.nonogramSize}
        onHome={() => setScreen({ name: 'home' })}
        onNextDaily={(mode) => {
          setPlayKey((k) => k + 1);
          setScreen({ name: 'play', mode, isDaily: true });
        }}
        onReplay={(opts) => {
          setPlayKey((k) => k + 1);
          setScreen({
            name: 'play',
            mode: screen.mode,
            isDaily: false,
            nonogramSize: opts?.size ?? screen.nonogramSize,
          });
        }}
      />
    </div>
  );
}
