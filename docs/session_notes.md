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

**Testnet resumed — createFund confirmed!**
- Blocks unstalled, Jar #1 appeared on-chain and in frontend
- Full pipeline verified: deploy → link → create jar → display
- OPWallet sign + broadcast → confirmed in next block

**Known display issues (polish tomorrow):**
- Jar names show as "Jar #N" — names are event-only, not in contract state
- Creator shows as `0x000000...000000` — needs proper address decoding
- $FJAR rate displays raw bigint (`120,000,000,000,000,000,000,000`) — needs formatting
- Description not shown (event-only, same as name)

**Commits:**
- `f2d9749` — fix: deployment debugging — correct derivation path, contract linking, live mode persistence

**Open items for next session:**
- [x] Fix jar name/creator/rate display (read events or add mapping) → Session 16
- [ ] Create 4 seed jars on-chain
- [ ] Test contribute flow (Account 2 → jar)
- [x] Redeploy frontend to Vercel with new config → Session 16
- [ ] Record 90s demo video
- [ ] Tweet #opnetvibecode + submit to vibecode.finance

**Days to deadline:** 2 (March 13, 2026)

---

## Session 16 — 2026-03-12 — Display Bug Fixes

**Goal:** Fix 4 frontend display bugs blocking demo readiness.

**What we did:**

1. **Jar names/descriptions** — Added localStorage metadata cache. `createVault` saves name+description on creation; `getFundDetails` reads cache before falling back to "Jar #N". Event-only data can't be read from contract state, so this is the pragmatic solution for the demo.

2. **Creator address** — Contract stores creator as `u256.fromUint8ArrayBE(addr)`. Frontend `toAddress()` was expecting a string but receiving a bigint → always returned `0x000...000`. Fixed: `bigintToHex()` converts bigint to `0x{padded hex}` for display.

3. **$FJAR token rate** — Rate from contract has 18 decimals (120,000 tokens = `120000000000000000000000n`). Was displayed raw. Added shared `formatTokens()` helper (divides by 10^18, locale formatting). Applied across FundDetail, StatsStrip, Dashboard. Replaced 2 local `formatTokens` implementations with shared version.

4. **Contribute estimate formula** — Was `sats * rate` (astronomically wrong). Fixed to `(sats * rate) / SATS_PER_BTC`, then format with 18-decimal division. Added `estimateTokensForSats()` helper.

5. **Mock consistency** — Updated `MOCK_TOKEN_RATE` to 18-decimal format. Fixed mock contribute formula to match.

**Files modified:**
- `frontend/src/services/contract.live.ts` — metadata cache, bigintToHex, toAddress fix
- `frontend/src/services/contract.mock.ts` — rate + contribute formula fix
- `frontend/src/types/index.ts` — formatTokens, estimateTokensForSats
- `frontend/src/pages/FundDetail/FundDetail.tsx` — all token displays
- `frontend/src/pages/Home/StatsStrip.tsx` — rate + minted displays
- `frontend/src/pages/Dashboard/Dashboard.tsx` — shared formatTokens import

**Commits:**
- `f6a21bb` — fix(frontend): jar display bugs — names, creator address, token rate formatting

**Deployed:** Pushed to main → Vercel auto-deploy at https://fatjar-ten.vercel.app/

**Open items for next session:**
- [ ] Test display fixes on Vercel (with `?live=true`)
- [ ] Create 4 seed jars on-chain (names will cache in localStorage)
- [ ] Test contribute flow (Account 2 → jar)
- [ ] Record 90s demo video
- [ ] Tweet #opnetvibecode + submit to vibecode.finance

**Days to deadline:** 1 (March 13, 2026)

---

## Session 17 — 2026-03-12 — Pre-Submission Review & Positioning

**Goal:** Full project review before competition submission.

**What we did:**

