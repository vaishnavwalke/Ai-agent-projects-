import { useState } from 'react';
import { formatTime } from './Timer';
import type { PlayId } from '../lib/storage';
import { DAILY_TOTAL, playMeta, isChallenge } from '../lib/storage';
import { todayKey } from '../lib/rng';

interface Props {
  mode: PlayId;
  seconds: number;
  score?: number;
  isDaily: boolean;
  dailyDone: number;
  streak: number;
  onHome: () => void;
  onNextDaily?: () => void;
  onPracticeAgain?: () => void;
  showStopNudge: boolean;
}

export function WinScreen({
  mode,
  seconds,
  score,
  isDaily,
  dailyDone,
  streak,
  onHome,
  onNextDaily,
  onPracticeAgain,
  showStopNudge,
}: Props) {
  const [copied, setCopied] = useState(false);
  const name = playMeta(mode).name;
  const brain = isChallenge(mode);
  const scoreBit = score != null ? ` · score ${score}` : '';

  const shareText = isDaily
    ? `Quell ${todayKey()}\n${name}: ${formatTime(seconds)}${scoreBit}\nDaily ${dailyDone}/${DAILY_TOTAL} · streak ${streak}\nOne short logic win. Then put the phone down.\nhttps://quell.app`
    : `Quell — ${name} in ${formatTime(seconds)}${scoreBit}\nOne short logic win. Then put the phone down.`;

  const copy = async () => {
    try {
      await navigator.clipboard.writeText(shareText);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      const ta = document.createElement('textarea');
      ta.value = shareText;
      document.body.appendChild(ta);
      ta.select();
      document.execCommand('copy');
      document.body.removeChild(ta);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  return (
    <div className="win-screen">
      <div className="win-badge" aria-hidden>
        ✓
      </div>
      <h2>{brain ? 'Challenge complete' : 'Nice work'}</h2>
      <p className="win-meta">
        {name} · {formatTime(seconds)}
        {score != null ? ` · score ${score}` : ''}
        {isDaily ? ` · Daily ${dailyDone}/${DAILY_TOTAL}` : ''}
      </p>
      {isDaily && streak > 0 && <p className="streak-pill">🔥 {streak}-day streak</p>}

      <button type="button" className="btn" onClick={copy}>
        {copied ? 'Copied!' : 'Copy result'}
      </button>

      {showStopNudge ? (
        <div className="stop-nudge">
          <p>
            <strong>Daily complete.</strong> One short logic win. Then put the phone down.
          </p>
          <button type="button" className="btn primary big" onClick={onHome}>
            I&apos;m done for today
          </button>
          {onPracticeAgain && (
            <button type="button" className="btn ghost" onClick={onPracticeAgain}>
              Practice anyway
            </button>
          )}
        </div>
      ) : (
        <div className="win-actions">
          {isDaily && onNextDaily && dailyDone < DAILY_TOTAL && (
            <button type="button" className="btn primary big" onClick={onNextDaily}>
              Next daily step
            </button>
          )}
          <button type="button" className="btn" onClick={onHome}>
            Home
          </button>
          {onPracticeAgain && (
            <button type="button" className="btn ghost" onClick={onPracticeAgain}>
              Play again
            </button>
          )}
        </div>
      )}
    </div>
  );
}
