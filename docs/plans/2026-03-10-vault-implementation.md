# FatJar Vault Redesign — Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Implement the vault redesign (goalAmount, beneficiary, refund with burn) in contracts and update the frontend for competition submission by March 13.

**Architecture:** Two existing AssemblyScript contracts (FatJarToken + FatJarManager) get additive changes — new params, new methods, new events. Existing React frontend (3 pages + 53 files) gets updated copy, new form fields, contextual actions, and a new Dashboard page. No framework changes.

**Tech Stack:** AssemblyScript/OPNet (contracts), React + TypeScript + Vite + CSS (frontend), OPWallet (wallet)

**Design doc:** `docs/plans/2026-03-10-vault-redesign.md`

**Deadline:** March 13, 2026 (competition submission)

---

## Task 1: Token Contract — Add burnForRefund + Event

**Files:**
- Modify: `contracts/src/fatjar-token/events/FatJarTokenEvents.ts`
- Modify: `contracts/src/fatjar-token/FatJarToken.ts`

**Step 1: Add TokensBurnedEvent**

In `contracts/src/fatjar-token/events/FatJarTokenEvents.ts`, add after the existing `ContributionMintedEvent`:

```typescript
@final
export class TokensBurnedEvent extends NetEvent {
    constructor(contributor: Address, tokensBurned: u256) {
        const data: BytesWriter = new BytesWriter(
            ADDRESS_BYTE_LENGTH + U256_BYTE_LENGTH,
        );
        data.writeAddress(contributor);
        data.writeU256(tokensBurned);

        super('TokensBurned', data);
    }
}
```

**Step 2: Add burnForRefund method to FatJarToken**

In `contracts/src/fatjar-token/FatJarToken.ts`, add after the `remainingSupply` method:

```typescript
/**
 * Burn tokens from a contributor during refund. Only callable by Manager.
 * D1: totalBtcContributed is NOT decremented — curve reflects all-time activity.
 */
@method(
    {
        name: 'contributor',
        type: ABIDataTypes.ADDRESS,
    },
    {
        name: 'tokenAmount',
        type: ABIDataTypes.UINT256,
    },
)
@emit('TokensBurned')
@returns()
public burnForRefund(calldata: Calldata): BytesWriter {
    this.onlyManager();

    const contributor: Address = calldata.readAddress();
    const tokenAmount: u256 = calldata.readU256();

    if (u256.eq(tokenAmount, u256.Zero)) {
        throw new Revert('Zero burn amount');
    }

    // Burn tokens from contributor (OP20._burn checks balance internally)
    this._burn(contributor, tokenAmount);

    this.emitEvent(new TokensBurnedEvent(contributor, tokenAmount));

    return new BytesWriter(0);
}
```

Import `TokensBurnedEvent` at the top of `FatJarToken.ts`:
```typescript
import { ContributionMintedEvent } from './events/FatJarTokenEvents';
// becomes:
import { ContributionMintedEvent, TokensBurnedEvent } from './events/FatJarTokenEvents';
```

**Step 3: Build token contract**

Run: `cd /Users/mikazaruj/CascadeProjects/fatjar/contracts && npm run build:fatjar-token`
Expected: Successful WASM build, no errors.

**Step 4: Commit**

```bash
git add contracts/src/fatjar-token/
git commit -m "feat(token): add burnForRefund method and TokensBurnedEvent"
```

---

## Task 2: Manager Contract — New Storage + Updated createFund

**Files:**
- Modify: `contracts/src/fatjar-manager/events/FatJarManagerEvents.ts`
- Modify: `contracts/src/fatjar-manager/FatJarManager.ts`

**Step 1: Add RefundEvent to events file**

In `contracts/src/fatjar-manager/events/FatJarManagerEvents.ts`, add after `FundClosedEvent`:

