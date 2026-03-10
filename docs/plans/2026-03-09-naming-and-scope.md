# FatJar — Naming & MVP Scope Decisions

**Date:** 2026-03-09
**Status:** Approved

---

## 1. Name

**Product:** FatJar
**Token:** $FJAR (OP20)
**Tagline:** "Fill your FatJar with sats."

### Why FatJar
- Fun, playful, visual — matches "fun & playful" + "piggy bank/jar" direction
- Completely unique in crypto (no existing token, no competing project)
- $FJAR ticker is clean
- Works as a verb: "Start a FatJar", "Fill your FatJar"
- Everyone knows what a savings jar is
- "Fat" = full, abundant, successful

### Checked & Clear
- $FJAR ticker: not taken on any chain
- "FatJar" product name: not taken in crypto (Java build concept only — zero audience overlap)
- Domain: needs manual check (fatjar.xyz, fatjar.finance)

### Rejected Alternatives
- PiggyCoin — taken (existing crypto project)
- BitPiggy — taken (physical BTC piggy bank)
- SatPiggy, OinkFund, SatOink — available but FatJar felt stronger
- Buffy — $BUFFY taken on TON and BSC

---

## 2. MVP Scope (Mar 13 deadline)

### In (must ship)
- **$FJAR token** — OP20, bonding curve mint, 100M cap, no pre-mine
- **Open contributions** — send BTC to a fund, earn $FJAR tokens
- **Optional time-lock** — lock funds until a date
- **3 contracts** — FatJarFactory, FatJarFund, FatJarToken
- **Dark + light themes** — both ship (user drives UI design quality)
- **3 pages** — Home, Create Fund, Fund Detail
- **Withdraw** — creator withdraws from Fund Detail page (no separate dashboard)

### Out (deferred)
- Goals system (named targets with progress bars) — just open contributions
- Fund types (one-time vs ongoing) — all funds are ongoing
- Dashboard page — withdraw happens on Fund page
- Bonding curve visualizer — static text explanation only
- Live activity feed
- NFT layer
- Governance / token utility beyond trading

### Contract Renames
| Old | New |
|-----|-----|
| PiggyFactory | FatJarFactory |
| PiggyFund | FatJarFund |
| PiggyToken | FatJarToken ($FJAR) |
