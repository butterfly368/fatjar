import { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowRight, Link2, Check, Share2, Inbox, Gift, Target, Rocket } from 'lucide-react';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import {
  getFundDetails,
  contribute,
  withdraw,
  refund,
  closeFund,
  getTokenRate,
  getVaultContributions,
} from '../../services/contract';
import type { Vault, Contribution } from '../../types';
import { getVaultMode, getVaultModeLabel, formatBtc, truncateAddress, ZERO_ADDRESS } from '../../types';
import type { VaultMode } from '../../types';

const MODE_ICON: Record<VaultMode, typeof Inbox> = {
  'open-collection': Inbox,
  'trust-fund': Gift,
  'all-or-nothing': Target,
  'funded-grant': Rocket,
};
import './FundDetail.css';

// Mock current block — will be replaced with real chain data in Task 9
const MOCK_CURRENT_BLOCK = 860000n;
// Mock connected wallet — will be replaced with real wallet in Task 9
const MOCK_WALLET_ADDRESS = 'bc1q...demo';

type VaultStatus = 'active' | 'unlocked' | 'withdrawn' | 'refundable';

function getVaultStatus(vault: Vault): VaultStatus {
  if (vault.withdrawn > 0n) return 'withdrawn';
  const isPastUnlock = vault.unlockBlock > 0n && MOCK_CURRENT_BLOCK >= vault.unlockBlock;
  if (isPastUnlock && vault.goalAmount > 0n && vault.totalRaised < vault.goalAmount) return 'refundable';
  if (isPastUnlock || vault.isClosed) return 'unlocked';
  return 'active';
}

function getStatusLabel(status: VaultStatus): string {
  const labels: Record<VaultStatus, string> = {
    active: 'Active',
    unlocked: 'Unlocked',
    withdrawn: 'Withdrawn',
    refundable: 'Refundable',
  };
  return labels[status];
}

