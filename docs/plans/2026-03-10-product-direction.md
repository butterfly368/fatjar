# FatJar Product Direction

Date: 2026-03-10
Status: Approved

## What FatJar Is

A Bitcoin group piggy bank. Create a jar, share the link, save together. Earn $FJAR tokens for being an early user.

## Who It's For

People collecting and saving with people they trust: families, friend groups, communities.

## FatJar Is For

- Collecting money for a shared goal (gift, trip, emergency, celebration)
- Saving for someone's future (child's education, a loved one's milestone)
- Pooling funds with an all-or-nothing safety net (refund if the goal is not met)
- Funding someone's dream with accountability (beneficiary only receives if goal is hit)

## FatJar Is NOT For

- **Investment management.** FatJar collects and holds BTC. It does not manage portfolios, distribute returns, or handle ROI splits. Once the creator withdraws, the jar is done. If a group wants to invest together, they need a fund management tool — that is a different product.
- **Strangers trusting strangers.** FatJar does not verify identities, enforce spending, or arbitrate disputes. Trust comes from knowing the creator, not from the protocol.
- **Governance or voting.** There is no on-chain decision-making about how funds are spent. The creator or beneficiary withdraws. Period.

## Trust Model

Social, not protocol-enforced. You share the link with people who know you or your cause. The platform does not verify creators or enforce how funds are spent. That is between the humans.

The smart contract provides a safety net — all-or-nothing refunds protect contributors when a goal is not met — but trust comes from relationships, not code.

## Growth Mechanic

$FJAR bonding curve rewards early platform adopters. The earlier you use FatJar, the more tokens you earn per BTC contributed. This is a platform-level incentive (encourages early adoption), not a fund-level mechanic.

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

## UX Notes

- **Contribution visibility**: Creator should choose whether individual contribution amounts are visible to other contributors or hidden (show only total raised + contributor count). For gifts, hidden avoids awkwardness. For group pools, visible provides transparency.

## Positioning

**Old framing**: Crowdfunding platform on Bitcoin.

**New framing**: Bitcoin group piggy bank — save together, earn $FJAR.

The key insight: the biggest crypto successes (lending, staking, DEXs) work because code enforces the deal. Crowdfunding requires human trust. Rather than building complex trust infrastructure for strangers, we lean into social trust and provide simple, flexible tools.

## Why This Works

1. Contributors know the creator personally or through community — trust already exists
2. All-or-nothing refunds protect against goals that fall short
3. The $FJAR token incentivizes early platform usage regardless of fund type
4. Four jar types cover the full spectrum from casual (birthday gift) to serious (community fundraiser)
5. Simplicity: jar in, jar out. No governance overhead.

## Decision Record

- **Stranger trust problem**: Not our problem to solve. We provide tools, people decide.
- **Investment management**: Explicitly out of scope. FatJar is collect-and-save, not invest-and-return. This is a different product.
- **Contribution visibility**: Creator's choice — show or hide individual amounts.
- **$FJAR token**: Kept. Platform-level growth mechanic, not fund-level trust.
- **Public/private visibility**: Kept as creator's choice. Most funds will be private (shared via link).
- **Refund mechanic**: Kept. Useful even among friends.
