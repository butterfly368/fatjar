/**
 * Live contract service — reads from OPNet testnet via JSON-RPC,
 * writes via OPWallet Chrome extension (auto-detected by TransactionFactory).
 *
 * Fund names are not stored on-chain (event-only), so we show "Jar #N".
 */

import {
  JSONRpcProvider,
  getContract,
  ABIDataTypes,
  BitcoinAbiTypes,
  OP_NET_ABI,
} from 'opnet';
import type { BitcoinInterfaceAbi, CallResult } from 'opnet';
import { Address } from '@btc-vision/transaction';
import type { Vault, Contribution } from '../types';
import { ZERO_ADDRESS } from '../types';
import { OPNET_CONFIG } from './opnet-config';

// ── OPNet testnet network definition ────────────────────────────────
const opnetTestnet = {
  messagePrefix: '\x18Bitcoin Signed Message:\n',
  bech32: 'opt',
  bech32Opnet: 'opt',
  bip32: { public: 0x043587cf, private: 0x04358394 },
  pubKeyHash: 0x6f,
  scriptHash: 0xc4,
  wif: 0xef,
};

// ── OPWallet browser types ──────────────────────────────────────────
interface OPWalletWeb3 {
  signInteraction(params: unknown): Promise<unknown>;
  signAndBroadcastInteraction(params: unknown): Promise<[unknown, unknown, unknown[], string]>;
  getMLDSAPublicKey(): Promise<string>;
}

interface OPWalletAPI {
  requestAccounts(): Promise<string[]>;
  getPublicKey(): Promise<string>;
  getNetwork(): Promise<string>;
  web3: OPWalletWeb3;
}

// ── ABI definitions ─────────────────────────────────────────────────
// Read methods
const FatJarManagerReadAbi: BitcoinInterfaceAbi = [
  {
    name: 'getFundCount',
    inputs: [],
    outputs: [{ name: 'count', type: ABIDataTypes.UINT256 }],
    type: BitcoinAbiTypes.Function,
  },
  {
    name: 'getFundDetails',
    inputs: [{ name: 'fundId', type: ABIDataTypes.UINT256 }],
    outputs: [
      { name: 'creator', type: ABIDataTypes.UINT256 },
      { name: 'totalRaised', type: ABIDataTypes.UINT256 },
      { name: 'unlockTimestamp', type: ABIDataTypes.UINT256 },
      { name: 'isClosed', type: ABIDataTypes.UINT256 },
      { name: 'withdrawn', type: ABIDataTypes.UINT256 },
      { name: 'contributorCount', type: ABIDataTypes.UINT256 },
      { name: 'goalAmount', type: ABIDataTypes.UINT256 },
      { name: 'beneficiary', type: ABIDataTypes.UINT256 },
    ],
    type: BitcoinAbiTypes.Function,
  },
  {
    name: 'getContribution',
    inputs: [
      { name: 'fundId', type: ABIDataTypes.UINT256 },
      { name: 'contributor', type: ABIDataTypes.ADDRESS },
    ],
    outputs: [{ name: 'amount', type: ABIDataTypes.UINT256 }],
    type: BitcoinAbiTypes.Function,
  },
  {
    name: 'getContributionTokens',
    inputs: [
      { name: 'fundId', type: ABIDataTypes.UINT256 },
      { name: 'contributor', type: ABIDataTypes.ADDRESS },
    ],
    outputs: [{ name: 'tokens', type: ABIDataTypes.UINT256 }],
    type: BitcoinAbiTypes.Function,
  },
  {
    name: 'getCreatorFundCount',
    inputs: [{ name: 'creator', type: ABIDataTypes.ADDRESS }],
    outputs: [{ name: 'count', type: ABIDataTypes.UINT256 }],
    type: BitcoinAbiTypes.Function,
  },
  {
    name: 'getCreatorFundByIndex',
    inputs: [
      { name: 'creator', type: ABIDataTypes.ADDRESS },
      { name: 'index', type: ABIDataTypes.UINT256 },
    ],
    outputs: [{ name: 'fundId', type: ABIDataTypes.UINT256 }],
    type: BitcoinAbiTypes.Function,
  },
];

