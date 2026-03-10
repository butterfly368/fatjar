import { useState, useCallback } from 'react';
import type { WalletState } from '../types';

/**
 * Wallet hook. Uses mock state for demo.
 * When OPWallet extension is detected, connects via window.opnet.
 * Full @btc-vision/walletconnect integration deferred until
 * contracts are deployed and the SDK's Vite dev compatibility is resolved.
 */
export function useWallet(): WalletState {
  const [connected, setConnected] = useState(false);
  const [address, setAddress] = useState<string | null>(null);
  const [balance, setBalance] = useState<number | null>(null);

  const connect = useCallback(async () => {
    // Try OPWallet extension if available
    const opnet = (window as unknown as Record<string, unknown>).opnet;
    if (opnet && typeof opnet === 'object' && 'requestAccounts' in opnet) {
      try {
        const accounts = await (opnet as { requestAccounts: () => Promise<string[]> }).requestAccounts();
        if (accounts.length > 0) {
          setConnected(true);
          setAddress(accounts[0]);
          setBalance(null);
          return;
        }
      } catch {
        // Fall through to mock
      }
    }

    // Mock fallback for demo
    setConnected(true);
    setAddress('bc1q...demo');
    setBalance(50000000);
  }, []);

  const disconnect = useCallback(() => {
    setConnected(false);
    setAddress(null);
    setBalance(null);
  }, []);

  return { connected, address, balance, connect, disconnect };
}
