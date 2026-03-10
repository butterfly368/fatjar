/**
 * Contract service facade — auto-detects live chain vs mock mode.
 *
 * Detection order:
 *   1. URL param: ?live=true  → force live
 *   2. URL param: ?mock=true  → force mock
 *   3. Auto: ping RPC, use live if reachable, else mock
 *
 * Same function signatures as before — no page changes needed.
 */

import type { Vault, Contribution } from '../types';
import * as mock from './contract.mock';
import * as live from './contract.live';
import { OPNET_CONFIG } from './opnet-config';

// ── Mode detection ──────────────────────────────────────────────────

type Mode = 'live' | 'mock' | 'pending';
let currentMode: Mode = 'pending';
let modePromise: Promise<Mode> | null = null;

function getUrlMode(): 'live' | 'mock' | null {
  if (typeof window === 'undefined') return null;
  const params = new URLSearchParams(window.location.search);
  if (params.get('live') === 'true') return 'live';
  if (params.get('mock') === 'true') return 'mock';
  return null;
}

async function probeRpc(): Promise<boolean> {
  try {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 3000);
    const res = await fetch(`${OPNET_CONFIG.rpcUrl}/api/v1/json-rpc`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ jsonrpc: '2.0', method: 'btc_blockNumber', params: [], id: 1 }),
      signal: controller.signal,
    });
    clearTimeout(timeout);
    return res.ok;
  } catch {
    return false;
  }
}

async function detectMode(): Promise<Mode> {
  const forced = getUrlMode();
  if (forced) {
    currentMode = forced;
    return forced;
  }

  const rpcAlive = await probeRpc();
  currentMode = rpcAlive ? 'live' : 'mock';
  return currentMode;
}

function ensureMode(): Promise<Mode> {
  if (currentMode !== 'pending') return Promise.resolve(currentMode);
  if (!modePromise) modePromise = detectMode();
  return modePromise;
}

export function getMode(): Mode {
  return currentMode;
}

export async function getResolvedMode(): Promise<'live' | 'mock'> {
  const mode = await ensureMode();
  return mode as 'live' | 'mock';
}

// ── Delegating methods ──────────────────────────────────────────────

async function svc() {
  const mode = await ensureMode();
  return mode === 'live' ? live : mock;
}

export async function getFundCount(): Promise<number> {
  return (await svc()).getFundCount();
}

export async function getFundDetails(fundId: string): Promise<Vault> {
  return (await svc()).getFundDetails(fundId);
}

export async function getAllVaults(): Promise<Vault[]> {
  return (await svc()).getAllVaults();
}

export async function getVaultContributions(fundId: string): Promise<Contribution[]> {
  return (await svc()).getVaultContributions(fundId);
}

export async function getContribution(fundId: string, contributor: string): Promise<bigint> {
  return (await svc()).getContribution(fundId, contributor);
}

export async function getContributionTokens(fundId: string, contributor: string): Promise<bigint> {
  return (await svc()).getContributionTokens(fundId, contributor);
}

export async function getTokenRate(): Promise<bigint> {
  return (await svc()).getTokenRate();
}

export async function getTotalMinted(): Promise<bigint> {
  return (await svc()).getTotalMinted();
}

export async function getTotalBtcContributed(): Promise<bigint> {
  return (await svc()).getTotalBtcContributed();
}

export async function getCreatorFundCount(creator: string): Promise<number> {
  return (await svc()).getCreatorFundCount(creator);
}

export async function getCreatorFundByIndex(creator: string, index: number): Promise<string> {
  return (await svc()).getCreatorFundByIndex(creator, index);
}

// ── Write methods (mock handles them; live throws until OPWallet) ───

export async function createVault(
  name: string,
  unlockBlock: bigint,
  goalAmount: bigint,
  beneficiary: string,
): Promise<string> {
  return (await svc()).createVault(name, unlockBlock, goalAmount, beneficiary);
}

export async function contribute(fundId: string, satoshis: bigint): Promise<void> {
  return (await svc()).contribute(fundId, satoshis);
}

export async function withdraw(fundId: string): Promise<bigint> {
  return (await svc()).withdraw(fundId);
}

export async function refund(fundId: string): Promise<bigint> {
  return (await svc()).refund(fundId);
}

export async function closeFund(fundId: string): Promise<void> {
  return (await svc()).closeFund(fundId);
}
