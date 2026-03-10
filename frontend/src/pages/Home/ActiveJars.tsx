import { Link } from 'react-router-dom';
import { ArrowRight } from 'lucide-react';
import { MOCK_FUNDS } from '../../services/mockData';
import { formatSats } from '../../services/contracts';
import './ActiveJars.css';

export function ActiveJars() {
  const publicFunds = MOCK_FUNDS.filter((f) => f.isPublic && !f.isClosed);

  if (publicFunds.length === 0) return null;

  return (
    <section className="jars" id="jars">
      <div className="jars-header">
        <h2 className="jars-title">Active Jars</h2>
        <span className="jars-sub">{publicFunds.length} public jars collecting sats</span>
      </div>
      <div className="jars-grid">
        {publicFunds.map((fund) => (
          <Link to={`/fund/${fund.id}`} className="jar-card" key={fund.id}>
            <div className="jar-card-label">
              Jar #{fund.id}
              <span className="jar-card-status">Open</span>
            </div>
            <div className="jar-card-name">{fund.name}</div>
            <div className="jar-card-desc">{fund.description}</div>
            <div className="jar-card-stats">
              <div>
                <div className="jar-card-stat-label">Raised</div>
                <div className="jar-card-stat-value">
                  <span className="jar-card-stat-accent">{formatSats(fund.totalRaised)}</span> BTC
                </div>
              </div>
              <div>
                <div className="jar-card-stat-label">Contributors</div>
                <div className="jar-card-stat-value">{fund.contributorCount}</div>
              </div>
            </div>
            <div className="jar-card-arrow">
              View Jar <ArrowRight size={12} />
            </div>
          </Link>
        ))}
      </div>
    </section>
  );
}
