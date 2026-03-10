# FatJar — The Piggy Bank for Everyone on Bitcoin

**Live:** [fatjar-ten.vercel.app](https://fatjar-ten.vercel.app/)
**Competition:** vibecode.finance Week 3 — "The Breakthrough"
**Token:** $FJAR (OP20) | **Platform:** OPNet (Bitcoin L1)

---

## What is FatJar?

Create a jar. Share the link. Friends and family chip in with BTC.

FatJar is a trustless Bitcoin vault protocol on OPNet. Anyone can create a time-locked jar, share it with their network, and collect BTC contributions. Contributors earn $FJAR tokens via a bonding curve — early backers get more. Zero platform fees.

### Four Jar Types from Two Parameters

| Goal | Beneficiary | Mode | Use Case |
|------|-------------|------|----------|
| — | — | **Collect** | Group gifts, event funds |
| — | Set | **Save for Someone** | College funds, trust funds |
| Set | — | **All-or-Nothing** | Project funding with refund guarantee |
| Set | Set | **Fund a Dream** | Milestone-based grants |

### Key Features

- **Bonding curve tokenomics** — early contributors earn more $FJAR per BTC
- **Time-locked vaults** — BTC is locked until the creator's chosen block height
- **Burn-on-refund** — refunding burns your $FJAR, protecting token value
- **100% to creators** — zero platform fees on contributions
- **Works with non-technical users** — just share a link

---

## Architecture

Two smart contracts on OPNet (Bitcoin L1, AssemblyScript/WASM):

| Contract | Purpose | Size |
|----------|---------|------|
| **FatJarManager** | Vault CRUD, contributions, time-lock, withdraw, refund | 26 KB |
| **FatJarToken** (OP20) | $FJAR bonding curve mint, burn-on-refund, 100M cap | 37 KB |

**Deployed on OPNet testnet:**
- Token: `opt1sqpe6eu5p0x5vhljqwhwt4hy7zw2w33t69g3cqgjr`
- Manager: `opt1sqrftj9eqnwa3gpxg5m5ulww6x5hsd4s5uup8hgzq`

**Frontend** reads from real on-chain state when the RPC is reachable, with mock fallback for demo. The LIVE/DEMO badge in the stats strip shows which mode is active.

---

## Tech Stack

- **Smart Contracts:** AssemblyScript (OPNet/WASM), `@btc-vision/btc-runtime`
- **Frontend:** React 19 + TypeScript + Vite
- **Chain Integration:** `opnet` SDK (JSONRpcProvider + getContract)
- **Wallet:** OPWallet (Chrome extension) with mock fallback
- **Token Standard:** OP20 (bonding curve, 100M capped supply)
- **Deploy:** Vercel (frontend), OPNet testnet (contracts)

---

## Project Structure

```
contracts/          # AssemblyScript smart contracts
  src/fatjar-token/   # OP20 token with bonding curve
  src/fatjar-manager/ # Vault management contract
  build/              # Compiled WASM binaries
  abis/               # Generated ABI files

frontend/           # React + Vite app
  src/pages/          # Home, Create, Fund Detail, Dashboard
  src/services/       # contract.ts (facade), contract.live.ts, contract.mock.ts
  src/components/     # UI components (editorial brutalist design)

scripts/            # Deployment scripts
docs/               # Design docs, session notes, task tracking
```

---

## Run Locally

```bash
# Frontend
cd frontend
npm install
npm run dev        # → http://localhost:5173

# Add ?mock=true to force demo mode
# Add ?live=true to force chain reads
```

---

## Bonding Curve

$FJAR uses a decreasing bonding curve: `tokens_per_btc = 120,000 / sqrt(total_btc + 1)`

| BTC Contributed | Rate | Tokens/BTC |
|----------------|------|------------|
| 0 – 1 BTC | Early Bird | 120,000 |
| 1 – 10 BTC | Growth | ~38,000 |
| 10 – 100 BTC | Mature | ~12,000 |
| 100+ BTC | Late | ~3,800 |

Early contributors are rewarded. No pre-mine, no team allocation.

---

## Security

- One-time guards on `setManager()` / `setTokenAddress()` — cannot be changed after linking
- Checks-Effects-Interactions pattern throughout
- `MAX_SATOSHIS` overflow protection on bonding curve
- Authorized minter pattern — only Manager can mint $FJAR
- Burn-on-refund prevents curve manipulation
- Code reviewed across 2 dedicated security review sessions

---

## License

MIT
