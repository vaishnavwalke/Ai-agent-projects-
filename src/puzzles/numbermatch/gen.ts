/**
 * Number Match — tap two numbers that sum to TARGET (10) to clear them.
 * Board is built from valid pairs so it is always solvable.
 */

export interface NumberMatchPuzzle {
  rows: number;
  cols: number;
  target: number;
  values: number[];
}

export function generateNumberMatch(rand: () => number): NumberMatchPuzzle {
  const rows = 4;
  const cols = 4;
  const target = 10;
  const cells = rows * cols;
  const pairOptions: [number, number][] = [
    [1, 9],
    [2, 8],
    [3, 7],
    [4, 6],
    [5, 5],
  ];

  const values: number[] = [];
  for (let i = 0; i < cells / 2; i++) {
    const [a, b] = pairOptions[Math.floor(rand() * pairOptions.length)];
    values.push(a, b);
  }
  for (let i = values.length - 1; i > 0; i--) {
    const j = Math.floor(rand() * (i + 1));
    [values[i], values[j]] = [values[j], values[i]];
  }

  return { rows, cols, target, values };
}

export function canPair(a: number, b: number, target: number): boolean {
  return a > 0 && b > 0 && a + b === target;
}

export function isCleared(values: number[]): boolean {
  return values.every((v) => v === 0);
}
