# Tasks — FatJar ($FJAR)

> Filter by tags: `[naming]` `[contracts]` `[frontend]` `[design]` `[infra]` `[demo]` `[tokenomics]`
> Priority: P0 = blocks everything, P1 = must ship, P2 = nice to have

## Backlog

### Session 2 — Name & Scope
- [x] `[naming]` P0 — Finalize product name → **FatJar** (2026-03-09)
- [x] `[naming]` P0 — Choose token ticker → **$FJAR** (2026-03-09)
- [ ] `[naming]` P1 — Check domain availability (fatjar.xyz, fatjar.finance)
- [x] `[naming]` P1 — Update design doc with final name (2026-03-09)
- [x] `[tokenomics]` P1 — MVP scope cuts defined (2026-03-09) — see `docs/plans/2026-03-09-naming-and-scope.md`
- [ ] `[design]` P2 — Logo concept / placeholder

### Session 3 — Dev Environment & Contracts
- [x] `[infra]` P0 — Install opnet-bob MCP (2026-03-09)
- [ ] `[infra]` P0 — Set up OPWallet, get testnet BTC from faucet
- [x] `[infra]` P0 — Verify toolchain works (npm install + build compiles) (2026-03-10)
- [x] `[contracts]` P0 — Build FatJarToken (OP20 with bonding curve) (2026-03-10)
- [x] `[contracts]` P0 — Build FatJarManager (fund creation, contributions, time-lock, withdraw) (2026-03-10)
- [ ] `[contracts]` P1 — Deploy all contracts to OPNet testnet
- [ ] `[contracts]` P1 — Test: create fund, contribute, check token mint math

### Session 4 — Frontend
- [x] `[frontend]` P0 — Scaffold React + TypeScript + Vite project (2026-03-10)
- [x] `[frontend]` P0 — Wire frontend to real OPNet contracts (strategy pattern: mock + live) (2026-03-10)
- [ ] `[frontend]` P2 — OPWallet write transaction signing (stretch goal)
- [x] `[frontend]` P0 — Home page (hero, stats, how-it-works, active jars, bonding curve) (2026-03-10)
- [x] `[frontend]` P0 — Create Fund page (form + validation + public/private toggle) (2026-03-10)
- [x] `[frontend]` P0 — Fund Detail page (stats, contributors, contribute form, share/copy link) (2026-03-10)
- [ ] `[frontend]` P1 — Dashboard (creator's funds, totals, withdraw)
- [ ] `[frontend]` P1 — Dark/light theme toggle (port from prototype)
- [x] `[frontend]` P2 — Bonding curve visualizer (2026-03-10)
- [ ] `[frontend]` P2 — Live activity feed
- [ ] `[frontend]` P0 — **Narrative revision** — update copy/content per direction change (pending)

### Session 16 — Display Bug Fixes
- [x] `[frontend]` P0 — Fix jar name/description display (localStorage metadata cache) (2026-03-12)
- [x] `[frontend]` P0 — Fix creator/beneficiary address display (bigint→hex) (2026-03-12)
- [x] `[frontend]` P0 — Fix $FJAR token rate display (18-decimal formatting) (2026-03-12)
- [x] `[frontend]` P0 — Fix contribute estimate formula (2026-03-12)
- [x] `[frontend]` P0 — Consolidate formatTokens into shared types module (2026-03-12)
- [ ] `[demo]` P0 — Test display fixes on Vercel with live mode
- [ ] `[demo]` P0 — Create 4 seed jars on-chain
- [ ] `[demo]` P0 — Test contribute flow (Account 2 → jar)

### Session 5 — Polish & Submit
- [x] `[demo]` P0 — Deploy frontend to Vercel → https://fatjar-ten.vercel.app/ (2026-03-10)
- [ ] `[demo]` P0 — Record 90s demo video
- [x] `[demo]` P0 — Write README with screenshots + instructions (2026-03-10)
- [ ] `[demo]` P0 — Tweet with #opnetvibecode
- [ ] `[demo]` P1 — Submit to vibecode.finance
- [ ] `[design]` P2 — Custom OG image for social sharing

## Architecture Changes (Session 4)
- Consolidated from 3 contracts (Factory + Fund + Token) to 2 contracts (Manager + Token)
- FatJarFactory + FatJarFund merged into **FatJarManager** (funds are data entries, not separate contracts)
- Reason: OPNet contracts deployed manually via OPWallet, no programmatic contract deployment
- Fund names stored via events (indexed off-chain), not on-chain string storage

## Post-Competition — Event Indexer

All three require an indexer that listens to contract events and stores data in an off-chain DB:

- [ ] `[infra]` P1 — **Jar name/description indexing** — `FundCreatedEvent` includes name + description as event data, but not stored on-chain. Currently using localStorage cache + hardcoded fallback. Indexer needed for any user to see jar names.
- [ ] `[infra]` P1 — **Contributor list indexing** — `ContributionEvent` emits contributor address + amount + tokens minted. Contract only stores per-address lookups (`getContribution(fundId, addr)`), not an iterable list. `getVaultContributions()` in live mode is a stub returning `[]`. Indexer needed to display contributor table.
- [ ] `[infra]` P2 — **Activity feed** — index all events (create, contribute, withdraw, refund) for a live activity feed on homepage.

## Completed
- [x] FatJarToken.wasm compiled (37KB) — OP20 + bonding curve + authorized minter
- [x] FatJarManager.wasm compiled (24KB) — fund CRUD, contributions, time-lock, withdrawals
- [x] Frontend scaffolded: Vite + React + TS, 3 routes, all components, mock data, zero build errors
- [x] Design system ported: tokens.css, typography, animations, all co-located CSS from prototype
- [x] Public/private jar visibility toggle added to Create Fund + filtered on homepage
- [x] Share/copy-link functionality on Fund Detail page
