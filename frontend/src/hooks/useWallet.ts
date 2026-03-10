import { useWalletConnect } from '@btc-vision/walletconnect/browser';
import type { WalletState } from '../types';

/**
 * Wraps @btc-vision/walletconnect into the WalletState shape used by our components.
 */
export function useWallet(): WalletState {
  const {
    walletAddress,
    walletBalance,
    openConnectModal,
    disconnect,
  } = useWalletConnect();

  const connected = walletAddress !== null;
  const balance = walletBalance?.confirmed ?? null;

  return {
    connected,
    address: walletAddress,
    balance,
    connect: async () => openConnectModal(),
    disconnect,
  };
}
