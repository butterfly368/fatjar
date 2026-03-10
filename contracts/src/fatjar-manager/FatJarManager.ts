import { u256 } from '@btc-vision/as-bignum/assembly';
import {
    Address,
    Blockchain,
    BytesWriter,
    Calldata,
    OP_NET,
    Revert,
    SafeMath,
    StoredU256,
} from '@btc-vision/btc-runtime/runtime';
import { EMPTY_POINTER } from '@btc-vision/btc-runtime/runtime/math/bytes';
import { encodeSelector } from '@btc-vision/btc-runtime/runtime/math/abi';
import { StoredMapU256 } from '@btc-vision/btc-runtime/runtime/storage/maps/StoredMapU256';
import {
    SELECTOR_BYTE_LENGTH,
    ADDRESS_BYTE_LENGTH,
    U256_BYTE_LENGTH,
} from '@btc-vision/btc-runtime/runtime/utils/lengths';
import {
    FundCreatedEvent,
    ContributionEvent,
    WithdrawalEvent,
    FundClosedEvent,
    RefundEvent,
} from './events/FatJarManagerEvents';

// =============================================================================
// Storage Pointer Allocation (Module Level - CRITICAL: unique, no collisions)
// =============================================================================

// Global state
const fundCountPointer: u16 = Blockchain.nextPointer;
const tokenAddressPointer: u16 = Blockchain.nextPointer;

// Fund data (keyed by fundId as u256)
const fundCreatorPointer: u16 = Blockchain.nextPointer;
// Fund name stored via events only (frontend indexes them)
const fundTotalRaisedPointer: u16 = Blockchain.nextPointer;
const fundUnlockTimestampPointer: u16 = Blockchain.nextPointer;
const fundIsClosedPointer: u16 = Blockchain.nextPointer;
const fundWithdrawnPointer: u16 = Blockchain.nextPointer;

// Contribution tracking (keyed by composite of fundId + contributor address)
const contributionAmountPointer: u16 = Blockchain.nextPointer;

// Creator fund index (keyed by composite of creator address + index)
const creatorFundCountPointer: u16 = Blockchain.nextPointer;
const creatorFundIdPointer: u16 = Blockchain.nextPointer;

// Fund contributor tracking
const fundContributorCountPointer: u16 = Blockchain.nextPointer;

// Goal and beneficiary (keyed by fundId)
const fundGoalAmountPointer: u16 = Blockchain.nextPointer;
const fundBeneficiaryPointer: u16 = Blockchain.nextPointer;

// Tokens earned per fund per contributor (keyed by composite fundId + contributor)
const contributionTokensEarnedPointer: u16 = Blockchain.nextPointer;

// =============================================================================
// Constants
// =============================================================================

const ONE: u256 = u256.One;
const ZERO: u256 = u256.Zero;

// I2: Max value that fits in a u64 for unlock timestamp validation
const MAX_U64: u256 = u256.fromString('18446744073709551615');

// =============================================================================
// Contract
// =============================================================================

@final
export class FatJarManager extends OP_NET {
    // Global state
    private readonly fundCount: StoredU256;

    // Token contract address (for cross-contract mint calls)
    private readonly tokenAddress: StoredMapU256;

    // Fund storage maps (keyed by fundId)
    private readonly fundCreator: StoredMapU256;
    // Fund names stored via events (indexed off-chain)
    private readonly fundTotalRaised: StoredMapU256;
    private readonly fundUnlockTimestamp: StoredMapU256;
    private readonly fundIsClosed: StoredMapU256;
    private readonly fundWithdrawn: StoredMapU256;

    // Contribution tracking (keyed by composite key)
    private readonly contributionAmount: StoredMapU256;

    // Creator fund index
    private readonly creatorFundCount: StoredMapU256;
    private readonly creatorFundId: StoredMapU256;

    // Fund contributor tracking
    private readonly fundContributorCount: StoredMapU256;

    private readonly fundGoalAmount: StoredMapU256;
    private readonly fundBeneficiary: StoredMapU256;
    private readonly contributionTokensEarned: StoredMapU256;

