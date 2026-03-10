import type { Fund } from '../types';
import { MOCK_FUNDS, MOCK_CONTRIBUTIONS } from './mockData';

/**
 * Stub contract calls. Replace with real OPWallet + OPNet calls later.
 */

export async function getFundCount(): Promise<number> {
  return MOCK_FUNDS.length;
}

export async function getFundDetails(fundId: number): Promise<Fund | null> {
  return MOCK_FUNDS.find((f) => f.id === fundId) ?? null;
}

export async function getAllFunds(): Promise<Fund[]> {
  return MOCK_FUNDS;
}

export async function getContributions(fundId: number) {
  return MOCK_CONTRIBUTIONS.filter((c) => c.fundId === fundId);
}

export async function createFund(
  _name: string,
  _unlockTimestamp: number,
): Promise<number> {
  // Stub: returns fake fund ID
  return MOCK_FUNDS.length + 1;
}

export async function contribute(
  _fundId: number,
  _satoshis: number,
): Promise<void> {
  // Stub: no-op
}

export function formatSats(satoshis: number): string {
  return (satoshis / 100_000_000).toFixed(2);
}

export function formatAddress(address: string): string {
  if (address.length <= 12) return address;
  return `${address.slice(0, 6)}...${address.slice(-4)}`;
}
