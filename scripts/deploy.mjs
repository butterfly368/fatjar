/**
 * FatJar Contract Deployment Script
 *
 * Deploys FatJarToken and FatJarManager to OPNet testnet,
 * then links them via setManager/setTokenAddress calls.
 *
 * Usage:
 *   MNEMONIC="your 24 words here" node deploy.mjs
 *
 * Steps:
 *   1. Deploy FatJarToken → get address + pubkey
 *   2. Deploy FatJarManager → get address + pubkey
 *   3. Call Token.setManager(managerAddress)
 *   4. Call Manager.setTokenAddress(tokenAddress)
 */

import fs from 'fs';
import {
  Mnemonic,
  TransactionFactory,
  OPNetLimitedProvider,
  BinaryWriter,
  ABICoder,
  Address,
  AddressTypes,
} from '@btc-vision/transaction';
import { networks } from '@btc-vision/bitcoin';
import { JSONRpcProvider } from 'opnet';

// ── Config ──────────────────────────────────────────────────────────
const NETWORK = networks.opnetTestnet;
const RPC_URL = 'https://testnet.opnet.org';
const FEE_RATE = 10; // sat/vB (bumped from 2 — low fees get dropped)
const PRIORITY_FEE = 1000n;
const GAS_SAT_FEE = 1000n;

const TOKEN_WASM = '../contracts/build/FatJarToken.wasm';
const MANAGER_WASM = '../contracts/build/FatJarManager.wasm';

// ── Helpers ─────────────────────────────────────────────────────────
function loadWasm(path) {
  const resolved = new URL(path, import.meta.url);
  return new Uint8Array(fs.readFileSync(resolved));
}

async function fetchUtxos(provider, address, amount = 500_000n) {
  return provider.fetchUTXO({
    address,
    minAmount: 330n,
    requestedAmount: amount,
  });
}

function sleep(ms) {
  return new Promise((r) => setTimeout(r, ms));
}