export function FundDetail() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [vault, setVault] = useState<Vault | null>(null);
  const [contributions, setContributions] = useState<Contribution[]>([]);
  const [loading, setLoading] = useState(true);
  const [tokenRate, setTokenRate] = useState<bigint>(120000n);
  const [amount, setAmount] = useState('');
  const [contributing, setContributing] = useState(false);
  const [showContributeForm, setShowContributeForm] = useState(false);
  const [actionLoading, setActionLoading] = useState(false);
  const [copied, setCopied] = useState(false);

  const loadVault = useCallback(async () => {
    if (!id) return;
    try {
      const [v, c, rate] = await Promise.all([
        getFundDetails(id),
        getVaultContributions(id),
        getTokenRate(),
      ]);
      setVault(v);
      setContributions(c);
      setTokenRate(rate);
    } catch {
      setVault(null);
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => {
    loadVault();
  }, [loadVault]);

  async function handleContribute(e: React.FormEvent) {
    e.preventDefault();
    if (!id) return;
    const sats = BigInt(Math.floor(Number(amount) * 100_000_000));
    if (sats <= 0n) return;
    setContributing(true);
    try {
      await contribute(id, sats);
      setAmount('');
      setShowContributeForm(false);
      await loadVault();
    } finally {
      setContributing(false);
    }
  }

  async function handleWithdraw() {
    if (!id) return;
    setActionLoading(true);
    try {
      await withdraw(id);
      await loadVault();
    } finally {
      setActionLoading(false);
    }
  }

  async function handleRefund() {
    if (!id) return;
    setActionLoading(true);
    try {
      await refund(id);
      await loadVault();
    } finally {
      setActionLoading(false);
    }
  }

  async function handleClose() {
    if (!id) return;
    setActionLoading(true);
    try {
      await closeFund(id);
      await loadVault();
    } finally {
      setActionLoading(false);
    }
  }

  async function handleCopyLink() {
    try {
      await navigator.clipboard.writeText(window.location.href);
    } catch {
      // Fallback for non-HTTPS or denied permission
      const textArea = document.createElement('textarea');
      textArea.value = window.location.href;
      document.body.appendChild(textArea);
      textArea.select();
      document.execCommand('copy');
      document.body.removeChild(textArea);
    }
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  async function handleShare() {
    if (navigator.share && vault) {
      try {
        await navigator.share({
          title: vault.name,
          text: `Contribute BTC to "${vault.name}" on FatJar`,
          url: window.location.href,
        });
        return;
      } catch {
        // User cancelled or share failed — fall through to copy
      }
    }
    handleCopyLink();
  }

  if (loading) return null;

  if (!vault) {
    return (
      <div className="fund-detail">
        <div className="fund-not-found">
          <h1 className="fund-not-found-title">Jar Not Found</h1>
          <p className="fund-not-found-desc">This jar doesn't exist or has been removed.</p>
          <Button to="/">Back to Home <ArrowRight size={14} /></Button>
        </div>
      </div>
    );
  }

  const mode = getVaultMode(vault);
  const modeLabel = getVaultModeLabel(mode);
  const ModeIcon = MODE_ICON[mode];
  const status = getVaultStatus(vault);
  const statusLabel = getStatusLabel(status);
  const hasGoal = vault.goalAmount > 0n;
  const progressPct = hasGoal
    ? Math.min(100, Number((vault.totalRaised * 100n) / vault.goalAmount))
    : 0;
  const blocksRemaining = vault.unlockBlock > MOCK_CURRENT_BLOCK
    ? vault.unlockBlock - MOCK_CURRENT_BLOCK
    : 0n;

  const isCreator = vault.creator === MOCK_WALLET_ADDRESS;
  const isBeneficiary = vault.beneficiary === MOCK_WALLET_ADDRESS;

  // Estimate tokens for the contribute form
  // In the mock, tokensEarned = satoshis * MOCK_TOKEN_RATE
  const estimateSats = amount ? BigInt(Math.floor(Number(amount) * 100_000_000)) : 0n;
  const estimateTokens = estimateSats > 0n ? estimateSats * tokenRate : 0n;
  const estimateDisplay = estimateTokens > 0n
    ? Number(estimateTokens).toLocaleString()
    : '';

  return (
    <div className="fund-detail">
      {/* Header */}
      <div className="fund-detail-header">
        <div className="fund-detail-label">
          Jar #{vault.id}
        </div>
        <h1 className="fund-detail-title">{vault.name}</h1>
        {vault.description && (
          <p className="fund-detail-desc">{vault.description}</p>
        )}
        <div className="fund-detail-badges">
          <span className="fund-mode-badge" data-mode={mode}><ModeIcon size={11} /> {modeLabel}</span>
          <span className={`fund-status-badge fund-status-${status}`}>{statusLabel}</span>
        </div>
        <div className="fund-detail-meta">
          <div className="fund-detail-meta-item">
            <span className="fund-detail-meta-label">Created by</span>
            <span className="fund-detail-meta-addr">{truncateAddress(vault.creator)}</span>
          </div>
          {vault.beneficiary !== ZERO_ADDRESS && vault.beneficiary !== '' && (
            <div className="fund-detail-meta-item">
              <span className="fund-detail-meta-label">Beneficiary</span>
              <span className="fund-detail-meta-addr">{truncateAddress(vault.beneficiary)}</span>
            </div>
          )}
        </div>
        <div className="fund-share-bar">
          <button className="fund-share-btn" onClick={handleCopyLink}>
            {copied ? <Check size={14} /> : <Link2 size={14} />}
            {copied ? 'Copied!' : 'Copy Link'}
          </button>
          <button className="fund-share-btn" onClick={handleShare}>
            <Share2 size={14} />
            Share
          </button>
        </div>
      </div>

      <div className="fund-detail-grid">
        {/* Left column: progress, stats, contributors */}
        <div>
          {/* Progress section */}
          <div className="fund-progress-section">
            {hasGoal ? (
              <>
                <div className="fund-progress-header">
                  <span className="fund-progress-raised">
                    <span className="fund-stat-accent">{formatBtc(vault.totalRaised)}</span> BTC
                  </span>
                  <span className="fund-progress-goal">
                    of {formatBtc(vault.goalAmount)} BTC goal
                  </span>
                </div>
                <div className="fund-progress-track">
                  <div
                    className="fund-progress-fill"
                    style={{ width: `${progressPct}%` }}
                  />
                </div>
                <div className="fund-progress-pct">{progressPct}% funded</div>
              </>
            ) : (
              <div className="fund-progress-header">
                <span className="fund-progress-raised">
                  Total Raised: <span className="fund-stat-accent">{formatBtc(vault.totalRaised)}</span> BTC
                </span>
              </div>
            )}
          </div>

          {/* Stats grid */}
          <div className="fund-stats">
            <div className="fund-stat">
              <div className="fund-stat-label">Contributors</div>
              <div className="fund-stat-value">{vault.contributorCount}</div>
            </div>
            <div className="fund-stat">
              <div className="fund-stat-label">Time-Lock</div>
              <div className="fund-stat-value">
                {vault.unlockBlock > 0n ? (
                  blocksRemaining > 0n
                    ? `${blocksRemaining.toLocaleString()} blocks`
                    : 'Unlocked'
                ) : (
                  'None'
                )}
              </div>
            </div>
            <div className="fund-stat">
              <div className="fund-stat-label">$FJAR Rate</div>
              <div className="fund-stat-value">
                <span className="fund-stat-accent">{Number(tokenRate).toLocaleString()}</span> / BTC
              </div>
            </div>
            <div className="fund-stat">
              <div className="fund-stat-label">Withdrawn</div>
              <div className="fund-stat-value">{formatBtc(vault.withdrawn)} BTC</div>
            </div>
          </div>

          {/* Contributors table */}
          <h3 className="fund-contributors-title">Contributors</h3>
          {contributions.length === 0 ? (
            <p className="fund-no-contributors">No contributions yet.</p>
          ) : (
            <div className="fund-contributors-table">
              <div className="fund-contributors-thead">
                <span>Address</span>
                <span>BTC</span>
                <span>$FJAR Earned</span>
              </div>
              {contributions.map((c, i) => (
                <div key={i} className="fund-contributor">
                  <span className="fund-contributor-addr">{truncateAddress(c.contributor)}</span>
                  <span className="fund-contributor-amount">{formatBtc(c.amount)}</span>
                  <span className="fund-contributor-tokens">
                    {Number(c.tokensEarned).toLocaleString()}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Right column: actions + bonding curve info */}
        <div>
          {/* Bonding curve info */}
          <div className="fund-curve-card">
            <h3 className="fund-curve-title">Bonding Curve</h3>
            <p className="fund-curve-desc">
              Current rate: <strong>{Number(tokenRate).toLocaleString()} $FJAR</strong> per 1 BTC.
              Early contributors earn more tokens.
            </p>
          </div>

          {/* Action buttons */}
          <div className="fund-actions">
            {status === 'active' && !vault.isClosed && (
              <>
                {!showContributeForm ? (
                  <Button onClick={() => setShowContributeForm(true)}>
                    Contribute <ArrowRight size={14} />
                  </Button>
                ) : (
                  <div className="fund-contribute-card">
                    <h3 className="fund-contribute-title">Contribute BTC</h3>
                    <form className="fund-contribute-form" onSubmit={handleContribute}>
                      <Input
                        label="Amount (BTC)"
                        type="number"
                        step="0.001"
                        min="0.001"
                        placeholder="0.01"
                        value={amount}
                        onChange={(e) => setAmount(e.target.value)}
                      />
                      {estimateDisplay && (
                        <div className="fund-contribute-estimate">
                          Estimated reward: <strong>~{estimateDisplay} $FJAR</strong>
                        </div>
                      )}
                      <div className="fund-contribute-actions">
                        <Button type="submit" disabled={contributing}>
                          {contributing ? 'Sending...' : 'Send BTC'} <ArrowRight size={14} />
                        </Button>
                        <Button
                          variant="secondary"
                          type="button"
                          onClick={() => { setShowContributeForm(false); setAmount(''); }}
                        >
                          Cancel
                        </Button>
                      </div>
                    </form>
                  </div>
                )}
                {isCreator && (
                  <Button
                    variant="secondary"
                    onClick={handleClose}
                    disabled={actionLoading}
                  >
                    {actionLoading ? 'Closing...' : 'Close Jar'}
                  </Button>
                )}
              </>
            )}

            {status === 'unlocked' && (isCreator || isBeneficiary) && (
              <Button onClick={handleWithdraw} disabled={actionLoading}>
                {actionLoading ? 'Withdrawing...' : 'Withdraw Funds'} <ArrowRight size={14} />
              </Button>
            )}

            {status === 'refundable' && (
              <Button onClick={handleRefund} disabled={actionLoading}>
                {actionLoading ? 'Refunding...' : 'Claim Refund'} <ArrowRight size={14} />
              </Button>
            )}

            {status === 'withdrawn' && (
              <div className="fund-withdrawn-notice">
                This jar has been fully withdrawn.
              </div>
            )}
          </div>

          <button className="fund-back-link" onClick={() => navigate('/')}>
            <ArrowRight size={12} style={{ transform: 'rotate(180deg)' }} />
            Back to all jars
          </button>
        </div>
      </div>
    </div>
  );
}