```typescript
/**
 * Emitted when a contributor refunds from a failed goal-based vault.
 */
@final
export class RefundEvent extends NetEvent {
    constructor(fundId: u256, contributor: Address, satoshis: u256, tokensBurned: u256) {
        const data: BytesWriter = new BytesWriter(
            U256_BYTE_LENGTH + ADDRESS_BYTE_LENGTH + U256_BYTE_LENGTH * 2,
        );
        data.writeU256(fundId);
        data.writeAddress(contributor);
        data.writeU256(satoshis);
        data.writeU256(tokensBurned);

        super('Refund', data);
    }
}
```

**Step 2: Update FundCreatedEvent to include goalAmount and beneficiary**

Replace the existing `FundCreatedEvent` constructor:

```typescript
@final
export class FundCreatedEvent extends NetEvent {
    constructor(fundId: u256, creator: Address, unlockTimestamp: u256, goalAmount: u256, beneficiary: Address) {
        const data: BytesWriter = new BytesWriter(
            U256_BYTE_LENGTH + ADDRESS_BYTE_LENGTH + U256_BYTE_LENGTH * 2 + ADDRESS_BYTE_LENGTH,
        );
        data.writeU256(fundId);
        data.writeAddress(creator);
        data.writeU256(unlockTimestamp);
        data.writeU256(goalAmount);
        data.writeAddress(beneficiary);

        super('FundCreated', data);
    }
}
```

**Step 3: Add new storage pointers and maps to FatJarManager**

In `FatJarManager.ts`, add after the existing storage pointer declarations (after `const fundContributorCountPointer`):

```typescript
// Goal and beneficiary (keyed by fundId)
const fundGoalAmountPointer: u16 = Blockchain.nextPointer;
const fundBeneficiaryPointer: u16 = Blockchain.nextPointer;

// Tokens earned per fund per contributor (keyed by composite fundId + contributor)
const contributionTokensEarnedPointer: u16 = Blockchain.nextPointer;
```

In the class, add the storage map declarations in the constructor and as class fields:

```typescript
// After fundContributorCount field:
private readonly fundGoalAmount: StoredMapU256;
private readonly fundBeneficiary: StoredMapU256;
private readonly contributionTokensEarned: StoredMapU256;
```

In constructor, after `this.fundContributorCount = ...`:

```typescript
this.fundGoalAmount = new StoredMapU256(fundGoalAmountPointer);
this.fundBeneficiary = new StoredMapU256(fundBeneficiaryPointer);
this.contributionTokensEarned = new StoredMapU256(contributionTokensEarnedPointer);
```

**Step 4: Update createFund to accept goalAmount + beneficiary**

Replace the `createFund` method signature and body. New params:

```typescript
@method(
    {
        name: 'name',
        type: ABIDataTypes.STRING,
    },
    {
        name: 'unlockTimestamp',
        type: ABIDataTypes.UINT256,
    },
    {
        name: 'goalAmount',
        type: ABIDataTypes.UINT256,
    },
    {
        name: 'beneficiary',
        type: ABIDataTypes.ADDRESS,
    },
)
```

Inside createFund, after existing storage writes (before creator fund tracking), add:

```typescript
// Store goal and beneficiary
this.fundGoalAmount.set(fundId, goalAmount);
this.fundBeneficiary.set(fundId, this.addressToU256(beneficiary));
```

Update the event emission:
```typescript
this.emitEvent(new FundCreatedEvent(fundId, creator, unlockTimestamp, goalAmount, beneficiary));
```

Import `RefundEvent` in the imports at top:
```typescript
import {
    FundCreatedEvent,
    ContributionEvent,
    WithdrawalEvent,
    FundClosedEvent,
    RefundEvent,
} from './events/FatJarManagerEvents';
```

**Step 5: Update contribute to track tokens earned per fund**

In the `contribute` method, after the cross-contract mint call (`const tokensMinted = this.mintTokensForContributor(...)`) and before the event emission, add:

```typescript
// Track tokens earned per fund per contributor (for burn-on-refund)
const tokensKey: u256 = this.compositeKey(fundId, contributorKey);
const existingTokens: u256 = this.contributionTokensEarned.get(tokensKey);
this.contributionTokensEarned.set(tokensKey, SafeMath.add(existingTokens, tokensMinted));
```

