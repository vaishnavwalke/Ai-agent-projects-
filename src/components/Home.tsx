import { AdBanner } from './AdBanner';
import { LogoMark, BrandWordmark } from './Logo';
import {
  MODES,
  CHALLENGES,
  DAILY_TOTAL,
  dailyChallengeId,
  dailyOrder,
  effectiveStreak,
  getDaily,
  getStats,
  type PlayId,
} from '../lib/storage';
import { todayKey } from '../lib/rng';
import { formatTime } from './Timer';

interface Props {
  onPlayDaily: () => void;
  onPlayMode: (mode: PlayId, opts?: { size?: number }) => void;
}

export function Home({ onPlayDaily, onPlayMode }: Props) {
  const daily = getDaily();
  const stats = getStats();
  const streak = effectiveStreak();
  const done = daily.completed.length;
  const allDone = done >= DAILY_TOTAL;
  const todayBrain = dailyChallengeId();
  const order = dailyOrder();

  return (
    <div className="home">
      <header className="hero">
        <div className="brand-row">
          <LogoMark size={44} />
          <h1 className="brand">
            <BrandWordmark />
          </h1>
        </div>
        <p className="tagline">One short logic win. Then put the phone down.</p>
        <div className="stats-row" role="group" aria-label="Your stats">
          <div className={`stat${streak > 0 ? ' streak' : ''}`}>
            <span className="stat-val">{streak > 0 ? `🔥 ${streak}` : '0'}</span>
            <span className="stat-label">streak</span>
          </div>
          <div className="stat">
            <span className="stat-val">
              {done}/{DAILY_TOTAL}
            </span>
            <span className="stat-label">today</span>
          </div>
          <div className="stat">
            <span className="stat-val">{stats.gamesWon}</span>
            <span className="stat-label">wins</span>
          </div>
        </div>
      </header>

      <section className="daily-card" aria-labelledby="daily-heading">
        <div className="daily-head">
          <h2 id="daily-heading">Today&apos;s daily</h2>
          <span className="date-chip">{todayKey()}</span>
        </div>
        <p className="muted">
          Four mini puzzles + one brain challenge, same for everyone today. Finite — no endless
          feed.
        </p>
        <div
          className="daily-progress daily-progress-5"
          aria-label={`Daily progress ${done} of ${DAILY_TOTAL}`}
        >
          {order.map((id) => {
            const meta =
              MODES.find((m) => m.id === id) ?? CHALLENGES.find((c) => c.id === id)!;
            const isBrain = CHALLENGES.some((c) => c.id === id);
            return (
              <span
                key={id}
                className={`pip ${daily.completed.includes(id) ? 'done' : ''} ${isBrain ? 'brain' : ''}`}
                title={meta.name}
                aria-label={`${meta.name}${daily.completed.includes(id) ? ', done' : ''}`}
              >
                {daily.completed.includes(id) ? '✓' : meta.emoji}
              </span>
            );
          })}
        </div>
        {allDone ? (
          <div className="stop-nudge compact">
            <p>
              <strong>You&apos;re done for today.</strong> Put the phone down — Quell will be here
              tomorrow.
            </p>
            <button type="button" className="btn" onClick={() => onPlayMode('sudoku')}>
              Practice a mode
            </button>
          </div>
        ) : (
          <button type="button" className="btn primary big" onClick={onPlayDaily}>
            {done === 0
              ? "Play today's daily"
              : `Continue daily (${done}/${DAILY_TOTAL})`}
          </button>
        )}
      </section>

      <section className="modes brain-section" aria-labelledby="brain-heading">
        <div className="section-head">
          <h2 id="brain-heading">Brain challenges</h2>
          <span className="chip">1–3 min</span>
        </div>
        <p className="section-blurb muted">
          Short cognitive drills — anti-doomscroll resets. Today&apos;s daily includes{' '}
          <strong>{CHALLENGES.find((c) => c.id === todayBrain)?.name}</strong>.
        </p>
        <ul className="mode-list">
          {CHALLENGES.map((c) => (
            <li key={c.id}>
              <button type="button" className="mode-card" onClick={() => onPlayMode(c.id)}>
                <span className={`mode-icon challenge ${c.id}`} aria-hidden>
                  {c.emoji}
                </span>
                <span className="mode-text">
                  <strong>{c.name}</strong>
                  <span className="muted">
                    {c.blurb} · {c.minutes}
                  </span>
                  {stats.bestScores[c.id] != null ? (
                    <span className="best">Best score {stats.bestScores[c.id]}</span>
                  ) : stats.bestTimes[c.id] != null ? (
                    <span className="best">Best {formatTime(stats.bestTimes[c.id]!)}</span>
                  ) : null}
                </span>
                <span className="chevron" aria-hidden>
                  ›
                </span>
              </button>
            </li>
          ))}
        </ul>
      </section>

      <section className="modes" aria-labelledby="modes-heading">
        <h2 id="modes-heading">Practice puzzles</h2>
        <ul className="mode-list">
          {MODES.map((m) => (
            <li key={m.id} className={m.id === 'nonogram' ? 'mode-item-wide' : undefined}>
              <button type="button" className="mode-card" onClick={() => onPlayMode(m.id)}>
                <span className={`mode-icon ${m.id}`} aria-hidden>
                  {m.emoji}
                </span>
                <span className="mode-text">
                  <strong>{m.name}</strong>
                  <span className="muted">{m.blurb}</span>
                  {stats.bestTimes[m.id] != null && (
                    <span className="best">Best {formatTime(stats.bestTimes[m.id]!)}</span>
                  )}
                </span>
                <span className="chevron" aria-hidden>
                  ›
                </span>
              </button>
              {m.id === 'nonogram' && (
                <button
                  type="button"
                  className="btn ghost small mode-extra"
                  onClick={() => onPlayMode('nonogram', { size: 10 })}
                >
                  10×10 challenge
                </button>
              )}
            </li>
          ))}
        </ul>
      </section>

      <p className="anti-scroll">
        Quell is built against doomscrolling: short sessions, a clear finish line, and no infinite
        autoplay. Win once — then stop.
      </p>

      <AdBanner placement="bottom" />
    </div>
  );
}