// Write methods
const FatJarManagerWriteAbi: BitcoinInterfaceAbi = [
  {
    name: 'createFund',
    inputs: [
      { name: 'name', type: ABIDataTypes.STRING },
      { name: 'unlockTimestamp', type: ABIDataTypes.UINT256 },
      { name: 'goalAmount', type: ABIDataTypes.UINT256 },
      { name: 'beneficiary', type: ABIDataTypes.ADDRESS },
    ],
    outputs: [{ name: 'fundId', type: ABIDataTypes.UINT256 }],
    type: BitcoinAbiTypes.Function,
  },
  {
    name: 'contribute',
    inputs: [
      { name: 'fundId', type: ABIDataTypes.UINT256 },
      { name: 'satoshis', type: ABIDataTypes.UINT256 },
    ],
    outputs: [],
    type: BitcoinAbiTypes.Function,
  },
  {
    name: 'withdraw',
    inputs: [{ name: 'fundId', type: ABIDataTypes.UINT256 }],
    outputs: [{ name: 'amount', type: ABIDataTypes.UINT256 }],
    type: BitcoinAbiTypes.Function,
  },
  {
    name: 'refund',
    inputs: [{ name: 'fundId', type: ABIDataTypes.UINT256 }],
    outputs: [{ name: 'amount', type: ABIDataTypes.UINT256 }],
    type: BitcoinAbiTypes.Function,
  },
  {
    name: 'closeFund',
    inputs: [{ name: 'fundId', type: ABIDataTypes.UINT256 }],
    outputs: [],
    type: BitcoinAbiTypes.Function,
  },
  {
    name: 'deleteFund',
    inputs: [{ name: 'fundId', type: ABIDataTypes.UINT256 }],
    outputs: [],
    type: BitcoinAbiTypes.Function,
  },
];

const FatJarManagerAbi: BitcoinInterfaceAbi = [
  ...FatJarManagerReadAbi,
  ...FatJarManagerWriteAbi,
  ...OP_NET_ABI,
];

const FatJarTokenAbi: BitcoinInterfaceAbi = [
  {
    name: 'getTokenRate',
    inputs: [],
    outputs: [{ name: 'rate', type: ABIDataTypes.UINT256 }],
    type: BitcoinAbiTypes.Function,
  },
  {
    name: 'getTotalBtcContributed',
    inputs: [],
    outputs: [{ name: 'totalBtc', type: ABIDataTypes.UINT256 }],
    type: BitcoinAbiTypes.Function,
  },
  {
    name: 'totalSupply',
    inputs: [],
    outputs: [{ name: 'totalSupply', type: ABIDataTypes.UINT256 }],
    type: BitcoinAbiTypes.Function,
  },
  ...OP_NET_ABI,
];

// ── Provider + contracts (lazy singleton) ───────────────────────────
let provider: JSONRpcProvider | null = null;
// eslint-disable-next-line @typescript-eslint/no-explicit-any
let managerContract: any = null;
// eslint-disable-next-line @typescript-eslint/no-explicit-any
let tokenContract: any = null;

function getProvider(): JSONRpcProvider {
  if (!provider) {
    provider = new JSONRpcProvider(OPNET_CONFIG.rpcUrl, opnetTestnet);
  }
  return provider;
}

function getManagerContract() {
  if (!managerContract) {
    managerContract = getContract(
      OPNET_CONFIG.managerAddress,
      FatJarManagerAbi,
      getProvider(),
      opnetTestnet,
    );
  }
  return managerContract;
}

function getTokenContract() {
  if (!tokenContract) {
    tokenContract = getContract(
      OPNET_CONFIG.tokenAddress,
      FatJarTokenAbi,
      getProvider(),
      opnetTestnet,
    );
  }
  return tokenContract;
}

// ── Jar metadata cache (names & descriptions are event-only) ────────
const JAR_METADATA_KEY = 'fatjar-metadata';

interface JarMeta { name: string; description: string }

// Seed jar names — calldata contains these but no indexer exists yet.
// Fallback for browsers without localStorage cache.
// Seed names for jars already on testnet (names are event-only, not in contract state)
const SEED_JAR_NAMES: Record<string, JarMeta> = {
  '1': { name: "Emma's College Fund", description: '' },
  '2': { name: "Dad's Retirement Stack", description: '' },
  '3': { name: 'Community Skatepark Build', description: '' },
};

