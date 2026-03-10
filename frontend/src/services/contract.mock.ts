/**
 * Mock contract service for FatJar vaults.
 *
 * Uses in-memory state so Create and Contribute work in the demo.
 * Will be replaced with real OPWallet calls in Task 9.
 */

import type { Vault, Contribution } from '../types';
import { ZERO_ADDRESS } from '../types';

// ── In-memory mock state ──────────────────────────────────────────

let nextVaultId = 4;

const vaults: Map<string, Vault> = new Map();
const contributions: Contribution[] = [];
const creatorVaults: Map<string, string[]> = new Map();

// Seed: 1) Lisa's Birthday Surprise — open-collection (Collect)
vaults.set('1', {
  id: '1',
  name: "Lisa's Birthday Surprise",
  creator: 'bc1q...creator1',
  totalRaised: 8500000n, // 0.085 BTC
  unlockBlock: 900000n,
  isClosed: false,
  withdrawn: 0n,
  contributorCount: 6,
  goalAmount: 0n,
  beneficiary: ZERO_ADDRESS,
});

// Seed: 2) Jake's College Fund — trust-fund (Save for Someone)
vaults.set('2', {
  id: '2',
  name: "Jake's College Fund",
  creator: 'bc1q...creator2',
  totalRaised: 150000000n, // 1.5 BTC
  unlockBlock: 1050000n,
  isClosed: false,
  withdrawn: 0n,
  contributorCount: 4,
  goalAmount: 0n,
  beneficiary: 'bc1q...jake',
});

// Seed: 3) Community Skatepark Build — all-or-nothing
vaults.set('3', {
  id: '3',
  name: 'Community Skatepark Build',
  creator: 'bc1q...creator3',
  totalRaised: 120000000n, // 1.2 BTC
  unlockBlock: 920000n,
  isClosed: false,
  withdrawn: 0n,
  contributorCount: 11,
  goalAmount: 200000000n, // 2 BTC goal
  beneficiary: ZERO_ADDRESS,
});

// Seed creator index
creatorVaults.set('bc1q...creator1', ['1']);
creatorVaults.set('bc1q...creator2', ['2']);
creatorVaults.set('bc1q...creator3', ['3']);

// Seed contributions for vault 1 — Lisa's Birthday Surprise
contributions.push(
  { vaultId: '1', contributor: 'bc1q...alpha1', amount: 2000000n, tokensEarned: 240000000000000000000n },
  { vaultId: '1', contributor: 'bc1q...alpha2', amount: 1500000n, tokensEarned: 180000000000000000000n },
  { vaultId: '1', contributor: 'bc1q...alpha3', amount: 1000000n, tokensEarned: 120000000000000000000n },
  { vaultId: '1', contributor: 'bc1q...alpha4', amount: 1500000n, tokensEarned: 180000000000000000000n },
  { vaultId: '1', contributor: 'bc1q...alpha5', amount: 1000000n, tokensEarned: 120000000000000000000n },
  { vaultId: '1', contributor: 'bc1q...alpha6', amount: 1500000n, tokensEarned: 180000000000000000000n },
);

// Seed contributions for vault 2 — Jake's College Fund
contributions.push(
  { vaultId: '2', contributor: 'bc1q...beta1', amount: 50000000n, tokensEarned: 6000000000000000000000n },
  { vaultId: '2', contributor: 'bc1q...beta2', amount: 30000000n, tokensEarned: 3600000000000000000000n },
  { vaultId: '2', contributor: 'bc1q...beta3', amount: 50000000n, tokensEarned: 6000000000000000000000n },
  { vaultId: '2', contributor: 'bc1q...beta4', amount: 20000000n, tokensEarned: 2400000000000000000000n },
);

// Seed contributions for vault 3 — Community Skatepark Build
contributions.push(
  { vaultId: '3', contributor: 'bc1q...gamma1', amount: 15000000n, tokensEarned: 1800000000000000000000n },
  { vaultId: '3', contributor: 'bc1q...gamma2', amount: 10000000n, tokensEarned: 1200000000000000000000n },
  { vaultId: '3', contributor: 'bc1q...gamma3', amount: 12000000n, tokensEarned: 1440000000000000000000n },
  { vaultId: '3', contributor: 'bc1q...gamma4', amount: 8000000n, tokensEarned: 960000000000000000000n },
  { vaultId: '3', contributor: 'bc1q...gamma5', amount: 15000000n, tokensEarned: 1800000000000000000000n },
  { vaultId: '3', contributor: 'bc1q...gamma6', amount: 10000000n, tokensEarned: 1200000000000000000000n },
  { vaultId: '3', contributor: 'bc1q...gamma7', amount: 8000000n, tokensEarned: 960000000000000000000n },
  { vaultId: '3', contributor: 'bc1q...gamma8', amount: 12000000n, tokensEarned: 1440000000000000000000n },
  { vaultId: '3', contributor: 'bc1q...gamma9', amount: 10000000n, tokensEarned: 1200000000000000000000n },
  { vaultId: '3', contributor: 'bc1q...gamma10', amount: 10000000n, tokensEarned: 1200000000000000000000n },
  { vaultId: '3', contributor: 'bc1q...gamma11', amount: 10000000n, tokensEarned: 1200000000000000000000n },
);

