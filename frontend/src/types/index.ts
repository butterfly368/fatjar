export interface Fund {
  id: number;
  name: string;
  description: string;
  creator: string;
  totalRaised: number; // satoshis
  unlockTimestamp: number; // block number, 0 = no lock
  isClosed: boolean;
  isPublic: boolean;
  withdrawn: number; // satoshis
  contributorCount: number;
}

export interface Contribution {
  fundId: number;
  contributor: string;
  amount: number; // satoshis
  tokensMinted: number;
  timestamp: number;
}

export interface BondingCurveTier {
  label: string;
  threshold: string;
  rate: string;
  change?: string;
}

export interface Stat {
  label: string;
  value: string;
  accent?: string;
}

export interface Feature {
  title: string;
  description: string;
  meta: string;
}

export interface Step {
  number: string;
  title: string;
  description: string;
}

export interface WalletState {
  connected: boolean;
  address: string | null;
  balance: number | null; // satoshis
  connect: () => Promise<void>;
  disconnect: () => void;
}
