# Bitcoin L1 dApp Brainstorm — vibecode.finance Week 3

**Date:** 2026-03-09
**Deadline:** March 13 (4 days)
**Competition:** vibecode.finance "The Breakthrough" — wildest builds win
**Time budget:** 10-15 hours
**Platform:** OPNet (Bitcoin L1 smart contracts, AssemblyScript/WASM)
**Submission:** GitHub repo + 90s demo video + README + tweet #opnetvibecode

---

## Ecosystem Analysis

318 dApps submitted. 252 complete. The ecosystem is 70% DeFi clones.

### Saturated (avoid)
- Token launchers (6+)
- Staking vaults (8+)
- Prediction markets (5+)
- Lending protocols (4+)
- DEXs (3+)

### Complete whitespace (our opportunity)
- Gift registries — **ZERO** projects
- Home services marketplace — near zero
- Property tokenization — near zero
- Identity/reputation systems — zero
- Charity/donations — zero
- Education platforms — zero

---

## Chosen Direction: SatGift — Bitcoin Gift Registry

### Core Concept

A structured Bitcoin gift registry where:
1. **Creator** sets up a registry (wedding, birthday, housewarming, baby shower)
2. Adds specific items with BTC target amounts
3. Shares link with friends/family
4. **Contributors** pick items, send BTC via smart contract
5. Contributors receive **value-accruing OP721 NFTs** as gift receipts
6. Creator withdraws funds after the event

### What Makes It Novel

- First gift registry on Bitcoin L1 (or any Bitcoin layer)
- NFT receipts that can appreciate in value (not just thank-you cards)
- On-chain permanence — your registry lives on Bitcoin forever
- Zero platform fees — just BTC transaction costs
- Group gifting — multiple people pool toward one item

---

## NFT Value Mechanics (Pick One for MVP)

### Option 1: Tiered Scarcity (RECOMMENDED for MVP)

Contribution amount determines NFT tier. Fixed supply per tier per registry.

| Tier | Contribution | Supply | Visual |
|------|-------------|--------|--------|
| Bronze | Any amount | Unlimited | Simple design |
| Silver | > 0.01 BTC | 50 per registry | Enhanced design |
| Gold | > 0.05 BTC | 10 per registry | Premium design |
| Diamond | > 0.1 BTC | 3 per registry | Unique 1-of-3 design |

**Why it works:**
- Simple to implement (threshold checks in contract)
- Clear value driver (scarcity + tier = market price)
- Higher tiers = stronger social signal
- Once minted, supply is fixed forever — natural appreciation

**Implementation:** Straightforward. Contract checks contribution amount, mints appropriate tier. Counter tracks remaining supply per tier.

### Option 2: Creator Perks

Registry creators define custom perks attached to each NFT tier.

**Examples:**
- "Gold contributors invited to our anniversary dinner"
- "Diamond contributors get a personalized thank-you video"
- "Silver+ holders get early access to our startup's product"

**Why it works:**
- Stickier — real-world value attached to NFT
- Creates ongoing relationship between creator and contributors
- Turns gift-giving into a social contract

**Complexity:** Medium. Needs a way for creators to define/update perks (could be off-chain metadata linked to on-chain token). Contract itself stays simple.

### Option 3: Generosity Reputation

NFTs build an on-chain "generosity portfolio." The more events you contribute to, the higher your reputation score.

**Mechanics:**
- Each NFT adds to your cumulative generosity score
- Platform displays top gifters (leaderboard)
- High-reputation gifters could get perks: priority access to new registries, badges, recognition
- Reputation is non-transferable (soulbound) but NFTs themselves are tradeable

**Why it works:**
- Gamification drives engagement
- Creates a "generosity economy" — social status from giving
- Encourages repeat usage across multiple events

**Complexity:** Medium-high. Needs a separate reputation contract that reads NFT ownership across registries.

### Option 4: Simple Tradeable Commemorative

Beautiful commemorative NFT, fully tradeable on any OP721 marketplace. Value comes purely from social meaning + scarcity.

**Why it works:**
- Simplest to implement
- Value is emergent — no complex mechanics needed
- Like a physical wedding favor, but digital and permanent
- People collect meaningful moments

**Complexity:** Lowest. Just mint an NFT with event metadata on contribution.

---

## Why SatGift Wins the Competition

1. **Zero competition** — not one gift registry in 318 dApps
2. **Instant comprehension** — judges understand it in 5 seconds
3. **90-second demo writes itself** — create registry, contribute, get NFT, show progress
4. **"First on Bitcoin" narrative** — powerful headline
5. **Real utility** — people actually use gift registries ($2.5B wedding registry market)
6. **Novel NFT mechanic** — gift receipts that appreciate adds DeFi flavor
7. **Low regulatory risk** — no securities, no KYC needed

---

## Alternative Approaches (Parked)

### FixChain — Bitcoin Home Services Marketplace
- BTC escrow for home services (cleaning, repairs, handyman)
- On-chain reputation via soulbound OP721
- DePIN for home services (doesn't exist anywhere)
- **Why parked:** Higher complexity (10-12h), two-sided marketplace bootstrapping challenge
- **Future:** Could layer on top of SatGift (gift someone a service)

### BitBricks — Fractional Property on Bitcoin
- Tokenize properties as OP20 tokens + OP721 deed NFTs
- Automated rental dividend distribution
- **Why parked:** Legal complexity (SPV/compliance), tightest on time (12-15h)
- **Future:** Strongest long-term product play given Mara background

---

## Smart Contract Architecture (Preliminary)

### Contracts Needed

1. **RegistryFactory** — creates new registries, tracks all registries
2. **Registry** — individual registry with items, contributions, withdrawals
3. **GiftNFT (OP721)** — minted on contribution, stores tier + event metadata

### Key Functions

**RegistryFactory:**
- `createRegistry(name, description, deadline)` → deploys new Registry
- `getRegistries(creator)` → list creator's registries

**Registry:**
- `addItem(name, targetAmount)` → add wishlist item
- `contribute(itemId)` → send BTC, mint NFT, track progress
- `withdraw()` → creator claims funds (after deadline or manual close)
- `getItems()` → return all items with progress
- `getContributors()` → return all contributors with amounts

**GiftNFT:**
- OP721 standard + metadata (event name, item, amount, tier, timestamp)
- Tradeable on any OP721 marketplace

### Frontend

- React app with OPWallet integration
- Create registry flow (form → items → share link)
- Contribute flow (browse items → pick → send BTC → receive NFT)
- Dashboard (progress bars, contributor list, NFT gallery)
- Deploy to Vercel (fastest for competition)

---

## Timeline Estimate

| Phase | Hours | Deliverable |
|-------|-------|------------|
| Setup (Claude Code + plugin + OPWallet) | 1h | Dev environment ready |
| Smart contracts (Registry + NFT) | 4-5h | Tested contracts on testnet |
| Frontend (React + wallet) | 3-4h | Working UI |
| Polish + demo video | 2-3h | 90s video, README, tweet |
| Deploy to mainnet | 0.5h | Live on Bitcoin L1 |
| **Total** | **10.5-13.5h** | |

---

## Decision Needed

Pick one NFT value mechanic for the MVP:
- [ ] Option 1: Tiered scarcity (recommended — simplest, clearest value)
- [ ] Option 2: Creator perks (stickier but more complex)
- [ ] Option 3: Generosity reputation (gamified but needs extra contract)
- [ ] Option 4: Simple tradeable (lowest effort, emergent value)

Or combine elements — e.g., tiered scarcity + simple creator perks.