    public constructor() {
        super();

        this.fundCount = new StoredU256(fundCountPointer, EMPTY_POINTER);
        this.tokenAddress = new StoredMapU256(tokenAddressPointer);

        this.fundCreator = new StoredMapU256(fundCreatorPointer);
        this.fundTotalRaised = new StoredMapU256(fundTotalRaisedPointer);
        this.fundUnlockTimestamp = new StoredMapU256(fundUnlockTimestampPointer);
        this.fundIsClosed = new StoredMapU256(fundIsClosedPointer);
        this.fundWithdrawn = new StoredMapU256(fundWithdrawnPointer);

        this.contributionAmount = new StoredMapU256(contributionAmountPointer);

        this.creatorFundCount = new StoredMapU256(creatorFundCountPointer);
        this.creatorFundId = new StoredMapU256(creatorFundIdPointer);

        this.fundContributorCount = new StoredMapU256(fundContributorCountPointer);

        this.fundGoalAmount = new StoredMapU256(fundGoalAmountPointer);
        this.fundBeneficiary = new StoredMapU256(fundBeneficiaryPointer);
        this.contributionTokensEarned = new StoredMapU256(contributionTokensEarnedPointer);
    }

    public override onDeployment(_calldata: Calldata): void {
        // Token address set via setTokenAddress after both contracts deployed
    }

    public override onUpdate(_calldata: Calldata): void {
        super.onUpdate(_calldata);
    }

    // =========================================================================
    // ADMIN METHODS
    // =========================================================================

    /**
     * Set the FatJarToken contract address. Only callable by deployer, once.
     */
    @method({
        name: 'tokenAddress',
        type: ABIDataTypes.ADDRESS,
    })
    @returns()
    public setTokenAddress(calldata: Calldata): BytesWriter {
        this.onlyDeployer(Blockchain.tx.sender);

        // C2: One-time guard — cannot change token address once set
        const existing: u256 = this.tokenAddress.get(ZERO);
        if (!u256.eq(existing, ZERO)) {
            throw new Revert('Token address already set');
        }

        const token: Address = calldata.readAddress();
        this.tokenAddress.set(ZERO, this.addressToU256(token));

        return new BytesWriter(0);
    }

    // =========================================================================
    // FUND MANAGEMENT
    // =========================================================================

    /**
     * Create a new fund (jar).
     * @param name - Fund name (string, emitted in event for off-chain indexing)
     * @param unlockTimestamp - Block number when funds can be withdrawn (0 = no lock)
     */
    @method(
        {
            name: 'name',
            type: ABIDataTypes.STRING,
        },
        {
            name: 'unlockTimestamp',
            type: ABIDataTypes.UINT256,
        },
        {
            name: 'goalAmount',
            type: ABIDataTypes.UINT256,
        },
        {
            name: 'beneficiary',
            type: ABIDataTypes.ADDRESS,
        },
    )
    @emit('FundCreated')
    @returns({
        name: 'fundId',
        type: ABIDataTypes.UINT256,
    })
    public createFund(calldata: Calldata): BytesWriter {
        const name: string = calldata.readStringWithLength();
        const unlockTimestamp: u256 = calldata.readU256();
        const goalAmount: u256 = calldata.readU256();
        const beneficiary: Address = calldata.readAddress();

        if (name.length == 0) {
            throw new Revert('Empty fund name');
        }
        if (name.length > 64) {
            throw new Revert('Name too long');
        }

        // I2: Validate unlock timestamp fits in reasonable range
        if (u256.gt(unlockTimestamp, MAX_U64)) {
            throw new Revert('Unlock timestamp too large');
        }

        const creator: Address = Blockchain.tx.sender;

        // Increment fund count to get new fund ID
        const currentCount: u256 = this.fundCount.value;
        const fundId: u256 = SafeMath.add(currentCount, ONE);
        this.fundCount.value = fundId;

        // Store fund data
        this.fundCreator.set(fundId, this.addressToU256(creator));
        this.fundTotalRaised.set(fundId, ZERO);
        this.fundUnlockTimestamp.set(fundId, unlockTimestamp);
        this.fundIsClosed.set(fundId, ZERO);
        this.fundWithdrawn.set(fundId, ZERO);

        // Store goal and beneficiary
        this.fundGoalAmount.set(fundId, goalAmount);
        this.fundBeneficiary.set(fundId, this.addressToU256(beneficiary));

        // Track creator's funds
        const creatorKey: u256 = this.addressToU256(creator);
        const creatorCount: u256 = this.creatorFundCount.get(creatorKey);
        const newCreatorCount: u256 = SafeMath.add(creatorCount, ONE);
        this.creatorFundCount.set(creatorKey, newCreatorCount);

        // Store fundId at creator's fund index
        const creatorFundKey: u256 = this.compositeKey(creatorKey, newCreatorCount);
        this.creatorFundId.set(creatorFundKey, fundId);

        // S2: Emit event with unlockTimestamp as u256 (matching stored type)
        this.emitEvent(new FundCreatedEvent(fundId, creator, unlockTimestamp, goalAmount, beneficiary));

        const writer = new BytesWriter(32);
        writer.writeU256(fundId);
        return writer;
    }

