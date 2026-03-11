# FatJar — Project Instructions

## What This Is
Social savings protocol on Bitcoin L1 via OPNet. Competition entry for vibecode.finance Week 3 "The Breakthrough" (deadline: **March 13, 2026**).

**Product:** FatJar | **Token:** $FJAR (OP20) | **Tagline:** "The Piggy Bank for Everyone on Bitcoin."

Anyone creates a jar. Family/friends contribute BTC. Contributors earn $FJAR tokens via bonding curve — early = more tokens. Two jar types (Open Jar + Goal Jar) with optional beneficiary and time-lock. 0.5% withdraw fee funds protocol development.

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
contracts/               # AssemblyScript smart contracts (compiled WASM in contracts/build/)
frontend/                # React + Vite app (4 pages, editorial brutalist design)
design-system/           # Design system spec (MASTER.md)
```

## Key Architecture
Two contracts:
- **FatJarManager (OP_NET)** — fund CRUD, 4 vault modes, contributions, time-lock, withdraw, refund, cross-contract mint/burn
- **FatJarToken (OP20, $FJAR)** — bonding curve mint, burn-on-refund, authorized minter pattern

Four jar types from two optional params:
| goalAmount | beneficiary | Mode | User-facing |
|---|---|---|---|
| 0 | not set | Open Collection | Collect |
| 0 | set | Trust Fund | Save for Someone |
| > 0 | not set | All-or-Nothing | All-or-Nothing |
| > 0 | set | Funded Grant | Fund a Dream |

## Scope (Mar 13)
- **Done:** bonding curve + $FJAR, 4 jar types, refund + burn, time-lock, 2 contracts, 4 pages (Home, Create, Fund Detail, Dashboard), editorial brutalist design, mock data
- **Remaining:** OPWallet real integration, contract deployment, Vercel deploy, demo video, README, submission
- **Out:** dark mode toggle, search/filter, live feed, NFTs, governance

## Rules
- Read existing code/docs before modifying
- Use `docs/TASKS.md` for task tracking — filter by tags
- Log every session in `docs/session_notes.md`
- Design doc (architecture): `docs/plans/2026-03-10-vault-redesign.md`
- Product direction (narrative): `docs/plans/2026-03-10-product-direction.md`
- Prototype is reference only — don't modify `prototype/index.html`
- No pre-mine, no team token allocation (MVP)
- 0.5% withdraw fee funds protocol development
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
