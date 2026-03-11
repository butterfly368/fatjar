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

---

## Session 8b — 2026-03-10 — WCAG & Copy Polish

*(Sessions between 8 and 9 — commits exist but no session notes written)*

**Commits:**
- `1c07f93` — fix(frontend): WCAG contrast and mobile responsiveness
- `57e52f7` — fix(frontend): restore original Bitcoin orange, use black for accent text
- `250baa5` — style: restore orange accent on hero 'On Bitcoin' highlight

---

## Session 9 — 2026-03-10 — Landing Page Fixes

**Goal:** Fix Active Jars visibility, broken nav scrolling, and mismatched mock data.

**What we did:**
1. Identified Active Jars buried 4th on landing page (after HowItWorks + Features)
2. Moved Active Jars up to right after StatsStrip — now visible immediately
3. Fixed "Active Jars" nav link — React Router `<Link to="/#active-jars">` doesn't scroll. Replaced with native scroll handler in Navbar (works from any page) and hash-aware `<a>` in Button component
4. Replaced 3 mock jars that contradicted product positioning:
   - ~~Bitcoin Mining Collective~~ → **Lisa's Birthday Surprise** (Collect mode, 6 friends, 0.085 BTC)
   - ~~Dev Grant: OPNet Toolkit~~ → **Jake's College Fund** (Save for Someone, beneficiary set, 1.5 BTC)
   - ~~HODL Vault 2027~~ → **Community Skatepark Build** (All-or-Nothing, 1.2/2.0 BTC goal, 11 contributors)
5. Updated seed contributions and platform total BTC to match new jars

**Files modified:**
- `frontend/src/pages/Home/Home.tsx` — section reorder
- `frontend/src/components/layout/Navbar.tsx` — scroll handler
- `frontend/src/components/ui/Button.tsx` — hash link support
- `frontend/src/services/contract.ts` — new mock data

**Commits:**
- `140167a` — fix(frontend): promote Active Jars, fix nav scrolling, update mock data

**Days to deadline:** 3 (March 13)

---

## Session 10 — 2026-03-10 — Code Review & Fixes

**Goal:** Full code review before contract deployment. Fix all critical and important issues.

**What we did:**
1. Dispatched superpowers:code-reviewer agent across full codebase (contracts + frontend + design docs)
2. Review found 1 critical, 6 important, 6 suggestion-level issues
3. Fixed all 7 issues + bonus cleanup:

**Fixes applied:**
- **C1 (CRITICAL):** `contribute()` used `Blockchain.tx.origin` while `refund()` used `Blockchain.tx.sender` — contributions stored under one key, refunds look up under another. BTC would be permanently locked. Changed to `tx.sender` consistently.
- **I1:** Updated CLAUDE.md — was referencing 3-contract architecture (Factory+Fund+Token) and saying goals/dashboard out of scope. Now reflects 2-contract arch + 4 jar types + current scope.
- **I2:** Deleted legacy `contracts.ts` and `mockData.ts`. Inlined bonding curve tiers into BondingCurveSection.
- **I3:** Dashboard hardcoded `bc1q...creator1` but wallet returns `bc1q...demo`. Now uses `useWallet()` address with seeded fallback for demo.
- **I4:** StatsStrip calculated $FJAR Minted as `totalRaised * rate / 10^18` = 0. Added `getTotalMinted()` that sums actual `tokensEarned` from contributions.
- **I5:** `refund()` didn't check `isClosed`. Decision: closing a goal-based jar early = immediate refund (skip time-lock). Updated contract.
- **I6:** Dashboard showed Withdraw on time-locked active vaults. Added block check to status calc. Fixed contribution refundable logic to require goal-based + (expired OR closed).
- **Bonus:** Removed deprecated legacy types (`Fund`, `LegacyContribution`, `Stat`, `Feature`, `Step`).

**Contract-frontend alignment verified:**
- All 13 contract methods have matching mock service methods
- Two mock-only methods (`getAllVaults`, `getVaultContributions`) need event indexing when going live
- Naming note: contract uses `unlockTimestamp`, frontend uses `unlockBlock` — same concept

**Builds clean:** Token 37KB, Manager 26KB, Frontend 271KB JS (0 errors)

**Days to deadline:** 3 (March 13)

**Next steps:** Deploy contracts to testnet → wire frontend to real contracts → Vercel deploy → demo video → submission

---

## Session 11 — 2026-03-10 — Wire Frontend to Real OPNet Contracts

**Goal:** Connect frontend to deployed OPNet testnet contracts using strategy pattern (mock + live).

