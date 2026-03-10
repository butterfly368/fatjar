import { u256 } from '@btc-vision/as-bignum/assembly';
import {
    Address,
    Blockchain,
    BytesWriter,
    Calldata,
    OP20,
    OP20InitParameters,
    Revert,
    SafeMath,
    StoredU256,
} from '@btc-vision/btc-runtime/runtime';
import { EMPTY_POINTER } from '@btc-vision/btc-runtime/runtime/math/bytes';
import { StoredMapU256 } from '@btc-vision/btc-runtime/runtime/storage/maps/StoredMapU256';
import { ContributionMintedEvent } from './events/FatJarTokenEvents';

// Storage pointers (module level — unique, no collisions)
const managerAddressPointer: u16 = Blockchain.nextPointer;
const totalBtcContributedPointer: u16 = Blockchain.nextPointer;

// Bonding curve constant K = 120,000 (with 18 decimals)
// K * 10^18 = 120000 * 10^18 = 1.2 * 10^23
const K_SCALED: u256 = u256.fromString('120000000000000000000000');

// 1 BTC in satoshis (for scaling)
const SATS_PER_BTC: u256 = u256.fromU64(100000000);

// 10^18 for decimal scaling
const DECIMALS_MULTIPLIER: u256 = u256.fromString('1000000000000000000');

@final
export class FatJarToken extends OP20 {
    // Address of the FatJarManager contract (authorized minter)
    private readonly managerAddress: StoredMapU256;

    // Total BTC contributed across all funds (in satoshis)
    private readonly totalBtcContributed: StoredU256;

    public constructor() {
        super();

        this.managerAddress = new StoredMapU256(managerAddressPointer);
        this.totalBtcContributed = new StoredU256(totalBtcContributedPointer, EMPTY_POINTER);
    }

    public override onDeployment(_calldata: Calldata): void {
        // 100M tokens with 18 decimals
        const maxSupply: u256 = u256.fromString('100000000000000000000000000');
        const decimals: u8 = 18;
        const name: string = 'FatJar';
        const symbol: string = 'FJAR';

        this.instantiate(new OP20InitParameters(maxSupply, decimals, name, symbol));

        // Manager address will be set after Manager contract is deployed
        // via setManager()
    }

    public override onUpdate(_calldata: Calldata): void {
        super.onUpdate(_calldata);
    }

    /**
     * Set the FatJarManager contract address. Only callable by deployer, once.
     */
    @method({
        name: 'managerAddress',
        type: ABIDataTypes.ADDRESS,
    })
    @returns()
    public setManager(calldata: Calldata): BytesWriter {
        this.onlyDeployer(Blockchain.tx.sender);

        const manager: Address = calldata.readAddress();
        const managerKey: u256 = u256.Zero;

        // Store manager address as u256
        this.managerAddress.set(managerKey, this.addressToU256(manager));

        return new BytesWriter(0);
    }

    /**
     * Mint tokens for a contribution. Only callable by the Manager contract.
     * Calculates tokens based on bonding curve: tokens_per_btc = K / sqrt(total_btc + 1)
     *
     * @param calldata: contributor address, btc amount in satoshis
     * @returns tokens minted (u256)
     */
    @method(
        {
            name: 'contributor',
            type: ABIDataTypes.ADDRESS,
        },
        {
            name: 'satoshis',
            type: ABIDataTypes.UINT256,
        },
    )
    @emit('ContributionMinted')
    @returns({
        name: 'tokensMinted',
        type: ABIDataTypes.UINT256,
    })
    public mintForContribution(calldata: Calldata): BytesWriter {
        // Only the Manager contract can call this
        this.onlyManager();

        const contributor: Address = calldata.readAddress();
        const satoshis: u256 = calldata.readU256();

        if (u256.eq(satoshis, u256.Zero)) {
            throw new Revert('Zero contribution');
        }

        // Calculate tokens to mint using bonding curve
        const tokensMinted: u256 = this.calculateTokens(satoshis);

        if (u256.eq(tokensMinted, u256.Zero)) {
            throw new Revert('Zero tokens calculated');
        }

        // Mint tokens to contributor
        this._mint(contributor, tokensMinted);

        // Update total BTC contributed
        const currentTotal: u256 = this.totalBtcContributed.value;
        this.totalBtcContributed.value = SafeMath.add(currentTotal, satoshis);

        // Emit event
        this.emitEvent(new ContributionMintedEvent(contributor, satoshis, tokensMinted));

        const writer = new BytesWriter(32);
        writer.writeU256(tokensMinted);
        return writer;
    }

    /**
     * Get current token rate (tokens per 1 BTC at current level)
     */
    @method()
    @returns({
        name: 'rate',
        type: ABIDataTypes.UINT256,
    })
    public getTokenRate(calldata: Calldata): BytesWriter {
        const rate: u256 = this.calculateTokens(SATS_PER_BTC);
        const writer = new BytesWriter(32);
        writer.writeU256(rate);
        return writer;
    }

