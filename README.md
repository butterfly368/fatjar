# FatJar — A Piggy Bank That Actually Grows With Your Child

**Live:** [fatjar-ten.vercel.app](https://fatjar-ten.vercel.app/)
**Competition:** vibecode.finance Week 3 — "The Breakthrough"
**Token:** $FJAR (OP20) | **Platform:** OPNet (Bitcoin L1)

---

## What is FatJar?

A piggy bank that actually grows with your child. Lock Bitcoin until they're 18 — nobody can touch it early, not even you. Family and friends contribute along the way, earning $FJAR reward tokens that grow in value as more families join.

FatJar is the first trustless social savings protocol on Bitcoin L1. Create a savings jar with an optional time-lock and beneficiary, share the link, and collect BTC contributions. Two things grow: the Bitcoin inside (unlike traditional savings that lose value to inflation) and the $FJAR tokens every contributor earns (worth more the earlier you join, thanks to the bonding curve).

No protocol on Ethereum, Solana, or any other chain does this.

### Two Jar Types

| Type | What it does |
|------|-------------|
| **Open Jar** | Collect BTC. Creator withdraws when the jar unlocks. |
| **Goal Jar** | Set a target. Hit it or everyone gets their BTC back. |

Both types support an optional **beneficiary** (someone else opens the jar) and optional **time-lock** (Bitcoin enforces the unlock date — nobody can override it).

### Key Features

- **Trustless time-locks** — Bitcoin enforces the unlock date. Not even the creator can withdraw early.
- **Beneficiary support** — save for someone else. They open the jar when it unlocks.
- **All-or-nothing goals** — set a target, miss it, everyone gets refunded automatically.
- **Bonding curve rewards** — early contributors earn more $FJAR per BTC.
- **Burn-on-refund** — refunding burns your $FJAR, protecting token value.
- **0.5% withdraw fee** — contributing is free, tiny fee on withdrawal only.

### Why This Belongs on Bitcoin L1

This is not a webapp with a token bolted on. The time-lock is enforced by Bitcoin itself — no server, no admin, no override. The bonding curve mints $FJAR via cross-contract calls between Manager and Token contracts. Refunds trigger on-chain burns. Four vault modes emerge from two optional parameters (goal amount + beneficiary), keeping the contract surface small while covering use cases from open collections to trust funds. Every piece of state is on-chain and verifiable.

No protocol on Ethereum, Solana, or any other chain combines group savings jars + beneficiary + goal-based refunds + trustless time-locks + bonding curve rewards. This is a genuinely new primitive.

---

## Architecture

Two smart contracts on OPNet (Bitcoin L1, AssemblyScript/WASM):

| Contract | Purpose | Size |
|----------|---------|------|
| **FatJarManager** | Vault CRUD, contributions, time-lock, withdraw, refund | 26 KB |
| **FatJarToken** (OP20) | $FJAR bonding curve mint, burn-on-refund, 100M cap | 37 KB |

**Deployed on OPNet testnet:**
- Token: `opt1sqznxd9r5fq3kqev8rra939l386r9szhszg333mnl`
- Manager: `opt1sqpyju3avp2h3q2hjk0evaaat8juz7vkagcuay866`

**Frontend** reads from real on-chain state when the RPC is reachable, with mock fallback for demo. The LIVE/DEMO badge in the stats strip shows which mode is active.

---

## Tech Stack

- **Smart Contracts:** AssemblyScript (OPNet/WASM), `@btc-vision/btc-runtime`
- **Frontend:** React 19 + TypeScript + Vite
- **Chain Integration:** `opnet` SDK (JSONRpcProvider + getContract)
- **Wallet:** OPWallet (Chrome extension) with mock fallback
- **Token Standard:** OP20 (bonding curve, 100M capped supply)
- **Deploy:** Vercel (frontend), OPNet testnet (contracts)

---

## Project Structure

```
contracts/          # AssemblyScript smart contracts
  src/fatjar-token/   # OP20 token with bonding curve
  src/fatjar-manager/ # Vault management contract
  build/              # Compiled WASM binaries
  abis/               # Generated ABI files

frontend/           # React + Vite app
  src/pages/          # Home, Create, Fund Detail, Dashboard
  src/services/       # contract.ts (facade), contract.live.ts, contract.mock.ts
  src/components/     # UI components (editorial brutalist design)

scripts/            # Deployment scripts
docs/               # Design docs, session notes, task tracking
```

---

## Run Locally

```bash
# Frontend
cd frontend
npm install
npm run dev        # → http://localhost:5173

# Add ?mock=true to force demo mode
# Add ?live=true to force chain reads
```

---

## Bonding Curve

$FJAR uses a decreasing bonding curve: `tokens_per_btc = 120,000 / sqrt(total_btc + 1)`

| BTC Contributed | Rate | Tokens/BTC |
|----------------|------|------------|
| 0 – 1 BTC | Early Bird | 120,000 |
| 1 – 10 BTC | Growth | ~38,000 |
| 10 – 100 BTC | Mature | ~12,000 |
| 100+ BTC | Late | ~3,800 |

Early contributors are rewarded. No pre-mine, no team allocation.

---

## Security

- One-time guards on `setManager()` / `setTokenAddress()` — cannot be changed after linking
- Checks-Effects-Interactions pattern throughout
- `MAX_SATOSHIS` overflow protection on bonding curve
- Authorized minter pattern — only Manager can mint $FJAR
- Burn-on-refund prevents curve manipulation
- Code reviewed across 2 dedicated security review sessions

---

## MVP Scope & Known Limitations

This is a competition MVP (vibecode.finance Week 3, deadline March 13 2026). Core protocol and frontend are complete and deployed. The following are documented architectural trade-offs, not bugs:

- **Jar names are event-only** — names are stored in transaction calldata (events), not contract state. The frontend caches names locally; other users see "Jar #N" until an off-chain event indexer is built.
- **Contributor lists** — individual contribution amounts are on-chain and queryable per-address, but there is no on-chain enumeration of all contributors for a given jar. The detail page shows contributor count but not the full list in live mode.
- **Write transactions** — the architecture supports OPWallet signing (simulate → send pattern), but the full signing UX flow requires OPWallet extension + testnet BTC. Demo mode simulates all write actions.
- **No event indexer** — activity feed and cross-user jar discovery depend on indexing contract events. This is planned infrastructure, not an MVP deliverable.

**Deferred to v2:** dark mode, search/filter, activity feed, milestone-based partial unlocks, fiat onramp.

---

## License

MIT