// Platform-level mock state
let totalPlatformBtc = 278500000n; // sum of all vault totalRaised
const MOCK_TOKEN_RATE = 120000n; // tokens per 1 BTC at current level
let totalMinted = 0n; // simplified, not tracking exactly

// ── Write methods ─────────────────────────────────────────────────

export async function createVault(
  name: string,
  unlockBlock: bigint,
  goalAmount: bigint,
  beneficiary: string,
): Promise<string> {
  const id = String(nextVaultId++);
  const creator = 'bc1q...demo'; // stub: would come from connected wallet

  const vault: Vault = {
    id,
    name,
    creator,
    totalRaised: 0n,
    unlockBlock,
    isClosed: false,
    withdrawn: 0n,
    contributorCount: 0,
    goalAmount,
    beneficiary: beneficiary || ZERO_ADDRESS,
  };

  vaults.set(id, vault);

  const existing = creatorVaults.get(creator) ?? [];
  existing.push(id);
  creatorVaults.set(creator, existing);

  return id;
}

export async function contribute(fundId: string, satoshis: bigint): Promise<void> {
  const vault = vaults.get(fundId);
  if (!vault) throw new Error(`Vault ${fundId} not found`);
  if (vault.isClosed) throw new Error(`Vault ${fundId} is closed`);

  const contributor = 'bc1q...demo'; // stub: would come from connected wallet
  const tokensEarned = satoshis * MOCK_TOKEN_RATE; // simplified

  vault.totalRaised += satoshis;
  vault.contributorCount += 1;
  totalPlatformBtc += satoshis;
  totalMinted += tokensEarned;

  contributions.push({
    vaultId: fundId,
    contributor,
    amount: satoshis,
    tokensEarned,
  });
}

export async function withdraw(fundId: string): Promise<bigint> {
  const vault = vaults.get(fundId);
  if (!vault) throw new Error(`Vault ${fundId} not found`);

  const available = vault.totalRaised - vault.withdrawn;
  vault.withdrawn = vault.totalRaised;
  return available;
}

export async function refund(fundId: string): Promise<bigint> {
  const vault = vaults.get(fundId);
  if (!vault) throw new Error(`Vault ${fundId} not found`);

  // Stub: return a mock refund amount for the demo contributor
  const contributor = 'bc1q...demo';
  const userContributions = contributions.filter(
    (c) => c.vaultId === fundId && c.contributor === contributor,
  );
  const total = userContributions.reduce((sum, c) => sum + c.amount, 0n);
  return total;
}

export async function closeFund(fundId: string): Promise<void> {
  const vault = vaults.get(fundId);
  if (!vault) throw new Error(`Vault ${fundId} not found`);
  vault.isClosed = true;
}

// ── Read methods ──────────────────────────────────────────────────

export async function getFundDetails(fundId: string): Promise<Vault> {
  const vault = vaults.get(fundId);
  if (!vault) throw new Error(`Vault ${fundId} not found`);
  return vault;
}

export async function getFundCount(): Promise<number> {
  return vaults.size;
}

export async function getAllVaults(): Promise<Vault[]> {
  return Array.from(vaults.values());
}

export async function getVaultContributions(fundId: string): Promise<Contribution[]> {
  return contributions.filter((c) => c.vaultId === fundId);
}

export async function getContribution(fundId: string, contributor: string): Promise<bigint> {
  return contributions
    .filter((c) => c.vaultId === fundId && c.contributor === contributor)
    .reduce((sum, c) => sum + c.amount, 0n);
}

export async function getContributionTokens(fundId: string, contributor: string): Promise<bigint> {
  return contributions
    .filter((c) => c.vaultId === fundId && c.contributor === contributor)
    .reduce((sum, c) => sum + c.tokensEarned, 0n);
}

export async function getTokenRate(): Promise<bigint> {
  return MOCK_TOKEN_RATE;
}

export async function getTotalMinted(): Promise<bigint> {
  return contributions.reduce((sum, c) => sum + c.tokensEarned, 0n);
}

export async function getTotalBtcContributed(): Promise<bigint> {
  return totalPlatformBtc;
}

export async function getCreatorFundCount(creator: string): Promise<number> {
  return (creatorVaults.get(creator) ?? []).length;
}

export async function getCreatorFundByIndex(creator: string, index: number): Promise<string> {
  const ids = creatorVaults.get(creator) ?? [];
  if (index < 0 || index >= ids.length) throw new Error('Index out of bounds');
  return ids[index];
}
