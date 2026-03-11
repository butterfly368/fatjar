import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, Inbox, Gift, Target, Rocket } from 'lucide-react';
import { getAllVaults } from '../../services/contract';
import { getVaultMode, getVaultModeLabel, formatBtc, blockToDate } from '../../types';
import type { Vault, VaultMode } from '../../types';
import './ExploreJars.css';

const MODE_ICON: Record<VaultMode, typeof Inbox> = {
  'open-collection': Inbox,
  'trust-fund': Gift,
  'all-or-nothing': Target,
  'funded-grant': Rocket,
};

type FilterType = 'all' | 'open' | 'goal';

const FILTERS: { key: FilterType; label: string }[] = [
  { key: 'all', label: 'All Jars' },
  { key: 'open', label: 'Open Jars' },
  { key: 'goal', label: 'Goal Jars' },
];

export function ExploreJars() {
  const [vaults, setVaults] = useState<Vault[]>([]);
  const [filter, setFilter] = useState<FilterType>('all');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getAllVaults().then((all) => {
      setVaults(all.filter((v) => !v.isClosed && v.isPublic));
      setLoading(false);
    });
  }, []);

  const filtered = vaults.filter((vault) => {
    if (filter === 'open') return vault.goalAmount === 0n;
    if (filter === 'goal') return vault.goalAmount > 0n;
    return true;
  });

  return (
    <div className="explore">
      <div className="explore-header">
        <div>
          <div className="explore-label">Browse</div>
          <h1 className="explore-title">Active Jars</h1>
        </div>
        <span className="explore-count">
          {filtered.length} jar{filtered.length !== 1 ? 's' : ''}
        </span>
      </div>

      <div className="explore-filters">
        {FILTERS.map(({ key, label }) => (
          <button
            key={key}
            className={`explore-filter${filter === key ? ' explore-filter-active' : ''}`}
            onClick={() => setFilter(key)}
          >
            {label}
          </button>
        ))}
      </div>

      {loading ? null : filtered.length === 0 ? (
        <div className="explore-empty">No jars match this filter.</div>
      ) : (
        <div className="explore-grid">
          {filtered.map((vault) => {
            const mode = getVaultMode(vault);
            const modeLabel = getVaultModeLabel(mode);
            const Icon = MODE_ICON[mode];
            const hasGoal = vault.goalAmount > 0n;
            const progress = hasGoal ? Number((vault.totalRaised * 100n) / vault.goalAmount) : 0;
            return (
              <Link to={`/fund/${vault.id}`} className="explore-card" key={vault.id}>
                <div className="explore-card-label">
                  Jar #{vault.id}
                  <span className="explore-card-mode">
                    <Icon size={11} />
                    {modeLabel}
                  </span>
                </div>
                <div className="explore-card-name">{vault.name}</div>
                {vault.description && (
                  <div className="explore-card-desc">{vault.description}</div>
                )}
                {hasGoal && (
                  <div className="explore-card-progress-wrap">
                    <div className="explore-card-progress-bar">
                      <div
                        className="explore-card-progress-fill"
                        style={{ width: `${Math.min(100, progress)}%` }}
                      />
                    </div>
                    <div className="explore-card-progress-text">
                      {formatBtc(vault.totalRaised)} / {formatBtc(vault.goalAmount)} BTC
                    </div>
                  </div>
                )}
                <div className="explore-card-stats">
                  <div>
                    <div className="explore-card-stat-label">Raised</div>
                    <div className="explore-card-stat-value">
                      <span className="explore-card-stat-accent">{formatBtc(vault.totalRaised)}</span> BTC
                    </div>
                  </div>
                  <div>
                    <div className="explore-card-stat-label">Contributors</div>
                    <div className="explore-card-stat-value">{vault.contributorCount}</div>
                  </div>
                  <div>
                    <div className="explore-card-stat-label">Opens</div>
                    <div className="explore-card-stat-value">{blockToDate(vault.unlockBlock)}</div>
                  </div>
                </div>
                <div className="explore-card-arrow">
                  View Jar <ArrowRight size={12} />
                </div>
              </Link>
            );
          })}
        </div>
      )}
    </div>
  );
}
