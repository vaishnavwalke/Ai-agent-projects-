import { useEffect, useState } from 'react';

interface Props {
  running: boolean;
  startMs: number;
}

export function formatTime(totalSec: number): string {
  const m = Math.floor(totalSec / 60);
  const s = totalSec % 60;
  return `${m}:${String(s).padStart(2, '0')}`;
}

export function Timer({ running, startMs }: Props) {
  const [now, setNow] = useState(Date.now());

  useEffect(() => {
    if (!running) return;
    const id = setInterval(() => setNow(Date.now()), 250);
    return () => clearInterval(id);
  }, [running]);

  const sec = Math.max(0, Math.floor((now - startMs) / 1000));
  return <span className="timer" aria-live="polite">{formatTime(sec)}</span>;
}

export function elapsedSeconds(startMs: number, endMs = Date.now()): number {
  return Math.max(0, Math.floor((endMs - startMs) / 1000));
}