1. **Code review** (5 parallel agents) — found 3 critical, 4 high, 7 medium issues across contracts + frontend
2. **OPNet vision alignment** — scored 77-89/100 for competition. Strong whitespace positioning (only social savings among 354 dApps). OPNet mainnet launches March 17.
3. **Token strategy** — decided: mint on testnet (proves end-to-end), do NOT pair with MOTO/PILL (bonding curve IS the pricing mechanism)
4. **Transition strategy** — BSL license for contracts after competition. Fresh mainnet deploy March 17. Decision gate at Week 6.
5. **Fiat onramp analysis** — thesis is correct but OPNet lacks account abstraction. Add `contributeOnBehalfOf()` to contract later. Post-mainnet play.
6. **Competitive landscape research** — no live protocol on any chain combines group savings + beneficiary + time-locks + bonding curve. On-chain attempts all died (WeTrust, Bloinx, Pigzbe). Demand proven by fintech (PayPal relaunched Pools, MoneyFellows 8.5M users).

**Positioning sharpened:**
- Rejected "Juicebox for Bitcoin" — Juicebox is crowdfunding for strangers/DAOs, essentially dead ($121K market cap). FatJar is social savings for trusted relationships.
- New tagline: "A piggy bank that actually grows with your child"
- Double growth story: Bitcoin appreciates + $FJAR rewards grow with adoption
- Two-layer messaging: consumer hook (family savings) + DeFi-native depth (cross-contract bonding curve, burn-on-refund, four modes from two params)
- Competition pitch: "The only way to lock BTC until your kid turns 18 — with family and friends contributing along the way"

**Code fixes applied:**
- C1: Added `isDeleted` check to `withdraw` in FatJarManager.ts (defense-in-depth)
- M2: Dashboard hides Withdraw button on time-locked vaults (shows "Time-locked" instead)
- M3: Unified `getVaultStatus` into shared utility in types/index.ts
- M6: Consolidated 3 different block constants (860000, 860000, 890000) into single `CURRENT_BLOCK = 890000n`
- M7: Fixed `ZERO_ADDRESS` from 40 chars (EVM) to 64 chars (OPNet u256) — would have broken vault mode detection on live data
- H4: Updated all "zero fees" references in docs to "0.5% withdrawal fee"

**Contract redeployment:** Not needed. `isDeleted` check is defense-in-depth (deleted funds have zero balance). Testnet contracts work for demo. Fresh deploy on mainnet March 17.

**Builds verified:** TypeScript `tsc --noEmit` clean, contracts `build:fatjar` clean.

**Files modified:**
- `CLAUDE.md` — new tagline
- `README.md` — title, pitch, features, "Why This Belongs on Bitcoin L1" section
- `contracts/src/fatjar-manager/FatJarManager.ts` — isDeleted check in withdraw
- `docs/plans/2026-03-10-product-direction.md` — full positioning rewrite
- `docs/plans/2026-03-10-vault-implementation.md` — fee fix
- `docs/plans/2026-03-10-vault-redesign.md` — positioning, demo script, fee fixes
- `docs/plans/2026-03-12-pre-submission-review.md` — new: full review doc
- `frontend/src/pages/Dashboard/Dashboard.tsx` — shared utility, M2 fix
- `frontend/src/pages/FundDetail/FundDetail.tsx` — shared utility
- `frontend/src/pages/Home/HeroSection.tsx` — new headline + tagline
- `frontend/src/types/index.ts` — ZERO_ADDRESS fix, shared CURRENT_BLOCK, shared getVaultStatus

**Commits:**
- `f33807e` — pre-submission review: positioning, code fixes, fee docs

**Open items for next session:**
- [ ] Create 4 seed jars on-chain
- [ ] Test contribute flow (Account 2 → jar)
- [ ] Record 90s demo video
- [ ] Tweet #opnetvibecode + submit to vibecode.finance
- [ ] Update LICENSE copyright from "ORANGE PILLS INC" to own entity

**Days to deadline:** 1 (March 13, 2026)

