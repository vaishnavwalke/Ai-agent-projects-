import { useState, type CSSProperties } from 'react';
import type { NumberMatchPuzzle } from './gen';
import { canPair, isCleared } from './gen';

interface Props {
  puzzle: NumberMatchPuzzle;
  onWin: () => void;
}

export function NumberMatchGame({ puzzle, onWin }: Props) {
  const [values, setValues] = useState(() => [...puzzle.values]);
  const [selected, setSelected] = useState<number | null>(null);
  const [bad, setBad] = useState<number[]>([]);
  const [msg, setMsg] = useState(`Tap two numbers that add up to ${puzzle.target}`);

  const tap = (idx: number) => {
    if (values[idx] === 0) return;
    if (selected === null) {
      setSelected(idx);
      setMsg('Pick a partner');
      return;
    }
    if (selected === idx) {
      setSelected(null);
      setMsg(`Tap two numbers that add up to ${puzzle.target}`);
      return;
    }
    const a = values[selected];
    const b = values[idx];
    if (canPair(a, b, puzzle.target)) {
      const next = [...values];
      next[selected] = 0;
      next[idx] = 0;
      setValues(next);
      setSelected(null);
      setMsg('Cleared!');
      if (isCleared(next)) setTimeout(onWin, 250);
      else setMsg(`Nice — sum ${puzzle.target}. Keep going.`);
    } else {
      setBad([selected, idx]);
      setMsg(`${a} + ${b} ≠ ${puzzle.target}`);
      setSelected(null);
      setTimeout(() => setBad([]), 400);
    }
  };

  return (
    <div className="numbermatch-game">
      <p className="set-msg muted">{msg}</p>
      <div
        className="nm-board"
        style={{ '--cols': puzzle.cols } as CSSProperties}
        role="grid"
      >
        {values.map((v, idx) => (
          <button
            key={idx}
            type="button"
            role="gridcell"
            className={[
              'nm-cell',
              v === 0 ? 'cleared' : '',
              selected === idx ? 'selected' : '',
              bad.includes(idx) ? 'bad' : '',
            ]
              .filter(Boolean)
              .join(' ')}
            onClick={() => tap(idx)}
            disabled={v === 0}
            aria-label={v === 0 ? 'cleared' : String(v)}
          >
            {v || ''}
          </button>
        ))}
      </div>
      <p className="hint-text muted">Pairs that sum to {puzzle.target} clear the board.</p>
    </div>
  );
}
