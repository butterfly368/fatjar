import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, PlusCircle, Inbox, Gift, Target, Rocket } from 'lucide-react';
import { Button } from '../../components/ui/Button';
import { getAllVaults } from '../../services/contract';
import { getVaultMode, getVaultModeLabel, formatBtc, blockToDate } from '../../types';
import type { Vault, VaultMode } from '../../types';
import './ActiveJars.css';

const MAX_LANDING_JARS = 4;

const MODE_ICON: Record<VaultMode, typeof Inbox> = {
  'open-collection': Inbox,
  'trust-fund': Gift,
  'all-or-nothing': Target,
  'funded-grant': Rocket,
};

export function ActiveJars() {
  const [vaults, setVaults] = useState<Vault[]>([]);

  useEffect(() => {
    getAllVaults().then((all) => setVaults(all.filter((v) => !v.isClosed && v.isPublic)));
  }, []);

  if (vaults.length === 0) return null;

  const displayVaults = vaults.slice(0, MAX_LANDING_JARS);
  const hasMore = vaults.length > MAX_LANDING_JARS;

  return (
    <section className="jars" id="active-jars">
      <div className="jars-header">
        <Link to="/jars" className="jars-title-link">
          <h2 className="jars-title">Active Jars</h2>
        </Link>
        <span className="jars-sub">
          {vaults.length} jar{vaults.length !== 1 ? 's' : ''} filling up right now
        </span>
      </div>
      <div className="jars-grid">
        {displayVaults.map((vault) => {
          const mode = getVaultMode(vault);
          const modeLabel = getVaultModeLabel(mode);
          const Icon = MODE_ICON[mode];
          const hasGoal = vault.goalAmount > 0n;
          const progress = hasGoal ? Number((vault.totalRaised * 100n) / vault.goalAmount) : 0;
          return (
            <Link
              to={`/fund/${vault.id}`}
              className="jar-card"
              key={vault.id}
            >
              <div className="jar-card-label">
                Jar #{vault.id}
                <span className="jar-card-mode" data-mode={mode}>
                  <Icon size={11} />
                  {modeLabel}
                </span>
              </div>
              <div className="jar-card-name">{vault.name}</div>
              {vault.description && (
                <div className="jar-card-desc">{vault.description}</div>
              )}
              {hasGoal && (
                <div className="jar-card-progress-wrap">
                  <div className="jar-card-progress-bar">
                    <div
                      className="jar-card-progress-fill"
                      style={{ width: `${Math.min(100, progress)}%` }}
                    />
                  </div>
                  <div className="jar-card-progress-text">
                    {formatBtc(vault.totalRaised)} / {formatBtc(vault.goalAmount)} BTC
                    {progress === 0 ? ' — just started' : ''}
                  </div>
                </div>
              )}
              <div className="jar-card-stats">
                <div>
                  <div className="jar-card-stat-label">Raised</div>
                  <div className="jar-card-stat-value">
                    <span className="jar-card-stat-accent">{formatBtc(vault.totalRaised)}</span> BTC
                  </div>
                </div>
                <div>
                  <div className="jar-card-stat-label">Contributors</div>
                  <div className="jar-card-stat-value">{vault.contributorCount}</div>
                </div>
                <div>
                  <div className="jar-card-stat-label">Opens</div>
                  <div className="jar-card-stat-value">{blockToDate(vault.unlockBlock)}</div>
                </div>
              </div>
              <div className="jar-card-arrow">
                View Jar <ArrowRight size={12} />
              </div>
            </Link>
          );
        })}
      </div>
      <div className="jars-footer">
        {hasMore && (
          <Link to="/jars" className="jars-view-all-link">
            View All {vaults.length} Jars <ArrowRight size={12} />
          </Link>
        )}
        <Button to="/create">
          <PlusCircle size={14} /> Create a Jar
        </Button>
      </div>
    </section>
  );
}
