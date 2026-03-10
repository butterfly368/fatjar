import { BondingCurveChart } from '../../components/ui/BondingCurveChart';
import { TierRow } from '../../components/ui/TierRow';
import { MOCK_TIERS } from '../../services/mockData';
import './BondingCurveSection.css';

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
            {MOCK_TIERS.map((tier) => (
              <TierRow key={tier.rate} {...tier} />
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
