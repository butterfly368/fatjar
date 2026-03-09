# Bitcoin Piggy Bank — Design Document v2

**Date:** 2026-03-09
**Status:** Approved (evolving)
**Competition:** vibecode.finance Week 3 "The Breakthrough" (deadline Mar 13)
**Platform:** OPNet (Bitcoin L1, AssemblyScript/WASM)
**Name:** TBD (working name: PiggyCoin — exploring alternatives)

---

## 1. Product Overview

A social savings protocol on Bitcoin L1. Anyone creates a fund ("piggy bank"). Family and friends contribute BTC. Contributors earn tokens via a bonding curve — early contributors earn more.

### Core Principles
- **No platform fees.** 100% of BTC goes to the fund.
- **Tokens are the incentive.** Contributors earn tokens as rewards.
- **Early = more.** Bonding curve rewards early adopters.
- **Any occasion.** Kids fund, wedding, savings goal, or no reason at all.
- **Recurring or one-time.** Contribute once or keep adding over years.
- **Optional time-lock.** Lock funds until a date (e.g., kid turns 18).

### What This Is NOT
- Not a gift registry with product lists
- Not a DeFi protocol for yield farming
- Not a meme coin — the token has purpose

---

## 2. Token Economics

### Token: $[TBD] (OP20)
- **Max supply:** 100,000,000 tokens (capped)
- **Minting:** Only via contributions to funds (no pre-mine, no team allocation for MVP)
- **Tradeable:** On any OPNet DEX

### Bonding Curve
Tokens minted per BTC decrease as total platform BTC contributed increases.

Formula: `tokens_per_btc = K / sqrt(total_btc + 1)` where K ≈ 120,000

| Platform Total BTC | Tokens per 0.01 BTC | Rate per BTC |
|---|---|---|
| 0 - 1 | ~1,200 | 120,000 |
| 1 - 5 | ~800 | 80,000 |
| 5 - 20 | ~400 | 40,000 |
| 20 - 100 | ~150 | 15,000 |
| 100+ | ~50 | 5,000 |

### Token Utility
- **MVP:** Tradeable + social signal (generosity score)
- **v2:** Governance votes, premium features, custom fund pages

### Viral Loop
Create fund → share link → friend contributes → friend earns tokens →
friend shares ("get in early") → more funds → more contributions → token value rises

The fund creator is the distribution channel. Every fund shared = marketing.

---

## 3. Smart Contract Architecture

### Contracts
1. **PiggyFactory** — creates funds, tracks global state (total BTC, token supply)
2. **PiggyFund** — individual fund with goals, contributions, time-lock
3. **PiggyToken (OP20)** — bonding curve minting, capped at 100M

### PiggyFactory
- `createFund(name, description, unlockDate?)` → deploys new fund
- `getFunds(creator)` → list creator's funds
- `getTotalBTC()` → total BTC contributed platform-wide
- `getTokenRate()` → current tokens per BTC

### PiggyFund
- `addGoal(name, targetAmount)` → add savings goal
- `contribute(goalId?)` → send BTC, triggers token mint
- `withdraw()` → creator claims (blocked if time-locked)
- `close()` → creator closes fund
- `getGoals()` → all goals with progress
- `getContributors()` → contributor list with amounts + tokens earned

### PiggyToken (OP20)
- Standard OP20 (transfer, approve, balanceOf)
- `mint(to, amount)` — only callable by Factory during contribution
- `totalMinted()` — tokens minted so far (of 100M cap)
- `remainingSupply()` — tokens left to mint

---

## 4. Frontend

React app with OPWallet integration. Both light and dark themes.

### Pages
1. **Home** — Hero, stats (TVL, funds, token price), live feed, how-it-works, bonding curve explainer
2. **Create** — Fund type (one-time/ongoing), name, description, unlock date, goals
3. **Fund Page** — Total raised, goals with progress, contributor list with token earnings, contribute CTA
4. **Dashboard** — Creator's funds, totals, withdraw

### Themes
- **Dark:** Deep space background, glass cards, orange glow effects. "Cool dad/uncle" vibe.
- **Light:** Clean white, warm accents, friendly. "Auntie/grandma" vibe.
- Toggle switch in nav.

### Deploy
Vercel (fastest for competition). Can move to .btc domain later.

---

## 5. Demo & Submission

90s video:
- Hook: "What if your kid's piggy bank was on Bitcoin?"
- Create a fund: "Emma's College Fund, unlocks 2044"
- Contribute: progress bars fill, tokens mint
- Show bonding curve: "early givers earn more"
- Tagline + GitHub link

Submission: GitHub + video + README + tweet #opnetvibecode + live Vercel demo

---

## 6. Open Questions
- [ ] Final name and ticker
- [ ] Logo design
- [ ] Images/illustrations for the landing page
- [ ] NFT layer (v2 — deferred)
