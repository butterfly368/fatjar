# FatJar Product Direction

Date: 2026-03-10
Updated: 2026-03-12 (positioning sharpened)
Status: Approved

## What FatJar Is

Trustless Bitcoin savings jars for the people you love. Lock BTC together — the time-lock can't be broken, not even by you.

## Who It's For

**Day-1 audience:** Bitcoiners saving for their kids, families pooling BTC for milestones. People who already hold BTC and want a trustless way to save it together.

**Broader audience:** Anyone collecting and saving with people they trust — families, friend groups, communities.

## The Insight

PayPal Money Pools does 86M pooling events/year — then got shut down in 2021, then relaunched in 2024 because demand was that strong. MoneyFellows (digital savings circles) has 8.5M users in Egypt alone. People want to save together. Every successful version is centralized and fiat-based.

FatJar brings this to Bitcoin L1 with properties only Bitcoin can offer:
- **Time-locks nobody can override** — Bitcoin enforces the unlock date. Not even the parents can touch it early.
- **No platform risk** — PayPal shut down Money Pools once already. FatJar can't be shut down.
- **Censorship resistance** — no government, bank, or platform can freeze a jar.
- **BTC as generational wealth** — $6T in crypto will be inherited by 2045. "Stack sats for your kid's 18th birthday" is a real Bitcoiner behavior with no product today.

## FatJar Is For

- **Saving for someone's future** — child's education fund, locked until they turn 18
- **Pooling BTC for a goal** — wedding, family emergency, community project
- **All-or-nothing safety** — set a target, everyone gets refunded if it's not met
- **Funding a dream** — a beneficiary receives the BTC only if the goal is reached

## FatJar Is NOT For

- **Investment management.** FatJar collects and holds BTC. It does not manage portfolios, distribute returns, or handle ROI splits.
- **Strangers trusting strangers.** Trust comes from knowing the creator, not from the protocol.
- **Governance or voting.** The creator or beneficiary withdraws. Period.

## Trust Model

Social, not protocol-enforced. You share the link with people who know you or your cause. The smart contract provides a safety net — all-or-nothing refunds protect contributors when a goal is not met — but trust comes from relationships, not code.

## Growth Mechanic

$FJAR bonding curve rewards early platform adopters. The earlier you use FatJar, the more tokens you earn per BTC contributed. Platform-level incentive, not fund-level.

## Four Jar Types

| Internal mode | User-facing name | Description |
|---|---|---|
| Open Collection | **Collect** | Pool money for anything — a gift, a trip, an emergency |
| Trust Fund | **Save for someone** | A beneficiary opens it when the time comes |
| All-or-Nothing Pledge | **All-or-nothing** | Everyone gets refunded if the goal is not hit |
| Funded Grant | **Fund a dream** | Beneficiary gets the money only if the goal is reached |

## What NOT to Build

- Reputation or verification systems for creators
- Milestone-based fund release
- Contributor voting on withdrawals
- KYC or identity verification
- Platform-level fund discovery/browse as a primary feature
- Proportional return distribution (ROI splitting)
- Portfolio management or investment tracking
- Multi-round deposit/withdrawal cycles

## Positioning

**Rejected framing**: "Juicebox for Bitcoin" — Juicebox is permissionless crowdfunding for strangers/DAOs. FatJar is social savings for trusted relationships. Different products.

**Current framing**: A piggy bank that actually grows with your child. Powered by Bitcoin.

**Competition pitch**: "Lock Bitcoin until they're 18. Family and friends contribute along the way. Nobody can touch it early — not even you."

### Competitive Landscape

No live protocol on any chain combines group savings jars + beneficiary + goal-based refunds + time-locks + bonding curve rewards. On-chain attempts at similar concepts have all died (WeTrust, Bloinx, Pigzbe). FatJar's differentiation: uses BTC (real value, not a proprietary token), software-only (no hardware), targets crypto-native users first, and the time-lock IS the killer feature.

## Why This Works

1. **Demand is proven** — PayPal relaunched Pools due to demand. MoneyFellows has 8.5M users. VCs funding Tanda, WeSpare.
2. **Bitcoin-native time-locks are the moat** — no centralized app can guarantee "nobody touches this until 2044."
3. **Contributors know the creator** — social trust already exists, no protocol enforcement needed.
4. **All-or-nothing refunds** protect against goals that fall short.
5. **$FJAR bonding curve** incentivizes early platform adoption.
6. **Simplicity** — jar in, jar out. No governance overhead.

## Decision Record

- **Juicebox comparison**: Rejected. Different product, different audience, and Juicebox is essentially dead ($121K market cap).
- **Stranger trust problem**: Not our problem to solve. We provide tools, people decide.
- **Investment management**: Explicitly out of scope.
- **Contribution visibility**: Creator's choice — show or hide individual amounts.
- **$FJAR token**: Kept. Platform-level growth mechanic.
- **Refund mechanic**: Kept. Useful even among friends.
- **Target audience**: Bitcoiners first, general crypto later, non-crypto only with fiat onramp (future).
