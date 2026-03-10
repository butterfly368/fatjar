# FatJar Product Direction

Date: 2026-03-10
Status: Approved

## What FatJar Is

A Bitcoin group piggy bank. Create a jar, share the link, save together. Earn $FJAR tokens for being an early user.

## Who It's For

People saving with people they trust: families, friend groups, investment clubs, communities.

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

These features solve the "stranger trust" problem, which is not our problem:

- Reputation or verification systems for creators
- Milestone-based fund release
- Contributor voting on withdrawals
- KYC or identity verification
- Platform-level fund discovery/browse as a primary feature

## Positioning

**Old framing**: Crowdfunding platform on Bitcoin.

**New framing**: Bitcoin group piggy bank — save together, earn $FJAR.

The key insight: the biggest crypto successes (lending, staking, DEXs) work because code enforces the deal. Crowdfunding requires human trust. Rather than building complex trust infrastructure for strangers, we lean into social trust and provide simple, flexible tools.

## Why This Works

1. Contributors know the creator personally or through community — trust already exists
2. All-or-nothing refunds protect against goals that fall short
3. The $FJAR token incentivizes early platform usage regardless of fund type
4. Four jar types cover the full spectrum from casual (birthday gift) to serious (investment club)
5. Simplicity: jar in, jar out. No governance overhead.

## Decision Record

- **Stranger trust problem**: Not our problem to solve. We provide tools, people decide.
- **$FJAR token**: Kept. Platform-level growth mechanic, not fund-level trust.
- **Public/private visibility**: Kept as creator's choice. Most funds will be private (shared via link).
- **Refund mechanic**: Kept. Useful even among friends.
