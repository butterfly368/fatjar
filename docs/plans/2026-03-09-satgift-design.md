# SatGift — Design Document

**Date:** 2026-03-09
**Status:** Approved
**Competition:** vibecode.finance Week 3 "The Breakthrough" (deadline Mar 13)
**Platform:** OPNet (Bitcoin L1, AssemblyScript/WASM)

---

## 1. Product Overview

SatGift is the first Bitcoin gift registry and savings piggy bank on L1.

### Two Modes

| Mode | Use Case | Duration | Withdrawal |
|------|----------|----------|------------|
| Registry | Wedding, birthday, housewarming, baby shower | Fixed deadline | Creator withdraws after event |
| Piggy Bank | Kid's trust fund, family savings, education fund | Ongoing (years) | Time-locked — unlocks on a set date |

### Core Flow

1. Creator sets up a fund (registry or piggy bank)
2. Adds goals with BTC target amounts
3. Shares a link
4. Contributors send BTC to specific goals
5. Contributors receive OP721 NFTs
6. Creator withdraws — immediately after deadline (registry) or after timelock (piggy bank)

No platform fees. Just Bitcoin transaction costs.

---

## 2. Smart Contract Architecture

### SatGiftFactory

Entry point. Deploys new funds, tracks all funds globally.

- `createRegistry(name, description, deadline)` — one-time event fund
- `createPiggyBank(name, description, unlockDate)` — time-locked savings
- `getFunds(creator)` — list all funds by creator
- `getAllFunds()` — global directory

### SatGiftFund

Each registry/piggy bank is its own contract instance.

- `addGoal(name, targetAmount)` — add a goal item
- `contribute(goalId)` — send BTC, triggers NFT mint
- `withdraw()` — creator claims funds (blocked until deadline/unlock date)
- `close()` — creator manually closes the fund
- `getGoals()` — all goals with progress
- `getContributors()` — all contributors with amounts

Rules:
- Registry: withdrawal unlocks after deadline
- Piggy bank: withdrawal unlocks after unlock date (CSV timelock)
- Creator can add goals but cannot reduce targets
- Real-time progress tracking per goal

### SatGiftNFT (OP721)

Minted automatically on contribution. NFT design TBD — exploring both tiered scarcity (Bronze/Silver/Gold/Diamond based on amount) and unique tradeable commemorative designs. Contract interface stays the same either way.

Metadata stored on-chain: fund name, goal name, contribution amount, mint timestamp, contributor address. Tradeable on any OP721 marketplace.

---

## 3. Frontend

React app with OPWallet integration. Deploy to Vercel.

### Pages

1. **Home** — Hero ("The first Bitcoin piggy bank"), two CTAs (Create Registry / Start Piggy Bank), live contribution feed
2. **Create Fund** — Form: name, description, type, deadline/unlock date, goals with target amounts. Generates shareable link.
3. **Fund Page** (public) — Fund info, goals with progress bars, contribute button per goal (OPWallet), contributor wall, countdown timer
4. **Dashboard** (creator) — All funds, totals raised, withdraw button, contributor details

---

## 4. Demo & Submission

90-second video:
- 0-15s: Hook — "What if your kid's piggy bank was on Bitcoin?"
- 15-35s: Create piggy bank — "Emma's College Fund, unlocks 2044"
- 35-55s: Contribute as family member, progress bars fill, NFT mints
- 55-70s: Contributor wall, NFT in wallet
- 70-85s: Registry mode — wedding example
- 85-90s: Tagline + GitHub link

Submission: GitHub repo + demo video + tweet #opnetvibecode + live Vercel demo

---

## 5. NFT Design (TBD)

Two options under consideration:

**Option A — Tiered scarcity:** Bronze (any amount, unlimited), Silver (>0.01 BTC, 50 max), Gold (>0.05 BTC, 10 max), Diamond (>0.1 BTC, 3 max). Overflow: get highest available tier you qualify for.

**Option B — Unique tradeable commemorative:** Each NFT is visually unique, value from social meaning + scarcity. No explicit tiers.

Decision deferred. Contract interface identical for both.
