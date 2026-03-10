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
- [ ] `[frontend]` P0 — OPWallet integration (connect, sign, send)
- [x] `[frontend]` P0 — Home page (hero, stats, how-it-works, active jars, bonding curve) (2026-03-10)
- [x] `[frontend]` P0 — Create Fund page (form + validation + public/private toggle) (2026-03-10)
- [x] `[frontend]` P0 — Fund Detail page (stats, contributors, contribute form, share/copy link) (2026-03-10)
- [ ] `[frontend]` P1 — Dashboard (creator's funds, totals, withdraw)
- [ ] `[frontend]` P1 — Dark/light theme toggle (port from prototype)
- [x] `[frontend]` P2 — Bonding curve visualizer (2026-03-10)
- [ ] `[frontend]` P2 — Live activity feed
- [ ] `[frontend]` P0 — **Narrative revision** — update copy/content per direction change (pending)

### Session 5 — Polish & Submit
- [ ] `[demo]` P0 — Deploy frontend to Vercel
- [ ] `[demo]` P0 — Record 90s demo video
- [ ] `[demo]` P0 — Write README with screenshots + instructions
- [ ] `[demo]` P0 — Tweet with #opnetvibecode
- [ ] `[demo]` P1 — Submit to vibecode.finance
- [ ] `[design]` P2 — Custom OG image for social sharing

## Architecture Changes (Session 4)
- Consolidated from 3 contracts (Factory + Fund + Token) to 2 contracts (Manager + Token)
- FatJarFactory + FatJarFund merged into **FatJarManager** (funds are data entries, not separate contracts)
- Reason: OPNet contracts deployed manually via OPWallet, no programmatic contract deployment
- Fund names stored via events (indexed off-chain), not on-chain string storage

## Completed
- [x] FatJarToken.wasm compiled (37KB) — OP20 + bonding curve + authorized minter
- [x] FatJarManager.wasm compiled (24KB) — fund CRUD, contributions, time-lock, withdrawals
- [x] Frontend scaffolded: Vite + React + TS, 3 routes, all components, mock data, zero build errors
- [x] Design system ported: tokens.css, typography, animations, all co-located CSS from prototype
- [x] Public/private jar visibility toggle added to Create Fund + filtered on homepage
- [x] Share/copy-link functionality on Fund Detail page