    /**
     * Get total BTC contributed platform-wide (in satoshis)
     */
    @method()
    @returns({
        name: 'totalBtc',
        type: ABIDataTypes.UINT256,
    })
    public getTotalBtcContributed(calldata: Calldata): BytesWriter {
        const writer = new BytesWriter(32);
        writer.writeU256(this.totalBtcContributed.value);
        return writer;
    }

    /**
     * Get remaining mintable supply
     */
    @method()
    @returns({
        name: 'remaining',
        type: ABIDataTypes.UINT256,
    })
    public remainingSupply(calldata: Calldata): BytesWriter {
        const minted: u256 = this._totalSupply.value;
        const max: u256 = this._maxSupply.value;
        const remaining: u256 = SafeMath.sub(max, minted);

        const writer = new BytesWriter(32);
        writer.writeU256(remaining);
        return writer;
    }

    // =========================================================================
    // Internal
    // =========================================================================

    /**
     * Calculate tokens to mint for a given satoshi amount using bonding curve.
     *
     * Formula: tokens = (satoshis / SATS_PER_BTC) * K / sqrt(total_btc_in_btc + 1)
     *
     * To avoid floating point, we use integer math:
     * tokens = (satoshis * K_SCALED) / (SATS_PER_BTC * sqrt_scaled(total_sats + SATS_PER_BTC))
     *
     * Where sqrt_scaled returns sqrt with 18 decimal precision.
     */
    private calculateTokens(satoshis: u256): u256 {
        // total_sats_plus_one_btc = totalBtcContributed + SATS_PER_BTC (adding 1 BTC for the +1)
        const totalSatsPlusOne: u256 = SafeMath.add(
            this.totalBtcContributed.value,
            SATS_PER_BTC,
        );

        // Convert to BTC with 18 decimal precision for sqrt
        // total_btc_scaled = totalSatsPlusOne * 10^18 / SATS_PER_BTC
        const totalBtcScaled: u256 = SafeMath.div(
            SafeMath.mul(totalSatsPlusOne, DECIMALS_MULTIPLIER),
            SATS_PER_BTC,
        );

        // Integer square root with 18 decimal precision
        // sqrt(x * 10^18) = sqrt(x) * 10^9, so we need to scale input by 10^18 first
        const sqrtInput: u256 = SafeMath.mul(totalBtcScaled, DECIMALS_MULTIPLIER);
        const sqrtResult: u256 = this.sqrt(sqrtInput);

        // tokens = satoshis * K_SCALED / (SATS_PER_BTC * sqrtResult)
        // But K_SCALED already has 18 decimals, sqrtResult has 18 decimals
        // So: tokens (18 dec) = satoshis * K_SCALED / (SATS_PER_BTC * sqrtResult / 10^18)
        // Simplified: tokens = satoshis * K_SCALED * 10^18 / (SATS_PER_BTC * sqrtResult)
        const numerator: u256 = SafeMath.mul(
            SafeMath.mul(satoshis, K_SCALED),
            DECIMALS_MULTIPLIER,
        );
        const denominator: u256 = SafeMath.mul(SATS_PER_BTC, sqrtResult);

        if (u256.eq(denominator, u256.Zero)) {
            return u256.Zero;
        }

        const tokens: u256 = SafeMath.div(numerator, denominator);

        // Cap at remaining supply
        const minted: u256 = this._totalSupply.value;
        const max: u256 = this._maxSupply.value;
        const remaining: u256 = SafeMath.sub(max, minted);

        if (u256.gt(tokens, remaining)) {
            return remaining;
        }

        return tokens;
    }

    /**
     * Integer square root using Newton's method (Babylonian method).
     * Returns floor(sqrt(x)).
     */
    private sqrt(x: u256): u256 {
        if (u256.eq(x, u256.Zero)) {
            return u256.Zero;
        }
        if (u256.eq(x, u256.One)) {
            return u256.One;
        }

        // Initial guess: x / 2
        let z: u256 = SafeMath.div(SafeMath.add(x, u256.One), u256.fromU32(2));
        let y: u256 = x;

        // Newton's iterations (bounded loop — max 256 iterations for u256)
        for (let i: i32 = 0; i < 256; i++) {
            if (u256.ge(z, y)) {
                break;
            }
            y = z;
            z = SafeMath.div(SafeMath.add(SafeMath.div(x, z), z), u256.fromU32(2));
        }

        return y;
    }

    /**
     * Check that the caller is the authorized Manager contract.
     */
    private onlyManager(): void {
        const managerKey: u256 = u256.Zero;
        const storedManager: u256 = this.managerAddress.get(managerKey);
        const senderAsU256: u256 = this.addressToU256(Blockchain.tx.sender);

        if (!u256.eq(storedManager, senderAsU256)) {
            throw new Revert('Only manager can mint');
        }
    }

    /**
     * Convert an Address to u256 for storage comparison.
     */
    private addressToU256(addr: Address): u256 {
        return u256.fromUint8ArrayBE(addr);
    }
}
