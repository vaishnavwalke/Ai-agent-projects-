interface Props {
  onContinue: () => void;
}

/** Shown ONLY after a completed puzzle — never mid-solve. */
export function AdInterstitial({ onContinue }: Props) {
  return (
    <div className="modal-backdrop" role="dialog" aria-modal="true" aria-label="Advertisement">
      <div className="modal ad-interstitial">
        <span className="ad-label">Ad</span>
        <div className="ad-interstitial-body">
          <p className="ad-big">Sponsored break</p>
          <p className="muted">
            Placeholder for a short post-win interstitial. Ads never interrupt a puzzle.
          </p>
        </div>
        <button type="button" className="btn primary big" onClick={onContinue}>
          Continue
        </button>
      </div>
    </div>
  );
}