**Step 6: Build to verify no compile errors**

Run: `cd /Users/mikazaruj/CascadeProjects/fatjar/contracts && npm run build:fatjar-manager`
Expected: Successful WASM build.

**Step 7: Commit**

```bash
git add contracts/src/fatjar-manager/
git commit -m "feat(manager): add goalAmount, beneficiary params and token tracking"
```

---

## Task 3: Manager Contract — Updated withdraw + New refund

**Files:**
- Modify: `contracts/src/fatjar-manager/FatJarManager.ts`

**Step 1: Rewrite withdraw method**

Replace the existing `withdraw` method body with goal-check + beneficiary logic:

```typescript
public withdraw(calldata: Calldata): BytesWriter {
    const fundId: u256 = calldata.readU256();

    // Validate fund exists
    const creatorU256: u256 = this.fundCreator.get(fundId);
    if (u256.eq(creatorU256, ZERO)) {
        throw new Revert('Fund does not exist');
    }

    const sender: Address = Blockchain.tx.sender;
    const senderU256: u256 = this.addressToU256(sender);

    // D5: Check if beneficiary is set — determines who can withdraw
    const beneficiaryU256: u256 = this.fundBeneficiary.get(fundId);
    if (!u256.eq(beneficiaryU256, ZERO)) {
        // Beneficiary mode: only beneficiary can withdraw
        if (!u256.eq(beneficiaryU256, senderU256)) {
            throw new Revert('Only beneficiary can withdraw');
        }
    } else {
        // Creator mode: only creator can withdraw
        if (!u256.eq(creatorU256, senderU256)) {
            throw new Revert('Only creator can withdraw');
        }
    }

    // Check time-lock
    const unlockTimestamp: u256 = this.fundUnlockTimestamp.get(fundId);
    if (!u256.eq(unlockTimestamp, ZERO)) {
        const currentBlock: u256 = u256.fromU64(Blockchain.block.number);
        if (u256.gt(unlockTimestamp, currentBlock)) {
            throw new Revert('Fund is time-locked');
        }
    }

    // If goal-based, require goal to be met
    const goalAmount: u256 = this.fundGoalAmount.get(fundId);
    if (!u256.eq(goalAmount, ZERO)) {
        const totalRaised: u256 = this.fundTotalRaised.get(fundId);
        if (u256.lt(totalRaised, goalAmount)) {
            throw new Revert('Goal not met');
        }
    }

    // Calculate withdrawable amount
    const totalRaised: u256 = this.fundTotalRaised.get(fundId);
    const alreadyWithdrawn: u256 = this.fundWithdrawn.get(fundId);
    const withdrawable: u256 = SafeMath.sub(totalRaised, alreadyWithdrawn);

    if (u256.eq(withdrawable, ZERO)) {
        throw new Revert('Nothing to withdraw');
    }

    this.fundWithdrawn.set(fundId, totalRaised);

    this.emitEvent(new WithdrawalEvent(fundId, sender, withdrawable));

    const writer = new BytesWriter(32);
    writer.writeU256(withdrawable);
    return writer;
}
```

**Step 2: Add refund method**

Add after the `closeFund` method:

```typescript
/**
 * Refund a contributor's BTC from a failed goal-based vault.
 * Burns the $FJAR tokens they earned from this vault.
 * D2: Contributor must hold enough $FJAR — if they sold, refund reverts.
 * D4: Only available for goal-based vaults (goalAmount > 0).
 */
@method({
    name: 'fundId',
    type: ABIDataTypes.UINT256,
})
@emit('Refund')
@returns({
    name: 'amount',
    type: ABIDataTypes.UINT256,
})
public refund(calldata: Calldata): BytesWriter {
    const fundId: u256 = calldata.readU256();

    // Must be a goal-based vault
    const goalAmount: u256 = this.fundGoalAmount.get(fundId);
    if (u256.eq(goalAmount, ZERO)) {
        throw new Revert('Not a goal-based vault');
    }

    // Validate fund exists
    const creatorU256: u256 = this.fundCreator.get(fundId);
    if (u256.eq(creatorU256, ZERO)) {
        throw new Revert('Fund does not exist');
    }

    // Time-lock must have expired
    const unlockTimestamp: u256 = this.fundUnlockTimestamp.get(fundId);
    if (!u256.eq(unlockTimestamp, ZERO)) {
        const currentBlock: u256 = u256.fromU64(Blockchain.block.number);
        if (u256.gt(unlockTimestamp, currentBlock)) {
            throw new Revert('Fund is time-locked');
        }
    }

    // Goal must NOT be met
    const totalRaised: u256 = this.fundTotalRaised.get(fundId);
    if (u256.ge(totalRaised, goalAmount)) {
        throw new Revert('Goal was met');
    }

    // Caller must have contributed
    const contributor: Address = Blockchain.tx.sender;
    const contributorKey: u256 = this.addressToU256(contributor);
    const contribKey: u256 = this.compositeKey(fundId, contributorKey);
    const contributionAmount: u256 = this.contributionAmount.get(contribKey);

    if (u256.eq(contributionAmount, ZERO)) {
        throw new Revert('No contribution to refund');
    }

    // Get tokens earned from this fund
    const tokensKey: u256 = this.compositeKey(fundId, contributorKey);
    const tokensEarned: u256 = this.contributionTokensEarned.get(tokensKey);

    // Zero out contribution and tokens earned
    this.contributionAmount.set(contribKey, ZERO);
    this.contributionTokensEarned.set(tokensKey, ZERO);

    // Decrement fund total raised
    this.fundTotalRaised.set(fundId, SafeMath.sub(totalRaised, contributionAmount));

    // Decrement contributor count
    const contribCount: u256 = this.fundContributorCount.get(fundId);
    if (u256.gt(contribCount, ZERO)) {
        this.fundContributorCount.set(fundId, SafeMath.sub(contribCount, ONE));
    }

    // Cross-contract call: burn $FJAR tokens
    if (!u256.eq(tokensEarned, ZERO)) {
        this.burnTokensForRefund(contributor, tokensEarned);
    }

    this.emitEvent(new RefundEvent(fundId, contributor, contributionAmount, tokensEarned));

    const writer = new BytesWriter(32);
    writer.writeU256(contributionAmount);
    return writer;
}
```

**Step 3: Add burnTokensForRefund helper**

Add after the existing `mintTokensForContributor` private method:

```typescript
/**
 * Cross-contract call to FatJarToken.burnForRefund(contributor, tokenAmount).
 */
private burnTokensForRefund(contributor: Address, tokenAmount: u256): void {
    const tokenU256: u256 = this.tokenAddress.get(ZERO);
    if (u256.eq(tokenU256, ZERO)) {
        throw new Revert('Token address not set');
    }

    const tokenBytes: Uint8Array = tokenU256.toUint8Array(true);
    const tokenAddr: Address = changetype<Address>(tokenBytes);

    const burnSelector = encodeSelector('burnForRefund(address,uint256)');
    const burnCalldata = new BytesWriter(
        SELECTOR_BYTE_LENGTH + ADDRESS_BYTE_LENGTH + U256_BYTE_LENGTH,
    );
    burnCalldata.writeSelector(burnSelector);
    burnCalldata.writeAddress(contributor);
    burnCalldata.writeU256(tokenAmount);

    Blockchain.call(tokenAddr, burnCalldata);
}
```

**Step 4: Update getFundDetails to return goalAmount and beneficiary**

Replace the existing `getFundDetails` method to include the two new fields:

```typescript
@method({
    name: 'fundId',
    type: ABIDataTypes.UINT256,
})
@returns(
    { name: 'creator', type: ABIDataTypes.UINT256 },
    { name: 'totalRaised', type: ABIDataTypes.UINT256 },
    { name: 'unlockTimestamp', type: ABIDataTypes.UINT256 },
    { name: 'isClosed', type: ABIDataTypes.UINT256 },
    { name: 'withdrawn', type: ABIDataTypes.UINT256 },
    { name: 'contributorCount', type: ABIDataTypes.UINT256 },
    { name: 'goalAmount', type: ABIDataTypes.UINT256 },
    { name: 'beneficiary', type: ABIDataTypes.UINT256 },
)
public getFundDetails(calldata: Calldata): BytesWriter {
    const fundId: u256 = calldata.readU256();

    const writer = new BytesWriter(32 * 8);
    writer.writeU256(this.fundCreator.get(fundId));
    writer.writeU256(this.fundTotalRaised.get(fundId));
    writer.writeU256(this.fundUnlockTimestamp.get(fundId));
    writer.writeU256(this.fundIsClosed.get(fundId));
    writer.writeU256(this.fundWithdrawn.get(fundId));
    writer.writeU256(this.fundContributorCount.get(fundId));
    writer.writeU256(this.fundGoalAmount.get(fundId));
    writer.writeU256(this.fundBeneficiary.get(fundId));
    return writer;
}
```

**Step 5: Add getContributionTokens view method**

Add after `getContribution`:

```typescript
/**
 * Get tokens earned by a contributor for a specific fund.
 */
@method(
    { name: 'fundId', type: ABIDataTypes.UINT256 },
    { name: 'contributor', type: ABIDataTypes.ADDRESS },
)
@returns({
    name: 'tokens',
    type: ABIDataTypes.UINT256,
})
public getContributionTokens(calldata: Calldata): BytesWriter {
    const fundId: u256 = calldata.readU256();
    const contributor: Address = calldata.readAddress();

    const tokensKey: u256 = this.compositeKey(fundId, this.addressToU256(contributor));
    const tokens: u256 = this.contributionTokensEarned.get(tokensKey);

    const writer = new BytesWriter(32);
    writer.writeU256(tokens);
    return writer;
}
```

**Step 6: Build both contracts**

Run: `cd /Users/mikazaruj/CascadeProjects/fatjar/contracts && npm run build:fatjar`
Expected: Both WASM files build successfully.

**Step 7: Commit**

```bash
git add contracts/src/fatjar-manager/
git commit -m "feat(manager): add withdraw goal-check, refund with burn, updated views"
```

---

## Task 4: Frontend — Update Types and Services

**Files:**
- Modify: `frontend/src/types/index.ts`
- Modify: `frontend/src/services/` (inspect existing, update)

**Step 1: Update vault types**

Read the existing `types/index.ts` and update/replace the fund type to include new fields:

```typescript
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

export function getVaultMode(vault: Vault): VaultMode {
  const hasGoal = vault.goalAmount > 0n;
  const hasBeneficiary = vault.beneficiary !== '' && vault.beneficiary !== '0x' + '0'.repeat(40);
  if (hasGoal && hasBeneficiary) return 'funded-grant';
  if (hasGoal) return 'all-or-nothing';
  if (hasBeneficiary) return 'trust-fund';
  return 'open-collection';
}

export function getVaultModeLabel(mode: VaultMode): string {
  const labels: Record<VaultMode, string> = {
    'open-collection': 'Open Collection',
    'trust-fund': 'Trust Fund',
    'all-or-nothing': 'All-or-Nothing Pledge',
    'funded-grant': 'Funded Grant',
  };
  return labels[mode];
}
```

**Step 2: Update/create contract service**

Read existing services in `frontend/src/services/`, then update to include new contract methods. The service should expose:

- `createVault(name, unlockBlock, goalAmount, beneficiary)`
- `contribute(fundId, satoshis)`
- `withdraw(fundId)`
- `refund(fundId)`
- `closeFund(fundId)`
- `getFundDetails(fundId)` → returns Vault
- `getFundCount()` → returns number
- `getContribution(fundId, address)` → returns Contribution
- `getContributionTokens(fundId, address)` → returns bigint
- `getTokenRate()` → returns bigint
- `getTotalBtcContributed()` → returns bigint
- `getCreatorFundCount(address)` → returns number
- `getCreatorFundByIndex(address, index)` → returns fundId