function getMetadataCache(): Record<string, JarMeta> {
  try {
    return JSON.parse(localStorage.getItem(JAR_METADATA_KEY) || '{}');
  } catch {
    return {};
  }
}

function saveMetadata(fundId: string, name: string, description: string): void {
  const cache = getMetadataCache();
  cache[fundId] = { name, description };
  localStorage.setItem(JAR_METADATA_KEY, JSON.stringify(cache));
}

// ── Helpers ─────────────────────────────────────────────────────────

function parseFundId(fundId: string): bigint {
  try {
    return BigInt(fundId);
  } catch {
    throw new Error(`Invalid fund ID: ${fundId}`);
  }
}

function toBigInt(val: unknown): bigint {
  if (typeof val === 'bigint') return val;
  if (typeof val === 'number') return BigInt(val);
  if (typeof val === 'string') return BigInt(val);
  return 0n;
}

function bigintToHex(val: bigint): string {
  if (val === 0n) return ZERO_ADDRESS;
  const hex = val.toString(16).padStart(64, '0');
  return '0x' + hex;
}

function toAddress(val: unknown): string {
  if (typeof val === 'bigint' && val !== 0n) return bigintToHex(val);
  if (typeof val === 'string' && val.length > 0) return val;
  return ZERO_ADDRESS;
}

function getOPWallet(): OPWalletAPI {
  const opnet = (window as unknown as Record<string, unknown>).opnet as OPWalletAPI | undefined;
  if (!opnet?.web3) {
    throw new Error('OPWallet not detected. Install the OPWallet Chrome extension to make transactions.');
  }
  return opnet;
}

async function getWalletAddress(): Promise<string> {
  const wallet = getOPWallet();
  const accounts = await wallet.requestAccounts();
  if (!accounts || accounts.length === 0) {
    throw new Error('No wallet accounts. Connect OPWallet first.');
  }
  return accounts[0];
}

/**
 * Build sender Address from OPWallet's public keys.
 * Used for simulation so access-controlled methods don't revert.
 */
async function getSenderAddress(): Promise<Address> {
  const wallet = getOPWallet();
  const legacyPubKey = await wallet.getPublicKey();

  let mldsaPubKey: string | undefined;
  try {
    mldsaPubKey = await wallet.web3.getMLDSAPublicKey();
  } catch {
    // ML-DSA not available — fallback to legacy key as identity
  }

  return Address.fromString(mldsaPubKey || legacyPubKey, legacyPubKey);
}

/**
 * Check that OPWallet is installed and the user is logged in.
 * Call this before any write operation to give a clear error early.
 */
async function ensureWalletConnected(): Promise<void> {
  const opnet = (window as unknown as Record<string, unknown>).opnet as OPWalletAPI | undefined;
  if (!opnet?.web3) {
    throw new Error('OPWallet not detected. Install the OPWallet Chrome extension to make transactions.');
  }
  const accounts = await opnet.requestAccounts();
  if (!accounts || accounts.length === 0) {
    throw new Error('Wallet not connected. Please unlock OPWallet and try again.');
  }
}

/**
 * Get a contract instance with sender set (for write simulations).
 * Falls back to no-sender if address construction fails.
 */
async function getWriteManagerContract() {
  try {
    const sender = await getSenderAddress();
    return getContract(
      OPNET_CONFIG.managerAddress,
      FatJarManagerAbi,
      getProvider(),
      opnetTestnet,
      sender,
    );
  } catch {
    // Fallback: contract without sender (works for createFund, contribute)
    return getManagerContract();
  }
}

/**
 * Simulate a contract call and send via OPWallet.
 * Pattern: simulate → get CallResult → sendTransaction (OPWallet auto-detected)
 */
async function simulateAndSend(
  callResult: CallResult,
): Promise<string> {
  const userAddress = await getWalletAddress();

  const receipt = await callResult.sendTransaction({
    signer: null,
    mldsaSigner: null,
    refundTo: userAddress,
    maximumAllowedSatToSpend: 100_000n, // generous for testnet
    network: opnetTestnet,
  });

  return receipt.transactionId;
}

