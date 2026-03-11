import { useState } from 'react';
import {
  JSONRpcProvider,
  getContract,
  ABIDataTypes,
  BitcoinAbiTypes,
  OP_NET_ABI,
} from 'opnet';
import type { BitcoinInterfaceAbi } from 'opnet';
import { Address } from '@btc-vision/transaction';
import { OPNET_CONFIG } from '../../services/opnet-config';
import './Admin.css';

function pubKeyToAddress(hexPubKey: string): Address {
  const hex = hexPubKey.replace(/^0x/, '');
  const bytes = new Uint8Array(hex.match(/.{2}/g)!.map(b => parseInt(b, 16)));
  return new Address(bytes);
}

const opnetTestnet = {
  messagePrefix: '\x18Bitcoin Signed Message:\n',
  bech32: 'opt',
  bech32Opnet: 'opt',
  bip32: { public: 0x043587cf, private: 0x04358394 },
  pubKeyHash: 0x6f,
  scriptHash: 0xc4,
  wif: 0xef,
};

// Token ABI with setManager
const TokenLinkAbi: BitcoinInterfaceAbi = [
  {
    name: 'setManager',
    inputs: [{ name: 'managerAddress', type: ABIDataTypes.ADDRESS }],
    outputs: [],
    type: BitcoinAbiTypes.Function,
  },
  ...OP_NET_ABI,
];

// Manager ABI with setTokenAddress
const ManagerLinkAbi: BitcoinInterfaceAbi = [
  {
    name: 'setTokenAddress',
    inputs: [{ name: 'tokenAddress', type: ABIDataTypes.ADDRESS }],
    outputs: [],
    type: BitcoinAbiTypes.Function,
  },
  ...OP_NET_ABI,
];

interface OPWalletAPI {
  requestAccounts(): Promise<string[]>;
  getPublicKey(): Promise<string>;
  web3: {
    getMLDSAPublicKey(): Promise<string>;
    signAndBroadcastInteraction(params: unknown): Promise<unknown>;
  };
}

function getOPWallet(): OPWalletAPI {
  const opnet = (window as unknown as Record<string, unknown>).opnet as OPWalletAPI | undefined;
  if (!opnet?.web3) throw new Error('OPWallet not detected');
  return opnet;
}

async function getSenderAddress(): Promise<Address> {
  const wallet = getOPWallet();
  const legacyPubKey = await wallet.getPublicKey();
  let mldsaPubKey: string | undefined;
  try {
    mldsaPubKey = await wallet.web3.getMLDSAPublicKey();
  } catch {
    // ML-DSA not available
  }
  return Address.fromString(mldsaPubKey || legacyPubKey, legacyPubKey);
}

export function Admin() {
  const [status, setStatus] = useState<string>('');
  const [loading, setLoading] = useState(false);

  const provider = new JSONRpcProvider(OPNET_CONFIG.rpcUrl, opnetTestnet);

  async function linkTokenToManager() {
    setLoading(true);
    setStatus('Step 1/2: Calling Token.setManager(managerAddress)...');
    try {
      const wallet = getOPWallet();
      const accounts = await wallet.requestAccounts();
      if (!accounts.length) throw new Error('Connect wallet first');

      // Convert manager pubkey to Address object
      const managerAddr = pubKeyToAddress(OPNET_CONFIG.managerPubKey);

      const sender = await getSenderAddress();
      const tokenContract = getContract(
        OPNET_CONFIG.tokenAddress,
        TokenLinkAbi,
        provider,
        opnetTestnet,
        sender,
      );

      // Simulate
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const result = await (tokenContract as any).setManager(managerAddr);

      // Send via OPWallet
      const receipt = await result.sendTransaction({
        signer: null,
        mldsaSigner: null,
        refundTo: accounts[0],
        maximumAllowedSatToSpend: 100_000n,
        network: opnetTestnet,
      });

      setStatus(`Step 1/2 DONE! Token.setManager tx: ${receipt.transactionId}`);
    } catch (err) {
      setStatus(`Step 1 FAILED: ${(err as Error).message}`);
    }
    setLoading(false);
  }

  async function linkManagerToToken() {
    setLoading(true);
    setStatus('Step 2/2: Calling Manager.setTokenAddress(tokenAddress)...');
    try {
      const wallet = getOPWallet();
      const accounts = await wallet.requestAccounts();
      if (!accounts.length) throw new Error('Connect wallet first');

      // Convert token pubkey to Address object
      const tokenAddr = pubKeyToAddress(OPNET_CONFIG.tokenPubKey);

      const sender = await getSenderAddress();
      const managerContract = getContract(
        OPNET_CONFIG.managerAddress,
        ManagerLinkAbi,
        provider,
        opnetTestnet,
        sender,
      );

      // Simulate
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const result = await (managerContract as any).setTokenAddress(tokenAddr);

      // Send via OPWallet
      const receipt = await result.sendTransaction({
        signer: null,
        mldsaSigner: null,
        refundTo: accounts[0],
        maximumAllowedSatToSpend: 100_000n,
        network: opnetTestnet,
      });

      setStatus(`Step 2/2 DONE! Manager.setTokenAddress tx: ${receipt.transactionId}`);
    } catch (err) {
      setStatus(`Step 2 FAILED: ${(err as Error).message}`);
    }
    setLoading(false);
  }

  return (
    <div className="admin-page">
      <h1>Admin — Contract Linking</h1>
      <p className="admin-info">
        After deploying both contracts, run these two steps (once) to link them.
        Must be called by the deployer wallet.
      </p>

      <div className="admin-addresses">
        <p><strong>Token:</strong> {OPNET_CONFIG.tokenAddress}</p>
        <p><strong>Manager:</strong> {OPNET_CONFIG.managerAddress}</p>
      </div>

      <div className="admin-actions">
        <button
          onClick={linkTokenToManager}
          disabled={loading}
          className="admin-btn"
        >
          Step 1: Token.setManager(manager)
        </button>

        <button
          onClick={linkManagerToToken}
          disabled={loading}
          className="admin-btn"
        >
          Step 2: Manager.setTokenAddress(token)
        </button>
      </div>

      {status && (
        <pre className="admin-status">{status}</pre>
      )}
    </div>
  );
}
