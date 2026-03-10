import type { Fund, Contribution, BondingCurveTier, Stat, Feature, Step } from '../types';

export const MOCK_STATS: Stat[] = [
  { label: 'Total Value Locked', value: '4.82', accent: 'BTC' },
  { label: 'Active Jars', value: '47' },
  { label: '$FJAR Minted', value: '2.4M' },
  { label: 'Current Rate', value: '120K', accent: '/BTC' },
];

export const MOCK_FEATURES: Feature[] = [
  {
    title: 'Create a Jar',
    description:
      'Name it anything \u2014 a college fund, wedding savings, emergency reserve. Set an optional time-lock so funds stay safe until the right moment.',
    meta: 'Zero setup fees',
  },
  {
    title: 'Share & Contribute BTC',
    description:
      'Share the link with family and friends. Anyone with OPWallet can contribute BTC directly. Every contribution mints $FJAR tokens to the sender.',
    meta: '100% to the fund',
  },
  {
    title: 'Earn $FJAR via Bonding Curve',
    description:
      'The earlier you contribute, the more tokens you earn. The bonding curve reduces token rate as total platform BTC grows. Early believers win.',
    meta: '120K tokens/BTC at genesis',
  },
  {
    title: 'Withdraw Anytime',
    description:
      'Fund creators withdraw when ready, or let the time-lock hold it. No platform fees, no middlemen. Bitcoin-native settlement.',
    meta: 'Optional time-lock',
  },
  {
    title: 'Trade $FJAR on Any OPNet DEX',
    description:
      '$FJAR follows the OP20 standard. Fully tradeable on any OPNet-compatible decentralized exchange. No lock-up on tokens.',
    meta: 'OP20 Standard',
  },
];

export const MOCK_STEPS: Step[] = [
  {
    number: 'Step 01',
    title: 'Create',
    description:
      'Name your jar. Set a description and optional unlock date. Deploy your piggy bank on Bitcoin L1.',
  },
  {
    number: 'Step 02',
    title: 'Share',
    description:
      'Send the link to contributors. Anyone with OPWallet can add BTC and earn $FJAR tokens.',
  },
  {
    number: 'Step 03',
    title: 'Grow',
    description:
      'Watch contributions stack. Early givers earn more tokens. Withdraw when ready.',
  },
];

export const MOCK_TIERS: BondingCurveTier[] = [
  { label: 'Early', threshold: '(now)', rate: '120K' },
  { label: 'After', threshold: '5 BTC', rate: '80K', change: '-33%' },
  { label: 'After', threshold: '20 BTC', rate: '40K', change: '-67%' },
  { label: 'After', threshold: '100 BTC', rate: '15K', change: '-88%' },
];

export const MOCK_FUNDS: Fund[] = [
  {
    id: 1,
    name: 'College Fund for Maya',
    description: 'Saving for Maya\u2019s university tuition. Every sat counts toward her future.',
    creator: 'bc1q...xyz1',
    totalRaised: 150000000, // 1.5 BTC
    unlockTimestamp: 0,
    isClosed: false,
    isPublic: true,
    withdrawn: 0,
    contributorCount: 12,
  },
  {
    id: 2,
    name: 'Wedding Savings Jar',
    description: 'Help us celebrate! Contributing to our dream wedding in 2027.',
    creator: 'bc1q...abc2',
    totalRaised: 82000000, // 0.82 BTC
    unlockTimestamp: 900000,
    isClosed: false,
    isPublic: false,
    withdrawn: 0,
    contributorCount: 8,
  },
  {
    id: 3,
    name: 'Emergency Community Fund',
    description: 'Community-run emergency fund for unexpected expenses. Open to all.',
    creator: 'bc1q...def3',
    totalRaised: 250000000, // 2.5 BTC
    unlockTimestamp: 0,
    isClosed: false,
    isPublic: true,
    withdrawn: 0,
    contributorCount: 27,
  },
];

export const MOCK_CONTRIBUTIONS: Contribution[] = [
  { fundId: 1, contributor: 'bc1q...aaa1', amount: 50000000, tokensMinted: 6000000, timestamp: Date.now() - 86400000 },
  { fundId: 1, contributor: 'bc1q...bbb2', amount: 25000000, tokensMinted: 2800000, timestamp: Date.now() - 43200000 },
  { fundId: 1, contributor: 'bc1q...ccc3', amount: 10000000, tokensMinted: 1100000, timestamp: Date.now() - 3600000 },
  { fundId: 1, contributor: 'bc1q...ddd4', amount: 5000000, tokensMinted: 540000, timestamp: Date.now() - 1800000 },
];

export const TAGS = ['OPNet', 'OP20 Token', 'Bonding Curve', 'Time-Lock'];