**What we did:**
1. Installed `opnet` SDK in frontend (v1.8.3, 265 packages added)
2. Copied ABI JSON files for FatJarManager and FatJarToken to `frontend/src/services/abis/`
3. Created `opnet-config.ts` with deployed contract addresses:
   - Token: `opt1sqpe6eu5p0x5vhljqwhwt4hy7zw2w33t69g3cqgjr`
   - Manager: `opt1sqrftj9eqnwa3gpxg5m5ulww6x5hsd4s5uup8hgzq`
4. Renamed `contract.ts` → `contract.mock.ts` (no content changes)
5. Created `contract.live.ts` — all 11 read methods using `JSONRpcProvider` + `getContract`:
   - getFundCount, getFundDetails, getAllVaults, getContribution, getContributionTokens,
     getCreatorFundCount, getCreatorFundByIndex, getTokenRate, getTotalBtcContributed,
     getTotalMinted, getVaultContributions (returns [] — no on-chain enumeration)
   - Write methods throw ("requires OPWallet") — signing not yet wired
   - Fund names show "Jar #N" (names stored via events only, not readable from storage)
6. Created `contract.ts` facade — auto-detects live vs mock:
   - Pings RPC with 3s timeout → live if reachable, mock otherwise
   - URL params: `?live=true` or `?mock=true` force mode
   - Same function signatures — zero page changes needed
7. Added LIVE/DEMO badge to StatsStrip (green for live, orange for demo)
8. Updated `vite.config.ts`: `global: 'globalThis'` polyfill, chunk size warning raised
9. Updated `tsconfig.app.json`: added `resolveJsonModule: true`
10. Defined `opnetTestnet` network inline (v6.5.6 of @btc-vision/bitcoin lacks it, v7.0.0 has it)

**Technical notes:**
- opnet SDK adds ~1.1MB to bundle (1.4MB total, 415KB gzipped) — heavy but acceptable for competition
- Attempted code-splitting opnet into separate chunk — Vite's `build-import-analysis` plugin fails to parse the minified opnet output. Kept as single chunk.
- Browser polyfills: opnet's `package.json` has `browser` field for Buffer, crypto, stream — Vite auto-resolves
- `protobuf.js` in opnet uses `eval()` — Vite warns but doesn't block

**Files created:**
- `frontend/src/services/contract.live.ts` — live OPNet reads
- `frontend/src/services/contract.ts` — facade with auto-detection
- `frontend/src/services/opnet-config.ts` — addresses + RPC URL
- `frontend/src/services/abis/FatJarManager.abi.json`
- `frontend/src/services/abis/FatJarToken.abi.json`

**Files modified:**
- `frontend/src/services/contract.mock.ts` — renamed from contract.ts
- `frontend/package.json` — added `opnet` dependency
- `frontend/tsconfig.app.json` — `resolveJsonModule: true`
- `frontend/vite.config.ts` — global polyfill + chunk limit
- `frontend/src/pages/Home/StatsStrip.tsx` — LIVE/DEMO badge
- `frontend/src/pages/Home/StatsStrip.css` — badge styles

**Commits:**
- `e2d9313` — feat(frontend): wire frontend to real OPNet contracts via strategy pattern

**Days to deadline:** 3 (March 13, 2026)

**Remaining:**
- Deploy frontend to Vercel
- Demo video (90s)
- README with screenshots
- Tweet #opnetvibecode + submission
- OPWallet write signing (stretch goal)
- Dark mode toggle (out of scope)

---

## Session 11b — 2026-03-10 — Deploy, Logo Fix, README

**Goal:** Deploy to Vercel, fix logo spacing, write README, push to GitHub.

**What we did:**
1. Deployed frontend to Vercel — live at https://fatjar-ten.vercel.app/
   - Framework: Vite, Root: `frontend`, Output: `dist`
   - No env vars needed (contract addresses hardcoded)
2. Verified wallet connect behavior — mock fallback works correctly when OPWallet not installed in current Chrome profile
3. Fixed logo spacing issue — converted from HTML text (flex + span) to single SVG with `<text>` + `<tspan>` elements. Piggy icon + "FatJar." wordmark in one coordinate system, zero browser layout quirks
4. Created prototype logo variations page (6 options), user confirmed current style is preferred
5. Wrote README.md: architecture overview, 4 jar types table, bonding curve rates, tech stack, project structure, run instructions, security notes
6. Switched GitHub auth from `mikazaruj` to `butterfly368` (repo owner)
7. Pushed 4 commits to remote (contract integration, logo fix, README)

