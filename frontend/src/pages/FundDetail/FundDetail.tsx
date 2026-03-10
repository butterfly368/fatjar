import { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { ArrowRight, Lock, Unlock, Link2, Check, Share2, Globe, EyeOff } from 'lucide-react';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import { getFundDetails, getContributions, formatSats, formatAddress, contribute } from '../../services/contracts';
import type { Fund, LegacyContribution } from '../../types';
import './FundDetail.css';

export function FundDetail() {
  const { id } = useParams<{ id: string }>();
  const [fund, setFund] = useState<Fund | null>(null);
  const [contributions, setContributions] = useState<LegacyContribution[]>([]);
  const [loading, setLoading] = useState(true);
  const [amount, setAmount] = useState('');
  const [contributing, setContributing] = useState(false);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    async function load() {
      const fundId = Number(id);
      const [f, c] = await Promise.all([
        getFundDetails(fundId),
        getContributions(fundId),
      ]);
      setFund(f);
      setContributions(c);
      setLoading(false);
    }
    load();
  }, [id]);

  async function handleContribute(e: React.FormEvent) {
    e.preventDefault();
    const sats = Math.floor(Number(amount) * 100_000_000);
    if (sats <= 0) return;
    setContributing(true);
    await contribute(Number(id), sats);
    setContributing(false);
    setAmount('');
  }

  if (loading) return null;

  if (!fund) {
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

  const isLocked = fund.unlockTimestamp > 0;
  const estimateTokens = amount ? Math.floor(Number(amount) * 120000) : 0;
  const shareUrl = window.location.href;

  function handleCopyLink() {
    navigator.clipboard.writeText(shareUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  function handleShare() {
    if (navigator.share && fund) {
      navigator.share({
        title: fund.name,
        text: `Contribute BTC to "${fund.name}" on FatJar`,
        url: shareUrl,
      });
    } else {
      handleCopyLink();
    }
  }

  return (
    <div className="fund-detail">
      <div className="fund-detail-header">
        <div className="fund-detail-label">
          Jar #{fund.id}
          <span className={`fund-status-badge ${fund.isClosed ? 'fund-status-locked' : 'fund-status-open'}`}>
            {fund.isClosed ? 'Closed' : 'Open'}
          </span>
          <span className={`fund-status-badge ${fund.isPublic ? 'fund-status-open' : 'fund-status-locked'}`}>
            {fund.isPublic ? <><Globe size={10} /> Public</> : <><EyeOff size={10} /> Private</>}
          </span>
        </div>
        <h1 className="fund-detail-title">{fund.name}</h1>
        <p className="fund-detail-desc">{fund.description}</p>
        <div className="fund-share-bar">
          <button className="fund-share-btn" onClick={handleCopyLink}>
            {copied ? <Check size={14} /> : <Link2 size={14} />}
            {copied ? 'Copied!' : 'Copy Link'}
          </button>
          <button className="fund-share-btn" onClick={handleShare}>
            <Share2 size={14} />
            Share
          </button>
          <span className="fund-share-url">{shareUrl}</span>
        </div>
      </div>

      <div className="fund-detail-grid">
        <div>
          <div className="fund-stats">
            <div className="fund-stat">
              <div className="fund-stat-label">Total Raised</div>
              <div className="fund-stat-value">
                <span className="fund-stat-accent">{formatSats(fund.totalRaised)}</span> BTC
              </div>
            </div>
            <div className="fund-stat">
              <div className="fund-stat-label">Contributors</div>
              <div className="fund-stat-value">{fund.contributorCount}</div>
            </div>
            <div className="fund-stat">
              <div className="fund-stat-label">Creator</div>
              <div className="fund-stat-value" style={{ fontSize: 14, fontFamily: "'IBM Plex Mono', monospace" }}>
                {formatAddress(fund.creator)}
              </div>
            </div>
            <div className="fund-stat">
              <div className="fund-stat-label">Time-Lock</div>
              <div className="fund-stat-value" style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                {isLocked ? <Lock size={16} /> : <Unlock size={16} />}
                {isLocked ? 'Locked' : 'None'}
              </div>
            </div>
          </div>

          <h3 className="fund-contributors-title">Recent Contributors</h3>
          {contributions.map((c, i) => (
            <div key={i} className="fund-contributor">
              <span className="fund-contributor-addr">{formatAddress(c.contributor)}</span>
              <span className="fund-contributor-amount">
                {formatSats(c.amount)} BTC
                <span className="fund-contributor-tokens">+{(c.tokensMinted / 1000).toFixed(0)}K FJAR</span>
              </span>
            </div>
          ))}
        </div>

        <div>
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
              {estimateTokens > 0 && (
                <div className="fund-contribute-estimate">
                  Estimated reward: <strong>~{estimateTokens.toLocaleString()} FJAR</strong>
                </div>
              )}
              <Button type="submit" disabled={contributing || fund.isClosed}>
                {contributing ? 'Sending...' : 'Contribute'} <ArrowRight size={14} />
              </Button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}
