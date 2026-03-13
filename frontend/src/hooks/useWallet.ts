import { useState, useCallback, useEffect } from 'react';
import type { WalletState } from '../types';
import { getResolvedMode } from '../services/contract';

const WALLET_KEY = 'fatjar_wallet';

function getSavedWallet(): { address: string; source: string } | null {
  try {
    const raw = localStorage.getItem(WALLET_KEY);
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}

/** Detect whether OPWallet browser extension is available. */
export function hasOPWallet(): boolean {
  const opnet = (window as unknown as Record<string, unknown>).opnet;
  return !!(opnet && typeof opnet === 'object' && 'requestAccounts' in opnet);
}

/**
 * Wallet hook with localStorage persistence.
 * When OPWallet extension is detected, connects via window.opnet.
 * Falls back to mock wallet for demo mode only.
 * In live mode without OPWallet, returns an error instead of silently faking it.
 */
export function useWallet(): WalletState {
  const saved = getSavedWallet();
  const [connected, setConnected] = useState(!!saved);
  const [address, setAddress] = useState<string | null>(saved?.address ?? null);
  const [balance, setBalance] = useState<number | null>(null);
  const [walletError, setWalletError] = useState<string | null>(null);

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
    setWalletError(null);

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
        // Fall through
      }
    }

    // Check mode: only mock-fallback in demo mode
    const mode = await getResolvedMode();
    if (mode === 'live') {
      setWalletError(
        'OPWallet extension not detected. Install OPWallet and switch to OPNet testnet to use Live mode.',
      );
      return;
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
    setWalletError(null);
    localStorage.removeItem(WALLET_KEY);
  }, []);

  return { connected, address, balance, connect, disconnect, walletError };
}