    /**
     * Contribute BTC to a fund. Records the contribution and triggers
     * cross-contract mint on FatJarToken for bonding curve token rewards.
     */
    @method(
        {
            name: 'fundId',
            type: ABIDataTypes.UINT256,
        },
        {
            name: 'satoshis',
            type: ABIDataTypes.UINT256,
        },
    )
    @emit('Contribution')
    @returns()
    public contribute(calldata: Calldata): BytesWriter {
        const fundId: u256 = calldata.readU256();
        const satoshis: u256 = calldata.readU256();

        // Validate fund exists
        const creatorU256: u256 = this.fundCreator.get(fundId);
        if (u256.eq(creatorU256, ZERO)) {
            throw new Revert('Fund does not exist');
        }

        // Check fund is not closed
        const isClosed: u256 = this.fundIsClosed.get(fundId);
        if (!u256.eq(isClosed, ZERO)) {
            throw new Revert('Fund is closed');
        }

        if (u256.eq(satoshis, ZERO)) {
            throw new Revert('Zero contribution');
        }

        const contributor: Address = Blockchain.tx.sender;
        const contributorKey: u256 = this.addressToU256(contributor);

        // Update fund total raised
        const currentTotal: u256 = this.fundTotalRaised.get(fundId);
        this.fundTotalRaised.set(fundId, SafeMath.add(currentTotal, satoshis));

        // Update contributor's contribution to this fund
        const contribKey: u256 = this.compositeKey(fundId, contributorKey);
        const currentContrib: u256 = this.contributionAmount.get(contribKey);

        if (u256.eq(currentContrib, ZERO)) {
            // New contributor — increment fund contributor count
            const contribCount: u256 = this.fundContributorCount.get(fundId);
            this.fundContributorCount.set(fundId, SafeMath.add(contribCount, ONE));
        }

        this.contributionAmount.set(contribKey, SafeMath.add(currentContrib, satoshis));

        // S5: Cross-contract call to FatJarToken.mintForContribution
        const tokensMinted: u256 = this.mintTokensForContributor(contributor, satoshis);

        // Track tokens earned per fund per contributor (for burn-on-refund)
        const tokensKey: u256 = this.compositeKey(fundId, contributorKey);
        const existingTokens: u256 = this.contributionTokensEarned.get(tokensKey);
        this.contributionTokensEarned.set(tokensKey, SafeMath.add(existingTokens, tokensMinted));

        // Emit event with tokens minted info
        this.emitEvent(new ContributionEvent(fundId, contributor, satoshis, tokensMinted));

        return new BytesWriter(0);
    }

    /**
     * Withdraw BTC from a fund. Creator withdraws (or beneficiary if set).
     * Respects time-lock and goal conditions.
     */
    @method({
        name: 'fundId',
        type: ABIDataTypes.UINT256,
    })
    @emit('Withdrawal')
    @returns({
        name: 'amount',
        type: ABIDataTypes.UINT256,
    })
    public withdraw(calldata: Calldata): BytesWriter {
        const fundId: u256 = calldata.readU256();

        // Validate fund exists
        const creatorU256: u256 = this.fundCreator.get(fundId);
        if (u256.eq(creatorU256, ZERO)) {
            throw new Revert('Fund does not exist');
        }

        const sender: Address = Blockchain.tx.sender;
        const senderU256: u256 = this.addressToU256(sender);

        // D5: Check if beneficiary is set — determines who can withdraw
        const beneficiaryU256: u256 = this.fundBeneficiary.get(fundId);
        if (!u256.eq(beneficiaryU256, ZERO)) {
            // Beneficiary mode: only beneficiary can withdraw
            if (!u256.eq(beneficiaryU256, senderU256)) {
                throw new Revert('Only beneficiary can withdraw');
            }
        } else {
            // Creator mode: only creator can withdraw
            if (!u256.eq(creatorU256, senderU256)) {
                throw new Revert('Only creator can withdraw');
            }
        }

        // Check time-lock
        const unlockTimestamp: u256 = this.fundUnlockTimestamp.get(fundId);
        if (!u256.eq(unlockTimestamp, ZERO)) {
            const currentBlock: u256 = u256.fromU64(Blockchain.block.number);
            if (u256.gt(unlockTimestamp, currentBlock)) {
                throw new Revert('Fund is time-locked');
            }
        }

        // Read totalRaised once (used for goal check AND withdrawal calculation)
        const totalRaised: u256 = this.fundTotalRaised.get(fundId);

        // If goal-based, require goal to be met
        const goalAmount: u256 = this.fundGoalAmount.get(fundId);
        if (!u256.eq(goalAmount, ZERO)) {
            if (u256.lt(totalRaised, goalAmount)) {
                throw new Revert('Goal not met');
            }
        }

        // Calculate withdrawable amount
        const alreadyWithdrawn: u256 = this.fundWithdrawn.get(fundId);
        const withdrawable: u256 = SafeMath.sub(totalRaised, alreadyWithdrawn);

        if (u256.eq(withdrawable, ZERO)) {
            throw new Revert('Nothing to withdraw');
        }

        this.fundWithdrawn.set(fundId, totalRaised);

        this.emitEvent(new WithdrawalEvent(fundId, sender, withdrawable));

        const writer = new BytesWriter(32);
        writer.writeU256(withdrawable);
        return writer;
    }