// ── Main ────────────────────────────────────────────────────────────
async function main() {
  const mnemonicPhrase = process.env.MNEMONIC;
  if (!mnemonicPhrase) {
    console.error('ERROR: Set MNEMONIC environment variable');
    console.error('  MNEMONIC="word1 word2 ... word24" node deploy.mjs');
    process.exit(1);
  }

  // Setup wallet
  console.log('Setting up wallet...');
  const mnemonic = new Mnemonic(mnemonicPhrase, '', NETWORK);
  const wallet = mnemonic.deriveOPWallet(AddressTypes.P2TR, 0);
  console.log('  P2TR address:', wallet.p2tr);

  // Setup providers
  const provider = new OPNetLimitedProvider(RPC_URL);
  const rpcProvider = new JSONRpcProvider({ url: RPC_URL, network: NETWORK });
  const factory = new TransactionFactory();

  // ── Already-deployed contract addresses ────────────────────────
  // Set these to skip re-deployment (Steps 1 & 2)
  const EXISTING_TOKEN_ADDRESS = process.env.TOKEN_ADDRESS || '';
  const EXISTING_TOKEN_PUBKEY = process.env.TOKEN_PUBKEY || '';
  const EXISTING_MANAGER_ADDRESS = process.env.MANAGER_ADDRESS || '';
  const EXISTING_MANAGER_PUBKEY = process.env.MANAGER_PUBKEY || '';

  let TOKEN_ADDRESS, TOKEN_PUBKEY, MANAGER_ADDRESS, MANAGER_PUBKEY;

  if (EXISTING_TOKEN_ADDRESS && EXISTING_MANAGER_ADDRESS) {
    console.log('\n=== Skipping deployment — using existing contracts ===');
    TOKEN_ADDRESS = EXISTING_TOKEN_ADDRESS;
    TOKEN_PUBKEY = EXISTING_TOKEN_PUBKEY;
    MANAGER_ADDRESS = EXISTING_MANAGER_ADDRESS;
    MANAGER_PUBKEY = EXISTING_MANAGER_PUBKEY;
    console.log('  TOKEN ADDRESS:', TOKEN_ADDRESS);
    console.log('  MANAGER ADDRESS:', MANAGER_ADDRESS);
  } else {
    // ── Step 1: Deploy FatJarToken ──────────────────────────────────
    console.log('\n=== Step 1: Deploy FatJarToken ===');
    const tokenBytecode = loadWasm(TOKEN_WASM);
    console.log(`  Bytecode size: ${tokenBytecode.length} bytes`);

    const utxos1 = await fetchUtxos(provider, wallet.p2tr);
    console.log(`  UTXOs found: ${utxos1.length}`);

    const challenge1 = await rpcProvider.getChallenge();
    console.log('  Challenge fetched');

    const tokenResult = await factory.signDeployment({
      signer: wallet.keypair,
      mldsaSigner: wallet.mldsaKeypair,
      network: NETWORK,
      from: wallet.p2tr,
      bytecode: tokenBytecode,
      utxos: utxos1,
      challenge: challenge1,
      feeRate: FEE_RATE,
      priorityFee: PRIORITY_FEE,
      gasSatFee: GAS_SAT_FEE,
    });

    console.log('  Broadcasting funding TX...');
    await provider.broadcastTransaction(tokenResult.transaction[0], false);
    console.log('  Broadcasting deployment TX...');
    await provider.broadcastTransaction(tokenResult.transaction[1], false);

    TOKEN_ADDRESS = tokenResult.contractAddress;
    TOKEN_PUBKEY = tokenResult.contractPubKey;
    console.log('  TOKEN ADDRESS:', TOKEN_ADDRESS);
    console.log('  TOKEN PUBKEY:', TOKEN_PUBKEY);

    // Wait for confirmation
    console.log('  Waiting 15s for mempool...');
    await sleep(15000);

    // ── Step 2: Deploy FatJarManager ────────────────────────────────
    console.log('\n=== Step 2: Deploy FatJarManager ===');
    const managerBytecode = loadWasm(MANAGER_WASM);
    console.log(`  Bytecode size: ${managerBytecode.length} bytes`);

    const utxos2 = await fetchUtxos(provider, wallet.p2tr);
    console.log(`  UTXOs found: ${utxos2.length}`);

    const challenge2 = await rpcProvider.getChallenge();
    console.log('  Challenge fetched');

    const managerResult = await factory.signDeployment({
      signer: wallet.keypair,
      mldsaSigner: wallet.mldsaKeypair,
      network: NETWORK,
      from: wallet.p2tr,
      bytecode: managerBytecode,
      utxos: utxos2,
      challenge: challenge2,
      feeRate: FEE_RATE,
      priorityFee: PRIORITY_FEE,
      gasSatFee: GAS_SAT_FEE,
    });

    console.log('  Broadcasting funding TX...');
    await provider.broadcastTransaction(managerResult.transaction[0], false);
    console.log('  Broadcasting deployment TX...');
    await provider.broadcastTransaction(managerResult.transaction[1], false);

    MANAGER_ADDRESS = managerResult.contractAddress;
    MANAGER_PUBKEY = managerResult.contractPubKey;
    console.log('  MANAGER ADDRESS:', MANAGER_ADDRESS);
    console.log('  MANAGER PUBKEY:', MANAGER_PUBKEY);

    console.log('  Waiting 15s for mempool...');
    await sleep(15000);
  }

  // ── Step 3: Call Token.setManager(managerAddress) ───────────────
  console.log('\n=== Step 3: Call Token.setManager() ===');
  const abiCoder = new ABICoder();
  const setManagerSelector = abiCoder.encodeSelector('setManager');

  // Convert pubkey hex strings to raw bytes for writeAddress
  const managerPubKeyBytes = new Uint8Array(Buffer.from(MANAGER_PUBKEY.replace(/^0x/, ''), 'hex'));
  const tokenPubKeyBytes = new Uint8Array(Buffer.from(TOKEN_PUBKEY.replace(/^0x/, ''), 'hex'));

  const calldata3 = new BinaryWriter();
  calldata3.writeSelector(Number('0x' + setManagerSelector));
  calldata3.writeAddress(managerPubKeyBytes);

  const utxos3 = await fetchUtxos(provider, wallet.p2tr, 200_000n);
  const challenge3 = await rpcProvider.getChallenge();

  const setManagerResult = await factory.signInteraction({
    signer: wallet.keypair,
    mldsaSigner: wallet.mldsaKeypair,
    network: NETWORK,
    from: wallet.p2tr,
    to: TOKEN_ADDRESS,
    calldata: calldata3.getBuffer(),
    utxos: utxos3,
    challenge: challenge3,
    contract: TOKEN_PUBKEY.replace(/^0x/, ''),
    feeRate: FEE_RATE,
    priorityFee: PRIORITY_FEE,
    gasSatFee: GAS_SAT_FEE,
  });

  if (setManagerResult.fundingTransaction) {
    await provider.broadcastTransaction(setManagerResult.fundingTransaction, false);
  }
  await provider.broadcastTransaction(setManagerResult.interactionTransaction, false);
  console.log('  setManager() called successfully');

  console.log('  Waiting 15s for mempool...');
  await sleep(15000);

  // ── Step 4: Call Manager.setTokenAddress(tokenAddress) ──────────
  console.log('\n=== Step 4: Call Manager.setTokenAddress() ===');
  const setTokenSelector = abiCoder.encodeSelector('setTokenAddress');

  const calldata4 = new BinaryWriter();
  calldata4.writeSelector(Number('0x' + setTokenSelector));
  calldata4.writeAddress(tokenPubKeyBytes);

  const utxos4 = await fetchUtxos(provider, wallet.p2tr, 200_000n);
  const challenge4 = await rpcProvider.getChallenge();

  const setTokenResult = await factory.signInteraction({
    signer: wallet.keypair,
    mldsaSigner: wallet.mldsaKeypair,
    network: NETWORK,
    from: wallet.p2tr,
    to: MANAGER_ADDRESS,
    calldata: calldata4.getBuffer(),
    utxos: utxos4,
    challenge: challenge4,
    contract: MANAGER_PUBKEY.replace(/^0x/, ''),
    feeRate: FEE_RATE,
    priorityFee: PRIORITY_FEE,
    gasSatFee: GAS_SAT_FEE,
  });

  if (setTokenResult.fundingTransaction) {
    await provider.broadcastTransaction(setTokenResult.fundingTransaction, false);
  }
  await provider.broadcastTransaction(setTokenResult.interactionTransaction, false);
  console.log('  setTokenAddress() called successfully');

  // ── Summary ─────────────────────────────────────────────────────
  console.log('\n========================================');
  console.log('DEPLOYMENT COMPLETE');
  console.log('========================================');
  console.log('Token Address:   ', TOKEN_ADDRESS);
  console.log('Token PubKey:    ', TOKEN_PUBKEY);
  console.log('Manager Address: ', MANAGER_ADDRESS);
  console.log('Manager PubKey:  ', MANAGER_PUBKEY);
  console.log('========================================');
  console.log('Save these addresses! They are needed for the frontend.');

  // Write addresses to file for easy reference
  const addresses = {
    token: { address: TOKEN_ADDRESS, pubkey: TOKEN_PUBKEY },
    manager: { address: MANAGER_ADDRESS, pubkey: MANAGER_PUBKEY },
    deployer: wallet.p2tr,
    network: 'testnet',
    deployedAt: new Date().toISOString(),
  };
  fs.writeFileSync(
    new URL('./deployed-addresses.json', import.meta.url),
    JSON.stringify(addresses, null, 2),
  );
  console.log('\nAddresses saved to scripts/deployed-addresses.json');
}

main().catch((err) => {
  console.error('Deployment failed:', err);
  process.exit(1);
});
