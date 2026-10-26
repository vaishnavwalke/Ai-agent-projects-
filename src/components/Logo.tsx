interface Props {
  size?: number;
  className?: string;
}

/** Quell mark: calm diamond with a centered pause/rest dot. */
export function LogoMark({ size = 40, className = '' }: Props) {
  return (
    <svg
      className={`logo-svg ${className}`.trim()}
      width={size}
      height={size}
      viewBox="0 0 64 64"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden
    >
      <rect width="64" height="64" rx="16" fill="url(#qm-bg)" />
      <path
        d="M32 14 L50 46 H14 Z"
        stroke="var(--accent)"
        strokeWidth="3.5"
        strokeLinejoin="round"
        fill="var(--accent-soft)"
      />
      <circle cx="32" cy="36" r="4.5" fill="var(--accent)" />
      <defs>
        <linearGradient id="qm-bg" x1="8" y1="4" x2="56" y2="60" gradientUnits="userSpaceOnUse">
          <stop stopColor="var(--logo-grad-a)" />
          <stop offset="1" stopColor="var(--logo-grad-b)" />
        </linearGradient>
      </defs>
    </svg>
  );
}

export function BrandWordmark({ className = '' }: { className?: string }) {
  return (
    <span className={`brand-wordmark ${className}`.trim()}>
      Quell
    </span>
  );
}
