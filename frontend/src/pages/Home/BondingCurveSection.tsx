import { BondingCurveChart } from '../../components/ui/BondingCurveChart';
import { TierRow } from '../../components/ui/TierRow';
import type { BondingCurveTier } from '../../types';
import './BondingCurveSection.css';

const TIERS: BondingCurveTier[] = [
  { label: 'Early', threshold: '(now)', rate: '120K' },
  { label: 'After', threshold: '5 BTC', rate: '80K', change: '-33%' },
  { label: 'After', threshold: '20 BTC', rate: '40K', change: '-67%' },
  { label: 'After', threshold: '100 BTC', rate: '15K', change: '-88%' },
];

export function BondingCurveSection() {
  return (
    <section className="curve">
      <div className="curve-card">
        <div className="curve-top">
          <h2 className="curve-top-title">The Early Bird Gets the $FJAR</h2>
          <span className="curve-badge">Bonding Curve</span>
        </div>
        <p className="curve-desc">
          Every BTC contributed on FatJar mints $FJAR tokens for the contributor.
          The earlier you join, the more tokens you earn &mdash; the rate drops as the platform grows.
          No pre-mine. No team allocation. First come, most served.
        </p>
        <div className="curve-body">
          <div className="curve-chart">
            <BondingCurveChart />
          </div>
          <div>
            {TIERS.map((tier) => (
              <TierRow key={tier.rate} {...tier} />
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