**Commits:**
- `e2d9313` — feat(frontend): wire frontend to real OPNet contracts via strategy pattern
- `4bf6ddc` — fix(frontend): convert logo to single SVG to eliminate text spacing
- `1af2f90` — docs: add README with architecture, bonding curve, and run instructions

**Live site:** https://fatjar-ten.vercel.app/
**GitHub:** https://github.com/butterfly368/fatjar

**Days to deadline:** 3 (March 13, 2026)

**Next session:** Record 90s demo video, tweet #opnetvibecode, submit to vibecode.finance

---

## Session 12 — 2026-03-11 — UX Fixes, Tokenomics, Revenue Model

**Goal:** User-tested the app, identified UX issues, brainstormed tokenomics/revenue, implemented fixes.

**Product decisions (brainstormed, approved Model A):**
1. **Revenue model:** 0.5% withdraw fee → protocol treasury (not contribution fee)
2. **Self-exploit solved:** contribute-to-self costs 0.5% on withdrawal = effectively buying $FJAR
3. **$FJAR utility (future):** staking for BTC yield from protocol fees
4. **NFT vision (future):** each contributor gets unique thank-you NFT on contribution, not years later
5. **Delete jar:** added deleteFund() for empty jars (totalRaised == 0)
6. **Single recipient for MVP:** creator or beneficiary withdraws. Multi-recipient/multisig = future.
7. **Where BTC sits:** in the FatJarManager smart contract. No admin keys, no backdoor.

**What we built:**

Contract changes:
- 0.5% withdraw fee (50 bps), accumulated in protocolFees storage
- claimProtocolFees() deployer-only, getProtocolFees() view
- deleteFund() — creator only, when totalRaised == 0
- FundDeletedEvent, updated WithdrawalEvent with fee field
- Both recompile clean: Token 37KB, Manager 30KB

Frontend changes:
- Wallet button: truncated address with hover tooltip
- "Unlock Block" → date picker with auto block calculation
- Beneficiary address validation (prefix + length + warning)
- Gas estimate clarified: "creation fee" + contributor note
- Description field (textarea, 200 chars) on create form + jar cards
- 4th seed jar: Maya's Dev Bootcamp (Funded Grant mode)
- Badges: orange bg + black text + Lucide icons (Inbox/Gift/Target/Rocket)
- Consistent badges between preview cards and FundDetail
- FAQ: "Zero Fees" → "Tiny Fee, Only on Withdrawal" (0.5%)
- "Four Jar Types" accordion → scannable 2x2 grid with icons
- Jar card dates: human-readable ("Sep 2026") instead of block numbers
- Progress bar shown even at 0% with "just started" hint

Design system compliance:
- Emojis removed → Lucide SVG icons (per MASTER.md anti-patterns)
- Badge style aligned across all pages
- Orange as accent color maintained

**Commits:**
- `874e90c` — fix(frontend): UX improvements for Create Jar page
- `1060b31` — feat: withdraw fee, deleteFund, jar descriptions, visual accents
- `9ac2bc2` — fix(frontend): jar cards UX — badges, dates, progress, 4th seed jar
- `587a167` — fix(frontend): align badges with editorial brutalist design system
- `a43fb6b` — style: orange background badges with black text for warmth

**Open items to continue:**
- [ ] Add "Vision / Roadmap" section to landing page (MVP now → NFTs → staking → multi-recipient)
- [ ] Redeploy contracts to testnet (new WASM with withdraw fee + deleteFund)
- [ ] Record 90s demo video
- [ ] Tweet #opnetvibecode + submit to vibecode.finance
- [ ] Dark mode toggle (out of scope for competition)

**Days to deadline:** 2 (March 13, 2026)

---

## Session 13 — 2026-03-11 — Polish, Consistency Audit, Redeployment

**Goal:** Fix UX issues, simplify jar types, add features, audit everything, redeploy contracts.

**What we did:**

1. Simplified 4 jar types → 2 (Open Jar + Goal Jar) with optional beneficiary note
2. Made time-lock optional (toggle, not required)
3. Added Roadmap section (Now / Next / Vision)
4. Fixed "Zero Fees" → "One Tiny Fee" in HowItWorks
5. Added description to FundDetail page
6. Fixed share button (clipboard fallback)
7. Added public/private jar toggle on create form
8. Built Active Jars page (/jars) with Open/Goal type filters
9. Limited landing page to 4 jars with "View All" link
10. Added "Create a Jar" CTA at bottom of Active Jars section + top of /jars page
11. 4 distinctive badge colors per jar mode (charcoal/forest/burnt-orange/indigo)
12. Persisted wallet connection via localStorage
13. Full consistency audit (3 parallel agents): copy, contract↔frontend, design system
14. Fixed blockToDate(0n) → "No lock" instead of "Unlocked"
15. Updated CLAUDE.md + README.md (2 jar types, 0.5% fee, new addresses)
16. Rebuilt contracts and redeployed to OPNet testnet
17. Updated frontend config with new contract addresses

