import { useMemo, useState, type CSSProperties } from 'react';
import type { SudokuPuzzle, SudokuGrid } from './gen';
import { isComplete, isValidPlacement } from './gen';

interface Props {
  puzzle: SudokuPuzzle;
  onWin: () => void;
}

export function SudokuGame({ puzzle, onWin }: Props) {
  const [grid, setGrid] = useState<SudokuGrid>(() => puzzle.givens.map((r) => [...r]));
  const [selected, setSelected] = useState<[number, number] | null>(null);
  const [error, setError] = useState(false);
  const [conflictCell, setConflictCell] = useState<[number, number] | null>(null);

  const givenMask = useMemo(
    () => puzzle.givens.map((row) => row.map((v) => v !== 0)),
    [puzzle],
  );

  const selectedVal =
    selected && grid[selected[0]][selected[1]] !== 0 ? grid[selected[0]][selected[1]] : null;

  const place = (n: number) => {
    if (!selected) return;
    const [r, c] = selected;
    if (givenMask[r][c]) return;
    if (n !== 0 && !isValidPlacement(grid, r, c, n)) {
      setError(true);
      setConflictCell([r, c]);
      setTimeout(() => {
        setError(false);
        setConflictCell(null);
      }, 320);
      return;
    }
    const next = grid.map((row) => [...row]);
    next[r][c] = n;
    setGrid(next);
    if (isComplete(next, puzzle.solution)) onWin();
  };

  const { size, boxR, boxC } = puzzle;

  return (
    <div className="sudoku-game">
      <div
        className={`sudoku-board ${error ? 'shake' : ''}`}
        style={{ '--size': size } as CSSProperties}
        role="grid"
        aria-label="Sudoku board"
      >
        {grid.map((row, r) =>
          row.map((val, c) => {
            const isGiven = givenMask[r][c];
            const isSel = selected?.[0] === r && selected?.[1] === c;
            const isSame = selectedVal != null && val === selectedVal && !isSel;
            const isConflict = conflictCell?.[0] === r && conflictCell?.[1] === c;
            const thickR = r % boxR === 0;
            const thickC = c % boxC === 0;
            return (
              <button
                key={`${r}-${c}`}
                type="button"
                role="gridcell"
                className={[
                  'sudoku-cell',
                  isGiven ? 'given' : '',
                  isSel ? 'selected' : '',
                  isSame ? 'same' : '',
                  isConflict ? 'conflict' : '',
                  thickR ? 'box-top' : '',
                  thickC ? 'box-left' : '',
                  r === size - 1 ? 'box-bottom' : '',
                  c === size - 1 ? 'box-right' : '',
                ]
                  .filter(Boolean)
                  .join(' ')}
                onClick={() => setSelected([r, c])}
                aria-label={`Row ${r + 1} column ${c + 1}${val ? `, ${val}` : ', empty'}`}
              >
                {val || ''}
              </button>
            );
          }),
        )}
      </div>
      <div className="numpad" role="group" aria-label="Number pad">
        {[1, 2, 3, 4, 5, 6].map((n) => (
          <button key={n} type="button" className="btn numpad-btn" onClick={() => place(n)}>
            {n}
          </button>
        ))}
        <button type="button" className="btn numpad-btn erase" onClick={() => place(0)}>
          ⌫
        </button>
      </div>
    </div>
  );
}
