import { useState, useCallback } from 'react';
import type { WalletState } from '../types';

/**
 * OPWallet integration stub.
 * Replace with real OPWallet SDK calls when ready.
 */
export function useWallet(): WalletState {
  const [connected, setConnected] = useState(false);
  const [address, setAddress] = useState<string | null>(null);
  const [balance, setBalance] = useState<number | null>(null);

  const connect = useCallback(async () => {
    // Stub: simulate wallet connection
    setConnected(true);
    setAddress('bc1q...demo');
    setBalance(50000000); // 0.5 BTC
  }, []);

  const disconnect = useCallback(() => {
    setConnected(false);
    setAddress(null);
    setBalance(null);
  }, []);

  return { connected, address, balance, connect, disconnect };
}