**Deployed contracts (v2 — with withdraw fee + deleteFund):**
- Token: `opt1sqznxd9r5fq3kqev8rra939l386r9szhszg333mnl`
- Manager: `opt1sqpyju3avp2h3q2hjk0evaaat8juz7vkagcuay866`
- Deployer: from OPWallet seed phrase

**Commits:**
- `e156f00` — feat(frontend): add Roadmap section + fix Zero Fees copy
- `35a3f11` — simplify jar types: 4 → 2 core types + beneficiary note
- `d82497f` — make time-lock optional with toggle
- `5515699` — feat: description on fund detail, share fix, public/private, explore page
- `21e0ba2` — fix: persist wallet connection across page refreshes
- `0a90530` — fix: roadmap 2 jar types, rename Explore to Active Jars, link title
- `fd8e20e` — feat: 4 distinctive badge colors + CTA buttons everywhere
- `91ef0fd` — fix: consistency audit — blockToDate, docs, README
- `a8d2463` — chore: update contract addresses after redeployment

**Known gaps (acceptable for MVP):**
- `isPublic` + `description` are frontend-only (contract uses events)
- `getProtocolFees()` / `claimProtocolFees()` not exposed in frontend
- Status badge colors (green/red) not in design system (functional colors)

---

## Session 14 — 2026-03-11 — OPWallet Write Integration

**Goal:** Wire OPWallet write transactions, deploy contracts, test live flow.

**What we did:**
1. Researched OPNet write transaction flow — `CallResult.sendTransaction()` auto-detects OPWallet via `TransactionFactory`
2. Implemented all 6 write methods in `contract.live.ts`:
   - `createFund`, `contribute` — simulation path (no access check in contract)
   - `withdraw`, `closeFund`, `deleteFund`, `refund` — simulation with fallback to direct `encodeCalldata` + `signAndBroadcastInteraction`
3. Added OPWallet helpers: `getOPWallet()`, `getWalletAddress()`, `getSenderAddress()`, `getWriteManagerContract()`
4. Added write method ABIs (6 methods) to Manager ABI
5. Beneficiary handling: `Address.dead()` for none, `provider.getPublicKeyInfo()` for real addresses
6. Built admin page (`/admin`) for contract linking (Token↔Manager setManager/setTokenAddress)
7. Tested live mode — discovered contracts from Session 13 are gone (testnet reset)
8. Attempted redeployment — failed with "No UTXO found (minAmount)"

**Architecture — OPWallet write flow:**
- Simulate call via `contract.methodName(args)` → `CallResult` (has calldata + gas estimate)
- `callResult.sendTransaction({ signer: null, refundTo, network, maximumAllowedSatToSpend })` → `TransactionFactory.signInteraction()` auto-detects `window.opnet.web3` → OPWallet prompts user → signs + broadcasts
- For access-controlled methods: builds sender `Address` from OPWallet public key (legacy + ML-DSA)
- Fallback: `encodeCalldata()` → `window.opnet.web3.signAndBroadcastInteraction()` directly

**Wallet setup:**
- Account 1: `opt1pd...nc5wm6` — 0.08+ tBTC (main wallet, faucet funded)
- Account 2: created in OPWallet — 0.001 tBTC (sent from Account 1)
- Friend with OPWallet available for two-person demo

**Commits:**
- `113d157` — feat(frontend): wire OPWallet write transactions for all 6 contract methods

**BLOCKER: Contract deployment**
- Testnet reset wiped Session 13 contracts
- Deploy script fails: "No UTXO found (minAmount)" — Account 1 UTXOs may be too small or fragmented
- Need to investigate: possibly need larger UTXOs from faucet, or UTXOs are stuck in unconfirmed state

**Open items for next session:**
- [ ] Fix UTXO issue and redeploy both contracts (Token + Manager)
- [ ] Run admin linking (Token.setManager + Manager.setTokenAddress)
- [ ] Test full live flow: create jar → contribute → verify on-chain
- [ ] Create 4 seed jars on-chain
- [ ] Redeploy frontend to Vercel
- [ ] Record 90s demo video
- [ ] Tweet #opnetvibecode + submit to vibecode.finance

