# OPNet Development Reference

> Quick reference for building smart contracts on Bitcoin L1 via OPNet.
> Source: btc-vision GitHub repos, vibecode bible, opnet-bob MCP.

## Toolchain

| Tool | Purpose | Install |
|------|---------|---------|
| opnet-bob MCP | AI dev agent (28+ tools) | `claude mcp add opnet-bob --transport http https://ai.opnet.org/mcp` |
| OPWallet | Browser wallet for OPNet | Chrome extension |
| Testnet faucet | Get regtest BTC | faucet.opnet.org |
| Testnet explorer | View contracts/txs | explorer.opnet.org/testnet |
| Node.js 22+ | Runtime | Required for unit tests |

## Key Repos (btc-vision)

| Repo | What |
|------|------|
| [btc-vision/OP_20](https://github.com/btc-vision/OP_20) | OP20 token template (clone this) |
| [btc-vision/example-contracts](https://github.com/btc-vision/example-contracts) | Contract examples |
| [btc-vision/btc-runtime](https://github.com/btc-vision/btc-runtime) | AssemblyScript runtime |
| [btc-vision/unit-test-framework](https://github.com/btc-vision/unit-test-framework) | Test framework |
| [btc-vision/opnet](https://github.com/btc-vision/opnet) | Core library |
| [btc-vision/native-swap](https://github.com/btc-vision/native-swap) | Swap contract example |

## Project Setup

```bash
git clone https://github.com/btc-vision/OP_20.git my-token
cd my-token
npm install
npm run build:token
```

Output: `build/[tokenname].wasm` → deploy via OPWallet

## OP20 Token Contract (AssemblyScript)

```typescript
// src/contracts/token/MyToken.ts
import { DeployableOP_20 } from '@btc-vision/btc-runtime';
import { u256 } from 'as-bignum/assembly';

export class MyToken extends DeployableOP_20 {
  onInstantiated(): void {
    const maxSupply: u256 = u256.fromString('100000000000000000000000000'); // 100M with 18 decimals
    const decimals: u8 = 18;
    const name: string = 'MyToken';
    const symbol: string = 'MTK';
    super.onInstantiated(maxSupply, decimals, name, symbol);
  }
}
```

## Custom Methods

```typescript
public override callMethod(method: Selector, calldata: Calldata): BytesWriter {
  switch (method) {
    case encodeSelector('myMethod()'):
      return this.myMethod(calldata);
    default:
      return super.callMethod(method, calldata);
  }
}
```

## Events

```typescript
class TransferEvent extends NetEvent {
  constructor(from: Address, to: Address, amount: u256) {
    const writer = new BytesWriter(ADDRESS_BYTE_LENGTH * 2 + U256_BYTE_LENGTH);
    writer.writeAddress(from);
    writer.writeAddress(to);
    writer.writeU256(amount);
    super('Transfer', writer);
  }
}
// Emit: this.emitEvent(new TransferEvent(from, to, amount));
```

## Storage (Persistent State)

```typescript
// Use StoredU256, StoredString, StoredBoolean for persistent state
// NOT regular variables — those reset each instantiation
```

## Access Control

```typescript
this.onlyOwner(Blockchain.sender); // Reverts if not owner
```

## Key Differences from Solidity

| Solidity | AssemblyScript/OPNet |
|----------|---------------------|
| Constructor runs once | `onInstantiated()` for one-time setup |
| Auto-persist state | Explicit `StoredU256`, `StoredString` |
| Built-in selectors | Manual `encodeSelector()` + `callMethod()` |
| `emit Event()` | `this.emitEvent(new EventClass())` |
| `msg.sender` | `Blockchain.sender` |
| `msg.value` | Check via calldata/Blockchain |

## Testing

```bash
npm install @btc-vision/unit-test-framework
npx tsx test/my-token.test.ts
```

```typescript
import { opnet, OPNetUnit, Assert, Blockchain, OP20 } from '@btc-vision/unit-test-framework';

await opnet('MyToken', async (vm: OPNetUnit) => {
  vm.beforeEach(async () => { /* reset */ });
  await vm.it('should mint tokens', async () => {
    // test logic
    Assert.expect(balance).toEqual(expected);
  });
});
```

Requires: Node.js 22+, Rust toolchain (for OP-VM)

## Deploy

1. `npm run build:token` → produces `.wasm`
2. Open OPWallet → select "deploy"
3. Upload `.wasm` file
4. Confirm transaction
5. Copy contract address

## Security Rules (from vibecode bible)

- All U256 arithmetic uses SafeMath (no raw operators)
- Unique, documented storage pointers (no collisions)
- Bounded `for` loops only (no `while` loops)
- CSV timelocks on swap recipient addresses
- 27 audit patterns checked by opnet-bob OpnetAudit tool

## Frontend Standards

- Dark theme with OPNet orange accent (#f7931a)
- Glassmorphism card design
- Mobile-first responsive
- Smooth 200ms transitions
- Wallet connection via OPWallet (signer remains null in frontend)

## Competition Submission (vibecode.finance)

- Working deployed contract (include address)
- 2-3 min demo video showing user flow
- Description paragraph
- Open-sourced repo
- Testnet or mainnet deployment proof
- Tweet with #opnetvibecode

## opnet-bob MCP Tools

28+ tools available when MCP is connected:
- **OpnetDev** — contract scaffolding, code generation
- **OpnetAudit** — 27-pattern security audit
- **OpnetCli** — deployment commands
- **CodingAgent** — full pipeline development
- **CryptoFrontend** — frontend generation
- **WebSearch, NewsFeed, XFeed** — research tools
