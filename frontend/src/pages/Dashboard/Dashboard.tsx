import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight } from 'lucide-react';
import { useWallet } from '../../hooks/useWallet';
import {
  getAllVaults,
  getFundDetails,
  getCreatorFundCount,
  getCreatorFundByIndex,
  getContribution,
  getContributionTokens,
  withdraw,
  refund,
  closeFund,
} from '../../services/contract';
import type { Vault } from '../../types';
import { getVaultMode, getVaultModeLabel, formatBtc } from '../../types';
import { Button } from '../../components/ui/Button';
import './Dashboard.css';

// TODO: Replace with real connected wallet address in Task 9.
// For the MVP demo we use a hardcoded address that matches seeded data
// so both "My Vaults" and "My Contributions" sections show content.
const MOCK_CREATOR_ADDRESS = 'bc1q...creator1';
const MOCK_CONTRIBUTOR_ADDRESS = 'bc1q...alpha1';

interface MyVault {
  vault: Vault;
  mode: string;
  status: 'active' | 'unlocked' | 'withdrawn';
}

interface MyContribution {
  vault: Vault;
  amount: bigint;
  tokensEarned: bigint;
  status: 'active' | 'goal-met' | 'refundable';
}

function getVaultStatus(vault: Vault): 'active' | 'unlocked' | 'withdrawn' {
  if (vault.withdrawn > 0n) return 'withdrawn';
  if (vault.isClosed) return 'unlocked';
  return 'active';
}

function getContributionStatus(vault: Vault): 'active' | 'goal-met' | 'refundable' {
  if (vault.goalAmount > 0n && vault.totalRaised >= vault.goalAmount) return 'goal-met';
  if (vault.isClosed) return 'refundable';
  return 'active';
}

function formatTokens(tokens: bigint): string {
  // Tokens have 18 decimals
  const whole = tokens / 1_000_000_000_000_000_000n;
  if (whole >= 1_000_000n) return `${(Number(whole) / 1_000_000).toFixed(1)}M`;
  if (whole >= 1_000n) return `${(Number(whole) / 1_000).toFixed(1)}K`;
  return whole.toString();
}