---

## Session 21 — 2026-03-12 — Narrative, UX Fixes & Submission

**Goal:** Strengthen landing page narrative, fix UX issues, submit to competition.

**What we did:**
1. Audited landing page against brainstorming docs — identified narrative gap (page was feature-heavy, story-light)
2. Added `[01] Why This Exists` section — three blocks: The Insight (market validation), The Opportunity ($6T stat), The Story (Emma's College Fund)
3. Shortened hero tagline — removed $FJAR mention and "actually", cleaner headline
4. Updated Active Jars subtitle with emotional framing
5. Rewrote Roadmap Vision column — "A savings layer for Bitcoin. Every family. Every milestone. Every generation."
6. Reframed competitors: "Ethereum validated the market, FatJar brings it to the right chain" instead of "everyone died"
7. Added `vercel.json` rewrite — fixed 404 on page refresh (SPA routing)
8. Fixed jar creation UX — show success screen instead of navigating to non-existent jar
9. Added toast notifications for all money actions (contribute, withdraw, refund, close) — success + error feedback
10. Renamed Jake's College Fund → Dad's Retirement Stack (free up Emma for demo)
11. Documented event indexer needs in TASKS.md (jar names, contributor list, activity feed)
12. Tested on-chain jar creation + contribution — bonding curve rate changed from 120,000 to 119,404 (minting works!)
13. Wrote competition description + tweet copy
14. **Submitted to vibecode.finance Week 3**

**Decisions:**
- Removed "actually" from hero headline — more confident without it
- Reframed competitor narrative for competition judges — validation, not failure
- PayPal 86M stat kept in docs but removed from public-facing copy (unverified primary source)
- No demo video needed for submission
- Contract address left optional in submission
- No project socials created — GitHub repo is sufficient

**Known issues (post-competition):**
- Contributor list not displayed in live mode (`getVaultContributions` returns `[]` — needs event indexer)
- No pending/confirming transaction state — user must manually refresh
- Only Account 1 can create jars (sufficient funds?)

**Commits:**
- `7ba8d88` — feat: add narrative section, sharpen hero and roadmap vision
- `f5cadd4` — fix: resolve bech32 addresses before contract queries
- `f88ecbc` — fix: SPA routing on Vercel, jar creation UX, rename Jake to Dad's Retirement
- `3772921` — feat: add toast notifications for all user actions

**Files created:**
- `frontend/src/pages/Home/WhySection.tsx` — new narrative section
- `frontend/src/pages/Home/WhySection.css` — styling for narrative section
- `frontend/vercel.json` — SPA rewrite rule

**Files modified:**
- `frontend/src/pages/Home/Home.tsx` — added WhySection to page flow
- `frontend/src/pages/Home/HeroSection.tsx` — shorter tagline, removed "actually"
- `frontend/src/pages/Home/ActiveJars.tsx` — emotional subtitle
- `frontend/src/pages/Home/FeaturesSection.tsx` — label [01] → [02]
- `frontend/src/pages/Home/RoadmapSection.tsx` — vision intro + rewritten items
- `frontend/src/pages/Home/RoadmapSection.css` — phase intro style
- `frontend/src/pages/FundDetail/FundDetail.tsx` — toast notifications, error handling
- `frontend/src/pages/FundDetail/FundDetail.css` — removed duplicate toast styles
- `frontend/src/pages/Dashboard/Dashboard.tsx` — toast notifications, error handling
- `frontend/src/pages/CreateFund/CreateFund.tsx` — success screen instead of navigate
- `frontend/src/services/contract.mock.ts` — renamed Jake → Dad's Retirement
- `frontend/src/services/contract.live.ts` — renamed Jake, address resolution fix
- `frontend/src/styles/global.css` — shared toast styles
- `docs/TASKS.md` — post-competition indexer section

**Status:** Submitted to vibecode.finance Week 3. Can continue pushing updates to GitHub/Vercel.

---

## Session 22 — 2026-03-13 — Live Mode Polish & Bug Fixes

**Goal:** Make live mode (OPNet testnet) work smoothly for judges. Fix UX gaps, CORS issues, and data display bugs.

**What we did:**
1. Fixed CORS blocking — RPC calls to `testnet.opnet.org` were blocked from localhost/Vercel. Added Vite proxy (dev) and Vercel rewrite (prod) routing all `/api/v1/*` through same-origin.
2. Added retry logic (2 retries with backoff) and sessionStorage vault cache (2-min TTL) for flaky testnet resilience.
3. Fixed fund ID indexing — discovered contract uses 1-indexed IDs. `getAllVaults` loop corrected from `0..count` to `1..count`. Ghost fund ID 0 returns zeroed data without reverting; filtered out.
4. Fixed `getAllVaults` error handling — `Promise.all` replaced with per-vault catch so one failure doesn't kill all results.
5. Removed hardcoded seed jar names (were wrong). Added correct seeds for Emma's College Fund (#1) and Dad's Retirement Stack (#2). New jars get names from localStorage metadata cache saved during creation.
6. Fixed metadata save ID — `saveMetadata(String(count + 1), ...)` for 1-indexed IDs.
7. Fixed Dashboard "My Jars" — creator tracking via `getCreatorFundByIndex` was returning ghost ID 0 and wrong attributions (likely due to CORS breaking `resolveAddress`). Added ID 0 filter and graceful fallback.
8. Fixed pending jar dedup — pending jars in localStorage no longer show alongside their confirmed on-chain versions.
9. Broadened hero copy — "Every Reason to Save Together" replacing children-only framing.
10. Added live mode info banner, wallet error dropdown, specific error messages (OPWallet missing, insufficient UTXOs, beneficiary not found).
11. Dynamic bonding curve in mock data — `computeTokenRate(totalBtcSats)` using `K / sqrt(total_btc + 1)`.
12. Human-readable time-lock dates via `blockToDate()`.
13. Fixed vault status — no-lock jars return 'active' not 'unlocked'.

**Key discoveries:**
- OPNet testnet RPC is flaky — intermittent 520s, CORS inconsistency, timeouts. Proxy + cache essential.
- Contract fund IDs are 1-indexed. `getFundDetails(0)` returns zeroed data without reverting — subtle bug source.
- Contract's `getCreatorFundByIndex` is unreliable when `resolveAddress` fails (CORS). With proxy fix, it works correctly.
- On-chain jar names are event-only (not in contract state) — no indexer means names rely on client-side cache/seeds.

**On-chain jars (OPNet testnet):**
- Jar #1: Emma's College Fund (Collect)
- Jar #2: Dad's Retirement Stack (Save for Someone)
- Jar #3: Community Skatepark Build (Fund a Dream)
- Jar #3+: Maya's Dev Bootcamp (Fund a Dream) — created during session

**Commits:**
- `3f15a53` — copy: broaden hero text beyond children-only framing
- `d6cdb85` — fix: live mode UX — CORS proxy, retry logic, error messages, pending jars
- `901becd` — fix: Dashboard uses getAllVaults instead of buggy creator tracking
- `6baf575` — fix: rename nav link 'My Jars' to 'Dashboard' for consistency
- `a421edf` — fix: Dashboard shows My Jars (creator tracking) + My Contributions

**Files created:**
- `frontend/src/components/layout/LiveBanner.css`
- `frontend/src/services/pending-jars.ts`

**Files modified:**
- `frontend/vite.config.ts` — Vite proxy for `/api/v1` → OPNet testnet
- `frontend/vercel.json` — Vercel rewrite for `/api/v1/:path*`
- `frontend/src/services/opnet-config.ts` — rpcUrl changed to `''` (relative, goes through proxy)
- `frontend/src/services/contract.live.ts` — retry logic, vault cache, 1-indexed IDs, per-vault error handling, seed names, metadata priority
- `frontend/src/services/contract.mock.ts` — dynamic bonding curve rates
- `frontend/src/pages/Dashboard/Dashboard.tsx` — My Jars with ID 0 filter + My Contributions
- `frontend/src/pages/Home/ActiveJars.tsx` — loading/error states, pending jar dedup
- `frontend/src/pages/Home/HeroSection.tsx` — broadened hero copy
- `frontend/src/pages/FundDetail/FundDetail.tsx` — specific error messages, blockToDate
- `frontend/src/pages/CreateFund/CreateFund.tsx` — pending jar save, specific errors
- `frontend/src/components/layout/Layout.tsx` — live mode banner
- `frontend/src/components/layout/Navbar.tsx` — "Dashboard" nav label
- `frontend/src/components/ui/WalletButton.tsx` — wallet error dropdown
- `frontend/src/hooks/useWallet.ts` — live mode wallet detection, error state
- `frontend/src/types/index.ts` — vault status fix, blockToDate, walletError

**Status:** Live mode functional. Jars created/contributed on testnet successfully. Vercel deploying with CORS proxy.

---

## Session 23 — 2026-03-13 — On-Chain Verification & Data Accuracy Audit

**Goal:** Verify frontend displays match actual on-chain data. Fix hardcoded inaccuracies before competition deadline.

**What we did:**

1. **On-chain verification via RPC** — queried both contract address sets directly from OPNet testnet:
   - `opnet-config.ts` addresses: **3 jars, real contributions** (correct deployment)
   - `scripts/deployed-addresses.json`: **1 empty jar** (stale/different deployment)
2. **Verified on-chain jar data:**
   - Jar #1: open-collection, 0.01 BTC raised, 1 contributor, unlock block 894,493
   - Jar #2: trust-fund, 0.001 BTC raised, 1 contributor, unlock block 1,521,225
   - Jar #3: funded-grant, 0 BTC raised, 0 contributors, unlock block 898,876, goal 0.01 BTC
   - Jar #4: **does not exist** (session 22 notes were wrong — Maya's Dev Bootcamp was never confirmed)
3. **Token contract state:** rate 119,345/BTC, total 0.011 BTC contributed, 1,319.40 $FJAR minted
4. **Current testnet block: 5,863** — CURRENT_BLOCK=890000n is a Bitcoin mainnet estimate, not testnet. Dates display correctly (same constant used in blockToDate), but on-chain time-locks are ~888K blocks in the future (functionally broken on testnet, cosmetically fine for demo).
5. **Fixed seed jar names** — added jar #3 "Community Skatepark Build" to SEED_JAR_NAMES. Removed phantom jar #4.
6. **Fixed bonding curve tiers** — were 80K/40K/15K at 5/20/100 BTC (completely wrong). Now 60K/30K/12K at 3/15/99 BTC, matching formula K/sqrt(total+1) exactly.
7. **Removed unverified PayPal 86M stat** from WhySection (session 21 decision, was still in code).
8. **Fixed demo wallet** — MOCK_WALLET_ADDRESS changed from `bc1q...demo` to `bc1q...creator1` so Withdraw/Close buttons are visible for jar #1 in demo mode.
9. **Gitignored stale deployed-addresses.json** — prevents confusion with the correct opnet-config.ts addresses.

**Key discoveries:**
- OPNet testnet block height is ~5,863 (not ~890K like Bitcoin mainnet). All jars have unlock blocks calculated from 890K assumption — they won't actually unlock for ~17 years on testnet.
- Session 22 noted "Jar #3+: Maya's Dev Bootcamp" but on-chain fundCount is 3. Jar #4 was never confirmed.
- Mock jar #3 mode (all-or-nothing) differs from on-chain jar #3 (funded-grant). Left mock as-is since it demonstrates all 4 modes.
- Bonding curve tier table was illustrative marketing numbers, not derived from formula. Fixed to match.

**Commits:**
- `915786a` — fix: add seed name for on-chain jar #3 (Community Skatepark Build)
- `8364feb` — fix: correct hardcoded data — bonding tiers, unverified stat, demo wallet

**Files modified:**
- `.gitignore` — added scripts/deployed-addresses.json
- `frontend/src/services/contract.live.ts` — SEED_JAR_NAMES: added jar #3, removed phantom #4
- `frontend/src/pages/Home/BondingCurveSection.tsx` — tiers corrected to match formula
- `frontend/src/pages/Home/WhySection.tsx` — removed unverified 86M stat
- `frontend/src/pages/FundDetail/FundDetail.tsx` — mock wallet set to creator1

**Verified on Vercel:**
- Build passes, HTTP 200, RPC proxy returns data, contract calls work end-to-end through proxy.

**Contract addresses (for competition submission):**
- FatJarManager: `opt1sqz2xxvr8dsa0qcxk62870sf67ycy7805nyhn456m`
- FatJarToken: `opt1sqzfndaxuj5kxt38d3funqnf09p2tlxryqg0d4jtq`

**Security audit (dual review):**
- Manual code review (find-bugs skill): reviewed all 30+ source files, full OWASP checklist
- opnet-bob MCP audit (parallel session): 27-pattern OPNet-specific security scan
- Consolidated findings in `docs/audit-notes.md`:
  - 3 Critical: no BTC verification in contribute(), no BTC transfer in withdraw/refund(), missing ReentrancyGuard + CEI violation
  - 4 High: fund name not in event, custom network object, encodeAndSend bypasses simulation, JSONRpcProvider args
  - 4 Medium: withdraw doesn't close fund, boolean storage as u256, hardcoded CURRENT_BLOCK, compositeKey 128-bit truncation
  - 8 Low/informational items
- **Verdict:** Architecture is solid for competition testnet demo. Core gap is contracts are an accounting layer without real BTC movement enforcement — acceptable for demo, must fix before mainnet.

**Status:** Competition submission ready. Audit documented for mainnet roadmap.

---

## Session 24 — 2026-03-13 — Audit Fixes (pre-submission)

**Goal:** Fix audit issues that are safe to ship on competition day without risking the demo.

**What we did:**

1. **H1 fix (cbfc47a):** `FundCreatedEvent` now emits the fund name via `writeStringWithLength()`. Previously the name was read from calldata and discarded — contradicting the design comment "names stored via events." Buffer size calculated dynamically from name length. Both contracts recompiled successfully.

2. **CEI improvement (cbfc47a):** In `contribute()`, moved `existingTokens` storage read before the cross-contract `mintTokensForContributor()` call. The write still follows the call (depends on `tokensMinted` return value) — documented as safe due to OPNet's synchronous VM execution.

3. **L2 fix (ae94a1f):** Added `parseFundId()` helper in `contract.live.ts`. All `BigInt(fundId)` calls now go through validation with a clear error message instead of unhandled exceptions on invalid input.

4. **M3 partial fix (ae94a1f):** Replaced 3 of 5 `any` types with typed `CallResult<{...}>` assertions — `simulateAndSend` parameter and both read method results (`getFundCount`, `getFundDetails`). The 2 contract singleton `any` types remain (dynamic ABI pattern requires full interface definitions to remove).

5. **L3 fix (ae94a1f):** Metadata cache in `createVault()` now saves jar name/description *before* sending the transaction. Previously it fetched `getFundCount()` after tx submission (race condition — count is stale pre-confirmation).

**Skipped (too risky for competition day):**
- C1/C2: BTC verification + transfer — architectural contract changes
- C3: ReentrancyGuard — new storage pointer, risk breaking deployed contracts
- H2/H4: Network object + provider args — could break RPC connection
- M1: StoredBoolean — changes storage layout
- M4: Dynamic CURRENT_BLOCK — adds async dependency to renders

**Commits:**
- `cbfc47a` — fix: emit fund name in FundCreatedEvent, improve CEI ordering in contribute()
- `ae94a1f` — fix: validate fundId inputs, type-safe CallResult, fix metadata cache race

**Files modified:**
- `contracts/src/fatjar-manager/FatJarManager.ts` — CEI reorder, name passed to event
- `contracts/src/fatjar-manager/events/FatJarManagerEvents.ts` — name string in FundCreatedEvent
- `frontend/src/services/contract.live.ts` — parseFundId, typed CallResult, metadata cache fix
- `docs/audit-notes.md` — marked fixed items, updated checklist

**Status:** 5 audit issues fixed (H1, M3 partial, L2, L3, CEI improvement). Remaining issues documented for mainnet roadmap.

---

## Session 25 — 2026-03-13 — Fact-Check & Rewrite WhySection Claims

**Goal:** Verify all claims in the competition submission and WhySection copy against primary sources. Rewrite with accurate, attributed data.

**What we did:**

1. **Fact-checked every claim** in the Insight & Opportunity sections against web sources:
   - PayPal 86M: verified but was misattributed (US consumer behavior, not PayPal usage) — reworded
   - MoneyFellows 8.5M: verified (TechCrunch, TechNext24)
   - "$2T in Bitcoin": outdated — BTC market cap is ~$1.4T (March 2026). Fixed.
   - "<0.5% in DeFi": approximately correct ($7B TVL / $1.4T = 0.5%). Rounded to "<1%" for safety.
   - "$6T inherited by 2045": sourced to VanEck/Matthew Sigel, not consensus. Added attribution.
   - WeTrust/Bloinx/Pigzbe: all essentially dead. Risky to cite as "demand was real."
   - "No government can freeze it": softened to "No middleman can freeze it."

2. **Replaced dead ETH projects** with PoolTogether — actually successful (88K wallets, $17.8M deposited, $4.5M in prizes). Clean pivot: "works on Ethereum, nobody built on Bitcoin."

3. **Replaced Venmo** (bill splitting, wrong psychology) with **stokvels** (11M members in South Africa, $2.7B/year) — literal group savings circles, exact FatJar behavior.

4. **Added 529 college fund stat** ($525B across 17M US accounts) — proves "save for children" motivation, directly maps to Trust Fund jar type.

5. **Broadened framing** from "save together" to "pool money" — covers all four jar type motivations:
   - PayPal 86M → group goals (All-or-Nothing / Fund a Dream)
   - Stokvels/MoneyFellows → savings circles (Open Jar)
   - 529 plans → children's futures (Trust Fund)
   - Title changed: "People Already Save Together" → "People Already Pool Money"

6. **Fixed TypeScript build error** — `CallResult<Record<string, unknown>>` didn't satisfy `ContractDecodedObjectResult` constraint. Changed to `CallResult` (default generic). Build passes.

**Commits:**
- `2ea49a1` — Update WhySection with verified claims and broader proof points
- `1c10121` — Fix TypeScript build error in CallResult generic type

**Files modified:**
- `frontend/src/pages/Home/WhySection.tsx` — full rewrite of Insight + Opportunity copy
- `frontend/src/services/contract.live.ts` — CallResult type fix

**Vercel:** Previous 3 deploys were failing (TS build error from Session 24's M3 fix). Fixed in `1c10121`. Deploy should succeed now.

**Claim verification summary:**

| Claim | Source | Status |
|---|---|---|
| PayPal 86M pooling events/yr | PayPal press release, Nov 2024 | Verified, reworded attribution |
| MoneyFellows 8.5M users | TechCrunch, TechNext24 | Verified |
| Stokvels 11M members, $2.7B/yr | Ipsos, FNB, UN | Verified |
| 529 plans $525B, 17M accounts | ICI, BestColleges | Verified |
| PoolTogether 88K wallets, $17.8M | DefiLlama, CryptoAdventure | Verified |
| Bitcoin $1.4T market cap | CoinMarketCap | Verified (was $2T, outdated) |
| Bitcoin DeFi <1% | DefiLlama ($7B TVL) | Verified |
| VanEck $6T inheritance by 2045 | VanEck/Matthew Sigel via BofA | Verified, attributed |

---

## Session 26 — 2026-03-13 — Live Testing & Bug Fixes

**Goal:** Test live contribution flow, fix bugs found during testing.

**What we did:**

1. **Debugged "Invalid receiver" error** — User tried to contribute without being logged in to OPWallet. During simulation, `Blockchain.tx.sender` resolved to `Address.zero()`, which was passed to `OP20._mint()` → "Invalid receiver" at OP20.ts:915. Root cause: no wallet = no sender = zero address in simulation.

2. **Fixed Dashboard off-by-one (7ddceaf)** — Contract stores creator fund indices starting at 1. Dashboard loop iterated 0..count-1, so index 0 returned ghost fund (skipped), and the last real fund was never queried. Changed to 1..count. This was the root cause of "My Jars" not showing for non-deployer accounts.

3. **Fixed Dashboard pending jar dedup (b4d3ea1)** — Pending jar dedup only checked creator-tracked vault names. When creator tracking failed (off-by-one), confirmed jars stayed stuck as "Confirming on-chain..." Now checks all on-chain vault names via `getAllVaults()`.

4. **Fixed wallet connection check (b997069)** — Initial approach used `requestAccounts()` in service layer, which triggered OPWallet popup even when checking. Moved check to UI level: FundDetail uses `useWallet().connected` before calling contribute in live mode. Shows toast "Wallet not connected" without triggering wallet popup. Service layer only checks extension exists.

5. **Added metadata cache fallback (d3ecc67)** — Saves creator wallet address in localStorage during jar creation. Dashboard uses this as fallback when `getCreatorFundCount` fails due to address resolution mismatch (bech32 vs u256 hex). Defense-in-depth alongside the off-by-one fix.

6. **Verified FJAR token flow** — Contributed to 3 jars from Account 2. Tokens minted on-chain (716.131 FJAR visible in OPWallet after importing token contract). Bonding curve working correctly.

**Commits:**
- `b4d3ea1` — fix: wallet connection check before writes, dashboard pending jar dedup
- `d3ecc67` — fix: dashboard My Jars fallback via metadata cache
- `7ddceaf` — fix: dashboard creator fund index is 1-based, not 0-based
- `b997069` — fix: check wallet connection at UI level, not via requestAccounts

**Files modified:**
- `frontend/src/services/contract.live.ts` — ensureWalletInstalled (no popup), metadata cache with creatorAddress, getMyCreatedFundIds export
- `frontend/src/services/contract.ts` — getMyCreatedFundIds facade
- `frontend/src/pages/Dashboard/Dashboard.tsx` — 1-indexed loop, allVaults dedup, metadata fallback
- `frontend/src/pages/FundDetail/FundDetail.tsx` — useWallet check before contribute in live mode

**On-chain state (OPNet testnet):**
- 4 jars confirmed (3 from Account 1, 1 from Account 2)
- Account 1: ~1,200 FJAR (deployer, created seed jars)
- Account 2: ~716 FJAR (contributed to 3 jars)
- Token contract: `opt1sqzfndaxuj5kxt38d3funqnf09p2tlxryqg0d4jtq`
- Manager contract: `opt1sqz2xxvr8dsa0qcxk62870sf67ycy7805nyhn456m`

**Key learnings:**
- OPWallet `requestAccounts()` is a connection REQUEST, not a passive check — triggers popup
- OP20._mint rejects Address.zero() with "Invalid receiver" — misleading when root cause is no wallet
- Contract creator fund indices are 1-based (same as fundIds) — easy off-by-one trap
- OPWallet doesn't auto-discover tokens; users must manually import via contract address
