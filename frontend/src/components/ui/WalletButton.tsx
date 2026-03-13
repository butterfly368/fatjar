import { Wallet, AlertTriangle } from 'lucide-react';
import { useWallet } from '../../hooks/useWallet';
import { truncateAddress } from '../../types';
import './WalletButton.css';

export function WalletButton() {
  const { connected, address, connect, disconnect, walletError } = useWallet();

  if (connected && address) {
    return (
      <button className="wallet-btn wallet-btn-connected" onClick={disconnect} title={address}>
        <Wallet size={14} />
        {truncateAddress(address)}
      </button>
    );
  }

  return (
    <div className="wallet-btn-wrap">
      <button className="wallet-btn" onClick={connect}>
        <Wallet size={14} />
        Connect
      </button>
      {walletError && (
        <div className="wallet-error">
          <AlertTriangle size={12} />
          {walletError}
        </div>
      )}
    </div>
  );
}
