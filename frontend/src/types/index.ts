// ── Vault types (new, vault-oriented design) ──────────────────────

export type VaultMode = 'open-collection' | 'trust-fund' | 'all-or-nothing' | 'funded-grant';

export interface Vault {
  id: string;
  name: string;
  description: string;        // short description (max 200 chars)
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
  if (address.length <= 14) return address;
  return address.slice(0, 8) + '...' + address.slice(-6);
}

// Mode-specific visual identity (color, icon, background)
const MODE_STYLES: Record<VaultMode, { color: string; bg: string; icon: string }> = {
  'open-collection': { color: '#1a7f37', bg: '#dafbe1', icon: '\u{1F4E5}' },   // green, inbox emoji
  'trust-fund':      { color: '#0550ae', bg: '#ddf4ff', icon: '\u{1F381}' },    // blue, gift emoji
  'all-or-nothing':  { color: '#9a6700', bg: '#fff8c5', icon: '\u{1F3AF}' },    // amber, target emoji
  'funded-grant':    { color: '#8250df', bg: '#fbefff', icon: '\u{1F680}' },     // purple, rocket emoji
};

export function getModeStyle(mode: VaultMode) {
  return MODE_STYLES[mode];
}

// Estimate human-readable date from block number
export function blockToDate(block: bigint): string {
  const CURRENT_BLOCK = 890000;
  const MINUTES_PER_BLOCK = 10;
  const blocksUntil = Number(block) - CURRENT_BLOCK;
  if (blocksUntil <= 0) return 'Unlocked';
  const ms = blocksUntil * MINUTES_PER_BLOCK * 60 * 1000;
  const date = new Date(Date.now() + ms);
  return date.toLocaleDateString('en-US', { month: 'short', year: 'numeric' });
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