**Seed jar details (ready to create):**
- Jar 1: "Lisa's Birthday Surprise" (Open, no goal, lock 1mo)
- Jar 2: "Jake's College Fund" (Open + beneficiary, lock 1yr)
- Jar 3: "Community Skatepark Build" (Goal 0.05 BTC, lock 1mo)
- Jar 4: "Maya's Dev Bootcamp" (Goal 0.01 BTC + beneficiary, lock 2mo)

**Days to deadline:** 2 (March 13, 2026)

---

## Session 15 — 2026-03-11 — Deployment Debugging & Contract Linking

**Goal:** Deploy contracts to OPNet testnet, link them, test live flow.

**What we did:**

1. Diagnosed previous deployment failure — "No UTXO found (minAmount)" was due to 50,000 sat minimum threshold
2. Lowered `minAmount` from 50,000 to 330 sats in deploy script
3. Discovered **wallet derivation mismatch** — `mnemonic.derive(0)` uses BIP84 (`m/84'/1'/0'/0/0`), but OPWallet uses BIP86 Taproot (`m/86'/0'/0'/0/0`). This was the root cause of all previous "successful" deployments never confirming — they deployed from a different wallet with no funds.
4. Fixed deploy script: `mnemonic.derive(0)` → `mnemonic.deriveOPWallet(AddressTypes.P2TR, 0)`
5. Script deployments broadcast successfully but transactions never get mined (stuck in mempool)
6. Deployed both contracts via **OPWallet UI** (Deploy button) — confirmed instantly in block 4854
7. Recovered Manager contract address from OPScan block explorer by searching deployer address
8. Built hex→bech32 address converter using `EcKeyPair.p2op()` (witness version 16, hash160 of seed)
9. Fixed deploy script linking (Steps 3-4): `Address.fromString()` → raw `Uint8Array` for `writeAddress()`, strip `0x` prefix for `contract` field
10. Fixed admin page linking: added `sender` (from OPWallet pubkeys) for deployer access check, replaced `getPublicKeyInfo()` with direct `Address` construction from pubkey bytes
11. Successfully linked contracts via admin page (both setManager + setTokenAddress confirmed)
12. Added `sessionStorage` persistence for live/mock mode (survives page navigation)
13. Attempted createFund — OPWallet prompted and signed, but testnet blocks stalled at 4861

**Key bugs fixed:**
- Deploy script: wrong BIP derivation path (`derive` vs `deriveOPWallet`)
- Deploy script: `Address.fromString()` requires EC pubkey, not raw 32-byte seed — use raw bytes with `writeAddress()`
- Deploy script: `contract` field needs hex without `0x` prefix
- Admin page: `getPublicKeyInfo()` doesn't work for contract addresses — use raw pubkey bytes
- Admin page: missing `sender` on contract instance → "Only deployer can call this method"
- Frontend: `?live=true` URL param lost on navigation → persisted via `sessionStorage`

**Deployed contracts (v3 — OPWallet deployed, confirmed):**
- Token: `opt1sqzfndaxuj5kxt38d3funqnf09p2tlxryqg0d4jtq` (pubkey: `0x61737f715467a6342379c17cf7259522ce4d30a0be676cef850718e78136cf86`)
- Manager: `opt1sqz2xxvr8dsa0qcxk62870sf67ycy7805nyhn456m` (pubkey: `0xea7aa93c4d9e615f08c80255278264a38492f2ab0b761547d321d71e3d11b3c6`)
- Deployer: `opt1pdhu5rz5jpwvyumjw8p5sgr44fs0plktppnkzgpdsy4ddkjpgns7qnc5wm6`
- Contracts linked: yes (via admin page, both confirmed)

**Files modified:**
- `scripts/deploy.mjs` — fixed derivation, minAmount, address encoding, hex prefix
- `frontend/src/services/opnet-config.ts` — new addresses + pubkeys, back to OPWallet-deployed contracts
- `frontend/src/services/contract.ts` — sessionStorage mode persistence
- `frontend/src/pages/Admin/Admin.tsx` — sender address, raw pubkey Address construction

**BLOCKER: Testnet block production stalled**
- Blocks stuck at 4861 for 10+ minutes
- createFund transaction signed via OPWallet but can't confirm until blocks resume
- Script-broadcast transactions also never mine (OPWallet deploys do — different broadcast path?)

**Open items for next session:**
- [ ] Wait for testnet to resume, verify createFund confirmed
- [ ] Create 4 seed jars on-chain
- [ ] Test contribute flow (Account 2 → jar)
- [ ] Redeploy frontend to Vercel with new config
- [ ] Record 90s demo video
- [ ] Tweet #opnetvibecode + submit to vibecode.finance

**Days to deadline:** 2 (March 13, 2026)
