# FatJar Vault Redesign — Design Document v3

**Date:** 2026-03-10
**Status:** Approved
**Supersedes:** `2026-03-09-satgift-design.md` (piggy bank design)
**Competition:** vibecode.finance Week 3 "The Breakthrough" (deadline Mar 13)
**Platform:** OPNet (Bitcoin L1, AssemblyScript/WASM)
**Name:** FatJar | **Token:** $FJAR (OP20)

---

## 1. Product Overview

Trustless Bitcoin vaults for financial coordination on L1. Create a vault, set optional goals and time-locks. Contributors back it with BTC and earn $FJAR tokens via a bonding curve — early backers earn more. If a goal-based vault fails, contributors get BTC back and $FJAR is burned. Zero platform fees.

### Positioning

**Tagline:** "Lock Bitcoin together."

**What it is:** A crowdfunding and coordination primitive on Bitcoin L1 — "Juicebox for Bitcoin." One flexible vault contract that supports multiple use cases based on what the creator configures.

**Target users:** Investment clubs, project treasuries, community funds, milestone-based funding, trust funds — anyone pooling 0.01+ BTC with people they don't fully trust.

**Why Bitcoin L1:**
- $2T in BTC value, <0.5% in DeFi — the richest chain has the least infrastructure
- L1 gas fees ($5-15) are insignificant on 0.01+ BTC contributions (0.01-0.03%)
- Most secure settlement layer for time-locked vaults holding serious money
- Bitcoin brand = trust for broader crypto audience
- High fees naturally filter to the use cases that belong on L1

### What This Is NOT
- Not a consumer savings app for $20 family contributions
- Not a meme coin launchpad
- Not a DeFi yield protocol
- Not a donation platform (though it supports donation-style open collections)

---

## 2. Vault Modes

One contract, four modes determined by two optional parameters:

| goalAmount | beneficiary | Mode | Use Case |
|---|---|---|---|
| 0 | not set | **Open Collection** | Donations, tips, project treasury |
| 0 | set | **Trust Fund** | Family vault, grant to known recipient |
| > 0 | not set | **All-or-Nothing Pledge** | Crowdfunding, investment club |
| > 0 | set | **Funded Grant** | Conditional funding for a builder/cause |

### Mode behaviors

**Open Collection** (no goal, no beneficiary)
- Anyone contributes. Creator withdraws whatever is there after unlock.
- No refund possible — contributions are gifts.

**Trust Fund** (no goal, beneficiary set)
- Anyone contributes. Beneficiary (not creator) withdraws after unlock.
- No refund possible — contributions are gifts to the beneficiary.

**All-or-Nothing Pledge** (goal set, no beneficiary)
- Anyone contributes. If totalRaised >= goalAmount at unlock → creator withdraws.
- If totalRaised < goalAmount at unlock → contributors call refund(), $FJAR burned.

**Funded Grant** (goal set, beneficiary set)
- Anyone contributes. If totalRaised >= goalAmount at unlock → beneficiary withdraws.
- If totalRaised < goalAmount at unlock → contributors call refund(), $FJAR burned.

---

## 3. Token Economics

### Token: $FJAR (OP20)
- **Max supply:** 100,000,000 (100M) with 18 decimals
- **Minting:** Only via contributions (no pre-mine, no team allocation)
- **Burn:** On refund — exact amount earned per vault is burned
- **Tradeable:** Standard OP20, transferable on any OPNet DEX

### Bonding Curve
Formula: `tokens_per_btc = K / sqrt(total_btc + 1)` where K = 120,000

| Platform Total BTC | Tokens per 1 BTC | Early backer advantage |
|---|---|---|
| 0 - 1 | ~120,000 | First movers |
| 1 - 5 | ~80,000 | Early adopters |
| 5 - 20 | ~40,000 | Growing platform |
| 20 - 100 | ~15,000 | Established |
| 100+ | ~5,000 | Mature |

Supply exhaustion at ~700+ BTC total contributed — effectively infinite for early-stage platform.

First contributor vs. fifth contributor in a 2.5 BTC vault: ~1.7x more $FJAR. Meaningful reward, not punishing to latecomers.

### $FJAR Utility (MVP)
- **Proof of successful backing** — you hold $FJAR only if vaults you contributed to succeeded
- **Early conviction signal** — more $FJAR = backed earlier when outcome was uncertain
- **Transferable** — standard OP20

Not claiming governance. Not claiming yield. Honest about what it is.

### Burn-on-Refund Mechanics
- When a goal-based vault fails and contributor calls refund():
  - Contributor gets BTC back
  - Exact $FJAR earned from that vault is burned
  - If contributor has already sold/transferred $FJAR and doesn't hold enough → refund reverts
  - Trade-off: sell $FJAR (forfeit refund) or hold $FJAR (keep refund right)
