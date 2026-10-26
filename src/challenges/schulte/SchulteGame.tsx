import { useMemo, useState, type CSSProperties } from 'react';
import { mulberry32, hashSeed, shuffle } from '../../lib/rng';

interface Props {
  seed?: number;
  onWin: (score?: number) => void;
}

const N = 5;
const TOTAL = N * N;

export function SchulteGame({ seed, onWin }: Props) {
  const [phase, setPhase] = useState<'ready' | 'play'>('ready');
  const [next, setNext] = useState(1);
  const [flash, setFlash] = useState<number | null>(null);
  const [bad, setBad] = useState(false);

  const cells = useMemo(() => {
    const rand = mulberry32(seed ?? (Date.now() ^ hashSeed('schulte')) >>> 0);
    return shuffle(
      Array.from({ length: TOTAL }, (_, i) => i + 1),
      rand,
    );
  }, [seed]);

  const tap = (n: number) => {
    if (phase !== 'play') return;
    if (n === next) {
      setFlash(n);
      setTimeout(() => setFlash(null), 120);
      if (next === TOTAL) {
        onWin(TOTAL);
      } else {
        setNext(next + 1);
      }
    } else {
      setBad(true);
      setTimeout(() => setBad(false), 280);
    }
  };

  if (phase === 'ready') {
    return (
      <div className="challenge-ready">
        <h3>Schulte table</h3>
        <p className="muted">
          Tap numbers <strong>1 through {TOTAL}</strong> in order on the shuffled {N}×{N} grid.
          Go as fast as you can — one finite run, then you&apos;re done.
        </p>
        <button type="button" className="btn primary big" onClick={() => setPhase('play')}>
          Start
        </button>
      </div>
    );
  }

  return (
    <div className={`schulte-game ${bad ? 'shake' : ''}`}>
      <div className="challenge-status">
        <span>
          Next: <strong>{next}</strong>
        </span>
        <span className="muted">
          {next - 1}/{TOTAL}
        </span>
      </div>
      <div
        className="schulte-grid"
        style={{ '--n': N } as CSSProperties}
        role="grid"
        aria-label="Schulte table"
      >
        {cells.map((n) => (
          <button
            key={n}
            type="button"
            role="gridcell"
            className={`schulte-cell ${flash === n ? 'flash' : ''} ${n < next ? 'done' : ''}`}
            onClick={() => tap(n)}
            disabled={n < next}
            aria-label={`Number ${n}`}
          >
            {n}
          </button>
        ))}
      </div>
      <p className="hint-text muted">Find {next} — finish the board to complete.</p>
    </div>
  );
}
