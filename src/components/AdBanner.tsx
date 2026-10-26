interface Props {
  placement?: 'side' | 'bottom';
}

export function AdBanner({ placement = 'bottom' }: Props) {
  return (
    <aside className={`ad-banner ad-${placement}`} aria-label="Advertisement placeholder">
      <span className="ad-label">Ad</span>
      <span className="ad-copy">
        {placement === 'side'
          ? 'Sponsored space'
          : 'Sponsored · reserved for AdSense (never mid-puzzle)'}
      </span>
    </aside>
  );
}