/**
 * Fallback for access-controlled methods: encode calldata and send via
 * OPWallet's signAndBroadcastInteraction directly (bypasses simulation).
 */
async function encodeAndSend(
  methodName: string,
  args: unknown[],
): Promise<string> {
  const wallet = getOPWallet();
  const userAddress = await getWalletAddress();
  const contract = getManagerContract();

  const calldata = contract.encodeCalldata(methodName, args);

  const [, interactionResult] = await wallet.web3.signAndBroadcastInteraction({
    calldata: new Uint8Array(calldata),
    to: OPNET_CONFIG.managerAddress,
    from: userAddress,
    utxos: [],  // OPWallet provides UTXOs
    feeRate: 10,
    priorityFee: 0n,
    gasSatFee: 100_000n,  // generous for testnet
  });

  // Extract transaction ID from broadcast result
  const result = interactionResult as { result?: string; transactionId?: string };
  return result.transactionId || result.result || 'tx-submitted';
}

// ── Retry helper ─────────────────────────────────────────────────────

async function withRetry<T>(fn: () => Promise<T>, retries = 2, delayMs = 1000): Promise<T> {
  for (let attempt = 0; attempt <= retries; attempt++) {
    try {
      return await fn();
    } catch (err) {
      if (attempt === retries) throw err;
      console.warn(`[opnet] Retry ${attempt + 1}/${retries}...`, err);
      await new Promise((r) => setTimeout(r, delayMs * (attempt + 1)));
    }
  }
  throw new Error('unreachable');
}

// ── Vault cache (survives page navigation, not tab close) ────────────

const VAULT_CACHE_KEY = 'fatjar-vault-cache';

interface VaultCacheEntry {
  vaults: Array<{
    id: string; name: string; description: string; creator: string;
    totalRaised: string; unlockBlock: string; isClosed: boolean;
    withdrawn: string; contributorCount: number; goalAmount: string;
    beneficiary: string; isPublic: boolean;
  }>;
  timestamp: number;
}

function getCachedVaults(): Vault[] | null {
  try {
    const raw = sessionStorage.getItem(VAULT_CACHE_KEY);
    if (!raw) return null;
    const entry: VaultCacheEntry = JSON.parse(raw);
    // Cache valid for 2 minutes
    if (Date.now() - entry.timestamp > 120_000) return null;
    return entry.vaults.map((v) => ({
      ...v,
      totalRaised: BigInt(v.totalRaised),
      unlockBlock: BigInt(v.unlockBlock),
      withdrawn: BigInt(v.withdrawn),
      goalAmount: BigInt(v.goalAmount),
    }));
  } catch {
    return null;
  }
}

function cacheVaults(vaults: Vault[]): void {
  try {
    const entry: VaultCacheEntry = {
      vaults: vaults.map((v) => ({
        ...v,
        totalRaised: v.totalRaised.toString(),
        unlockBlock: v.unlockBlock.toString(),
        withdrawn: v.withdrawn.toString(),
        goalAmount: v.goalAmount.toString(),
      })),
      timestamp: Date.now(),
    };
    sessionStorage.setItem(VAULT_CACHE_KEY, JSON.stringify(entry));
  } catch { /* sessionStorage full or unavailable */ }
}

// ── Read methods ────────────────────────────────────────────────────

export async function getFundCount(): Promise<number> {
  const result = await withRetry(() => getManagerContract().getFundCount()) as CallResult<{ count: bigint }>;
  if (result.revert) throw new Error(`getFundCount reverted: ${result.revert}`);
  const count = toBigInt(result.properties.count);
  return Number(count);
}

