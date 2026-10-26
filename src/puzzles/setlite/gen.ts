/**
 * SET-lite: 3 attributes × 3 values = 27 cards.
 * color: 0 red, 1 green, 2 blue
 * shape: 0 diamond, 1 oval, 2 square
 * fill:  0 empty, 1 striped, 2 solid
 */

export interface Card {
  id: number;
  color: 0 | 1 | 2;
  shape: 0 | 1 | 2;
  fill: 0 | 1 | 2;
}

export const COLORS = ['#ef4444', '#22c55e', '#3b82f6'] as const;

export function allCards(): Card[] {
  const cards: Card[] = [];
  let id = 0;
  for (let color = 0; color < 3; color++) {
    for (let shape = 0; shape < 3; shape++) {
      for (let fill = 0; fill < 3; fill++) {
        cards.push({
          id: id++,
          color: color as 0 | 1 | 2,
          shape: shape as 0 | 1 | 2,
          fill: fill as 0 | 1 | 2,
        });
      }
    }
  }
  return cards;
}

export function isSet(a: Card, b: Card, c: Card): boolean {
  const attrs: (keyof Pick<Card, 'color' | 'shape' | 'fill'>)[] = ['color', 'shape', 'fill'];
  return attrs.every((attr) => {
    const vals = [a[attr], b[attr], c[attr]];
    const allSame = vals[0] === vals[1] && vals[1] === vals[2];
    const allDiff = vals[0] !== vals[1] && vals[1] !== vals[2] && vals[0] !== vals[2];
    return allSame || allDiff;
  });
}

export function findAllSets(board: Card[]): [number, number, number][] {
  const sets: [number, number, number][] = [];
  for (let i = 0; i < board.length; i++) {
    for (let j = i + 1; j < board.length; j++) {
      for (let k = j + 1; k < board.length; k++) {
        if (isSet(board[i], board[j], board[k])) sets.push([i, j, k]);
      }
    }
  }
  return sets;
}

export interface SetPuzzle {
  board: Card[];
  setCount: number;
}

export function generateSetBoard(rand: () => number): SetPuzzle {
  const deck = allCards();
  for (let attempt = 0; attempt < 80; attempt++) {
    for (let i = deck.length - 1; i > 0; i--) {
      const j = Math.floor(rand() * (i + 1));
      [deck[i], deck[j]] = [deck[j], deck[i]];
    }
    const board = deck.slice(0, 12);
    const sets = findAllSets(board);
    if (sets.length >= 3 && sets.length <= 10) {
      return { board, setCount: sets.length };
    }
  }
  const board = deck.slice(0, 12);
  return { board, setCount: findAllSets(board).length };
}
