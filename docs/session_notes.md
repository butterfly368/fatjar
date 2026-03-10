# Session Notes — FatJar ($FJAR)

---

## Session 1 — 2026-03-09 — Research & Design

**Goal:** Research OPNet ecosystem, find whitespace, design product, build prototype.

**What we did:**
1. Researched the OPNet ecosystem (318 dApps, 252 complete, 70% DeFi clones)
2. Identified whitespace: gift registries (zero projects), home services, property tokenization
3. Brainstormed three concepts: SatGift (gift registry), FixChain (home services), BitBricks (property)
4. Chose SatGift → evolved into "PiggyCoin" (social savings + bonding curve)
5. Designed full token economics (100M capped supply, bonding curve formula)
6. Built clickable HTML prototype with 4 pages + dark/light themes
7. Wrote design doc v2 with smart contract architecture

**Decisions:**
- Bonding curve: `tokens_per_btc = K / sqrt(total_btc + 1)`, K ≈ 120,000
- Zero platform fees — 100% BTC goes to fund creator
- No pre-mine, no team allocation (MVP)
- OP20 token standard, 100M cap
- 3-contract architecture: PiggyFactory, PiggyFund, PiggyToken

**Open items carried forward:**
- PiggyCoin name is taken — need new name
- MVP scope cuts needed (4 days to deadline)
- Dev environment not yet set up

**Commits:**
- `a6e2096` — Initial commit: brainstorm doc
- `23d7ceb` — Approved design document
- `5272010` — Dual-theme prototype + design doc v2

---

## Session 2 — 2026-03-09 — Project Setup & Tooling

**Goal:** Set up CLAUDE.md, TASKS.md, session_notes.md, bitcoin-agent skill, OPNet tooling.

**What we did:**
1. Created CLAUDE.md with project instructions, stack, architecture, rules
2. Created TASKS.md with full backlog organized by session, tagged and prioritized
3. Created session_notes.md with Session 1 retrospective
4. Created bitcoin-agent domain skill following existing agent pattern
5. Read vibecode.finance/bible — extracted full competition requirements + tooling
6. Installed opnet-bob MCP (`claude mcp add opnet-bob --transport http https://ai.opnet.org/mcp`)
7. Researched OPNet dev stack: btc-vision/OP_20 template, btc-runtime, unit-test-framework
8. Created `docs/opnet-reference.md` — comprehensive dev cheatsheet
9. Updated CLAUDE.md and bitcoin-agent skill with correct tooling references

**Key findings:**
- "buidl-opnet-plugin" from the bible is NOT a separate plugin — it describes Bob MCP's built-in agents (OpnetDev, OpnetAudit, OpnetCli, CodingAgent)
- opnet-bob MCP provides 28+ tools including contract scaffolding, security audit, deployment
- OP20 template: clone btc-vision/OP_20, customize `MyToken.ts`, `npm run build:token`
- Testing requires Node.js 22+ and Rust toolchain
- Deploy: upload `.wasm` via OPWallet Chrome extension
- Competition: working contract + 2-3 min video + open repo + tweet #opnetvibecode

**Files created/modified:**
- `CLAUDE.md` (new) — project instructions
- `docs/TASKS.md` (new) — full backlog, 5 sessions, tagged + prioritized
- `docs/session_notes.md` (new) — session log
- `docs/opnet-reference.md` (new) — OPNet dev cheatsheet
- `~/.claude/skills/bitcoin-agent/SKILL.md` (new) — domain agent skill
- `~/.claude.json` — opnet-bob MCP registered

**Open items carried forward:**
- PiggyCoin name is taken — need new name + ticker
- MVP scope cuts needed (4 days to deadline)
- OPWallet not yet installed (manual: Chrome extension + faucet.opnet.org)
- Node.js 22+ and Rust toolchain needed for contract testing

**Days to deadline:** 4 (March 13, 2026)

**Next session:** Finalize name + MVP scope cuts (Session 2 tasks in TASKS.md)

---

## Session 3 — 2026-03-09 — Naming & MVP Scope

**Goal:** Finalize product name, token ticker, and define MVP scope cuts.

**What we did:**
1. Brainstormed naming direction: fun & playful + piggy bank metaphor
2. Searched availability for SatPiggy, OinkFund, SatOink, BitPiggy, Buffy, FatJar
3. Found: PiggyCoin taken, BitPiggy taken, $BUFFY taken, $OINK taken
4. Landed on **FatJar / $FJAR** — unique, fun, visual, clean ticker
5. Defined MVP scope cuts:
   - **Cut:** goals system, fund types, dashboard, bonding curve visualizer, live feed
   - **Keep:** bonding curve + $FJAR token, open contributions, time-lock, dual themes, 3 pages