**Note:** The actual OPWallet integration pattern depends on what's in the existing services directory. Read it first, then extend. If mock/placeholder services exist, update them. If none exist, create `frontend/src/services/contract.ts` with the interface above and mock data for local dev.

**Step 3: Commit**

```bash
git add frontend/src/types/ frontend/src/services/
git commit -m "feat(frontend): update types and services for vault redesign"
```

---

## Task 5: Frontend — Update Home Page

**Files:**
- Modify: `frontend/src/pages/Home/HeroSection.tsx` + `.css`
- Modify: `frontend/src/pages/Home/HowItWorks.tsx`
- Modify: `frontend/src/pages/Home/ActiveJars.tsx` + `.css`
- Modify: `frontend/src/pages/Home/FeaturesSection.tsx`
- Modify: `frontend/src/pages/Home/StatsStrip.tsx`

**Step 1: Update HeroSection**

Change headline from piggy bank language to vault language:
- Headline: "Lock Bitcoin together."
- Subline: "Trustless vaults on Bitcoin L1. Set a goal, set a time-lock. Contributors back it with BTC. Goal met — funds release. Goal missed — everyone gets BTC back."
- CTA button: "Create a Vault"

**Step 2: Update StatsStrip labels**

- "Total BTC Locked" (not "saved")
- "Active Vaults" (not "jars" or "funds")
- "$FJAR Minted"
- "Current Rate"

**Step 3: Update HowItWorks**

Three steps:
1. **Create** — "Set your vault name, goal, time-lock, and optional beneficiary."
2. **Fund** — "Contributors back it with BTC and earn $FJAR tokens. Early backers earn more."
3. **Resolve** — "Goal met? Withdraw the BTC. Goal missed? Everyone gets a refund."

**Step 4: Update ActiveJars to show vault modes**

Rename component to ActiveVaults (or keep ActiveJars, update display). Each vault card should show:
- Vault name
- Mode badge (from `getVaultModeLabel`)
- Progress bar (if goal-based: raised/goal)
- Contributor count
- Time remaining

**Step 5: Update FeaturesSection**

Update feature descriptions to match vault narrative. Key features:
- All-or-nothing guarantee
- Time-locked by Bitcoin's blockchain
- Bonding curve rewards early backers
- Zero platform fees
- Four flexible vault modes

**Step 6: Commit**

```bash
git add frontend/src/pages/Home/
git commit -m "feat(frontend): update Home page for vault narrative"
```

---

## Task 6: Frontend — Update CreateFund Page

**Files:**
- Modify: `frontend/src/pages/CreateFund/CreateFund.tsx` + `.css`

**Step 1: Read existing CreateFund component and update**

Add new form fields:
- **Goal amount** — toggle switch + BTC input (disabled when toggled off, sends 0)
- **Beneficiary address** — toggle switch + address input (disabled when toggled off, sends zero address)

Keep existing fields:
- Vault name (required)
- Unlock block / estimated date (required)

**Step 2: Add mode preview card**

Below the form, show a card that dynamically displays the vault mode based on current toggle state:
- Use `getVaultMode()` and `getVaultModeLabel()` from types
- Brief description of what the mode means

**Step 3: Add gas estimate display**

Show estimated gas cost before the submit button. Can be a static estimate for MVP.

**Step 4: Commit**

```bash
git add frontend/src/pages/CreateFund/
git commit -m "feat(frontend): add goal, beneficiary, and mode preview to CreateFund"
```

---

## Task 7: Frontend — Update FundDetail Page

**Files:**
- Modify: `frontend/src/pages/FundDetail/FundDetail.tsx` + `.css`

**Step 1: Read existing FundDetail and update**

