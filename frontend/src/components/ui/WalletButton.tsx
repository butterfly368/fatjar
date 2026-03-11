import { Wallet } from 'lucide-react';
import { useWallet } from '../../hooks/useWallet';
import { truncateAddress } from '../../types';
import './WalletButton.css';

export function WalletButton() {
  const { connected, address, connect, disconnect } = useWallet();

  if (connected && address) {
    return (
      <button className="wallet-btn wallet-btn-connected" onClick={disconnect} title={address}>
        <Wallet size={14} />
        {truncateAddress(address)}
      </button>
    );
  }

  return (
    <button className="wallet-btn" onClick={connect}>
      <Wallet size={14} />
      Connect
    </button>
  );
}
