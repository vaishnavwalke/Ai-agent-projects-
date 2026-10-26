import { useEffect, useMemo, useState } from 'react';
import { mulberry32, hashSeed } from '../../lib/rng';

interface Props {
  seed?: number;
  onWin: (score?: number) => void;
}

const START_LEN = 3;
const MAX_LEN = 9;
const SHOW_MS_PER_DIGIT = 700;
const PAUSE_BEFORE_INPUT = 400;

function makeDigits(seed: number, len: number, round: number): number[] {
  const rand = mulberry32((seed + round * 9973) >>> 0);
  const out: number[] = [];
  for (let i = 0; i < len; i++) {
    out.push(1 + Math.floor(rand() * 9)); // 1-9, avoid leading-zero confusion
  }
  return out;
}

export function DigitSpanGame({ seed, onWin }: Props) {
  const baseSeed = useMemo(
    () => seed ?? ((Date.now() ^ hashSeed('digitspan')) >>> 0),
    [seed],
  );

  const [phase, setPhase] = useState<'ready' | 'show' | 'input' | 'feedback'>('ready');
  const [len, setLen] = useState(START_LEN);
  const [round, setRound] = useState(0);
  const [digits, setDigits] = useState<number[]>([]);
  const [showIdx, setShowIdx] = useState(-1);
  const [entered, setEntered] = useState<number[]>([]);
  const [best, setBest] = useState(0);
  const [lives, setLives] = useState(2);
  const [msg, setMsg] = useState('');

  const startRound = (nextLen: number, nextRound: number) => {
    const d = makeDigits(baseSeed, nextLen, nextRound);
    setDigits(d);
    setEntered([]);
    setShowIdx(-1);
    setLen(nextLen);
    setRound(nextRound);
    setPhase('show');
  };

  useEffect(() => {
    if (phase !== 'show') return;
    let i = 0;
    setShowIdx(0);
    const id = window.setInterval(() => {
      i += 1;
      if (i >= digits.length) {
        window.clearInterval(id);
        window.setTimeout(() => {
          setShowIdx(-1);
          setPhase('input');
        }, PAUSE_BEFORE_INPUT);
      } else {
        setShowIdx(i);
      }
    }, SHOW_MS_PER_DIGIT);
    return () => window.clearInterval(id);
  }, [phase, digits]);

  const tapDigit = (n: number) => {
    if (phase !== 'input') return;
    const next = [...entered, n];
    setEntered(next);
    if (next.length === digits.length) {
      const ok = next.every((v, i) => v === digits[i]);
      if (ok) {
        const newBest = Math.max(best, len);
        setBest(newBest);
        setMsg(`Got it — span ${len}`);
        setPhase('feedback');
        window.setTimeout(() => {
          if (len >= MAX_LEN) {
            onWin(newBest);
          } else {
            startRound(len + 1, round + 1);
          }
        }, 700);
      } else {
        const left = lives - 1;
        setLives(left);
        setMsg(left > 0 ? 'Miss — try same length again' : 'Round over');
        setPhase('feedback');
        window.setTimeout(() => {
          if (left <= 0) {
            onWin(best);
          } else {
            startRound(len, round + 1);
          }
        }, 900);
      }
    }
  };

  const erase = () => {
    if (phase !== 'input') return;
    setEntered((e) => e.slice(0, -1));
  };

  if (phase === 'ready') {
    return (
      <div className="challenge-ready">
        <h3>Digit span</h3>
        <p className="muted">
          Watch the digits, then enter them in order. Length grows from {START_LEN} up to {MAX_LEN}.
          Two misses and the round ends — your score is the longest span you got right.
        </p>
        <button
          type="button"
          className="btn primary big"
          onClick={() => {
            setBest(0);
            setLives(2);
            setMsg('');
            startRound(START_LEN, 0);
          }}
        >
          Start
        </button>
      </div>
    );
  }

  return (
    <div className="digitspan-game">
      <div className="challenge-status">
        <span>
          Span <strong>{len}</strong>
        </span>
        <span className="muted">
          Best {best} · lives {lives}
        </span>
      </div>

      <div className="digitspan-display" aria-live="polite">
        {phase === 'show' && showIdx >= 0 ? (
          <span className="digitspan-flash">{digits[showIdx]}</span>
        ) : phase === 'input' ? (
          <span className="digitspan-entry">
            {entered.length === 0 ? (
              <span className="muted">Enter the digits…</span>
            ) : (
              entered.join(' ')
            )}
          </span>
        ) : (
          <span className={msg.startsWith('Got') ? 'ok-msg' : 'bad-msg'}>{msg}</span>
        )}
      </div>

      {phase === 'input' && (
        <>
          <div className="numpad digitspan-pad" role="group" aria-label="Digit pad">
            {[1, 2, 3, 4, 5, 6, 7, 8, 9].map((n) => (
              <button
                key={n}
                type="button"
                className="btn numpad-btn"
                onClick={() => tapDigit(n)}
              >
                {n}
              </button>
            ))}
            <button type="button" className="btn numpad-btn erase" onClick={erase}>
              ⌫
            </button>
          </div>
        </>
      )}

      <p className="hint-text muted">Memorize, then type. Finite — ends after two misses or span {MAX_LEN}.</p>
    </div>
  );
}
