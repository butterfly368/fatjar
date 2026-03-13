/**
 * Pending jars — tracks jars submitted to the network but not yet confirmed.
 * Stored in localStorage so they survive page refreshes.
 * Auto-expire after 30 minutes (transactions that haven't confirmed are likely failed).
 */

import type { Vault } from '../types';
import { ZERO_ADDRESS } from '../types';

const STORAGE_KEY = 'fatjar-pending-jars';
const EXPIRY_MS = 30 * 60 * 1000; // 30 minutes

export interface PendingJar {
  txId: string;
  name: string;
  description: string;
  goalAmount: bigint;
  beneficiary: string;
  unlockBlock: bigint;
  isPublic: boolean;
  createdAt: number;
}

// localStorage can't store bigint, so we serialize/deserialize
interface PendingJarRaw {
  txId: string;
  name: string;
  description: string;
  goalAmount: string;
  beneficiary: string;
  unlockBlock: string;
  isPublic: boolean;
  createdAt: number;
}

function toRaw(jar: PendingJar): PendingJarRaw {
  return {
    ...jar,
    goalAmount: jar.goalAmount.toString(),
    unlockBlock: jar.unlockBlock.toString(),
  };
}

function fromRaw(raw: PendingJarRaw): PendingJar {
  return {
    ...raw,
    goalAmount: BigInt(raw.goalAmount),
    unlockBlock: BigInt(raw.unlockBlock),
  };
}

export function savePendingJar(jar: PendingJar): void {
  const existing = getPendingJarsRaw();
  existing.push(toRaw(jar));
  localStorage.setItem(STORAGE_KEY, JSON.stringify(existing));
}

export function getPendingJars(): PendingJar[] {
  const now = Date.now();
  const all = getPendingJarsRaw();
  // Filter out expired entries and clean up storage
  const valid = all.filter((j) => now - j.createdAt < EXPIRY_MS);
  if (valid.length !== all.length) {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(valid));
  }
  return valid.map(fromRaw);
}

export function removePendingJar(txId: string): void {
  const existing = getPendingJarsRaw().filter((j) => j.txId !== txId);
  localStorage.setItem(STORAGE_KEY, JSON.stringify(existing));
}

export function getPendingJarByTxId(txId: string): PendingJar | null {
  return getPendingJars().find((j) => j.txId === txId) ?? null;
}

/** Convert a pending jar to a Vault-like object for display. */
export function pendingToVault(jar: PendingJar): Vault {
  return {
    id: `pending-${jar.txId.slice(0, 8)}`,
    name: jar.name,
    description: jar.description,
    creator: 'you',
    totalRaised: 0n,
    unlockBlock: jar.unlockBlock,
    isClosed: false,
    withdrawn: 0n,
    contributorCount: 0,
    goalAmount: jar.goalAmount,
    beneficiary: jar.beneficiary || ZERO_ADDRESS,
    isPublic: jar.isPublic,
  };
}

function getPendingJarsRaw(): PendingJarRaw[] {
  try {
    return JSON.parse(localStorage.getItem(STORAGE_KEY) || '[]');
  } catch {
    return [];
  }
}
