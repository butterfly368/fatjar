# FatJar — Project Instructions

## What This Is
Social savings protocol on Bitcoin L1 via OPNet. Competition entry for vibecode.finance Week 3 "The Breakthrough" (deadline: **March 13, 2026**).

**Product:** FatJar | **Token:** $FJAR (OP20) | **Tagline:** "Fill your FatJar with sats."

Anyone creates a fund ("jar"). Family/friends contribute BTC. Contributors earn $FJAR tokens via bonding curve — early = more tokens. Zero platform fees.

## Stack
- **Smart contracts:** AssemblyScript (OPNet/WASM), built with `@btc-vision/btc-runtime`
- **AI tooling:** opnet-bob MCP (28+ tools: OpnetDev, OpnetAudit, OpnetCli, CodingAgent)
- **Frontend:** React + TypeScript + Vite
- **Wallet:** OPWallet (Chrome extension, regtest network)
- **Token standard:** OP20 (bonding curve mint, 100M cap)
- **Testing:** `@btc-vision/unit-test-framework` (Node.js 22+, Rust)
- **Deploy:** Vercel (frontend), OPNet testnet via OPWallet (contracts)

## Repo Structure
```
docs/plans/              # Design docs, brainstorm
docs/session_notes.md    # Session log
docs/TASKS.md            # Task tracking (tagged)
docs/opnet-reference.md  # OPNet dev cheatsheet (contracts, testing, deploy)
prototype/               # HTML clickable prototype (reference only)
contracts/               # AssemblyScript smart contracts (TBD)
frontend/                # React app (TBD)
```

## Key Architecture
- **FatJarFactory** — creates funds, tracks global state (total BTC, token supply)
- **FatJarFund** — individual fund (open contributions, optional time-lock)
- **FatJarToken (OP20, $FJAR)** — bonding curve: `tokens_per_btc = K / sqrt(total_btc + 1)`, K ≈ 120,000

## MVP Scope (Mar 13)
- **In:** bonding curve + $FJAR, open contributions, optional time-lock, 3 contracts, dark+light themes, 3 pages (Home, Create, Fund)
- **Out:** goals system, fund types, dashboard, bonding curve visualizer, live feed, NFTs, governance

## Rules
- Read existing code/docs before modifying
- Use `docs/TASKS.md` for task tracking — filter by tags
- Log every session in `docs/session_notes.md`
- Design doc is source of truth: `docs/plans/2026-03-10-vault-redesign.md`
- Prototype is reference only — don't modify `prototype/index.html`
- No pre-mine, no team token allocation (MVP)
- Zero platform fees (100% BTC to fund creator)
- Competition deadline is hard — ship MVP, defer nice-to-haves
- Do NOT add `Co-Authored-By` lines to commit messages

## Open Decisions
- [x] Final name and ticker — FatJar / $FJAR
- [x] MVP scope cuts — see above
- [ ] Logo/branding
- [ ] Domain (check fatjar.xyz, fatjar.finance)

## Task Tags
- `[naming]` — name, ticker, domain, branding
- `[contracts]` — smart contract development
- `[frontend]` — React app, wallet integration
- `[design]` — UI/UX, themes, assets
- `[infra]` — dev environment, tooling, deploy
- `[demo]` — video, README, submission
- `[tokenomics]` — bonding curve, supply mechanics

## Agent
Domain agent: `bitcoin-agent` — invoke for any work in this repo.