export function Dashboard() {
  const { connected, connect } = useWallet();
  const [myVaults, setMyVaults] = useState<MyVault[]>([]);
  const [myContributions, setMyContributions] = useState<MyContribution[]>([]);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState<string | null>(null);

  useEffect(() => {
    async function load() {
      setLoading(true);

      // Load vaults created by the mock wallet address
      const creatorCount = await getCreatorFundCount(MOCK_CREATOR_ADDRESS);
      const vaultResults: MyVault[] = [];
      for (let i = 0; i < creatorCount; i++) {
        const fundId = await getCreatorFundByIndex(MOCK_CREATOR_ADDRESS, i);
        const vault = await getFundDetails(fundId);
        vaultResults.push({
          vault,
          mode: getVaultModeLabel(getVaultMode(vault)),
          status: getVaultStatus(vault),
        });
      }
      setMyVaults(vaultResults);

      // Load contributions from the mock contributor address
      const allVaults = await getAllVaults();
      const contribResults: MyContribution[] = [];
      for (const vault of allVaults) {
        const amount = await getContribution(vault.id, MOCK_CONTRIBUTOR_ADDRESS);
        if (amount > 0n) {
          const tokensEarned = await getContributionTokens(vault.id, MOCK_CONTRIBUTOR_ADDRESS);
          contribResults.push({
            vault,
            amount,
            tokensEarned,
            status: getContributionStatus(vault),
          });
        }
      }
      setMyContributions(contribResults);

      setLoading(false);
    }

    load();
  }, []);

  async function handleWithdraw(fundId: string) {
    setActionLoading(fundId);
    try {
      await withdraw(fundId);
      // Reload vault details
      const vault = await getFundDetails(fundId);
      setMyVaults((prev) =>
        prev.map((v) =>
          v.vault.id === fundId
            ? { ...v, vault, status: getVaultStatus(vault) }
            : v,
        ),
      );
    } finally {
      setActionLoading(null);
    }
  }

  async function handleClose(fundId: string) {
    setActionLoading(fundId);
    try {
      await closeFund(fundId);
      const vault = await getFundDetails(fundId);
      setMyVaults((prev) =>
        prev.map((v) =>
          v.vault.id === fundId
            ? { ...v, vault, status: getVaultStatus(vault) }
            : v,
        ),
      );
    } finally {
      setActionLoading(null);
    }
  }

  async function handleRefund(fundId: string) {
    setActionLoading(`refund-${fundId}`);
    try {
      await refund(fundId);
      // Remove from contributions list after refund
      setMyContributions((prev) => prev.filter((c) => c.vault.id !== fundId));
    } finally {
      setActionLoading(null);
    }
  }

  // Wallet not connected
  if (!connected) {
    return (
      <div className="dashboard">
        <div className="dashboard-empty">
          <h2 className="dashboard-empty-title">Connect Your Wallet</h2>
          <p className="dashboard-empty-desc">
            Connect your wallet to view your dashboard.
          </p>
          <button className="dashboard-connect-btn" onClick={connect}>
            Connect Wallet
          </button>
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="dashboard">
        <div className="dashboard-loading">Loading...</div>
      </div>
    );
  }

  // Empty state — no vaults and no contributions
  if (myVaults.length === 0 && myContributions.length === 0) {
    return (
      <div className="dashboard">
        <div className="dashboard-header">
          <h1 className="dashboard-title">Dashboard</h1>
        </div>
        <div className="dashboard-empty">
          <h2 className="dashboard-empty-title">No Jars Yet</h2>
          <p className="dashboard-empty-desc">
            No jars yet. Create one or contribute to an existing jar.
          </p>
          <Button to="/create">
            Create a Jar <ArrowRight size={14} />
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="dashboard">
      <div className="dashboard-header">
        <h1 className="dashboard-title">Dashboard</h1>
        <span className="dashboard-subtitle">
          {myVaults.length} jar{myVaults.length !== 1 ? 's' : ''} created
          {' / '}
          {myContributions.length} contribution{myContributions.length !== 1 ? 's' : ''}
        </span>
      </div>

      {/* My Vaults Section */}
      {myVaults.length > 0 && (
        <section className="dashboard-section">
          <h2 className="dashboard-section-title">My Jars</h2>
          <div className="dashboard-cards">
            {myVaults.map(({ vault, mode, status }) => (
              <div className="dashboard-card" key={vault.id}>
                <div className="dashboard-card-top">
                  <Link to={`/fund/${vault.id}`} className="dashboard-card-name">
                    {vault.name}
                  </Link>
                  <span className="dashboard-mode-badge">{mode}</span>
                </div>
                <div className="dashboard-card-stats">
                  <div className="dashboard-card-stat">
                    <span className="dashboard-card-stat-label">Raised</span>
                    <span className="dashboard-card-stat-value">
                      <span className="dashboard-accent">{formatBtc(vault.totalRaised)}</span> BTC
                    </span>
                  </div>
                  <div className="dashboard-card-stat">
                    <span className="dashboard-card-stat-label">Contributors</span>
                    <span className="dashboard-card-stat-value">{vault.contributorCount}</span>
                  </div>
                  <div className="dashboard-card-stat">
                    <span className="dashboard-card-stat-label">Status</span>
                    <span className={`dashboard-status-badge dashboard-status-${status}`}>
                      {status === 'active' ? 'Active' : status === 'unlocked' ? 'Unlocked' : 'Withdrawn'}
                    </span>
                  </div>
                </div>
                <div className="dashboard-card-actions">
                  {status === 'active' && (
                    <>
                      <button
                        className="dashboard-action-btn dashboard-action-primary"
                        onClick={() => handleWithdraw(vault.id)}
                        disabled={actionLoading === vault.id}
                      >
                        {actionLoading === vault.id ? 'Processing...' : 'Withdraw'}
                      </button>
                      <button
                        className="dashboard-action-btn dashboard-action-secondary"
                        onClick={() => handleClose(vault.id)}
                        disabled={actionLoading === vault.id}
                      >
                        Close
                      </button>
                    </>
                  )}
                  {status === 'unlocked' && (
                    <button
                      className="dashboard-action-btn dashboard-action-primary"
                      onClick={() => handleWithdraw(vault.id)}
                      disabled={actionLoading === vault.id}
                    >
                      {actionLoading === vault.id ? 'Processing...' : 'Withdraw'}
                    </button>
                  )}
                  {status === 'withdrawn' && (
                    <span className="dashboard-action-done">Funds withdrawn</span>
                  )}
                </div>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* My Contributions Section */}
      {myContributions.length > 0 && (
        <section className="dashboard-section">
          <h2 className="dashboard-section-title">My Contributions</h2>
          <div className="dashboard-cards">
            {myContributions.map(({ vault, amount, tokensEarned, status }) => (
              <div className="dashboard-card" key={vault.id}>
                <div className="dashboard-card-top">
                  <Link to={`/fund/${vault.id}`} className="dashboard-card-name">
                    {vault.name}
                  </Link>
                </div>
                <div className="dashboard-card-stats">
                  <div className="dashboard-card-stat">
                    <span className="dashboard-card-stat-label">My Contribution</span>
                    <span className="dashboard-card-stat-value">
                      <span className="dashboard-accent">{formatBtc(amount)}</span> BTC
                    </span>
                  </div>
                  <div className="dashboard-card-stat">
                    <span className="dashboard-card-stat-label">$FJAR Earned</span>
                    <span className="dashboard-card-stat-value">
                      <span className="dashboard-accent">{formatTokens(tokensEarned)}</span>
                    </span>
                  </div>
                  <div className="dashboard-card-stat">
                    <span className="dashboard-card-stat-label">Status</span>
                    <span className={`dashboard-status-badge dashboard-status-${status}`}>
                      {status === 'active' ? 'Active' : status === 'goal-met' ? 'Goal Met' : 'Refundable'}
                    </span>
                  </div>
                </div>
                <div className="dashboard-card-actions">
                  {status === 'refundable' && (
                    <button
                      className="dashboard-action-btn dashboard-action-primary"
                      onClick={() => handleRefund(vault.id)}
                      disabled={actionLoading === `refund-${vault.id}`}
                    >
                      {actionLoading === `refund-${vault.id}` ? 'Processing...' : 'Refund'}
                    </button>
                  )}
                  {status === 'active' && (
                    <Link to={`/fund/${vault.id}`} className="dashboard-action-btn dashboard-action-secondary">
                      View Jar
                    </Link>
                  )}
                  {status === 'goal-met' && (
                    <span className="dashboard-action-done">Goal reached</span>
                  )}
                </div>
              </div>
            ))}
          </div>
        </section>
      )}
    </div>
  );
}
