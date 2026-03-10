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
import { ContributionMintedEvent, TokensBurnedEvent } from './events/FatJarTokenEvents';

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

// Maximum realistic contribution: 21M BTC in satoshis (C1: upper-bound check)
const MAX_SATOSHIS: u256 = u256.fromString('2100000000000000');

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

        // C2: One-time guard — cannot change manager once set
        const managerKey: u256 = u256.Zero;
        const existing: u256 = this.managerAddress.get(managerKey);
        if (!u256.eq(existing, u256.Zero)) {
            throw new Revert('Manager already set');
        }

        const manager: Address = calldata.readAddress();
        this.managerAddress.set(managerKey, this.addressToU256(manager));

        return new BytesWriter(0);
    }

    /**
     * Mint tokens for a contribution. Only callable by the Manager contract.
     * Calculates tokens based on bonding curve: tokens_per_btc = K / sqrt(total_btc + 1)
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
        this.onlyManager();

        const contributor: Address = calldata.readAddress();
        const satoshis: u256 = calldata.readU256();

        if (u256.eq(satoshis, u256.Zero)) {
            throw new Revert('Zero contribution');
        }

        // C1: Upper-bound check to prevent overflow in bonding curve math
        if (u256.gt(satoshis, MAX_SATOSHIS)) {
            throw new Revert('Contribution too large');
        }

        // Calculate tokens to mint using bonding curve
        const tokensMinted: u256 = this.calculateTokens(satoshis);

        if (u256.eq(tokensMinted, u256.Zero)) {
            throw new Revert('Zero tokens calculated');
        }

        // I1: Update state BEFORE mint (Checks-Effects-Interactions pattern)
        const currentTotal: u256 = this.totalBtcContributed.value;
        this.totalBtcContributed.value = SafeMath.add(currentTotal, satoshis);

        // Mint tokens to contributor
        this._mint(contributor, tokensMinted);

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

    /**
     * Burn tokens from a contributor during refund. Only callable by Manager.
     * D1: totalBtcContributed is NOT decremented — curve reflects all-time activity.
     */
    @method(
        {
            name: 'contributor',
            type: ABIDataTypes.ADDRESS,
        },
        {
            name: 'tokenAmount',
            type: ABIDataTypes.UINT256,
        },
    )
    @emit('TokensBurned')
    @returns()
    public burnForRefund(calldata: Calldata): BytesWriter {
        this.onlyManager();

        const contributor: Address = calldata.readAddress();
        const tokenAmount: u256 = calldata.readU256();

        if (u256.eq(tokenAmount, u256.Zero)) {
            throw new Revert('Zero burn amount');
        }

        // Burn tokens from contributor (OP20._burn checks balance internally)
        this._burn(contributor, tokenAmount);

        this.emitEvent(new TokensBurnedEvent(contributor, tokenAmount));

        return new BytesWriter(0);
    }

    // =========================================================================
    // Internal
    // =========================================================================

    /**
     * Calculate tokens to mint for a given satoshi amount using bonding curve.
     *
     * Formula: tokens = (satoshis / SATS_PER_BTC) * K / sqrt(total_btc_in_btc + 1)
     *
     * Integer math: tokens = (satoshis * K_SCALED * 10^18) / (SATS_PER_BTC * sqrt_scaled)
     */
    private calculateTokens(satoshis: u256): u256 {
        // total_sats + 1 BTC (the "+1" in the formula)
        const totalSatsPlusOne: u256 = SafeMath.add(
            this.totalBtcContributed.value,
            SATS_PER_BTC,
        );

        // Convert to BTC with 18 decimal precision for sqrt
        const totalBtcScaled: u256 = SafeMath.div(
            SafeMath.mul(totalSatsPlusOne, DECIMALS_MULTIPLIER),
            SATS_PER_BTC,
        );

        // C3: Use audited SafeMath.sqrt instead of custom implementation
        const sqrtInput: u256 = SafeMath.mul(totalBtcScaled, DECIMALS_MULTIPLIER);
        const sqrtResult: u256 = SafeMath.sqrt(sqrtInput);

        // tokens = satoshis * K_SCALED * 10^18 / (SATS_PER_BTC * sqrtResult)
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