export async function getFundDetails(fundId: string): Promise<Vault> {
  const id = parseFundId(fundId);
  const result = await withRetry(() => getManagerContract().getFundDetails(id)) as CallResult<{
    creator: bigint; totalRaised: bigint; unlockTimestamp: bigint; isClosed: bigint;
    withdrawn: bigint; contributorCount: bigint; goalAmount: bigint; beneficiary: bigint;
  }>;
  if (result.revert) throw new Error(`getFundDetails reverted: ${result.revert}`);
  const p = result.properties;
  const meta = getMetadataCache()[fundId] || SEED_JAR_NAMES[fundId];
  return {
    id: fundId,
    name: meta?.name || `Jar #${fundId}`,
    description: meta?.description || '',
    creator: toAddress(p.creator),
    totalRaised: toBigInt(p.totalRaised),
    unlockBlock: toBigInt(p.unlockTimestamp),
    isClosed: toBigInt(p.isClosed) !== 0n,
    withdrawn: toBigInt(p.withdrawn),
    contributorCount: Number(toBigInt(p.contributorCount)),
    goalAmount: toBigInt(p.goalAmount),
    beneficiary: toAddress(p.beneficiary),
    isPublic: true, // on-chain vaults are always public
  };
}

export async function getAllVaults(): Promise<Vault[]> {
  // Try fresh RPC fetch — fund IDs are 1-indexed on-chain
  try {
    const count = await getFundCount();
    if (count === 0) return [];
    const promises: Promise<Vault | null>[] = [];
    for (let i = 1; i <= count; i++) {
      promises.push(
        getFundDetails(String(i)).catch((err) => {
          console.warn(`Failed to fetch vault ${i}:`, err);
          return null;
        }),
      );
    }
    const results = await Promise.all(promises);
    const vaults = results.filter((v): v is Vault => v !== null);
    if (vaults.length > 0) {
      cacheVaults(vaults);
    }
    return vaults;
  } catch (err) {
    // RPC down — fall back to cached data
    const cached = getCachedVaults();
    if (cached) {
      console.warn('[opnet] RPC failed, using cached vault data', err);
      return cached;
    }
    throw err;
  }
}

export async function getContribution(fundId: string, contributor: string): Promise<bigint> {
  const resolved = await resolveAddress(contributor);
  const result = await getManagerContract().getContribution(parseFundId(fundId), resolved);
  if (result.revert) return 0n;
  return toBigInt(result.properties.amount);
}

export async function getContributionTokens(fundId: string, contributor: string): Promise<bigint> {
  const resolved = await resolveAddress(contributor);
  const result = await getManagerContract().getContributionTokens(parseFundId(fundId), resolved);
  if (result.revert) return 0n;
  return toBigInt(result.properties.tokens);
}

/**
 * Resolve a bech32 wallet address to an Address object for contract queries.
 * Falls back to raw string if resolution fails.
 */
async function resolveAddress(addr: string): Promise<Address | string> {
  try {
    return await getProvider().getPublicKeyInfo(addr, true);
  } catch {
    return addr;
  }
}

export async function getCreatorFundCount(creator: string): Promise<number> {
  const resolved = await resolveAddress(creator);
  const result = await getManagerContract().getCreatorFundCount(resolved);
  if (result.revert) return 0;
  return Number(toBigInt(result.properties.count));
}

export async function getCreatorFundByIndex(creator: string, index: number): Promise<string> {
  const resolved = await resolveAddress(creator);
  const result = await getManagerContract().getCreatorFundByIndex(resolved, BigInt(index));
  if (result.revert) throw new Error(`getCreatorFundByIndex reverted: ${result.revert}`);
  return String(toBigInt(result.properties.fundId));
}

export async function getTokenRate(): Promise<bigint> {
  const result = await getTokenContract().getTokenRate();
  if (result.revert) throw new Error(`getTokenRate reverted: ${result.revert}`);
  return toBigInt(result.properties.rate);
}

export async function getTotalBtcContributed(): Promise<bigint> {
  const result = await getTokenContract().getTotalBtcContributed();
  if (result.revert) return 0n;
  return toBigInt(result.properties.totalBtc);
}

export async function getTotalMinted(): Promise<bigint> {
  const result = await getTokenContract().totalSupply();
  if (result.revert) return 0n;
  return toBigInt(result.properties.totalSupply);
}

// No on-chain enumeration of contributors per vault
export async function getVaultContributions(_fundId: string): Promise<Contribution[]> {
  return [];
}

// ── Write methods ───────────────────────────────────────────────────

/**
 * Create a new jar on-chain.
 * Uses simulation path — createFund has no sender access check.
 */
