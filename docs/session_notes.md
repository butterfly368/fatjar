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

---

## Session 4b — 2026-03-10 — Security Review & Cross-Contract Minting

**Goal:** Code review, fix security issues, wire up cross-contract minting between Manager and Token.

**What we did:**
1. Ran security code review via dedicated agent — found 3 critical, 4 important, 5 suggestions
2. Fixed C1: Added MAX_SATOSHIS (21M BTC) upper-bound check in bonding curve to prevent overflow DoS
3. Fixed C2: Added one-time guards on `setManager()` and `setTokenAddress()` — cannot change once set
4. Fixed C3: Replaced custom `sqrt` implementation with audited `SafeMath.sqrt` from btc-runtime
5. Fixed I1: Reordered state update (`totalBtcContributed`) before `_mint()` — Checks-Effects-Interactions pattern
6. Fixed I2: Validated `unlockTimestamp` fits in u64 range, changed `FundCreatedEvent` to use u256
7. Fixed S2: `ContributionEvent` now includes `tokensMinted` amount for frontend indexing
8. Researched OPNet cross-contract calls — `Blockchain.call()` is first-class, used by TransferHelper/safeTransfer
9. Fixed S5: Wired up `Manager.contribute()` → `Token.mintForContribution()` via `Blockchain.call()`
   - Single atomic transaction, reverts entirely on failure
   - `Blockchain.tx.sender` inside Token resolves to Manager address → `onlyManager()` passes
   - `Blockchain.tx.origin` stays as the user throughout the call chain
10. Both contracts recompile clean (Token 37KB, Manager 26KB)

**Key findings — OPNet cross-contract calls:**
- `Blockchain.call(destinationContract, calldata)` — canonical pattern
- `Blockchain.tx.sender` = immediate caller (changes in call chain)
- `Blockchain.tx.origin` = original user (stays constant)
- `TransferHelper` and `OP20Utils` in btc-runtime demonstrate the pattern
- OP20 has `ReentrancyGuard` with CALLBACK mode for safe cross-contract calls
- vibecode bible has no specific guidance — this is a runtime-level feature

**Architecture (final):**
- User calls `Manager.contribute(fundId, satoshis)`
- Manager updates fund state, then calls `Token.mintForContribution(contributor, satoshis)`
- Token calculates bonding curve, mints $FJAR to contributor, returns tokensMinted
- All in one atomic transaction

**Deployment order (for next session):**
1. Deploy FatJarToken via OPWallet → get token address
2. Deploy FatJarManager via OPWallet → get manager address
3. Call `Token.setManager(managerAddress)` — links them (one-time)
4. Call `Manager.setTokenAddress(tokenAddress)` — links them (one-time)

**Note on contribute():** Changed `Blockchain.tx.sender` to `Blockchain.tx.origin` for contributor address in Manager.contribute(), since tx.sender could be a relayer/frontend contract. The actual contributor is the original transaction signer.

**Commits:**
- `3ae5d6d` — Add smart contracts and project docs (sessions 2-4)
- `86cb9da` — Fix security issues and wire up cross-contract minting

**Open items carried forward:**
- OPWallet not yet installed (manual: Chrome extension + faucet.opnet.org)
- Contracts not yet deployed to testnet
- No unit tests (acceptable for competition — contracts are reviewed)
- Fund name emitted in FundCreatedEvent but as unlockTimestamp only — consider adding name string to event in future
- I4 (compositeKey collision for 160-bit addresses) — fine for competition, fix post-competition

**Days to deadline:** 3 (March 13, 2026)

**Next session:** Install OPWallet → deploy contracts → link them → test create/contribute/withdraw flow on testnet

---

## Session 5 — 2026-03-10 — UI Direction & Hero Design

**Goal:** Explore visual directions for the landing page, converge on a design, create hero illustration.

**What we did:**
1. Studied 6 design references (W3 editorial, Paytech dark dashboard, Avalon Labs DeFi, etc.)
2. Built 3-direction comparison prototype (`prototype/comparison.html`):
   - Direction A: Editorial Brutalist (light bg, Syne font, accordion features)
   - Direction B: Dark Finance (dark bg, chartreuse accent, stat cards)
   - Direction C: Premium Protocol (purple-black gradient, gold accent)
