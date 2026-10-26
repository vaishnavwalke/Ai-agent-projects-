import { useCallback, useMemo, useState } from 'react';
import type { PlayId } from '../lib/storage';
import {
  DAILY_TOTAL,
  playMeta,
  getDaily,
  markModeComplete,
  recordPracticeWin,
  effectiveStreak,
  nextDailyMode,
  isChallenge,
} from '../lib/storage';
import { getDailyPuzzle, getPracticePuzzle, type PuzzleBundle } from '../lib/daily';
import { Timer, elapsedSeconds } from './Timer';
import { WinScreen } from './WinScreen';
import { AdBanner } from './AdBanner';
import { AdInterstitial } from './AdInterstitial';
import { SudokuGame } from '../puzzles/sudoku/SudokuGame';
import { SetGame } from '../puzzles/setlite/SetGame';
import { NonogramGame } from '../puzzles/nonogram/NonogramGame';
import { NumberMatchGame } from '../puzzles/numbermatch/NumberMatchGame';
import { SchulteGame } from '../challenges/schulte/SchulteGame';
import { StroopGame } from '../challenges/stroop/StroopGame';
import { NBackGame } from '../challenges/nback/NBackGame';
import { DigitSpanGame } from '../challenges/digitspan/DigitSpanGame';

interface Props {
  mode: PlayId;
  isDaily: boolean;
  nonogramSize?: number;
  onHome: () => void;
  onNextDaily: (mode: PlayId) => void;
  onReplay: (opts?: { size?: number }) => void;
}

export function PlayScreen({
  mode,
  isDaily,
  nonogramSize,
  onHome,
  onNextDaily,
  onReplay,
}: Props) {
  const [phase, setPhase] = useState<'play' | 'ad' | 'win'>('play');
  const [session, setSession] = useState(0);
  const [startMs, setStartMs] = useState(() => Date.now());
  const [winSeconds, setWinSeconds] = useState(0);
  const [winScore, setWinScore] = useState<number | undefined>();
  const [dailyDone, setDailyDone] = useState(() => getDaily().completed.length);
  const [streak, setStreak] = useState(() => effectiveStreak());

  const puzzleBundle = useMemo(() => {
    if (isDaily) return getDailyPuzzle(mode);
    return getPracticePuzzle(mode, nonogramSize);
  }, [mode, isDaily, nonogramSize, session]);

  const name = playMeta(mode).name;
  const brain = isChallenge(mode);

  const onPuzzleWin = useCallback(
    (score?: number) => {
      const sec = elapsedSeconds(startMs);
      setWinSeconds(sec);
      setWinScore(score);
      if (isDaily) {
        const d = markModeComplete(mode, sec, score);
        setDailyDone(d.completed.length);
        setStreak(effectiveStreak());
      } else {
        recordPracticeWin(mode, sec, score);
      }
      setPhase('ad');
    },
    [isDaily, mode, startMs],
  );

  const restart = () => {
    setSession((s) => s + 1);
    setStartMs(Date.now());
    setPhase('play');
    onReplay(nonogramSize ? { size: nonogramSize } : undefined);
  };

  const showStop = isDaily && dailyDone >= DAILY_TOTAL;

  return (
    <div className="play-screen">
      <header className="play-header">
        <button type="button" className="btn ghost small" onClick={onHome} aria-label="Back home">
          ← Home
        </button>
        <div className="play-title">
          <strong>{name}</strong>
          {isDaily && <span className="chip">Daily</span>}
          {brain && !isDaily && <span className="chip">Brain</span>}
        </div>
        <Timer running={phase === 'play'} startMs={startMs} />
      </header>

      <div className="play-layout">
        <div className="side-ad-slot">
          <AdBanner placement="side" />
        </div>
        <main className="play-main">
          {phase === 'play' && (
            <GameBody key={`${mode}-${session}`} bundle={puzzleBundle} onWin={onPuzzleWin} />
          )}
          {phase === 'win' && (
            <WinScreen
              mode={mode}
              seconds={winSeconds}
              score={winScore}
              isDaily={isDaily}
              dailyDone={dailyDone}
              streak={streak}
              showStopNudge={showStop}
              onHome={onHome}
              onNextDaily={() => {
                const n = nextDailyMode();
                if (n) onNextDaily(n);
                else onHome();
              }}
              onPracticeAgain={restart}
            />
          )}
        </main>
      </div>

      {phase === 'play' && <AdBanner placement="bottom" />}
      {phase === 'ad' && <AdInterstitial onContinue={() => setPhase('win')} />}
    </div>
  );
}

function GameBody({
  bundle,
  onWin,
}: {
  bundle: PuzzleBundle;
  onWin: (score?: number) => void;
}) {
  switch (bundle.type) {
    case 'sudoku':
      return <SudokuGame puzzle={bundle.puzzle} onWin={() => onWin()} />;
    case 'setlite':
      return <SetGame puzzle={bundle.puzzle} onWin={() => onWin()} />;
    case 'nonogram':
      return <NonogramGame puzzle={bundle.puzzle} onWin={() => onWin()} />;
    case 'numbermatch':
      return <NumberMatchGame puzzle={bundle.puzzle} onWin={() => onWin()} />;
    case 'schulte':
      return <SchulteGame seed={bundle.seed} onWin={onWin} />;
    case 'stroop':
      return <StroopGame seed={bundle.seed} onWin={onWin} />;
    case 'nback':
      return <NBackGame seed={bundle.seed} n={bundle.nBack} onWin={onWin} />;
    case 'digitspan':
      return <DigitSpanGame seed={bundle.seed} onWin={onWin} />;
  }
}
