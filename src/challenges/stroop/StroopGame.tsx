import { useCallback, useMemo, useState } from 'react';
import { mulberry32, hashSeed, pick } from '../../lib/rng';

interface Props {
  seed?: number;
  onWin: (score?: number) => void;
}

const COLORS = [
  { id: 'red', label: 'Red', hex: '#e07a7a' },
  { id: 'blue', label: 'Blue', hex: '#6b9bd1' },
  { id: 'green', label: 'Green', hex: '#7d9b8a' },
  { id: 'yellow', label: 'Yellow', hex: '#d4a574' },
] as const;

type ColorId = (typeof COLORS)[number]['id'];

interface Trial {
  word: ColorId;
  ink: ColorId;
}

const ROUNDS = 12;

function makeTrials(seed: number): Trial[] {
  const rand = mulberry32(seed);
  const trials: Trial[] = [];
  for (let i = 0; i < ROUNDS; i++) {
    const word = pick([...COLORS], rand).id;
    let ink = pick([...COLORS], rand).id;
    // Prefer conflict (~75%)
    if (rand() < 0.75) {
      while (ink === word) ink = pick([...COLORS], rand).id;
    }
    trials.push({ word, ink });
  }
  return trials;
}

export function StroopGame({ seed, onWin }: Props) {
  const [phase, setPhase] = useState<'ready' | 'play'>('ready');
  const [idx, setIdx] = useState(0);
  const [correct, setCorrect] = useState(0);
  const [feedback, setFeedback] = useState<'ok' | 'bad' | null>(null);

  const trials = useMemo(
    () => makeTrials(seed ?? (Date.now() ^ hashSeed('stroop')) >>> 0),
    [seed],
  );

  const trial = trials[idx];

  const answer = useCallback(
    (inkId: ColorId) => {
      if (phase !== 'play' || feedback) return;
      const ok = inkId === trial.ink;
      setFeedback(ok ? 'ok' : 'bad');
      const nextCorrect = correct + (ok ? 1 : 0);
      setTimeout(() => {
        setFeedback(null);
        setCorrect(nextCorrect);
        if (idx + 1 >= ROUNDS) {
          onWin(nextCorrect);
        } else {
          setIdx(idx + 1);
        }
      }, 320);
    },
    [phase, feedback, trial, correct, idx, onWin],
  );

  if (phase === 'ready') {
    return (
      <div className="challenge-ready">
        <h3>Stroop-lite</h3>
        <p className="muted">
          A color <strong>word</strong> appears in a different <strong>ink</strong>. Tap the button
          for the <strong>ink color</strong> — ignore what the word says. {ROUNDS} quick trials.
        </p>
        <p className="hint-text muted" style={{ marginTop: 0 }}>
          Example: the word &quot;Blue&quot; in red ink → tap <strong>Red</strong>.
        </p>
        <button type="button" className="btn primary big" onClick={() => setPhase('play')}>
          Start
        </button>
      </div>
    );
  }

  const wordMeta = COLORS.find((c) => c.id === trial.word)!;
  const inkMeta = COLORS.find((c) => c.id === trial.ink)!;

  return (
    <div className={`stroop-game ${feedback === 'bad' ? 'shake' : ''}`}>
      <div className="challenge-status">
        <span>
          Trial <strong>{idx + 1}</strong>/{ROUNDS}
        </span>
        <span className="muted">{correct} correct</span>
      </div>
      <p className="stroop-prompt muted">Tap the ink color</p>
      <div
        className={`stroop-word ${feedback === 'ok' ? 'ok' : ''} ${feedback === 'bad' ? 'bad' : ''}`}
        style={{ color: inkMeta.hex }}
        aria-live="polite"
      >
        {wordMeta.label}
      </div>
      <div className="stroop-choices" role="group" aria-label="Ink color choices">
        {COLORS.map((c) => (
          <button
            key={c.id}
            type="button"
            className="btn stroop-choice"
            style={{ borderColor: c.hex, color: c.hex }}
            onClick={() => answer(c.id)}
            disabled={!!feedback}
          >
            {c.label}
          </button>
        ))}
      </div>
    </div>
  );
}
