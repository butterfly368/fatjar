# FatJar — Security Audit Notes

> Consolidated from two independent reviews (2026-03-13): manual code review + opnet-bob MCP audit.
> Scope: FatJarManager.ts, FatJarToken.ts, event files, frontend service layer.

**Overall:** Contract architecture is solid — proper access control, SafeMath throughout, one-time admin guards, burn-on-refund protection, CEI mostly followed. The core gap is that **contracts are an accounting layer without real BTC movement enforcement.** This is acceptable for the competition testnet demo but must be fixed before mainnet.

---

## Critical — Must Fix Before Mainnet

### C1: contribute() does not verify actual BTC transfer

**File:** `FatJarManager.ts:281-338`

The `satoshis` parameter is self-reported from calldata. The contract never verifies that the caller actually sent BTC in the transaction outputs. Anyone can call `contribute(fundId, 999999999n)` without sending any BTC, inflating `totalRaised` and minting $FJAR tokens for free.

**Fix:** Verify BTC outputs match claimed `satoshis` using OPNet's payable mechanism / `setTransactionDetails()`.

### C2: withdraw() and refund() never transfer BTC

**File:** `FatJarManager.ts:353-430, 525-596`

Both methods update accounting (`fundWithdrawn`, zero out contributions) and emit events, but never create a BTC output to the recipient. The return value `netAmount` is informational only — no actual BTC moves.

**Fix:** Implement UTXO-based BTC transfer via OPNet's transaction output mechanism.

### C3: Missing ReentrancyGuard

**File:** `FatJarManager.ts` (whole contract)

The contract makes cross-contract calls via `Blockchain.call()` (lines 811, 837) without a ReentrancyGuard. OPNet audit guidelines list this as mandatory for any contract using `Blockchain.call()`.

Additionally, `contributionTokensEarned` is updated (line 332) AFTER the cross-contract mint call (line 327) — a CEI violation.

**Fix:** Add ReentrancyGuard. Move token tracking update before the cross-contract call.

---

## High — Fix Before Mainnet

### H1: Fund name never emitted in event

**File:** `FatJarManager.ts:212-263`

`createFund()` reads `name` from calldata (line 212) but never passes it to `FundCreatedEvent` (line 258). The comment says "Fund name stored via events only" — but the name isn't in the event. Fund names are permanently lost on-chain. Frontend currently works around this with localStorage cache + hardcoded seed names.

**Fix:** Add `name: string` to `FundCreatedEvent` constructor and emit it.

### H2: Custom network object instead of networks.opnetTestnet

**File:** `contract.live.ts:22-30`

Hardcoded `opnetTestnet` object instead of `networks.opnetTestnet` from `@btc-vision/bitcoin`. If OPNet updates network parameters, this manual copy becomes stale.

**Fix:** `import { networks } from '@btc-vision/bitcoin'` and use `networks.opnetTestnet`.

### H3: encodeAndSend() bypasses simulation

**File:** `contract.live.ts:346-369`

The fallback `encodeAndSend()` skips simulation entirely. OPNet guidelines: "NEVER skip simulation."

**Fix:** Always simulate. If simulation fails due to sender mismatch, construct a proper sender Address rather than bypassing.

---

## Medium — Improve for Mainnet

### M1: Withdraw doesn't close the fund

**File:** `FatJarManager.ts:353-430`

After `withdraw()`, the fund remains open (`isClosed` never set). New contributions can arrive, enabling repeated withdrawals. This creates an implicit "streaming withdraw" pattern that isn't documented.

**Fix:** Either auto-close after withdrawal, or document as intentional and surface in UI.

### M2: Boolean storage as u256

**File:** `FatJarManager.ts:42-43, 66`

`fundIsClosed`, `fundIsDeleted` store booleans as `StoredMapU256` (32 bytes each). Should use `StoredBoolean` per OPNet guidelines for gas efficiency.

### M3: CURRENT_BLOCK hardcoded at 890000

**File:** `types/index.ts:102`

All vault status logic uses this static value. OPNet testnet is actually at block ~5,863. Dates display correctly (same constant in `blockToDate`), but on-chain time-locks are set ~888K blocks in the future — functionally broken on testnet.

**Fix:** Fetch current block from RPC in live mode.

### M4: compositeKey 128-bit truncation

**File:** `FatJarManager.ts:853-856`

`compositeKey(a, b)` shifts `a` left 128 bits and ORs with `b`. For 256-bit addresses, this loses lower 128 bits of `a`. Collision probability ~2^-128 (negligible) but not collision-proof.

**Fix:** Use hash-based composite: `SHA256(a || b)`.

---

## Low / Informational

| Issue | File | Notes |
|-------|------|-------|
| `any` types with eslint-disable | contract.live.ts | OPNet TypeScript Law mandates zero `any` |
| JSONRpcProvider positional args | contract.live.ts:190 | OPNet convention: use config object |
| tokenAddress uses StoredMapU256 for single value | FatJarToken.ts | StoredU256 would suffice |
| No input validation on frontend fundId | contract.live.ts | `BigInt(fundId)` throws on non-numeric |
| Race condition in metadata cache | contract.live.ts:605 | `getFundCount()` returns stale count pre-confirmation |
| WalletState.balance is number not bigint | types/index.ts:145 | Precision loss > 2^53 sats (unlikely) |
| Unbounded getAllVaults() scan | contract.live.ts:467 | O(n) RPC calls, no pagination |
| Admin page publicly routable | Admin.tsx | On-chain access control prevents misuse, but UX concern |

---

## Mainnet Readiness Checklist

- [ ] C1: BTC verification in contribute()
- [ ] C2: BTC transfer in withdraw() and refund()
- [ ] C3: ReentrancyGuard + CEI fix
- [ ] H1: Fund name in event
- [ ] H2: Use networks.opnetTestnet
- [ ] H3: Remove encodeAndSend bypass
- [ ] M1: Auto-close after withdraw (or document)
- [ ] M2: StoredBoolean for flags
- [ ] M3: Dynamic CURRENT_BLOCK from RPC
- [ ] Event indexer for jar names + contributor lists
- [ ] Professional security audit before mainnet deployment