export async function createVault(
  name: string,
  unlockBlock: bigint,
  goalAmount: bigint,
  beneficiary: string,
  _description: string = '',
  _isPublic: boolean = true,
): Promise<string> {
  await ensureWalletConnected();
  const contract = await getWriteManagerContract();

  // Resolve beneficiary: dead address for "no beneficiary"
  let beneficiaryAddr: Address;
  if (beneficiary && beneficiary !== ZERO_ADDRESS && beneficiary !== '') {
    try {
      beneficiaryAddr = await getProvider().getPublicKeyInfo(beneficiary, true);
    } catch {
      throw new Error(
        'Could not resolve beneficiary address. The address must have interacted with OPNet before.',
      );
    }
  } else {
    beneficiaryAddr = Address.dead();
  }

  // Cache name before sending — fund count is known pre-tx, avoids race condition
  let nextId: string | undefined;
  try {
    const count = await getFundCount();
    nextId = String(count + 1);
    saveMetadata(nextId, name, _description);
  } catch {
    // Non-critical — jar will show as "Jar #N" if this fails
  }

  // Simulate the call
  const result = await contract.createFund(
    name,
    unlockBlock,
    goalAmount,
    beneficiaryAddr,
  );

  // Send via OPWallet
  return simulateAndSend(result);
}

/**
 * Contribute BTC to a jar.
 * Uses simulation path — contribute has no sender access check.
 */
export async function contribute(fundId: string, satoshis: bigint): Promise<void> {
  await ensureWalletConnected();
  const contract = await getWriteManagerContract();

  const result = await contract.contribute(parseFundId(fundId), satoshis);

  await simulateAndSend(result);
}

/**
 * Withdraw from a jar. Creator or beneficiary only.
 * Uses simulation with sender first, falls back to direct OPWallet call.
 */
export async function withdraw(fundId: string): Promise<bigint> {
  await ensureWalletConnected();
  try {
    // Try simulation path (needs correct sender for access check)
    const contract = await getWriteManagerContract();
    const result = await contract.withdraw(parseFundId(fundId));
    await simulateAndSend(result);
    return toBigInt(result.properties?.amount ?? 0n);
  } catch (simError) {
    // Fallback: encode calldata and send directly via OPWallet
    console.warn('Simulation failed, trying direct OPWallet call:', simError);
    await encodeAndSend('withdraw', [parseFundId(fundId)]);
    return 0n; // can't get return value from direct call
  }
}

/**
 * Refund contribution from a failed goal-based jar.
 * Uses simulation with sender first, falls back to direct OPWallet call.
 */
export async function refund(fundId: string): Promise<bigint> {
  await ensureWalletConnected();
  try {
    const contract = await getWriteManagerContract();
    const result = await contract.refund(parseFundId(fundId));
    await simulateAndSend(result);
    return toBigInt(result.properties?.amount ?? 0n);
  } catch (simError) {
    console.warn('Simulation failed, trying direct OPWallet call:', simError);
    await encodeAndSend('refund', [parseFundId(fundId)]);
    return 0n;
  }
}

/**
 * Close a jar (prevent new contributions). Creator only.
 * Uses simulation with sender first, falls back to direct OPWallet call.
 */
export async function closeFund(fundId: string): Promise<void> {
  await ensureWalletConnected();
  try {
    const contract = await getWriteManagerContract();
    const result = await contract.closeFund(parseFundId(fundId));
    await simulateAndSend(result);
  } catch (simError) {
    console.warn('Simulation failed, trying direct OPWallet call:', simError);
    await encodeAndSend('closeFund', [parseFundId(fundId)]);
  }
}

/**
 * Delete an empty jar. Creator only.
 * Uses simulation with sender first, falls back to direct OPWallet call.
 */
export async function deleteFund(fundId: string): Promise<void> {
  await ensureWalletConnected();
  try {
    const contract = await getWriteManagerContract();
    const result = await contract.deleteFund(parseFundId(fundId));
    await simulateAndSend(result);
  } catch (simError) {
    console.warn('Simulation failed, trying direct OPWallet call:', simError);
    await encodeAndSend('deleteFund', [parseFundId(fundId)]);
  }
}
