import { useMemo, useState } from 'react';
import type { Card, SetPuzzle } from './gen';
import { COLORS, findAllSets, isSet } from './gen';

interface Props {
  puzzle: SetPuzzle;
  onWin: () => void;
}

function ShapeSvg({ card }: { card: Card }) {
  const color = COLORS[card.color];
  const fill =
    card.fill === 2 ? color : card.fill === 1 ? `url(#stripe-${card.id})` : 'transparent';
  const stroke = color;
  const common = { stroke, strokeWidth: 3, fill };

  return (
    <svg viewBox="0 0 60 80" className="set-shape" aria-hidden>
      {card.fill === 1 && (
        <defs>
          <pattern
            id={`stripe-${card.id}`}
            width="6"
            height="6"
            patternUnits="userSpaceOnUse"
            patternTransform="rotate(45)"
          >
            <line x1="0" y1="0" x2="0" y2="6" stroke={color} strokeWidth="3" />
          </pattern>
        </defs>
      )}
      {card.shape === 0 && <polygon points="30,8 54,72 6,72" {...common} />}
      {card.shape === 1 && <ellipse cx="30" cy="40" rx="18" ry="28" {...common} />}
      {card.shape === 2 && <rect x="10" y="12" width="40" height="56" rx="4" {...common} />}
    </svg>
  );
}

export function SetGame({ puzzle, onWin }: Props) {
  const [found, setFound] = useState<[number, number, number][]>([]);
  const [selected, setSelected] = useState<number[]>([]);
  const [message, setMessage] = useState('Find three cards that form a set');
  const [flash, setFlash] = useState<'good' | 'bad' | null>(null);

  const remainingSets = useMemo(() => {
    const all = findAllSets(puzzle.board);
    return all.filter(
      (s) =>
        !found.some(
          (f) =>
            [...f].sort().join() === [...s].sort().join(),
        ),
    );
  }, [puzzle.board, found]);

  const target = Math.min(3, Math.max(1, puzzle.setCount));

  const toggle = (idx: number) => {
    if (found.some((f) => f.includes(idx))) return;
    let next = selected.includes(idx) ? selected.filter((i) => i !== idx) : [...selected, idx];
    if (next.length > 3) next = [idx];
    setSelected(next);

    if (next.length === 3) {
      const [a, b, c] = next;
      const cards = puzzle.board;
      if (isSet(cards[a], cards[b], cards[c])) {
        const key = [a, b, c].sort((x, y) => x - y) as [number, number, number];
        const already = found.some((f) => [...f].sort().join() === key.join());
        if (already) {
          setFlash('bad');
          setMessage('Already found that set');
          setSelected([]);
        } else {
          const nf = [...found, key];
          setFound(nf);
          setFlash('good');
          setSelected([]);
          const left = target - nf.length;
          if (nf.length >= target) {
            setMessage('All sets found!');
            setTimeout(onWin, 400);
          } else {
            setMessage(`Nice! ${left} more to go`);
          }
        }
      } else {
        setFlash('bad');
        setMessage('Not a set — each trait all-same or all-different');
        setSelected([]);
      }
      setTimeout(() => setFlash(null), 450);
    }
  };

  const hint = () => {
    if (remainingSets.length === 0) {
      setMessage('No more sets on this board');
      return;
    }
    const [a] = remainingSets[0];
    setSelected([a]);
    setMessage('Hint: one card of a set is highlighted');
  };

  return (
    <div className={`set-game ${flash ?? ''}`}>
      <div className="set-status">
        <span>
          Sets found: {found.length}/{target}
        </span>
        <button type="button" className="btn ghost small" onClick={hint}>
          Hint
        </button>
      </div>
      <p className="set-msg muted">{message}</p>
      <div className="set-board" role="list">
        {puzzle.board.map((card, idx) => {
          const used = found.some((f) => f.includes(idx));
          const sel = selected.includes(idx);
          return (
            <button
              key={card.id}
              type="button"
              role="listitem"
              className={['set-card', sel ? 'selected' : '', used ? 'used' : '']
                .filter(Boolean)
                .join(' ')}
              onClick={() => toggle(idx)}
              disabled={used}
              aria-label={`Card ${idx + 1}`}
              aria-pressed={sel}
            >
              <ShapeSvg card={card} />
            </button>
          );
        })}
      </div>
      <p className="hint-text muted">
        A set: for color, shape, and fill — each is all the same or all different.
      </p>
    </div>
  );
}
