import { useEffect, useState } from 'react';
import { StatBlock } from '../../components/ui/StatBlock';
import { getAllVaults, getTokenRate, getTotalBtcContributed, getTotalMinted, getResolvedMode } from '../../services/contract';
import { formatBtc } from '../../types';
import './StatsStrip.css';

function formatTokens(tokens: bigint): string {
  const whole = tokens / 1_000_000_000_000_000_000n;
  if (whole >= 1_000_000n) return `${(Number(whole) / 1_000_000).toFixed(1)}M`;
  if (whole >= 1_000n) return `${(Number(whole) / 1_000).toFixed(0)}K`;
  return whole.toString();
}

export function StatsStrip() {
  const [mode, setMode] = useState<'live' | 'mock' | null>(null);
  const [stats, setStats] = useState([
    { label: 'Total BTC Locked', value: '—', accent: 'BTC' },
    { label: 'Active Jars', value: '—' },
    { label: '$FJAR Minted', value: '—' },
    { label: 'Current Rate', value: '—', accent: '/BTC' },
  ]);

  useEffect(() => {
    async function load() {
      const [vaults, rate, totalBtc, totalMinted, resolvedMode] = await Promise.all([
        getAllVaults(),
        getTokenRate(),
        getTotalBtcContributed(),
        getTotalMinted(),
        getResolvedMode(),
      ]);
      setMode(resolvedMode);
      const activeCount = vaults.filter((v) => !v.isClosed).length;
      const rateDisplay = rate >= 1000n ? `${Number(rate / 1000n)}K` : String(rate);

      setStats([
        { label: 'Total BTC Locked', value: formatBtc(totalBtc), accent: 'BTC' },
        { label: 'Active Jars', value: String(activeCount) },
        { label: '$FJAR Minted', value: formatTokens(totalMinted) },
        { label: 'Current Rate', value: rateDisplay, accent: '/BTC' },
      ]);
    }
    load();
  }, []);

  return (
    <div className="stats-strip">
      {mode && (
        <span className={`stats-strip__badge stats-strip__badge--${mode}`}>
          {mode === 'live' ? 'LIVE' : 'DEMO'}
        </span>
      )}
      {stats.map((stat) => (
        <StatBlock key={stat.label} {...stat} />
      ))}
    </div>
  );
}
