import type { BondingCurveTier } from '../../types';
import './TierRow.css';

export function TierRow({ label, threshold, rate, change }: BondingCurveTier) {
  return (
    <div className="tier-row">
      <div className="tier-label">
        <strong>{label}</strong> {threshold}
      </div>
      <div className="tier-rate">
        <span className="tier-rate-value">{rate}</span> FJAR/BTC
        {change && <span className="tier-rate-change">{change}</span>}
      </div>
    </div>
  );
}
