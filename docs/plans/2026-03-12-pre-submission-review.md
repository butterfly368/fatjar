# FatJar Pre-Submission Review — 2026-03-12

**Status:** Review complete. Fixes in progress.
**Deadline:** March 13, 2026 (vibecode.finance Week 3)

---

## 1. Code Review Summary

### Critical

| # | Issue | Status | Notes |
|---|-------|--------|-------|
| C1 | `withdraw` missing `isDeleted` check | TODO | Add check — `contribute` has it, `withdraw` doesn't |
| C2 | Withdraw fee accounting needs documentation | TODO | `fundWithdrawn` set to full `totalRaised`, `netAmount` emitted — internally consistent but unclear |
| C3 | No BTC transfer in withdraw/refund — event-only settlement | TODO | Document that OPNet handles BTC at UTXO layer; contract manages state + events |

### High

| # | Issue | Status | Notes |
|---|-------|--------|-------|
| H1 | `compositeKey` truncates addresses to 128 bits | ACCEPT | 2^128 collision probability is negligible; standard OPNet pattern |
| H3 | `Blockchain.tx.sender` semantics for cross-contract calls | VERIFIED | Session 15 confirmed `createFund` works on-chain — sender semantics are correct |
| H4 | Docs said "Zero fees" but code has 0.5% | FIXED | Updated vault-redesign.md and implementation plan |

### Medium

| # | Issue | Status | Notes |
|---|-------|--------|-------|
| M2 | Dashboard shows Withdraw on time-locked vaults | TODO | Hide button when `unlockBlock > currentBlock` |
| M3 | Two different `getVaultStatus` functions | TODO | Unify into shared utility in types/index.ts |
| M6 | 3 different hardcoded block numbers (860000, 860000, 890000) | TODO | Consolidate to single constant |
| M7 | `ZERO_ADDRESS` is 40 chars (EVM), should be 64 chars (OPNet) | TODO | Fix in types/index.ts — will break vault mode detection on live data |
| M4 | Admin page accessible without auth | ACCEPT | Contract enforces `onlyDeployer`; admin page is for deployer convenience |
| M5 | `createVault` caches metadata under wrong ID (race condition) | ACCEPT | Edge case; cache is best-effort fallback for fund names |

### Low / Info

- No automated tests (acknowledged — competition deadline)
- `isPublic` is frontend-only, not stored on-chain (acknowledged — documented in session 12)
- Fund names are event-only — Explore page shows "Jar #N" for others' jars (acceptable for MVP)
- Service facade pattern (mock/live split) is well-designed — will impress judges

---

## 2. Fee Documentation

**Actual implementation:** 0.5% fee on withdrawal only. Contributing is free.

**Updated docs:**
- `vault-redesign.md` line 14: ~~"Zero platform fees"~~ → "Contributing is free — 0.5% fee on withdrawal only"
- `vault-redesign.md` lines 109-115: ~~"Zero fees at launch / future monetization"~~ → "0.5% fee on withdrawals only"
- `vault-redesign.md` line 314: ~~"No platform fees"~~ → "0.5% fee on withdrawal only"
- `vault-implementation.md` line 656: ~~"Zero platform fees"~~ → "0.5% withdrawal fee (contributing is free)"

**Frontend (already correct):**
- HowItWorks: "Three Steps. One Tiny Fee." / "0.5% on withdrawal only"
- FeaturesSection: "Contributing is free — 100% of every sat goes into the jar. When the creator withdraws, a 0.5% fee supports the protocol."

---

## 3. OPNet Vision Alignment

**Strong alignment:** Native BTC, unlocks dormant value, whitespace positioning (only social savings among 354 dApps), deep OPNet usage (cross-contract calls, composite storage, bonding curve in AS).

**Weak:** Not a DeFi primitive (DEX/stablecoin/lending). Standalone product, no composability story yet.

**Estimated competition score:** 77-89 / 100 — competitive for top 10.

---

## 4. Token Strategy

- **Mint on testnet:** Yes — proves contracts work, essential for demo video
- **DEX pairing (MOTO/PILL):** No — bonding curve IS the pricing mechanism; DEX creates competing price signal
- **Post-mainnet liquidity:** Use protocol treasury from 0.5% withdraw fees to seed pool when demand warrants

---

## 5. Transition Strategy (Open Source → Mainnet)

- **Fork risk:** Low in OPNet's small ecosystem; moat = active jars + FJAR distribution + brand
- **License:** Switch contracts to BSL 1.1 after competition (March 14); keep frontend MIT
- **Mainnet:** Fresh deploy March 17; budget ~$60 BTC for gas
- **Decision gate:** Week 6 — if <10 jars with <3 unique contributors, pivot

---

## 6. Fiat Onramp (Future)

- **Thesis is correct** but OPNet lacks infrastructure (no account abstraction)
- **Now:** Add `contributeOnBehalfOf()` to contract (~20 lines) to preserve architectural path
- **Later:** Build relay service post-mainnet if ecosystem grows
- **Standalone opportunity:** First fiat onramp for OPNet = highest-value infrastructure play if ecosystem takes off

---

## 7. Positioning (Resolved)

### FatJar vs Juicebox — REJECTED

Juicebox is permissionless crowdfunding for strangers/DAOs ($175M raised, now essentially dead at $121K market cap). FatJar is social savings for trusted relationships. Different products, different audiences.

### Competitive Landscape

No live protocol on any chain combines group savings jars + beneficiary + time-locks + goal-based refunds + bonding curve rewards. On-chain attempts at similar concepts all died (WeTrust, Bloinx, Pigzbe, Ernit). Demand is proven by fintech (PayPal relaunched Pools, MoneyFellows 8.5M users, VC money flowing into Tanda/WeSpare).

### Final Positioning

**Tagline:** "A piggy bank that actually grows with your child."
**Pitch:** "Lock Bitcoin until they're 18. Family and friends contribute along the way. Nobody can touch it early — not even you."
**Hero use case:** "Emma's College Fund, unlocks 2044, beneficiary = Emma's wallet."
**Differentiator:** Traditional savings lose value to inflation. A FatJar holds Bitcoin. Plus trustless time-locks nobody can break — not even the creator.
