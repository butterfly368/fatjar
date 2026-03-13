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
  getResolvedMode,
  getMyCreatedFundIds,
  withdraw,
  refund,
} from '../../services/contract';
import { getPendingJars, pendingToVault } from '../../services/pending-jars';
import type { Vault, VaultStatus } from '../../types';
import { getVaultMode, getVaultModeLabel, formatBtc, formatTokens, getVaultStatus, CURRENT_BLOCK } from '../../types';
import { Button } from '../../components/ui/Button';
import './Dashboard.css';

const SEED_CREATOR_ADDRESS = 'bc1q...creator1';
const SEED_CONTRIBUTOR_ADDRESS = 'bc1q...alpha1';

interface MyVault {
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
  const [myVaults, setMyVaults] = useState<MyVault[]>([]);
  const [myContributions, setMyContributions] = useState<MyContribution[]>([]);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState<string | null>(null);
  const [toast, setToast] = useState<{ type: 'success' | 'error'; message: string } | null>(null);

  function showToast(type: 'success' | 'error', message: string) {
    setToast({ type, message });
    setTimeout(() => setToast(null), type === 'error' ? 8000 : 6000);
  }

  const walletAddress = address ?? 'bc1q...demo';
  const creatorAddr = walletAddress === 'bc1q...demo' ? SEED_CREATOR_ADDRESS : walletAddress;
  const contributorAddr = walletAddress === 'bc1q...demo' ? SEED_CONTRIBUTOR_ADDRESS : walletAddress;

  useEffect(() => {
    async function load() {
      setLoading(true);
      try {
        // Load vaults created by this wallet
        const vaultResults: MyVault[] = [];
        const trackedFundIds = new Set<string>();
        try {
          const creatorCount = await getCreatorFundCount(creatorAddr);
          for (let i = 0; i < creatorCount; i++) {
            const fundId = await getCreatorFundByIndex(creatorAddr, i);
            if (fundId === '0') continue; // Skip ghost fund 0 (contract is 1-indexed)
            try {
              const vault = await getFundDetails(fundId);
              trackedFundIds.add(fundId);
              vaultResults.push({
                vault,
                mode: getVaultModeLabel(getVaultMode(vault)),
                status: getVaultStatus(vault),
              });
            } catch {
              console.warn(`Skipping vault ${fundId}: fetch failed`);
            }
          }
        } catch (err) {
          console.warn('Creator fund tracking failed, skipping My Jars:', err);
        }

        // Load all vaults (used for contributions AND pending jar dedup)
        const allVaults = await getAllVaults();

        // Fallback: check metadata cache for jars created by this wallet
        // (covers cases where getCreatorFundCount fails due to address resolution)
        const cachedIds = await getMyCreatedFundIds(walletAddress);
        for (const fundId of cachedIds) {
          if (trackedFundIds.has(fundId)) continue; // already found via creator tracking
          const vault = allVaults.find((v) => v.id === fundId);
          if (vault) {
            vaultResults.push({
              vault,
              mode: getVaultModeLabel(getVaultMode(vault)),
              status: getVaultStatus(vault),
            });
          }
        }

        // In live mode, prepend pending jars (skip confirmed)
        // Check both creator-tracked vaults AND all on-chain vaults for dedup
        const mode = await getResolvedMode();
        if (mode === 'live') {
          const confirmedNames = new Set([
            ...vaultResults.map((v) => v.vault.name),
            ...allVaults.map((v) => v.name),
          ]);
          const pending = getPendingJars().filter((p) => !confirmedNames.has(p.name));
          const pendingVaults: MyVault[] = pending.map((p) => ({
            vault: pendingToVault(p),
            mode: getVaultModeLabel(getVaultMode(pendingToVault(p))),
            status: 'active' as VaultStatus,
            isPending: true,
          }));
          vaultResults.unshift(...pendingVaults);
        }

        setMyVaults(vaultResults);
        const contribResults: MyContribution[] = [];
        for (const vault of allVaults) {
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
  }, [creatorAddr, contributorAddr]);

  async function handleWithdraw(fundId: string) {
    setActionLoading(fundId);
    try {
      await withdraw(fundId);
      showToast('success', 'Withdrawal submitted! BTC will arrive once the transaction confirms.');
      const vault = await getFundDetails(fundId);
      setMyVaults((prev) =>
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

  if (myVaults.length === 0 && myContributions.length === 0) {
    return (
      <div className="dashboard">
        <div className="dashboard-header">
          <h1 className="dashboard-title">Dashboard</h1>
        </div>
        <div className="dashboard-empty">
          <h2 className="dashboard-empty-title">Nothing Here Yet</h2>
          <p className="dashboard-empty-desc">
            Create a jar or contribute to an existing one to see it here.
          </p>
          <Button to="/jars">
            Browse Jars <ArrowRight size={14} />
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
          {myVaults.length > 0 && <>{myVaults.length} jar{myVaults.length !== 1 ? 's' : ''} created</>}
          {myVaults.length > 0 && myContributions.length > 0 && ' / '}
          {myContributions.length > 0 && <>{myContributions.length} contribution{myContributions.length !== 1 ? 's' : ''}</>}
        </span>
      </div>

      {myVaults.length > 0 && (
        <section className="dashboard-section">
          <h2 className="dashboard-section-title">My Jars</h2>
          <div className="dashboard-cards">
            {myVaults.map(({ vault, mode, status, isPending }) => (
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
                        Confirming on-chain...
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
