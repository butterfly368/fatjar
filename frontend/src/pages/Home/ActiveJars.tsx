import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight } from 'lucide-react';
import { getAllVaults } from '../../services/contract';
import { getVaultMode, getVaultModeLabel, formatBtc } from '../../types';
import type { Vault } from '../../types';
import './ActiveJars.css';

export function ActiveJars() {
  const [vaults, setVaults] = useState<Vault[]>([]);

  useEffect(() => {
    getAllVaults().then((all) => setVaults(all.filter((v) => !v.isClosed)));
  }, []);

  if (vaults.length === 0) return null;

  return (
    <section className="jars" id="active-jars">
      <div className="jars-header">
        <h2 className="jars-title">Active Jars</h2>
        <span className="jars-sub">
          {vaults.length} jar{vaults.length !== 1 ? 's' : ''} filling up right now
        </span>
      </div>
      <div className="jars-grid">
        {vaults.map((vault) => {
          const mode = getVaultMode(vault);
          const modeLabel = getVaultModeLabel(mode);
          const hasGoal = vault.goalAmount > 0n;
          return (
            <Link to={`/fund/${vault.id}`} className="jar-card" key={vault.id}>
              <div className="jar-card-label">
                Jar #{vault.id}
                <span className="jar-card-status">{modeLabel}</span>
              </div>
              <div className="jar-card-name">{vault.name}</div>
              {hasGoal && (
                <div className="jar-card-progress-wrap">
                  <div className="jar-card-progress-bar">
                    <div
                      className="jar-card-progress-fill"
                      style={{
                        width: `${Math.min(100, Number((vault.totalRaised * 100n) / vault.goalAmount))}%`,
                      }}
                    />
                  </div>
                  <div className="jar-card-progress-text">
                    {formatBtc(vault.totalRaised)} / {formatBtc(vault.goalAmount)} BTC
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
                  <div className="jar-card-stat-label">Unlock Block</div>
                  <div className="jar-card-stat-value">{Number(vault.unlockBlock).toLocaleString()}</div>
                </div>
              </div>
              <div className="jar-card-arrow">
                View Jar <ArrowRight size={12} />
              </div>
            </Link>
          );
        })}
      </div>
    </section>
  );
}