Add/update:
- Mode badge at top (from `getVaultModeLabel`)
- Progress bar for goal-based vaults (raised / goal, percentage)
- For non-goal vaults, just show total raised
- Contributor list with: address (truncated), BTC amount, $FJAR earned
- Current $FJAR rate display
- Time remaining countdown (blocks until unlock)

**Step 2: Contextual action buttons**

Based on vault state and connected wallet:

```
if vault is open (not past unlock):
    show Contribute button (anyone)
    show Close button (if connected wallet is creator)

if vault is past unlock:
    if no goal OR goal met:
        show Withdraw button (if connected wallet is creator/beneficiary)
    if goal set AND goal not met:
        show Refund button (if connected wallet has contribution)
```

**Step 3: Commit**

```bash
git add frontend/src/pages/FundDetail/
git commit -m "feat(frontend): update FundDetail with modes, progress, and contextual actions"
```

---

## Task 8: Frontend — Add Dashboard Page

**Files:**
- Create: `frontend/src/pages/Dashboard/Dashboard.tsx`
- Create: `frontend/src/pages/Dashboard/Dashboard.css`
- Modify: `frontend/src/App.tsx` (add route)
- Modify: `frontend/src/components/layout/Navbar.tsx` (add nav link)

**Step 1: Create Dashboard component**

Two sections:

**My Vaults** (created by connected wallet):
- Query `getCreatorFundCount(address)` + `getCreatorFundByIndex(address, i)` + `getFundDetails(fundId)`
- Show: vault name, mode badge, total raised, status (Active/Unlocked/Withdrawn), action buttons (Withdraw/Close)

**My Contributions** (vaults I contributed to):
- This requires iterating known vaults and checking contributions — for MVP, can show vaults the user has interacted with (tracked client-side or via event indexing)
- Show: vault name, my BTC amount, $FJAR earned, status (Active/Goal Met/Refundable), action button (Refund if applicable)

**Empty state:** "No vaults yet. Create one or contribute to an existing vault."

Requires wallet to be connected. Show connect prompt if not connected.

**Step 2: Add route to App.tsx**

```typescript
import { Dashboard } from './pages/Dashboard/Dashboard';
// Add route:
<Route path="/dashboard" element={<Dashboard />} />
```

**Step 3: Add Dashboard link to Navbar**

Add "Dashboard" nav item next to existing links.

**Step 4: Commit**

```bash
git add frontend/src/pages/Dashboard/ frontend/src/App.tsx frontend/src/components/layout/Navbar.tsx
git commit -m "feat(frontend): add Dashboard page with My Vaults and My Contributions"
```

---

## Task 9: Frontend — OPWallet Integration

**Files:**
- Modify: `frontend/src/hooks/` (wallet hook)
- Modify: `frontend/src/components/ui/WalletButton.tsx`
- Modify: `frontend/src/services/contract.ts`

**Step 1: Check current wallet hook state**

Read existing hooks directory. If a wallet hook exists, update it. If not, create `useWallet.ts`:

```typescript
// Hook that manages OPWallet connection state
// - connect(): request wallet connection
// - disconnect(): clear state
// - address: connected address or null
// - isConnected: boolean
// - signer: wallet signer for signing transactions
```

**Step 2: Wire WalletButton to hook**

Update WalletButton component to use the wallet hook — show address when connected, "Connect Wallet" when not.

**Step 3: Wire contract service to real wallet calls**

Replace mock data in contract service with actual OPWallet SDK calls. Reference `@btc-vision/walletconnect` package (add to dependencies if not present).

**Note:** If OPWallet SDK is not installed, run:
```bash
cd frontend && npm install @btc-vision/walletconnect
```

Consult `docs/opnet-reference.md` for wallet integration patterns.

**Step 4: Commit**

```bash
git add frontend/src/hooks/ frontend/src/components/ui/WalletButton.tsx frontend/src/services/
git commit -m "feat(frontend): wire OPWallet integration"
```

---

## Task 10: Deploy Contracts to Testnet