    /**
     * Close a fund. Only the fund creator can close.
     */
    @method({
        name: 'fundId',
        type: ABIDataTypes.UINT256,
    })
    @emit('FundClosed')
    @returns()
    public closeFund(calldata: Calldata): BytesWriter {
        const fundId: u256 = calldata.readU256();

        const creatorU256: u256 = this.fundCreator.get(fundId);
        if (u256.eq(creatorU256, ZERO)) {
            throw new Revert('Fund does not exist');
        }

        const sender: Address = Blockchain.tx.sender;
        const senderU256: u256 = this.addressToU256(sender);
        if (!u256.eq(creatorU256, senderU256)) {
            throw new Revert('Only creator can close');
        }

        const isClosed: u256 = this.fundIsClosed.get(fundId);
        if (!u256.eq(isClosed, ZERO)) {
            throw new Revert('Already closed');
        }

        this.fundIsClosed.set(fundId, ONE);

        this.emitEvent(new FundClosedEvent(fundId, sender));

        return new BytesWriter(0);
    }

    /**
     * Refund a contributor's BTC from a failed goal-based vault.
     * Burns the $FJAR tokens they earned from this vault.
     * D2: Contributor must hold enough $FJAR — if they sold, refund reverts.
     * D4: Only available for goal-based vaults (goalAmount > 0).
     */
    @method({
        name: 'fundId',
        type: ABIDataTypes.UINT256,
    })
    @emit('Refund')
    @returns({
        name: 'amount',
        type: ABIDataTypes.UINT256,
    })
    public refund(calldata: Calldata): BytesWriter {
        const fundId: u256 = calldata.readU256();

        // Must be a goal-based vault
        const goalAmount: u256 = this.fundGoalAmount.get(fundId);
        if (u256.eq(goalAmount, ZERO)) {
            throw new Revert('Not a goal-based vault');
        }

        // Validate fund exists
        const creatorU256: u256 = this.fundCreator.get(fundId);
        if (u256.eq(creatorU256, ZERO)) {
            throw new Revert('Fund does not exist');
        }

        // Time-lock must have expired OR fund must be closed
        // Closing a goal-based fund early = admitting failure, allows immediate refund
        const isClosed: u256 = this.fundIsClosed.get(fundId);
        if (u256.eq(isClosed, ZERO)) {
            // Fund not closed — time-lock must have expired
            const unlockTimestamp: u256 = this.fundUnlockTimestamp.get(fundId);
            if (!u256.eq(unlockTimestamp, ZERO)) {
                const currentBlock: u256 = u256.fromU64(Blockchain.block.number);
                if (u256.gt(unlockTimestamp, currentBlock)) {
                    throw new Revert('Fund is time-locked');
                }
            }
        }

        // Goal must NOT be met
        const totalRaised: u256 = this.fundTotalRaised.get(fundId);
        if (u256.ge(totalRaised, goalAmount)) {
            throw new Revert('Goal was met');
        }

        // Caller must have contributed
        const contributor: Address = Blockchain.tx.sender;
        const contributorKey: u256 = this.addressToU256(contributor);
        const contribKey: u256 = this.compositeKey(fundId, contributorKey);
        const contributionAmount: u256 = this.contributionAmount.get(contribKey);

        if (u256.eq(contributionAmount, ZERO)) {
            throw new Revert('No contribution to refund');
        }

        // Get tokens earned from this fund (same composite key as contribution)
        const tokensEarned: u256 = this.contributionTokensEarned.get(contribKey);

        // Zero out contribution and tokens earned
        this.contributionAmount.set(contribKey, ZERO);
        this.contributionTokensEarned.set(contribKey, ZERO);

        // Decrement fund total raised
        this.fundTotalRaised.set(fundId, SafeMath.sub(totalRaised, contributionAmount));

        // Decrement contributor count
        const contribCount: u256 = this.fundContributorCount.get(fundId);
        if (u256.gt(contribCount, ZERO)) {
            this.fundContributorCount.set(fundId, SafeMath.sub(contribCount, ONE));
        }

        // Cross-contract call: burn $FJAR tokens
        if (!u256.eq(tokensEarned, ZERO)) {
            this.burnTokensForRefund(contributor, tokensEarned);
        }

        this.emitEvent(new RefundEvent(fundId, contributor, contributionAmount, tokensEarned));

        const writer = new BytesWriter(32);
        writer.writeU256(contributionAmount);
        return writer;
    }

