/**
 * Nonogram / Picross generator with unique-solution check via line deduction.
 */

export type Cell = 0 | 1;

export interface NonogramPuzzle {
  size: number;
  solution: Cell[][];
  rowClues: number[][];
  colClues: number[][];
}

function cluesFromLine(line: Cell[]): number[] {
  const clues: number[] = [];
  let run = 0;
  for (const c of line) {
    if (c === 1) run++;
    else if (run > 0) {
      clues.push(run);
      run = 0;
    }
  }
  if (run > 0) clues.push(run);
  return clues.length ? clues : [0];
}

function generatePattern(size: number, rand: () => number): Cell[][] {
  const density = 0.4 + rand() * 0.15;
  const grid: Cell[][] = Array.from({ length: size }, () =>
    Array.from({ length: size }, () => (rand() < density ? 1 : 0) as Cell),
  );
  for (let i = 0; i < size; i++) {
    if (grid[i].every((c) => c === 0)) grid[i][Math.floor(rand() * size)] = 1;
    if (grid.every((r) => r[i] === 0)) grid[Math.floor(rand() * size)][i] = 1;
  }
  return grid;
}

function linePossibilities(size: number, clues: number[]): Cell[][] {
  if (clues.length === 1 && clues[0] === 0) {
    return [Array(size).fill(0)];
  }
  const results: Cell[][] = [];
  const place = (idx: number, pos: number, line: Cell[]) => {
    if (idx === clues.length) {
      results.push([...line]);
      return;
    }
    const len = clues[idx];
    const remaining = clues.slice(idx + 1);
    const minRest = remaining.reduce((a, b) => a + b, 0) + remaining.length;
    for (let start = pos; start + len + minRest <= size; start++) {
      const next = [...line];
      for (let i = start; i < start + len; i++) next[i] = 1;
      const nextPos = start + len + (idx < clues.length - 1 ? 1 : 0);
      place(idx + 1, nextPos, next);
    }
  };
  place(0, 0, Array(size).fill(0));
  return results;
}

function hasUniqueSolution(
  size: number,
  rowClues: number[][],
  colClues: number[][],
  expected: Cell[][],
): boolean {
  const known: number[][] = Array.from({ length: size }, () => Array(size).fill(-1));

  const filterLines = (clues: number[], knownLine: number[]): Cell[][] => {
    return linePossibilities(size, clues).filter((cand) =>
      cand.every((v, i) => knownLine[i] === -1 || knownLine[i] === v),
    );
  };

  let changed = true;
  let guard = 0;
  while (changed && guard++ < size * size * 4) {
    changed = false;
    for (let r = 0; r < size; r++) {
      const poss = filterLines(rowClues[r], known[r]);
      if (poss.length === 0) return false;
      for (let c = 0; c < size; c++) {
        const all1 = poss.every((p) => p[c] === 1);
        const all0 = poss.every((p) => p[c] === 0);
        if (all1 && known[r][c] !== 1) {
          known[r][c] = 1;
          changed = true;
        } else if (all0 && known[r][c] !== 0) {
          known[r][c] = 0;
          changed = true;
        }
      }
    }
    for (let c = 0; c < size; c++) {
      const colKnown = known.map((row) => row[c]);
      const poss = filterLines(colClues[c], colKnown);
      if (poss.length === 0) return false;
      for (let r = 0; r < size; r++) {
        const all1 = poss.every((p) => p[r] === 1);
        const all0 = poss.every((p) => p[r] === 0);
        if (all1 && known[r][c] !== 1) {
          known[r][c] = 1;
          changed = true;
        } else if (all0 && known[r][c] !== 0) {
          known[r][c] = 0;
          changed = true;
        }
      }
    }
  }

  for (let r = 0; r < size; r++) {
    for (let c = 0; c < size; c++) {
      if (known[r][c] === -1) return false;
      if (known[r][c] !== expected[r][c]) return false;
    }
  }
  return true;
}

export function generateNonogram(rand: () => number, size: number): NonogramPuzzle {
  for (let attempt = 0; attempt < 60; attempt++) {
    const solution = generatePattern(size, rand);
    const rowClues = solution.map(cluesFromLine);
    const colClues = Array.from({ length: size }, (_, c) =>
      cluesFromLine(solution.map((row) => row[c])),
    );
    if (hasUniqueSolution(size, rowClues, colClues, solution)) {
      return { size, solution, rowClues, colClues };
    }
  }
  const solution: Cell[][] = Array.from({ length: size }, (_, r) =>
    Array.from({ length: size }, (_, c) => ((r + c) % 3 !== 0 ? 1 : 0) as Cell),
  );
  for (let i = 0; i < size; i++) {
    solution[i][Math.floor(rand() * size)] = 1;
  }
  const rowClues = solution.map(cluesFromLine);
  const colClues = Array.from({ length: size }, (_, c) =>
    cluesFromLine(solution.map((row) => row[c])),
  );
  return { size, solution, rowClues, colClues };
}

export function isSolved(player: Cell[][], solution: Cell[][]): boolean {
  for (let r = 0; r < solution.length; r++) {
    for (let c = 0; c < solution[r].length; c++) {
      if ((player[r][c] === 1) !== (solution[r][c] === 1)) return false;
    }
  }
  return true;
}
