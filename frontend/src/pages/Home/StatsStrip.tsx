import { StatBlock } from '../../components/ui/StatBlock';
import { MOCK_STATS } from '../../services/mockData';
import './StatsStrip.css';

export function StatsStrip() {
  return (
    <div className="stats-strip">
      {MOCK_STATS.map((stat) => (
        <StatBlock key={stat.label} {...stat} />
      ))}
    </div>
  );
}
