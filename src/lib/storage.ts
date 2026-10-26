import { todayKey } from './rng';

export type ModeId = 'sudoku' | 'setlite' | 'nonogram' | 'numbermatch';
export type ChallengeId = 'schulte' | 'stroop' | 'nback' | 'digitspan';
export type PlayId = ModeId | ChallengeId;

export const MODES: { id: ModeId; name: string; blurb: string; emoji: string }[] = [
  { id: 'sudoku', name: 'Mini Sudoku', blurb: '6×6 grid, 2×3 blocks', emoji: '9️⃣' },
  { id: 'setlite', name: 'Pattern Set', blurb: 'Find matching triples', emoji: '🔺' },
  { id: 'nonogram', name: 'Nonogram', blurb: 'Paint by numbers', emoji: '⬛' },
  { id: 'numbermatch', name: 'Number Match', blurb: 'Pairs that sum to 10', emoji: '🔟' },
];

export const CHALLENGES: {
  id: ChallengeId;
  name: string;
  blurb: string;
  emoji: string;
  minutes: string;
}[] = [
  {
    id: 'schulte',
    name: 'Schulte table',
    blurb: 'Find 1–25 in order on a shuffled grid',
    emoji: '🔲',
    minutes: '~1–2 min',
  },
  {
    id: 'stroop',
    name: 'Stroop-lite',
    blurb: 'Tap the ink color, not the word',
    emoji: '🎨',
    minutes: '~1 min',
  },
  {
    id: 'nback',
    name: 'N-back lite',
    blurb: 'Match when a letter repeats from N ago',
    emoji: '🧠',
    minutes: '~2 min',
  },
  {
    id: 'digitspan',
    name: 'Digit span',
    blurb: 'Remember and enter growing digit sequences',
    emoji: '🔢',
    minutes: '~1–2 min',
  },
];

const MODE_ORDER: ModeId[] = ['sudoku', 'setlite', 'nonogram', 'numbermatch'];
const CHALLENGE_ORDER: ChallengeId[] = ['schulte', 'stroop', 'nback', 'digitspan'];

export function isChallenge(id: PlayId): id is ChallengeId {
  return (CHALLENGE_ORDER as string[]).includes(id);
}

export function isMode(id: PlayId): id is ModeId {
  return (MODE_ORDER as string[]).includes(id);
}

export function playMeta(id: PlayId) {
  if (isChallenge(id)) return CHALLENGES.find((c) => c.id === id)!;
  return MODES.find((m) => m.id === id)!;
}

/** Rotating daily brain challenge (same for everyone that day). */
export function dailyChallengeId(date = todayKey()): ChallengeId {
  let h = 2166136261;
  const s = `quell:${date}:brain`;
  for (let i = 0; i < s.length; i++) {
    h ^= s.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  return CHALLENGE_ORDER[(h >>> 0) % CHALLENGE_ORDER.length];
}

/** Full daily sequence: 4 puzzles + today's brain challenge. */
export function dailyOrder(date = todayKey()): PlayId[] {
  return [...MODE_ORDER, dailyChallengeId(date)];
}

export const DAILY_TOTAL = 5;

export interface DailyProgress {
  date: string;
  completed: PlayId[];
  times: Partial<Record<PlayId, number>>;
  scores: Partial<Record<PlayId, number>>;
}

export interface Stats {
  streak: number;
  lastDailyComplete: string | null;
  bestTimes: Partial<Record<PlayId, number>>;
  bestScores: Partial<Record<PlayId, number>>;
  gamesWon: number;
}

const DAILY_KEY = 'quell_daily';
const STATS_KEY = 'quell_stats';

function load<T>(key: string, fallback: T): T {
  try {
    const raw = localStorage.getItem(key);
    if (!raw) return fallback;
    return { ...fallback, ...JSON.parse(raw) };
  } catch {
    return fallback;
  }
}

function save(key: string, value: unknown) {
  localStorage.setItem(key, JSON.stringify(value));
}

export function getDaily(): DailyProgress {
  const today = todayKey();
  const d = load<DailyProgress>(DAILY_KEY, {
    date: today,
    completed: [],
    times: {},
    scores: {},
  });
  if (d.date !== today) {
    const fresh: DailyProgress = { date: today, completed: [], times: {}, scores: {} };
    save(DAILY_KEY, fresh);
    return fresh;
  }
  if (!d.scores) d.scores = {};
  if (!d.times) d.times = {};
  if (!d.completed) d.completed = [];
  return d;
}

export function getStats(): Stats {
  const s = load<Stats>(STATS_KEY, {
    streak: 0,
    lastDailyComplete: null,
    bestTimes: {},
    bestScores: {},
    gamesWon: 0,
  });
  if (!s.bestTimes) s.bestTimes = {};
  if (!s.bestScores) s.bestScores = {};
  return s;
}

function bumpStats(id: PlayId, seconds: number, score?: number): Stats {
  const stats = getStats();
  stats.gamesWon += 1;
  const best = stats.bestTimes[id];
  if (best == null || seconds < best) stats.bestTimes[id] = seconds;
  if (score != null) {
    const prev = stats.bestScores[id];
    if (prev == null || score > prev) stats.bestScores[id] = score;
  }
  save(STATS_KEY, stats);
  return stats;
}

/** Record a practice win (stats only). */
export function recordPracticeWin(id: PlayId, seconds: number, score?: number): void {
  bumpStats(id, seconds, score);
}

/** Record a daily-mode win: progress + streak + stats. */
export function markModeComplete(id: PlayId, seconds: number, score?: number): DailyProgress {
  const daily = getDaily();
  if (!daily.completed.includes(id)) {
    daily.completed = [...daily.completed, id];
  }
  const prev = daily.times[id];
  if (prev == null || seconds < prev) daily.times[id] = seconds;
  if (score != null) {
    const prevS = daily.scores[id];
    if (prevS == null || score > prevS) daily.scores[id] = score;
  }
  save(DAILY_KEY, daily);

  const stats = bumpStats(id, seconds, score);

  if (daily.completed.length >= DAILY_TOTAL) {
    const today = todayKey();
    if (stats.lastDailyComplete !== today) {
      const yesterday = todayKey(new Date(Date.now() - 86400000));
      if (stats.lastDailyComplete === yesterday) {
        stats.streak += 1;
      } else {
        stats.streak = 1;
      }
      stats.lastDailyComplete = today;
      save(STATS_KEY, stats);
    }
  }
  return daily;
}

export function effectiveStreak(): number {
  const stats = getStats();
  const today = todayKey();
  const yesterday = todayKey(new Date(Date.now() - 86400000));
  if (!stats.lastDailyComplete) return 0;
  if (stats.lastDailyComplete === today || stats.lastDailyComplete === yesterday) {
    return stats.streak;
  }
  return 0;
}

export function nextDailyMode(): PlayId | null {
  const d = getDaily();
  return dailyOrder().find((m) => !d.completed.includes(m)) ?? null;
}
