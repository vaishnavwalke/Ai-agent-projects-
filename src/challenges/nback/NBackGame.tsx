import { useEffect, useMemo, useRef, useState } from 'react';
import { mulberry32, hashSeed, pick } from '../../lib/rng';

interface Props {
  seed?: number;
  n?: 1 | 2;
  onWin: (score?: number) => void;
}

const LETTERS = ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H'] as const;
const TRIALS = 18;
const SHOW_MS = 1500;
const GAP_MS = 450;

function makeSequence(seed: number, n: number): string[] {
  const rand = mulberry32(seed);
  const seq: string[] = [];
  for (let i = 0; i < TRIALS; i++) {
    if (i >= n && rand() < 0.35) {
      seq.push(seq[i - n]);
    } else {
      let L = pick([...LETTERS], rand);
      if (i >= n) {
        let guard = 0;
        while (L === seq[i - n] && guard++ < 8) L = pick([...LETTERS], rand);
      }
      seq.push(L);
    }
  }
  return seq;
}

export function NBackGame({ seed, n: nProp, onWin }: Props) {
  const resolvedN: 1 | 2 = nProp ?? (((seed ?? 1) >>> 0) % 2 === 0 ? 1 : 2);
  const [phase, setPhase] = useState<'ready' | 'play'>('ready');
  const [idx, setIdx] = useState(0);
  const [showing, setShowing] = useState(false);
  const [hits, setHits] = useState(0);
  const [misses, setMisses] = useState(0);
  const [falseAlarms, setFalseAlarms] = useState(0);
  const [flash, setFlash] = useState<'ok' | 'bad' | null>(null);
  const [responded, setResponded] = useState(false);

  const respondedRef = useRef(false);
  const hitsRef = useRef(0);
  const finishedRef = useRef(false);
  const onWinRef = useRef(onWin);
  onWinRef.current = onWin;

  const sequence = useMemo(
    () => makeSequence(seed ?? ((Date.now() ^ hashSeed('nback')) >>> 0), resolvedN),
    [seed, resolvedN],
  );

  useEffect(() => {
    if (phase !== 'play') return;

    if (idx >= TRIALS) {
      if (!finishedRef.current) {
        finishedRef.current = true;
        onWinRef.current(hitsRef.current);
      }
      return;
    }

    respondedRef.current = false;
    setResponded(false);
    setFlash(null);
    setShowing(false);

    const showTimer = window.setTimeout(() => {
      setShowing(true);
    }, GAP_MS);

    const endTimer = window.setTimeout(() => {
      setShowing(false);
      const isMatch = idx >= resolvedN && sequence[idx] === sequence[idx - resolvedN];
      if (isMatch && !respondedRef.current) {
        setMisses((m) => m + 1);
      }
      setIdx((i) => i + 1);
    }, GAP_MS + SHOW_MS);

    return () => {
      window.clearTimeout(showTimer);
      window.clearTimeout(endTimer);
    };
  }, [phase, idx, sequence, resolvedN]);

  const onMatch = () => {
    if (phase !== 'play' || !showing || respondedRef.current || idx < resolvedN) return;
    respondedRef.current = true;
    setResponded(true);
    const isMatch = sequence[idx] === sequence[idx - resolvedN];
    if (isMatch) {
      hitsRef.current += 1;
      setHits(hitsRef.current);
      setFlash('ok');
    } else {
      setFalseAlarms((f) => f + 1);
      setFlash('bad');
    }
  };

  if (phase === 'ready') {
    return (
      <div className="challenge-ready">
        <h3>N-back lite ({resolvedN}-back)</h3>
        <p className="muted">
          Letters appear one at a time. Tap <strong>Match</strong> when the current letter is the
          same as the one{' '}
          <strong>
            {resolvedN} step{resolvedN > 1 ? 's' : ''} back
          </strong>
          . {TRIALS} trials — finite round.
        </p>
        <button
          type="button"
          className="btn primary big"
          onClick={() => {
            finishedRef.current = false;
            hitsRef.current = 0;
            setHits(0);
            setMisses(0);
            setFalseAlarms(0);
            setIdx(0);
            setPhase('play');
          }}
        >
          Start
        </button>
      </div>
    );
  }

  const letter = idx < TRIALS ? sequence[idx] : '';

  return (
    <div className={`nback-game ${flash === 'bad' ? 'shake' : ''}`}>
      <div className="challenge-status">
        <span>
          {resolvedN}-back · <strong>{Math.min(idx + 1, TRIALS)}</strong>/{TRIALS}
        </span>
        <span className="muted">
          ✓{hits} · miss {misses} · ✗{falseAlarms}
        </span>
      </div>
      <div
        className={`nback-letter ${showing ? 'show' : ''} ${flash === 'ok' ? 'ok' : ''} ${flash === 'bad' ? 'bad' : ''}`}
        aria-live="polite"
      >
        {showing ? letter : '·'}
      </div>
      <button
        type="button"
        className="btn primary big nback-match"
        onClick={onMatch}
        disabled={!showing || responded || idx < resolvedN || idx >= TRIALS}
      >
        Match
      </button>
      <p className="hint-text muted">
        Tap Match only when this letter matches {resolvedN} ago.
      </p>
    </div>
  );
}
