import { useEffect, useState } from 'react';
import { StatBlock } from '../../components/ui/StatBlock';
import { getAllVaults, getTokenRate, getTotalBtcContributed } from '../../services/contract';
import { formatBtc } from '../../types';
import './StatsStrip.css';

export function StatsStrip() {
  const [stats, setStats] = useState([
    { label: 'Total BTC Locked', value: '—', accent: 'BTC' },
    { label: 'Active Vaults', value: '—' },
    { label: '$FJAR Minted', value: '—' },
    { label: 'Current Rate', value: '—', accent: '/BTC' },
  ]);

  useEffect(() => {
    async function load() {
      const [vaults, rate, totalBtc] = await Promise.all([
        getAllVaults(),
        getTokenRate(),
        getTotalBtcContributed(),
      ]);
      const activeCount = vaults.filter((v) => !v.isClosed).length;
      const totalMinted = vaults.reduce(
        (sum, v) => sum + v.totalRaised * rate,
        0n,
      );
      const mintedDisplay =
        Number(totalMinted / 10n ** 18n) >= 1_000_000
          ? `${(Number(totalMinted / 10n ** 18n) / 1_000_000).toFixed(1)}M`
          : Number(totalMinted / 10n ** 18n) >= 1_000
            ? `${(Number(totalMinted / 10n ** 18n) / 1_000).toFixed(0)}K`
            : String(Number(totalMinted / 10n ** 18n));

      setStats([
        { label: 'Total BTC Locked', value: formatBtc(totalBtc), accent: 'BTC' },
        { label: 'Active Vaults', value: String(activeCount) },
        { label: '$FJAR Minted', value: mintedDisplay },
        { label: 'Current Rate', value: `${Number(rate / 1000n)}K`, accent: '/BTC' },
      ]);
    }
    load();
  }, []);

  return (
    <div className="stats-strip">
      {stats.map((stat) => (
        <StatBlock key={stat.label} {...stat} />
      ))}
    </div>
  );
}
