import { useRef, useState, type CSSProperties } from 'react';
import type { Cell, NonogramPuzzle } from './gen';
import { isSolved } from './gen';

interface Props {
  puzzle: NonogramPuzzle;
  onWin: () => void;
}

type Mark = 0 | 1 | 2; // 0 empty, 1 filled, 2 X

export function NonogramGame({ puzzle, onWin }: Props) {
  const { size, rowClues, colClues, solution } = puzzle;
  const [marks, setMarks] = useState<Mark[][]>(() =>
    Array.from({ length: size }, () => Array(size).fill(0)),
  );
  const [mode, setMode] = useState<'fill' | 'x'>('fill');
  const dragging = useRef<{ value: Mark } | null>(null);

  const apply = (r: number, c: number, value: Mark) => {
    setMarks((prev) => {
      const next = prev.map((row) => [...row]);
      next[r][c] = value;
      const asCells: Cell[][] = next.map((row) => row.map((m) => (m === 1 ? 1 : 0)));
      if (isSolved(asCells, solution)) {
        setTimeout(onWin, 120);
      }
      return next;
    });
  };

  const paint = (r: number, c: number, isStart: boolean) => {
    if (isStart) {
      const cur = marks[r][c];
      const target: Mark = mode === 'fill' ? (cur === 1 ? 0 : 1) : cur === 2 ? 0 : 2;
      dragging.current = { value: target };
      apply(r, c, target);
    } else if (dragging.current) {
      apply(r, c, dragging.current.value);
    }
  };

  const maxRowClue = Math.max(...rowClues.map((c) => c.length), 1);
  const maxColClue = Math.max(...colClues.map((c) => c.length), 1);

  return (
    <div className="nonogram-game">
      <div className="nonogram-toolbar">
        <button
          type="button"
          className={`btn small ${mode === 'fill' ? 'primary' : ''}`}
          onClick={() => setMode('fill')}
        >
          Fill
        </button>
        <button
          type="button"
          className={`btn small ${mode === 'x' ? 'primary' : ''}`}
          onClick={() => setMode('x')}
        >
          Mark ×
        </button>
      </div>
      <div
        className="nonogram-wrap"
        onPointerUp={() => {
          dragging.current = null;
        }}
        onPointerLeave={() => {
          dragging.current = null;
        }}
      >
        <div
          className="nonogram-grid"
          style={
            {
              '--n': size,
              '--rc': maxRowClue,
              '--cc': maxColClue,
            } as CSSProperties
          }
        >
          <div className="ng-corner" />
          {colClues.map((clues, c) => (
            <div key={`cc-${c}`} className="ng-col-clue">
              {clues.map((n, i) => (
                <span key={i}>{n}</span>
              ))}
            </div>
          ))}
          {marks.map((row, r) => (
            <div key={`row-${r}`} className="ng-row">
              <div className="ng-row-clue">
                {rowClues[r].map((n, i) => (
                  <span key={i}>{n}</span>
                ))}
              </div>
              {row.map((mark, c) => (
                <button
                  key={`${r}-${c}`}
                  type="button"
                  className={`ng-cell mark-${mark}`}
                  onPointerDown={(e) => {
                    e.preventDefault();
                    (e.target as HTMLElement).setPointerCapture?.(e.pointerId);
                    paint(r, c, true);
                  }}
                  onPointerEnter={(e) => {
                    if (e.buttons === 1) paint(r, c, false);
                  }}
                  aria-label={`Row ${r + 1} col ${c + 1}`}
                >
                  {mark === 2 ? '×' : ''}
                </button>
              ))}
            </div>
          ))}
        </div>
      </div>
      <p className="hint-text muted">Fill cells to match the clues. Use × for known empties.</p>
    </div>
  );
}