    // =========================================================================
    // VIEW METHODS
    // =========================================================================

    /**
     * Get total number of funds created.
     */
    @method()
    @returns({
        name: 'count',
        type: ABIDataTypes.UINT256,
    })
    public getFundCount(calldata: Calldata): BytesWriter {
        const writer = new BytesWriter(32);
        writer.writeU256(this.fundCount.value);
        return writer;
    }

    /**
     * Get fund details.
     */
    @method({
        name: 'fundId',
        type: ABIDataTypes.UINT256,
    })
    @returns(
        { name: 'creator', type: ABIDataTypes.UINT256 },
        { name: 'totalRaised', type: ABIDataTypes.UINT256 },
        { name: 'unlockTimestamp', type: ABIDataTypes.UINT256 },
        { name: 'isClosed', type: ABIDataTypes.UINT256 },
        { name: 'withdrawn', type: ABIDataTypes.UINT256 },
        { name: 'contributorCount', type: ABIDataTypes.UINT256 },
        { name: 'goalAmount', type: ABIDataTypes.UINT256 },
        { name: 'beneficiary', type: ABIDataTypes.UINT256 },
    )
    public getFundDetails(calldata: Calldata): BytesWriter {
        const fundId: u256 = calldata.readU256();

        const writer = new BytesWriter(32 * 8);
        writer.writeU256(this.fundCreator.get(fundId));
        writer.writeU256(this.fundTotalRaised.get(fundId));
        writer.writeU256(this.fundUnlockTimestamp.get(fundId));
        writer.writeU256(this.fundIsClosed.get(fundId));
        writer.writeU256(this.fundWithdrawn.get(fundId));
        writer.writeU256(this.fundContributorCount.get(fundId));
        writer.writeU256(this.fundGoalAmount.get(fundId));
        writer.writeU256(this.fundBeneficiary.get(fundId));
        return writer;
    }

    /**
     * Get a contributor's total contribution to a specific fund.
     */
    @method(
        { name: 'fundId', type: ABIDataTypes.UINT256 },
        { name: 'contributor', type: ABIDataTypes.ADDRESS },
    )
    @returns({
        name: 'amount',
        type: ABIDataTypes.UINT256,
    })
    public getContribution(calldata: Calldata): BytesWriter {
        const fundId: u256 = calldata.readU256();
        const contributor: Address = calldata.readAddress();

        const contribKey: u256 = this.compositeKey(fundId, this.addressToU256(contributor));
        const amount: u256 = this.contributionAmount.get(contribKey);

        const writer = new BytesWriter(32);
        writer.writeU256(amount);
        return writer;
    }

    /**
     * Get tokens earned by a contributor for a specific fund.
     */
    @method(
        { name: 'fundId', type: ABIDataTypes.UINT256 },
        { name: 'contributor', type: ABIDataTypes.ADDRESS },
    )
    @returns({
        name: 'tokens',
        type: ABIDataTypes.UINT256,
    })
    public getContributionTokens(calldata: Calldata): BytesWriter {
        const fundId: u256 = calldata.readU256();
        const contributor: Address = calldata.readAddress();

        const tokensKey: u256 = this.compositeKey(fundId, this.addressToU256(contributor));
        const tokens: u256 = this.contributionTokensEarned.get(tokensKey);

        const writer = new BytesWriter(32);
        writer.writeU256(tokens);
        return writer;
    }