- Prevents gaming: can't create fake vaults to farm $FJAR risk-free

### Future Monetization (post-competition)
- Zero fees at launch — trust signal for Bitcoin community
- Treasury proposal later via contract upgrade (`onUpdate`):
  - Option A: 0.5-1% protocol fee on successful withdrawals
  - Option B: Small % of $FJAR minted to treasury on each contribution
  - Option C: Direct BTC fee on withdrawals
- Upgrade requires deployer key — transparent, announced in advance
- Existing vaults honor original terms; fee applies only to new vaults

---

## 4. Smart Contract Architecture

Two contracts: **FatJarToken** (OP20) and **FatJarManager** (OP_NET).

### FatJarManager — Changes from v2

**`createFund` — new parameters:**
```
createFund(
  name: string,          // required, max 64 chars
  unlockBlock: u256,     // required, block number (0 = no lock)
  goalAmount: u256,      // NEW — 0 = no goal, >0 = all-or-nothing
  beneficiary: Address   // NEW — zero address = creator withdraws
)
```

**`withdraw` — updated logic:**
```
withdraw(fundId):
  validate fund exists

  if beneficiary != zero:
    require caller == beneficiary
  else:
    require caller == creator

  if goalAmount > 0:
    require totalRaised >= goalAmount   // goal must be met

  require currentBlock >= unlockBlock   // time-lock respected

  calculate withdrawable (totalRaised - alreadyWithdrawn)
  update withdrawn amount
  emit WithdrawalEvent
```

**`refund` — new function:**
```
refund(fundId):
  require goalAmount > 0               // only goal-based vaults
  require currentBlock >= unlockBlock   // time-lock expired
  require totalRaised < goalAmount      // goal NOT met

  contributorAmount = caller's contribution to this fund
  require contributorAmount > 0

  tokensToReturn = caller's $FJAR earned from this fund

  zero out caller's contribution
  decrement fund totalRaised by contributorAmount

  // cross-contract call: burn $FJAR
  call Token.burnForRefund(caller, tokensToReturn)

  emit RefundEvent(fundId, caller, contributorAmount, tokensToReturn)
```

**New storage maps:**
- `fundGoalAmount` (StoredMapU256, keyed by fundId)
- `fundBeneficiary` (StoredMapU256, keyed by fundId)
- `contributionTokensEarned` (StoredMapU256, keyed by composite fundId + contributor)

**Updated events:**
- `FundCreatedEvent` — add goalAmount, beneficiary
- `RefundEvent` — new: fundId, contributor, btcAmount, tokensBurned

### FatJarToken — Changes from v2

**`burnForRefund` — new function:**
```
burnForRefund(contributor: Address, tokenAmount: u256):
  onlyManager()
  require balanceOf(contributor) >= tokenAmount
  _burn(contributor, tokenAmount)

  // update totalBtcContributed? NO — keep it as historical record
  // the curve reflects all-time contributions, not current state

  emit TokensBurnedEvent(contributor, tokenAmount)
```

### Unchanged
- Bonding curve formula and K constant
- Cross-contract mint pattern (Manager → Token)
- Composite storage keys for contributor tracking
- Security guards (onlyManager, onlyDeployer, one-time setters)
- All existing view methods
- OP20 standard methods (transfer, approve, balanceOf)

### Design Decisions

**D1: totalBtcContributed is NOT decremented on refund.**
The bonding curve reflects all-time platform activity, not current deposits. This prevents manipulation: contribute → refund → re-contribute at a better rate.

**D2: Contributor must hold $FJAR to refund.**
If they sold their $FJAR, they forfeit refund rights. This is a clean trade-off that prevents double-claiming and gives $FJAR real economic weight.

**D3: Fund names in events, not storage.**
Unchanged from v2. Frontend indexes FundCreatedEvent for vault metadata.

**D4: goalAmount=0 means refund is impossible.**
Open collections and trust funds are gift-based. No take-backs.

**D5: Beneficiary is immutable once set.**
Set at vault creation, cannot be changed. Prevents bait-and-switch.

---

## 5. Frontend

### Tech Stack
- React + TypeScript + Vite
- Tailwind CSS
- OPWallet via `@btc-vision/walletconnect`
- Deploy to Vercel

