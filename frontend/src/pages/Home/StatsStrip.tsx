import { useEffect, useState } from 'react';
import { StatBlock } from '../../components/ui/StatBlock';
import { getAllVaults, getTokenRate, getTotalBtcContributed, getTotalMinted, getResolvedMode } from '../../services/contract';
import { formatBtc, formatTokens } from '../../types';
import './StatsStrip.css';

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
      try {
        const [vaults, rate, totalBtc, totalMinted, resolvedMode] = await Promise.all([
          getAllVaults(),
          getTokenRate(),
          getTotalBtcContributed(),
          getTotalMinted(),
          getResolvedMode(),
        ]);
        setMode(resolvedMode);
        const activeCount = vaults.filter((v) => !v.isClosed).length;
        const rateDisplay = formatTokens(rate);

        setStats([
          { label: 'Total BTC Locked', value: formatBtc(totalBtc), accent: 'BTC' },
          { label: 'Active Jars', value: String(activeCount) },
          { label: '$FJAR Minted', value: formatTokens(totalMinted) },
          { label: 'Current Rate', value: rateDisplay, accent: '/BTC' },
        ]);
      } catch (err) {
        console.error('StatsStrip load failed:', err);
        const resolvedMode = await getResolvedMode().catch(() => 'mock' as const);
        setMode(resolvedMode);
        if (resolvedMode === 'live') {
          setStats([
            { label: 'Total BTC Locked', value: 'Connect wallet', accent: '' },
            { label: 'Active Jars', value: 'to see live data' },
            { label: '$FJAR Minted', value: '—' },
            { label: 'Current Rate', value: '—', accent: '' },
          ]);
        }
      }
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
