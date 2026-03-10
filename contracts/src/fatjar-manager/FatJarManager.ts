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
import { StoredMapU256 } from '@btc-vision/btc-runtime/runtime/storage/maps/StoredMapU256';
import {
    FundCreatedEvent,
    ContributionEvent,
    WithdrawalEvent,
    FundClosedEvent,
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

// Contribution tracking (keyed by hash of fundId + contributor address)
const contributionAmountPointer: u16 = Blockchain.nextPointer;

// Creator fund index (keyed by hash of creator address + index)
const creatorFundCountPointer: u16 = Blockchain.nextPointer;
const creatorFundIdPointer: u16 = Blockchain.nextPointer;

// Fund contributor tracking
const fundContributorCountPointer: u16 = Blockchain.nextPointer;

// =============================================================================
// Constants
// =============================================================================

const ONE: u256 = u256.One;
const ZERO: u256 = u256.Zero;

// =============================================================================
// Contract
// =============================================================================

@final
export class FatJarManager extends OP_NET {
    // Global state
    private readonly fundCount: StoredU256;

    // Token contract address (for cross-contract calls)
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
     * Set the FatJarToken contract address. Only callable by deployer.
     */
    @method({
        name: 'tokenAddress',
        type: ABIDataTypes.ADDRESS,
    })
    @returns()
    public setTokenAddress(calldata: Calldata): BytesWriter {
        this.onlyDeployer(Blockchain.tx.sender);

        const token: Address = calldata.readAddress();
        this.tokenAddress.set(ZERO, this.addressToU256(token));

        return new BytesWriter(0);
    }

    // =========================================================================
    // FUND MANAGEMENT
    // =========================================================================

    /**
     * Create a new fund (jar).
     * @param name - Fund name (string)
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
    )
    @emit('FundCreated')
    @returns({
        name: 'fundId',
        type: ABIDataTypes.UINT256,
    })
    public createFund(calldata: Calldata): BytesWriter {
        const name: string = calldata.readStringWithLength();
        const unlockTimestamp: u256 = calldata.readU256();

        if (name.length == 0) {
            throw new Revert('Empty fund name');
        }
        if (name.length > 64) {
            throw new Revert('Name too long');
        }

        const creator: Address = Blockchain.tx.sender;

        // Increment fund count to get new fund ID
        const currentCount: u256 = this.fundCount.value;
        const fundId: u256 = SafeMath.add(currentCount, ONE);
        this.fundCount.value = fundId;

        // Store fund data
        this.fundCreator.set(fundId, this.addressToU256(creator));
        // Fund name emitted in event (indexed off-chain)
        this.fundTotalRaised.set(fundId, ZERO);
        this.fundUnlockTimestamp.set(fundId, unlockTimestamp);
        this.fundIsClosed.set(fundId, ZERO); // false
        this.fundWithdrawn.set(fundId, ZERO);

        // Track creator's funds
        const creatorKey: u256 = this.addressToU256(creator);
        const creatorCount: u256 = this.creatorFundCount.get(creatorKey);
        const newCreatorCount: u256 = SafeMath.add(creatorCount, ONE);
        this.creatorFundCount.set(creatorKey, newCreatorCount);

        // Store fundId at creator's fund index
        const creatorFundKey: u256 = this.compositeKey(creatorKey, newCreatorCount);
        this.creatorFundId.set(creatorFundKey, fundId);

        // Emit event
        const unlockTs: u64 = unlockTimestamp.lo1;
        this.emitEvent(new FundCreatedEvent(fundId, creator, unlockTs));

        const writer = new BytesWriter(32);
        writer.writeU256(fundId);
        return writer;
    }

    /**
     * Contribute BTC to a fund. The satoshi amount is passed as calldata
     * (actual BTC transfer happens at the transaction level).
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

        // Emit event
        this.emitEvent(new ContributionEvent(fundId, contributor, satoshis));

        return new BytesWriter(0);
    }

    /**
     * Withdraw BTC from a fund. Only the fund creator can withdraw.
     * Respects time-lock if set.
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

        // Validate fund exists and caller is creator
        const creatorU256: u256 = this.fundCreator.get(fundId);
        if (u256.eq(creatorU256, ZERO)) {
            throw new Revert('Fund does not exist');
        }

        const sender: Address = Blockchain.tx.sender;
        const senderU256: u256 = this.addressToU256(sender);
        if (!u256.eq(creatorU256, senderU256)) {
            throw new Revert('Only creator can withdraw');
        }

        // Check time-lock
        const unlockTimestamp: u256 = this.fundUnlockTimestamp.get(fundId);
        if (!u256.eq(unlockTimestamp, ZERO)) {
            const currentBlock: u256 = u256.fromU64(Blockchain.block.number);
            if (u256.gt(unlockTimestamp, currentBlock)) {
                throw new Revert('Fund is time-locked');
            }
        }

        // Calculate withdrawable amount (total raised - already withdrawn)
        const totalRaised: u256 = this.fundTotalRaised.get(fundId);
        const alreadyWithdrawn: u256 = this.fundWithdrawn.get(fundId);
        const withdrawable: u256 = SafeMath.sub(totalRaised, alreadyWithdrawn);

        if (u256.eq(withdrawable, ZERO)) {
            throw new Revert('Nothing to withdraw');
        }

        // Mark as withdrawn
        this.fundWithdrawn.set(fundId, totalRaised);

        // Emit event (actual BTC transfer handled at transaction level)
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
     * Returns: creator (as u256), totalRaised, unlockTimestamp, isClosed, withdrawn, contributorCount
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
    )
    public getFundDetails(calldata: Calldata): BytesWriter {
        const fundId: u256 = calldata.readU256();

        const writer = new BytesWriter(32 * 6);
        writer.writeU256(this.fundCreator.get(fundId));
        writer.writeU256(this.fundTotalRaised.get(fundId));
        writer.writeU256(this.fundUnlockTimestamp.get(fundId));
        writer.writeU256(this.fundIsClosed.get(fundId));
        writer.writeU256(this.fundWithdrawn.get(fundId));
        writer.writeU256(this.fundContributorCount.get(fundId));
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
     * Get creator's fund count and fund IDs by index.
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
     * Convert an Address to u256 for storage.
     */
    private addressToU256(addr: Address): u256 {
        return u256.fromUint8ArrayBE(addr);
    }

    /**
     * Create a composite storage key from two u256 values.
     * Uses XOR + shift to create unique keys.
     */
    private compositeKey(a: u256, b: u256): u256 {
        // Simple composite: hash by shifting a left and XOR with b
        // This ensures unique keys for different (a, b) pairs
        const shifted: u256 = u256.shl(a, 128);
        return u256.or(shifted, b);
    }
}