### Design Direction
Editorial Brutalist — carried over from v2 prototype:
- Background: warm cream (#F5F2ED)
- Text: black (#111111)
- Accent: Bitcoin orange (#F7931A) for CTAs only
- Typography: Syne (display), IBM Plex Mono (labels), Source Sans 3 (body)

### Pages (4 total)

**1. Home**
- Hero: "Lock Bitcoin together" + one-sentence explainer
- Stats strip: Total BTC Locked, Active Vaults, $FJAR Minted, Current Rate
- How it works: 3 steps (Create → Fund → Withdraw or Refund)
- Active vaults list: name, mode badge, progress bar (if goal), contributors count, time remaining
- CTA: "Create a Vault"

**2. Create Vault**
- Form fields:
  - Vault name (required)
  - Unlock block / estimated date (required)
  - Goal amount in BTC (toggle — determines all-or-nothing behavior)
  - Beneficiary address (toggle — determines who withdraws)
- Mode preview card: shows which mode based on current selections
- Gas estimate before signing
- OPWallet sign + submit

**3. Vault Detail**
- Vault name, creator address, mode badge
- Progress: raised / goal with progress bar (goal-based) or total raised (no goal)
- Time: blocks remaining until unlock, estimated date
- Contributor list: address, BTC amount, $FJAR earned
- Current $FJAR rate from bonding curve
- Contextual actions:
  - Before unlock: **Contribute** button (anyone)
  - After unlock, goal met (or no goal): **Withdraw** button (creator/beneficiary)
  - After unlock, goal not met: **Refund** button (contributors)
  - Creator anytime: **Close** button (prevents new contributions)

**4. Dashboard**
- Requires wallet connection
- **My Vaults** (created): name, mode, total raised, status, action buttons
- **My Contributions** (backed): name, my amount, $FJAR earned, status (active/refundable/succeeded)
- Empty state: prompt to create or browse vaults

### Scope Cuts (MVP)
- No dark mode toggle (light only)
- No search/filter on vault list
- No bonding curve visualizer
- No live activity feed
- No mobile-first responsive (desktop-first, basic mobile support)

---

## 6. Competition Submission

### Requirements
- Public GitHub repo + polished README
- Screenshot (marks submission as "Complete")
- Tweet with #opnetvibecode @opnetbtc @opnetbtc_eco
- Frontend deployed to Vercel

### README Structure
1. One-paragraph pitch
2. Screenshot
3. How it works (3 steps)
4. Vault modes table
5. Tech stack
6. Contract addresses (testnet)
7. Run locally instructions
8. Links: live demo, video, tweet

### 90-Second Video Script
```
0-10s:  "Bitcoin holds $2 trillion. But there's no way to pool it
        trustlessly. Until now."

10-25s: "FatJar. Create a vault, set a goal, set a time-lock.
        Contributors back it with BTC. Goal met — funds release.
        Goal missed — everyone gets BTC back. No middleman.
        No platform fees. Just Bitcoin and math."

25-40s: Demo: Create Vault (all-or-nothing mode, 1 BTC goal)

40-55s: Demo: Contribute, watch $FJAR mint, bonding curve rate

55-70s: Demo: Vault Detail — progress bar, contributor list,
        time remaining

70-80s: "Early backers earn more $FJAR. But if the vault fails,
        tokens burn. Only successful conviction counts."

80-90s: "Juicebox raised $100M on Ethereum. FatJar brings
        trustless coordination to Bitcoin L1. Lock Bitcoin together."
```

### Judging Criteria Alignment (100 pts)
| Criterion | Points | FatJar's angle |
|---|---|---|
| Working Product | 30 | 2 contracts on testnet + 4-page frontend on Vercel |
| Innovation | 25 | First all-or-nothing crowdfunding on Bitcoin L1 + bonding curve commitment + burn-on-refund |
| UX/Polish | 15 | Editorial Brutalist design, mode preview, gas estimates |
| Mainnet Viability | 15 | Proven model (Juicebox: $100M), L1 gas justified at vault scale |
| OP_NET Usage | 15 | Cross-contract mint + burn, bonding curve math, composite keys, OP20 extensions |

---

## 7. Post-Competition Roadmap (if viable)

**v1.1 — Polish**
- Dark mode
- Vault search/filter
- Mobile responsive
- Bonding curve visualizer

**v1.2 — Growth**
- Treasury proposal (protocol fee or mint fee)
- Vault sharing / social cards
- Fund discovery page with categories

**v2.0 — Advanced**
- Milestone-based unlocks (partial withdrawals tied to deliverables)
- Governance framework for $FJAR (if supply distribution warrants it)
- L2 integration for smaller contributions
- HODL Pact mode (contributors withdraw their own BTC after lock)
- Savings circle mode (rotating payouts)

---

## 8. Open Questions
- [ ] Logo / wordmark design
- [ ] Domain (fatjar.xyz, fatjar.finance — check availability)
- [ ] Hero illustration update (current piggy bank → vault/jar imagery?)
