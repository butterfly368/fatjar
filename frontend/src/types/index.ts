// ── Vault types (new, vault-oriented design) ──────────────────────

export type VaultMode = 'open-collection' | 'trust-fund' | 'all-or-nothing' | 'funded-grant';

export interface Vault {
  id: string;
  name: string;
  creator: string;
  totalRaised: bigint;       // satoshis
  unlockBlock: bigint;
  isClosed: boolean;
  withdrawn: bigint;          // satoshis
  contributorCount: number;
  goalAmount: bigint;         // satoshis, 0 = no goal
  beneficiary: string;        // zero address = no beneficiary
}

export interface Contribution {
  vaultId: string;
  contributor: string;
  amount: bigint;             // satoshis
  tokensEarned: bigint;       // $FJAR with 18 decimals
}

export interface TokenInfo {
  rate: bigint;               // tokens per 1 BTC at current level
  totalBtcContributed: bigint; // total platform BTC in satoshis
  totalSupply: bigint;        // total $FJAR minted
  remainingSupply: bigint;    // tokens left to mint
}

export const ZERO_ADDRESS = '0x' + '0'.repeat(40);

export function getVaultMode(vault: Vault): VaultMode {
  const hasGoal = vault.goalAmount > 0n;
  const hasBeneficiary = vault.beneficiary !== '' && vault.beneficiary !== ZERO_ADDRESS;
  if (hasGoal && hasBeneficiary) return 'funded-grant';
  if (hasGoal) return 'all-or-nothing';
  if (hasBeneficiary) return 'trust-fund';
  return 'open-collection';
}

export function getVaultModeLabel(mode: VaultMode): string {
  const labels: Record<VaultMode, string> = {
    'open-collection': 'Collect',
    'trust-fund': 'Save for Someone',
    'all-or-nothing': 'All-or-Nothing',
    'funded-grant': 'Fund a Dream',
  };
  return labels[mode];
}

export function formatBtc(satoshis: bigint): string {
  const btc = Number(satoshis) / 100_000_000;
  return btc.toFixed(btc < 0.01 ? 8 : btc < 1 ? 4 : 2);
}

export function truncateAddress(address: string): string {
  if (address.length <= 12) return address;
  return address.slice(0, 6) + '...' + address.slice(-4);
}

// ── Shared types ────────────────────────────────────────────────────

export interface BondingCurveTier {
  label: string;
  threshold: string;
  rate: string;
  change?: string;
}

export interface WalletState {
  connected: boolean;
  address: string | null;
  balance: number | null; // satoshis
  connect: () => Promise<void>;
  disconnect: () => void;
}
