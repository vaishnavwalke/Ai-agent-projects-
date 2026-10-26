import { hashSeed, mulberry32, todayKey } from './rng';
import type { ChallengeId, ModeId, PlayId } from './storage';
import { isChallenge } from './storage';
import { generateSudoku } from '../puzzles/sudoku/gen';
import { generateSetBoard } from '../puzzles/setlite/gen';
import { generateNonogram } from '../puzzles/nonogram/gen';
import { generateNumberMatch } from '../puzzles/numbermatch/gen';

export function dailySeed(mode: PlayId, date = todayKey()): number {
  return hashSeed(`quell:${date}:${mode}`);
}

export type PuzzleBundle =
  | { type: 'sudoku'; puzzle: ReturnType<typeof generateSudoku> }
  | { type: 'setlite'; puzzle: ReturnType<typeof generateSetBoard> }
  | { type: 'nonogram'; puzzle: ReturnType<typeof generateNonogram> }
  | { type: 'numbermatch'; puzzle: ReturnType<typeof generateNumberMatch> }
  | { type: ChallengeId; seed: number; nBack?: 1 | 2 };

export function getDailyPuzzle(mode: PlayId, date = todayKey()): PuzzleBundle {
  const seed = dailySeed(mode, date);
  const rand = mulberry32(seed);
  if (isChallenge(mode)) {
    if (mode === 'nback') {
      return { type: 'nback', seed, nBack: (seed % 2 === 0 ? 1 : 2) as 1 | 2 };
    }
    return { type: mode, seed };
  }
  switch (mode as ModeId) {
    case 'sudoku':
      return { type: 'sudoku', puzzle: generateSudoku(rand) };
    case 'setlite':
      return { type: 'setlite', puzzle: generateSetBoard(rand) };
    case 'nonogram':
      return { type: 'nonogram', puzzle: generateNonogram(rand, 5) };
    case 'numbermatch':
      return { type: 'numbermatch', puzzle: generateNumberMatch(rand) };
  }
}

export function getPracticePuzzle(mode: PlayId, size?: number): PuzzleBundle {
  const seed = (Date.now() ^ hashSeed(mode)) >>> 0;
  const rand = mulberry32(seed);
  if (isChallenge(mode)) {
    if (mode === 'nback') {
      return { type: 'nback', seed, nBack: (seed % 2 === 0 ? 1 : 2) as 1 | 2 };
    }
    return { type: mode, seed };
  }
  switch (mode as ModeId) {
    case 'sudoku':
      return { type: 'sudoku', puzzle: generateSudoku(rand) };
    case 'setlite':
      return { type: 'setlite', puzzle: generateSetBoard(rand) };
    case 'nonogram':
      return { type: 'nonogram', puzzle: generateNonogram(rand, size === 10 ? 10 : 5) };
    case 'numbermatch':
      return { type: 'numbermatch', puzzle: generateNumberMatch(rand) };
  }
}