    /**
     * Get creator's fund count.
     */
    @method({
        name: 'creator',
        type: ABIDataTypes.ADDRESS,
    })
    @returns({
        name: 'count',
        type: ABIDataTypes.UINT256,
    })
    public getCreatorFundCount(calldata: Calldata): BytesWriter {
        const creator: Address = calldata.readAddress();
        const creatorKey: u256 = this.addressToU256(creator);
        const count: u256 = this.creatorFundCount.get(creatorKey);

        const writer = new BytesWriter(32);
        writer.writeU256(count);
        return writer;
    }

    /**
     * Get a specific fund ID from a creator's fund list by index.
     */
    @method(
        { name: 'creator', type: ABIDataTypes.ADDRESS },
        { name: 'index', type: ABIDataTypes.UINT256 },
    )
    @returns({
        name: 'fundId',
        type: ABIDataTypes.UINT256,
    })
    public getCreatorFundByIndex(calldata: Calldata): BytesWriter {
        const creator: Address = calldata.readAddress();
        const index: u256 = calldata.readU256();

        const creatorKey: u256 = this.addressToU256(creator);
        const creatorFundKey: u256 = this.compositeKey(creatorKey, index);
        const fundId: u256 = this.creatorFundId.get(creatorFundKey);

        const writer = new BytesWriter(32);
        writer.writeU256(fundId);
        return writer;
    }

    // =========================================================================
    // INTERNAL HELPERS
    // =========================================================================

    /**
     * S5: Cross-contract call to FatJarToken.mintForContribution(contributor, satoshis).
     * Uses Blockchain.call() — the canonical OPNet pattern for contract-to-contract calls.
     * When called, Blockchain.tx.sender inside the Token will be this Manager's address,
     * so the Token's onlyManager() check passes.
     */
    private mintTokensForContributor(contributor: Address, satoshis: u256): u256 {
        const tokenU256: u256 = this.tokenAddress.get(ZERO);
        if (u256.eq(tokenU256, ZERO)) {
            throw new Revert('Token address not set');
        }

        // Reconstruct token Address from stored u256
        const tokenBytes: Uint8Array = tokenU256.toUint8Array(true);
        const tokenAddr: Address = changetype<Address>(tokenBytes);

        // Build calldata: selector + contributor address + satoshis
        // mintForContribution(address,uint256) selector
        const mintSelector = encodeSelector('mintForContribution(address,uint256)');
        const mintCalldata = new BytesWriter(
            SELECTOR_BYTE_LENGTH + ADDRESS_BYTE_LENGTH + U256_BYTE_LENGTH,
        );
        mintCalldata.writeSelector(mintSelector);
        mintCalldata.writeAddress(contributor);
        mintCalldata.writeU256(satoshis);

        // Execute cross-contract call (reverts entire tx on failure)
        const result = Blockchain.call(tokenAddr, mintCalldata);

        // Read the minted token amount from the response
        return result.data.readU256();
    }

    /**
     * Cross-contract call to FatJarToken.burnForRefund(contributor, tokenAmount).
     */
    private burnTokensForRefund(contributor: Address, tokenAmount: u256): void {
        const tokenU256: u256 = this.tokenAddress.get(ZERO);
        if (u256.eq(tokenU256, ZERO)) {
            throw new Revert('Token address not set');
        }

        const tokenBytes: Uint8Array = tokenU256.toUint8Array(true);
        const tokenAddr: Address = changetype<Address>(tokenBytes);

        const burnSelector = encodeSelector('burnForRefund(address,uint256)');
        const burnCalldata = new BytesWriter(
            SELECTOR_BYTE_LENGTH + ADDRESS_BYTE_LENGTH + U256_BYTE_LENGTH,
        );
        burnCalldata.writeSelector(burnSelector);
        burnCalldata.writeAddress(contributor);
        burnCalldata.writeU256(tokenAmount);

        Blockchain.call(tokenAddr, burnCalldata);
    }

    /**
     * Convert an Address to u256 for storage.
     */
    private addressToU256(addr: Address): u256 {
        return u256.fromUint8ArrayBE(addr);
    }

    /**
     * Create a composite storage key from two u256 values.
     * Packs a into upper 128 bits, b into lower 128 bits.
     * Safe for fundId (sequential small numbers) and address keys
     * where StoredMapU256 applies its own SHA256 hashing on the key.
     */
    private compositeKey(a: u256, b: u256): u256 {
        const shifted: u256 = u256.shl(a, 128);
        return u256.or(shifted, b);
    }
}