3. User chose **Direction A** — most distinctive, never seen in crypto
4. Built 4 graphic variants (`prototype/comparison-graphics.html`)
5. Explored piggy bank as key visual — "FatJar, the piggy bank for Bitcoin"
6. Iterated on SVG piggy bank illustration (4+ versions) — learned SVG ears are hard
7. Pivoted to AI-generated illustration via Leonardo DaVinci
8. Generated final hero image: minimalist line art piggy with orange BTC fill
9. Integrated DaVinci image into prototype, removed background, balanced layout
10. Built full editorial homepage (`prototype/direction-final.html`):
    - Hero: bold Syne typography + piggy illustration, two-column grid
    - Stats strip: TVL, Active Jars, $FJAR Minted, Current Rate
    - Features: accordion layout with protocol details
    - How It Works: 3-step cards (Create, Share, Grow)
    - Bonding Curve: visual explainer with rate table
    - Footer: minimal editorial

**Design decisions:**
- Aesthetic: Editorial Brutalist — warm cream bg (#F5F2ED), black text, orange (#F7931A) accent
- Typography: Syne (display), IBM Plex Mono (labels), Source Sans 3 (body), Newsreader (italic accents)
- Hero image: AI-generated (DaVinci) minimalist piggy bank with orange BTC fill, line art style
- Piggy faces left toward text — creates visual flow to CTAs
- Brand: "FatJar — The Piggy Bank for Bitcoin"

**Files created:**
- `prototype/comparison.html` — 3-direction comparison with tab switcher
- `prototype/comparison-graphics.html` — 4 graphic variant comparison
- `prototype/direction-final.html` — converged editorial homepage prototype
- `prototype/piggy-hero.png` — DaVinci-generated hero illustration (transparent bg)

**Open items carried forward:**
- Logo/branding still open (piggy hero works, need icon/wordmark)
- Frontend not yet scaffolded (React + Vite)
- Contracts not yet deployed
- OPWallet not yet installed

**Days to deadline:** 3 (March 13, 2026)

**Next session:** Scaffold React frontend, port prototype design to components, integrate OPWallet

---

## Session 6 — 2026-03-10 — Frontend Scaffold & Full Build

**Goal:** Scaffold React frontend from plan, port prototype CSS, build all 3 pages, add UX features.

**What we did:**
1. Scaffolded Vite + React + TypeScript in `frontend/`
2. Installed react-router-dom + lucide-react
3. Created design system CSS: tokens, reset, typography, animations, global
4. Built layout shell: Navbar (fixed, wallet-aware), Footer (editorial), Layout (Outlet), Section
5. Built UI atoms: Button (primary/secondary), StatBlock, Tag, AccordionItem, StepCard, Input/TextArea, BondingCurveChart (SVG), TierRow, WalletButton, Logo (SVG piggy + wordmark)
6. Built Home page: HeroSection (two-column, piggy float), StatsStrip (4 KPIs), FeaturesSection (accordion, 5 items), HowItWorks (3 step cards), BondingCurveSection (chart + tier table)
7. Built Create Fund page: form with name, description, unlock date, validation, success state
8. Built Fund Detail page: fund header, 4-stat grid, contributor list, contribute form with token estimate
9. Created TypeScript interfaces, mock data, contract call stubs, useWallet hook
10. All verified: `npm run build` — zero errors, 19KB CSS, 254KB JS

**UX improvements (from user feedback):**
11. Added **Active Jars** section to homepage — clickable fund cards linking to `/fund/:id`
12. Added **Share bar** to Fund Detail — Copy Link (clipboard API), Share (Web Share API), URL display
13. Updated **Nav** — Explore link (#jars), Create link (wallet-gated)
14. Added **Public/Private visibility toggle** to Create Fund — segmented button with hint text
15. Added `isPublic` field to Fund type — homepage filters to public jars only
16. Added visibility badge (Public/Private) on Fund Detail header

**Key UX decisions:**
- Public jars: visible on homepage + shareable via link
- Private jars: only accessible via direct link (share buttons on Fund Detail)
- Wallet addresses always truncated (bc1q...xyz1) — standard crypto UX, safe
- Default: Public (encourages discovery), can toggle to Private

**Design system created:**
- `design-system/fatjar/MASTER.md` — full spec: colors, typography, spacing, components, anti-patterns, checklist

**File structure (40+ files):**
```
frontend/
  public/piggy-hero.png
  src/
    main.tsx, App.tsx
    styles/ (tokens, reset, typography, animations, global)
    components/layout/ (Navbar, Footer, Layout, Section, Logo)
    components/ui/ (Button, StatBlock, Tag, AccordionItem, StepCard, Input, BondingCurveChart, TierRow, WalletButton)
    pages/Home/ (Home, HeroSection, StatsStrip, ActiveJars, FeaturesSection, HowItWorks, BondingCurveSection)
    pages/CreateFund/ (CreateFund)
    pages/FundDetail/ (FundDetail)
    hooks/useWallet.ts
    services/ (contracts.ts, mockData.ts)
    types/index.ts
```

**Open items carried forward:**
- **Narrative revision needed** — user has direction changes to copy/content
- OPWallet real integration (currently stubbed)
- Contract deployment to testnet
- Dark/light theme toggle
- Dashboard page (creator's funds view)

**Days to deadline:** 3 (March 13, 2026)

**Next session:** Apply narrative revisions, then OPWallet integration + deploy

---

## Session 7 — 2026-03-10 — Product Direction & Copy Rework

**Goal:** Brainstorm product direction (trust problem for strangers), formalize positioning, rework all user-facing copy.

**What we did:**
1. Brainstormed the fundamental trust gap: strangers vs known networks
2. Concluded FatJar is a **group piggy bank for people who trust each other** — not a crowdfunding platform for strangers
3. Scoped out investment management (ROI splits, portfolio tracking) as a different product
4. Defined "FatJar IS for" / "FatJar is NOT for" boundaries
5. Chose "group piggy bank" as the core framing
6. Rewrote all user-facing copy across 11 files (vault → jar, protocol → human)
7. Updated mode labels: Collect, Save for Someone, All-or-Nothing, Fund a Dream

**Decisions:**
- **Trust model**: Social, not protocol-enforced. We provide tools, people decide.
- **Investment management**: Explicitly out of scope. FatJar is collect-and-save, not invest-and-return.
- **Contribution visibility**: Creator's choice (show/hide individual amounts) — noted as UX feature, not yet implemented.
- **$FJAR token**: Kept as platform-level growth mechanic (early adopter rewards), not fund-level trust.
- **Stranger trust infrastructure**: Not building (no reputation, KYC, milestones, voting).

**Key copy changes:**
- Hero: "THE PIGGY BANK FOR EVERYONE ON BITCOIN" (was "LOCK BITCOIN TOGETHER")
- Tagline: "Create a jar. Share the link. Friends and family chip in with BTC."
- How it works: Create a Jar → Share the Link → Open the Jar
- Features section: "What Makes FatJar Different" (was "Trustless Vaults on Bitcoin L1")
- All pages: vault → jar in every user-facing string
- Create form placeholder: "Sarah's College Fund" (was "Bitcoin Mining Collective")

**Commits:**
- `eaa4a7a` — Add product direction doc: Bitcoin group piggy bank
- `76b1218` — Add is-for/not-for boundaries and contribution visibility
- `21c779b` — Rework all user-facing copy: vault → jar, protocol → human

**Files created/modified:**
- `docs/plans/2026-03-10-product-direction.md` — product direction (approved)
- 11 frontend files updated with new copy

**Open items carried forward:**
- Contribution visibility toggle (show/hide amounts) — not yet implemented
- OPWallet real integration (still stubbed)
- Contract deployment to testnet
- Dark/light theme toggle
- Demo video (90s)

**Days to deadline:** 3 (March 13, 2026)

**Next session:** OPWallet integration + contract deployment, or demo video

---

## Session 8 — 2026-03-10 — Vault Redesign & Full Frontend Rebuild

**Goal:** Redesign product from consumer piggy bank to trustless Bitcoin vaults for financial coordination. Implement full vault redesign across contracts and frontend.

**What we did:**

**Product redesign:**
1. Analyzed competitive landscape (Juicebox on ETH, Geyser Fund on Lightning, Week 1-2 vibecode winners)
2. Identified fundamental product issues: gas fees kill small contributions, no monetization, weak token utility
3. Repositioned from consumer savings ($20 contributions) to financial coordination (0.01+ BTC where gas is <0.03%)
4. Designed 4 vault modes from 2 optional params (goalAmount + beneficiary):
   - Open Collection, Trust Fund, All-or-Nothing Pledge, Funded Grant
5. Designed burn-on-refund mechanics: sell $FJAR = forfeit refund right
6. Wrote and approved design doc: `docs/plans/2026-03-10-vault-redesign.md`
7. Wrote implementation plan: `docs/plans/2026-03-10-vault-implementation.md` (12 tasks)

**Contract changes (Tasks 1-3):**
8. Token: Added `burnForRefund` method + `TokensBurnedEvent`
9. Manager: Added `goalAmount`, `beneficiary` params to `createFund`; `contributionTokensEarned` tracking
10. Manager: Rewrote `withdraw` (beneficiary/creator check, goal-met requirement); added `refund` with CEI pattern
11. Fixed variable shadowing, redundant compositeKey, stale docstring (code review catches)

**Frontend changes (Tasks 4-9):**
12. Updated types: `Vault`, `Contribution`, `VaultMode` + helpers (`getVaultMode`, `formatBtc`, `truncateAddress`)
13. Created mock contract service with 3 seed vaults (all-or-nothing, funded-grant, open-collection)
14. Updated Home page: hero "Lock Bitcoin Together", stats from mock service, vault cards with mode badges + progress bars
15. Updated CreateFund: goal amount toggle, beneficiary toggle, live mode preview card, block date estimate, gas estimate
16. Updated FundDetail: progress bar, mode/status badges, contributor table with $FJAR, contextual actions (contribute/withdraw/refund/close)
17. Added Dashboard page: wallet gate, my vaults (withdraw/close), my contributions (refund), status badges, empty states
18. Wired OPWallet: installed `@btc-vision/walletconnect`, found it breaks Vite dev (broken .d.ts structure), removed it. Hook detects `window.opnet` with mock fallback.

**Typography fixes:**
19. Ran visual readability audit (seo-visual agents on all 3 pages + screenshots)
20. Found critical issues: Syne 800 + uppercase + negative letter-spacing = unreadable dense blocks
21. Fixed across all pages (5 parallel agents): Syne headings → weight 700, mixed case, neutral letter-spacing
22. Kept IBM Plex Mono labels uppercase (works at small sizes)

**Also identified (not yet fixed):**
- `--text-muted` (#999) fails WCAG AA contrast — needs darkening to #767676
- `--accent` (#F7931A) fails WCAG AA on text — needs darkening to #C97600
- Mobile: CTAs below fold, no hamburger menu, contributors table overflow
- 9-10px labels should be 11-12px minimum
- Progress bar too thin (6px → 8-10px)

**Decisions:**
- Positioning: "Juicebox for Bitcoin" — trustless crowdfunding primitive on L1
- 4 vault modes from 2 params (elegant, one contract)
- Burn-on-refund gives $FJAR real economic weight
- Zero fees at launch; transparent treasury upgrade path post-competition
- `totalBtcContributed` NOT decremented on refund (prevents curve manipulation)
- Contributor must hold $FJAR to refund (sell = forfeit refund)

**Commits:**
- `c6304dd` — Add vault redesign v3 design doc
- `6810951` — Add vault implementation plan (12 tasks)
- `42d485a` — feat(token): add burnForRefund + TokensBurnedEvent
- `70d83c1` — feat(manager): add goalAmount, beneficiary params and token tracking
- `d75c165` — feat(manager): add withdraw goal-check, refund with burn, updated views
- `616e35f` — fix(manager): clean up docstring and redundant compositeKey
- `6ab1cf3` — feat(frontend): update types and services for vault redesign
- `567ff28` — feat(frontend): update Home page for vault redesign
- `e310fb8` — feat(frontend): update CreateFund with goal/beneficiary toggles
- `390d8a6` — feat(frontend): update FundDetail with modes, progress bar, actions
- `4bc56ad` — feat(frontend): add Dashboard page
- `b9efd42` — feat(frontend): wire OPWallet integration
- `021dd63` — fix(frontend): improve typography readability across all pages

**GitHub:** https://github.com/mikazaruj/fatjar (to be moved to different account)

**Days to deadline:** 3 (March 13, 2026)

**Remaining tasks:**
- Task 10: Deploy contracts to testnet (requires OPWallet + faucet BTC)
- Task 11: Deploy frontend to Vercel
- Task 12: Submission materials (README, video, tweet)
- Fix WCAG contrast issues (--text-muted, --accent)
- Fix mobile responsiveness (CTAs, hamburger, table overflow)
- Move GitHub repo to separate account
