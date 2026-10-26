/**
 * Mini Sudoku 6×6 with 2×3 blocks.
 * Digits 1–6. Blocks are 2 rows × 3 cols.
 */

export type SudokuGrid = number[][]; // 0 = empty

const SIZE = 6;
const BOX_R = 2;
const BOX_C = 3;

function emptyGrid(): SudokuGrid {
  return Array.from({ length: SIZE }, () => Array(SIZE).fill(0));
}

function copy(g: SudokuGrid): SudokuGrid {
  return g.map((r) => [...r]);
}

function valid(g: SudokuGrid, r: number, c: number, n: number): boolean {
  for (let i = 0; i < SIZE; i++) {
    if (g[r][i] === n || g[i][c] === n) return false;
  }
  const br = Math.floor(r / BOX_R) * BOX_R;
  const bc = Math.floor(c / BOX_C) * BOX_C;
  for (let i = 0; i < BOX_R; i++) {
    for (let j = 0; j < BOX_C; j++) {
      if (g[br + i][bc + j] === n) return false;
    }
  }
  return true;
}

function solve(g: SudokuGrid, countOnly = false, limit = 2): number {
  let solutions = 0;
  const find = (): boolean => {
    for (let r = 0; r < SIZE; r++) {
      for (let c = 0; c < SIZE; c++) {
        if (g[r][c] === 0) {
          for (let n = 1; n <= SIZE; n++) {
            if (valid(g, r, c, n)) {
              g[r][c] = n;
              if (find()) {
                if (!countOnly) return true;
              }
              g[r][c] = 0;
              if (countOnly && solutions >= limit) return true;
            }
          }
          return false;
        }
      }
    }
    solutions++;
    return !countOnly;
  };
  find();
  return solutions;
}

function fillComplete(rand: () => number): SudokuGrid {
  const g = emptyGrid();
  const digits = [1, 2, 3, 4, 5, 6];

  const fill = (): boolean => {
    for (let r = 0; r < SIZE; r++) {
      for (let c = 0; c < SIZE; c++) {
        if (g[r][c] === 0) {
          const order = [...digits].sort(() => rand() - 0.5);
          for (const n of order) {
            if (valid(g, r, c, n)) {
              g[r][c] = n;
              if (fill()) return true;
              g[r][c] = 0;
            }
          }
          return false;
        }
      }
    }
    return true;
  };
  fill();
  return g;
}

export interface SudokuPuzzle {
  size: number;
  boxR: number;
  boxC: number;
  givens: SudokuGrid;
  solution: SudokuGrid;
}

export function generateSudoku(rand: () => number): SudokuPuzzle {
  const solution = fillComplete(rand);
  const puzzle = copy(solution);

  const cells: [number, number][] = [];
  for (let r = 0; r < SIZE; r++) {
    for (let c = 0; c < SIZE; c++) cells.push([r, c]);
  }
  for (let i = cells.length - 1; i > 0; i--) {
    const j = Math.floor(rand() * (i + 1));
    [cells[i], cells[j]] = [cells[j], cells[i]];
  }

  let removed = 0;
  const targetRemove = 16 + Math.floor(rand() * 4);
  for (const [r, c] of cells) {
    if (removed >= targetRemove) break;
    const backup = puzzle[r][c];
    puzzle[r][c] = 0;
    const test = copy(puzzle);
    const n = solve(test, true, 2);
    if (n !== 1) {
      puzzle[r][c] = backup;
    } else {
      removed++;
    }
  }

  return { size: SIZE, boxR: BOX_R, boxC: BOX_C, givens: puzzle, solution };
}

export function isComplete(grid: SudokuGrid, solution: SudokuGrid): boolean {
  for (let r = 0; r < SIZE; r++) {
    for (let c = 0; c < SIZE; c++) {
      if (grid[r][c] !== solution[r][c]) return false;
    }
  }
  return true;
}

export function isValidPlacement(grid: SudokuGrid, r: number, c: number, n: number): boolean {
  if (n === 0) return true;
  const g = copy(grid);
  g[r][c] = 0;
  return valid(g, r, c, n);
}