6. User will push on theme/UI design quality (both dark + light themes ship)
7. Renamed all references: PiggyFactory→FatJarFactory, PiggyFund→FatJarFund, PiggyToken→FatJarToken
8. Updated: design doc, CLAUDE.md, bitcoin-agent skill, TASKS.md
9. Created `docs/plans/2026-03-09-naming-and-scope.md`

**Decisions:**
- Product name: **FatJar**
- Token ticker: **$FJAR**
- Tagline: "Fill your FatJar with sats."
- MVP: 3 contracts, 3 pages, dual themes, no goals system, no dashboard
- Withdraw happens on Fund Detail page (no separate dashboard)

**Files modified:**
- `docs/plans/2026-03-09-satgift-design.md` — updated name, ticker, contract names
- `docs/plans/2026-03-09-naming-and-scope.md` (new) — naming + scope decisions
- `CLAUDE.md` — updated name, architecture, MVP scope, open decisions
- `docs/TASKS.md` — marked naming tasks complete, renamed contracts
- `~/.claude/skills/bitcoin-agent/SKILL.md` — renamed all contract references

**Open items carried forward:**
- Domain availability: check fatjar.xyz, fatjar.finance (manual)
- Logo/branding
- OPWallet not yet installed
- Node.js 22+ and Rust toolchain needed

**Days to deadline:** 4 (March 13, 2026)

**Next session:** Dev environment setup + smart contracts (Session 3 tasks in TASKS.md)

---

## Session 4 — 2026-03-10 — Smart Contracts Built

**Goal:** Set up dev environment, build and compile smart contracts.

**What we did:**
1. Cloned OP_20 template into `contracts/` directory
2. Installed dependencies (Node 22 — works despite 24+ warnings)
3. Verified toolchain: template token compiles successfully
4. Built **FatJarToken** (OP20 with bonding curve):
   - 100M max supply, 18 decimals, $FJAR ticker
   - Bonding curve: `tokens_per_btc = K / sqrt(total_btc + 1)`, K = 120,000
   - Integer sqrt via Newton's method (bounded 256 iterations)
   - Authorized minter pattern (only Manager can mint)
   - View methods: getTokenRate, getTotalBtcContributed, remainingSupply
5. Built **FatJarManager** (OP_NET — fund management):
   - createFund(name, unlockTimestamp) → returns fundId
   - contribute(fundId, satoshis) → tracks per-contributor amounts
   - withdraw(fundId) → creator only, respects time-lock
   - closeFund(fundId) → prevents new contributions
   - View methods: getFundCount, getFundDetails, getContribution, getCreatorFundCount, getCreatorFundByIndex
6. Both compile to WASM (37KB token, 24KB manager), ABIs auto-generated

**Architecture change:**
- Consolidated from 3 contracts (Factory + Fund + Token) to **2 contracts** (Manager + Token)
- Reason: OPNet contracts are deployed manually via OPWallet — no programmatic contract deployment like Solidity's `new Contract()`
- Funds are data entries in Manager contract, not separate contracts
- Fund names emitted in events (indexed off-chain), not stored as on-chain strings

**Key learnings:**
- `StoredU256` constructor: `(pointer, EMPTY_POINTER)` not `(pointer, defaultValue)`
- `_maxSupply` is `StoredU256`, need `.value` to get `u256`
- `_addressToU256` only on `OP20S`, not `OP20` — use `u256.fromUint8ArrayBE(addr)`
- Non-token contracts extend `OP_NET`, token contracts extend `OP20`
- Storage: `StoredMapU256` for key-value, `Blockchain.nextPointer` for slots

**Files created:**
- `contracts/src/fatjar-token/FatJarToken.ts` — OP20 token with bonding curve
- `contracts/src/fatjar-token/events/FatJarTokenEvents.ts` — ContributionMinted event
- `contracts/src/fatjar-token/index.ts` — entry point
- `contracts/src/fatjar-manager/FatJarManager.ts` — fund management contract
- `contracts/src/fatjar-manager/events/FatJarManagerEvents.ts` — fund events
- `contracts/src/fatjar-manager/index.ts` — entry point
- `contracts/build/FatJarToken.wasm` — compiled token contract
- `contracts/build/FatJarManager.wasm` — compiled manager contract

**Open items carried forward:**
- OPWallet not yet installed (manual: Chrome extension + faucet.opnet.org)
- Contracts not yet deployed to testnet
- No unit tests yet (need Rust toolchain for OP-VM)
- Cross-contract calls (Manager calling Token.mintForContribution) not yet tested on-chain
- Fund name not stored on-chain — relies on event indexing

**Days to deadline:** 3 (March 13, 2026)

**Next steps:** Deploy to testnet, test full flow (create fund → contribute → check token mint), then frontend integration