**Prerequisite:** OPWallet Chrome extension installed with testnet BTC from faucet.opnet.org

**Step 1: Build final WASM files**

```bash
cd /Users/mikazaruj/CascadeProjects/fatjar/contracts && npm run build:fatjar
```

**Step 2: Deploy FatJarToken via OPWallet**

1. Open OPWallet → select "Deploy"
2. Upload `build/fatjar-token.wasm`
3. Confirm transaction
4. Copy token contract address → save to `frontend/.env` as `VITE_TOKEN_ADDRESS`

**Step 3: Deploy FatJarManager via OPWallet**

1. Upload `build/fatjar-manager.wasm`
2. Confirm transaction
3. Copy manager contract address → save to `frontend/.env` as `VITE_MANAGER_ADDRESS`

**Step 4: Link contracts**

1. Call `FatJarToken.setManager(managerAddress)` via OPWallet
2. Call `FatJarManager.setTokenAddress(tokenAddress)` via OPWallet

**Step 5: Smoke test on testnet**

1. Create a vault (all-or-nothing mode, small goal)
2. Contribute
3. Verify $FJAR minted
4. Verify fund details via view methods

**Step 6: Update frontend .env with contract addresses**

**Step 7: Commit**

```bash
git add frontend/.env.example
git commit -m "chore: add testnet contract addresses"
```

---

## Task 11: Deploy Frontend to Vercel

**Step 1: Build frontend**

```bash
cd /Users/mikazaruj/CascadeProjects/fatjar/frontend && npm run build
```

Expected: `dist/` directory with production build.

**Step 2: Deploy to Vercel**

```bash
npx vercel --prod
```

Or connect GitHub repo to Vercel for auto-deploy.

**Step 3: Verify live site**

Open the Vercel URL. Test:
- Home page loads with updated copy
- Create vault form works
- Vault detail page renders
- Dashboard shows when wallet connected
- Wallet connect/disconnect works

**Step 4: Commit Vercel config if any**

```bash
git add vercel.json
git commit -m "chore: add Vercel deployment config"
```

---

## Task 12: Submission Materials

**Files:**
- Modify: `README.md`
- Record: 90-second video
- Post: tweet

**Step 1: Write README**

Structure:
1. One-paragraph pitch (from design doc)
2. Screenshot of the running app
3. How it works (3 steps)
4. Vault modes table (4 modes)
5. Tech stack
6. Contract addresses (testnet)
7. Run locally: `cd frontend && npm install && npm run dev`
8. Links: Vercel demo URL, video URL, tweet URL

**Step 2: Take screenshot**

Capture the Home page with stats and active vaults visible.

**Step 3: Record 90-second video**

Follow the script from the design doc (`docs/plans/2026-03-10-vault-redesign.md` section 6).

**Step 4: Post tweet**

Include: #opnetvibecode @opnetbtc @opnetbtc_eco, video, GitHub link, Vercel link.

**Step 5: Submit on vibecode.finance**

Mark submission as "Complete" with screenshot.

**Step 6: Final commit**

```bash
git add README.md
git commit -m "docs: add competition README with vault redesign"
```

---

## Task Dependency Graph

```
Task 1 (Token burn) ─────┐
                          ├──→ Task 3 (withdraw + refund) ──→ Task 6 (CreateFund UI)
Task 2 (Manager storage) ─┘                                  Task 7 (FundDetail UI)
                                                              Task 8 (Dashboard UI)
Task 4 (Types/Services) ──→ Task 5 (Home UI) ──────────────→ Task 9 (OPWallet)
                                                              │
Task 10 (Deploy contracts) ←──────────────────────────────────┘
Task 11 (Deploy frontend) ←── Task 10
Task 12 (Submission) ←──────── Task 11
```

**Parallelizable:** Tasks 1+2 can run in parallel. Tasks 5+6+7+8 can run in parallel (all depend on Task 4). Task 9 depends on all frontend tasks.

**Critical path:** Tasks 1→2→3 (contract changes) block everything else. Start here.
