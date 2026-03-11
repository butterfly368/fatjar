import { useState, useCallback, useEffect } from 'react';
import type { WalletState } from '../types';

const WALLET_KEY = 'fatjar_wallet';

function getSavedWallet(): { address: string; source: string } | null {
  try {
    const raw = localStorage.getItem(WALLET_KEY);
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}

/**
 * Wallet hook with localStorage persistence.
 * When OPWallet extension is detected, connects via window.opnet.
 * Falls back to mock wallet for demo.
 */
export function useWallet(): WalletState {
  const saved = getSavedWallet();
  const [connected, setConnected] = useState(!!saved);
  const [address, setAddress] = useState<string | null>(saved?.address ?? null);
  const [balance, setBalance] = useState<number | null>(null);

  // On mount, try to reconnect OPWallet silently if previously connected via it
  useEffect(() => {
    if (!saved || saved.source !== 'opnet') return;
    const opnet = (window as unknown as Record<string, unknown>).opnet;
    if (opnet && typeof opnet === 'object' && 'requestAccounts' in opnet) {
      (opnet as { requestAccounts: () => Promise<string[]> }).requestAccounts()
        .then((accounts) => {
          if (accounts.length > 0) {
            setAddress(accounts[0]);
            setConnected(true);
          }
        })
        .catch(() => {
          // OPWallet not available anymore, clear saved state
          localStorage.removeItem(WALLET_KEY);
          setConnected(false);
          setAddress(null);
        });
    }
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

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
          localStorage.setItem(WALLET_KEY, JSON.stringify({ address: accounts[0], source: 'opnet' }));
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
    localStorage.setItem(WALLET_KEY, JSON.stringify({ address: 'bc1q...demo', source: 'mock' }));
  }, []);

  const disconnect = useCallback(() => {
    setConnected(false);
    setAddress(null);
    setBalance(null);
    localStorage.removeItem(WALLET_KEY);
  }, []);

  return { connected, address, balance, connect, disconnect };
}
