import { BondingCurveChart } from '../../components/ui/BondingCurveChart';
import { TierRow } from '../../components/ui/TierRow';
import { MOCK_TIERS } from '../../services/mockData';
import './BondingCurveSection.css';

export function BondingCurveSection() {
  return (
    <section className="curve">
      <div className="curve-card">
        <div className="curve-top">
          <h2 className="curve-top-title">Early Givers Earn More</h2>
          <span className="curve-badge">Bonding Curve</span>
        </div>
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
