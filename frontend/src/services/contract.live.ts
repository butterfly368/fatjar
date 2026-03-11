/**
 * Live contract service — reads from OPNet testnet via JSON-RPC.
 *
 * Write methods are stubs (throw) until OPWallet signing is wired.
 * Fund names are not stored on-chain (event-only), so we show "Jar #N".
 */

import {
  JSONRpcProvider,
  getContract,
  ABIDataTypes,
  BitcoinAbiTypes,
  OP_NET_ABI,
} from 'opnet';
import type { BitcoinInterfaceAbi } from 'opnet';
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

// ── ABI definitions (inline to avoid JSON import issues) ────────────
const FatJarManagerAbi: BitcoinInterfaceAbi = [
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

// ── Helpers ─────────────────────────────────────────────────────────
function toBigInt(val: unknown): bigint {
  if (typeof val === 'bigint') return val;
  if (typeof val === 'number') return BigInt(val);
  if (typeof val === 'string') return BigInt(val);
  return 0n;
}

function toAddress(val: unknown): string {
  if (typeof val === 'string' && val.length > 0) return val;
  return ZERO_ADDRESS;
}

// ── Read methods ────────────────────────────────────────────────────

export async function getFundCount(): Promise<number> {
  const result = await getManagerContract().getFundCount();
  if (result.revert) throw new Error(`getFundCount reverted: ${result.revert}`);
  const count = toBigInt(result.properties.count);
  return Number(count);
}

export async function getFundDetails(fundId: string): Promise<Vault> {
  const result = await getManagerContract().getFundDetails(BigInt(fundId));
  if (result.revert) throw new Error(`getFundDetails reverted: ${result.revert}`);
  const p = result.properties;
  return {
    id: fundId,
    name: `Jar #${fundId}`, // names stored via events only
    description: '', // descriptions stored via events only
    creator: toAddress(p.creator),
    totalRaised: toBigInt(p.totalRaised),
    unlockBlock: toBigInt(p.unlockTimestamp),
    isClosed: toBigInt(p.isClosed) !== 0n,
    withdrawn: toBigInt(p.withdrawn),
    contributorCount: Number(toBigInt(p.contributorCount)),
    goalAmount: toBigInt(p.goalAmount),
    beneficiary: toAddress(p.beneficiary),
  };
}

export async function getAllVaults(): Promise<Vault[]> {
  const count = await getFundCount();
  if (count === 0) return [];
  const promises: Promise<Vault>[] = [];
  for (let i = 1; i <= count; i++) {
    promises.push(getFundDetails(String(i)));
  }
  return Promise.all(promises);
}

export async function getContribution(fundId: string, contributor: string): Promise<bigint> {
  const result = await getManagerContract().getContribution(BigInt(fundId), contributor);
  if (result.revert) return 0n;
  return toBigInt(result.properties.amount);
}

export async function getContributionTokens(fundId: string, contributor: string): Promise<bigint> {
  const result = await getManagerContract().getContributionTokens(BigInt(fundId), contributor);
  if (result.revert) return 0n;
  return toBigInt(result.properties.tokens);
}

export async function getCreatorFundCount(creator: string): Promise<number> {
  const result = await getManagerContract().getCreatorFundCount(creator);
  if (result.revert) return 0;
  return Number(toBigInt(result.properties.count));
}

export async function getCreatorFundByIndex(creator: string, index: number): Promise<string> {
  const result = await getManagerContract().getCreatorFundByIndex(creator, BigInt(index));
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

// ── Write stubs (need OPWallet for signing) ─────────────────────────

export async function createVault(
  _name: string,
  _unlockBlock: bigint,
  _goalAmount: bigint,
  _beneficiary: string,
  _description: string = '',
): Promise<string> {
  throw new Error('Write operations require OPWallet. Use demo mode for testing.');
}

export async function contribute(_fundId: string, _satoshis: bigint): Promise<void> {
  throw new Error('Write operations require OPWallet. Use demo mode for testing.');
}

export async function withdraw(_fundId: string): Promise<bigint> {
  throw new Error('Write operations require OPWallet. Use demo mode for testing.');
}

export async function refund(_fundId: string): Promise<bigint> {
  throw new Error('Write operations require OPWallet. Use demo mode for testing.');
}

export async function closeFund(_fundId: string): Promise<void> {
  throw new Error('Write operations require OPWallet. Use demo mode for testing.');
}

export async function deleteFund(_fundId: string): Promise<void> {
  throw new Error('Write operations require OPWallet. Use demo mode for testing.');
}
