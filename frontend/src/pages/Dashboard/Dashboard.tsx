import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, Clock } from 'lucide-react';
import { useWallet } from '../../hooks/useWallet';
import {
  getAllVaults,
  getFundDetails,
  getContribution,
  getContributionTokens,
  getResolvedMode,
  withdraw,
  refund,
} from '../../services/contract';
import { getPendingJars, pendingToVault } from '../../services/pending-jars';
import type { Vault, VaultStatus } from '../../types';
import { getVaultMode, getVaultModeLabel, formatBtc, formatTokens, getVaultStatus, CURRENT_BLOCK } from '../../types';
import { Button } from '../../components/ui/Button';
import './Dashboard.css';

// Seeded addresses that match mock data — used as fallback when wallet is 'bc1q...demo'
const SEED_CONTRIBUTOR_ADDRESS = 'bc1q...alpha1';

interface DashboardVault {
  vault: Vault;
  mode: string;
  status: VaultStatus;
  isPending?: boolean;
}

interface MyContribution {
  vault: Vault;
  amount: bigint;
  tokensEarned: bigint;
  status: 'active' | 'goal-met' | 'refundable';
}

function getContributionStatus(vault: Vault): 'active' | 'goal-met' | 'refundable' {
  if (vault.goalAmount > 0n && vault.totalRaised >= vault.goalAmount) return 'goal-met';
  if (vault.goalAmount > 0n && vault.totalRaised < vault.goalAmount) {
    const isPastUnlock = vault.unlockBlock === 0n || CURRENT_BLOCK >= vault.unlockBlock;
    if (isPastUnlock || vault.isClosed) return 'refundable';
  }
  return 'active';
}

export function Dashboard() {
  const { connected, connect, address } = useWallet();
  const [allVaults, setAllVaults] = useState<DashboardVault[]>([]);
  const [myContributions, setMyContributions] = useState<MyContribution[]>([]);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState<string | null>(null);
  const [toast, setToast] = useState<{ type: 'success' | 'error'; message: string } | null>(null);

  function showToast(type: 'success' | 'error', message: string) {
    setToast({ type, message });
    setTimeout(() => setToast(null), type === 'error' ? 8000 : 6000);
  }

  const walletAddress = address ?? 'bc1q...demo';
  const contributorAddr = walletAddress === 'bc1q...demo' ? SEED_CONTRIBUTOR_ADDRESS : walletAddress;

  useEffect(() => {
    async function load() {
      setLoading(true);
      try {
        // Load ALL on-chain vaults (reliable path — avoids buggy creator tracking)
        const vaults = await getAllVaults();
        const vaultResults: DashboardVault[] = vaults
          .filter((v) => v.isPublic)
          .map((vault) => ({
            vault,
            mode: getVaultModeLabel(getVaultMode(vault)),
            status: getVaultStatus(vault),
          }));

        // In live mode, prepend pending jars (skip confirmed)
        const mode = await getResolvedMode();
        if (mode === 'live') {
          const confirmedNames = new Set(vaultResults.map((v) => v.vault.name));
          const pending = getPendingJars().filter((p) => !confirmedNames.has(p.name));
          const pendingVaults: DashboardVault[] = pending.map((p) => ({
            vault: pendingToVault(p),
            mode: getVaultModeLabel(getVaultMode(pendingToVault(p))),
            status: 'active' as VaultStatus,
            isPending: true,
          }));
          vaultResults.unshift(...pendingVaults);
        }

        setAllVaults(vaultResults);

        // Load contributions for this wallet address
        const contribResults: MyContribution[] = [];
        for (const vault of vaults) {
          const amount = await getContribution(vault.id, contributorAddr);
          if (amount > 0n) {
            const tokensEarned = await getContributionTokens(vault.id, contributorAddr);
            contribResults.push({
              vault,
              amount,
              tokensEarned,
              status: getContributionStatus(vault),
            });
          }
        }
        setMyContributions(contribResults);
      } catch (err) {
        console.error('Dashboard load failed:', err);
      } finally {
        setLoading(false);
      }
    }

    load();
  }, [contributorAddr]);

  async function handleWithdraw(fundId: string) {
    setActionLoading(fundId);
    try {
      await withdraw(fundId);
      showToast('success', 'Withdrawal submitted! BTC will arrive once the transaction confirms.');
      const vault = await getFundDetails(fundId);
      setAllVaults((prev) =>
        prev.map((v) =>
          v.vault.id === fundId
            ? { ...v, vault, status: getVaultStatus(vault) }
            : v,
        ),
      );
    } catch {
      showToast('error', 'Withdrawal failed. The jar may still be time-locked or the transaction was rejected.');
    } finally {
      setActionLoading(null);
    }
  }

  async function handleRefund(fundId: string) {
    setActionLoading(`refund-${fundId}`);
    try {
      await refund(fundId);
      showToast('success', 'Refund submitted! Your BTC will be returned once the transaction confirms.');
      setMyContributions((prev) => prev.filter((c) => c.vault.id !== fundId));
    } catch {
      showToast('error', 'Refund failed. The transaction may have been rejected.');
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

  // Empty state
  if (allVaults.length === 0 && myContributions.length === 0) {
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
      {toast && (
        <div className={`fund-toast fund-toast--${toast.type}`} onClick={() => setToast(null)}>
          {toast.message}
        </div>
      )}
      <div className="dashboard-header">
        <h1 className="dashboard-title">Dashboard</h1>
        <span className="dashboard-subtitle">
          {allVaults.length} jar{allVaults.length !== 1 ? 's' : ''} on-chain
          {myContributions.length > 0 && (
            <>{' / '}{myContributions.length} contribution{myContributions.length !== 1 ? 's' : ''}</>
          )}
        </span>
      </div>

      {/* All Jars Section */}
      {allVaults.length > 0 && (
        <section className="dashboard-section">
          <h2 className="dashboard-section-title">All Jars</h2>
          <div className="dashboard-cards">
            {allVaults.map(({ vault, mode, status, isPending }) => (
              <div className={`dashboard-card${isPending ? ' dashboard-card--pending' : ''}`} key={vault.id}>
                <div className="dashboard-card-top">
                  {isPending ? (
                    <span className="dashboard-card-name">{vault.name}</span>
                  ) : (
                    <Link to={`/fund/${vault.id}`} className="dashboard-card-name">
                      {vault.name}
                    </Link>
                  )}
                  <span className="dashboard-mode-badge">{mode}</span>
                </div>
                <div className="dashboard-card-stats">
                  {isPending ? (
                    <div className="dashboard-card-stat" style={{ gridColumn: '1 / -1' }}>
                      <span className="dashboard-pending-label">
                        <Clock size={12} /> Confirming on-chain...
                      </span>
                    </div>
                  ) : (
                    <>
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
                    </>
                  )}
                </div>
                {!isPending && (
                  <div className="dashboard-card-actions">
                    {status === 'active' && vault.unlockBlock > 0n && (
                      <span className="dashboard-action-done">Time-locked</span>
                    )}
                    {status === 'active' && vault.unlockBlock === 0n && (
                      <span className="dashboard-action-done">Open — accepting contributions</span>
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
                )}
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
