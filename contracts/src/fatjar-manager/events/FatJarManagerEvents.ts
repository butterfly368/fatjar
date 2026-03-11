import { u256 } from '@btc-vision/as-bignum/assembly';
import {
    Address,
    ADDRESS_BYTE_LENGTH,
    BytesWriter,
    NetEvent,
    U256_BYTE_LENGTH,
} from '@btc-vision/btc-runtime/runtime';

/**
 * Emitted when a new fund (jar) is created.
 * S2: Includes fund name so frontend can index it off-chain.
 * I2: Uses u256 for unlockTimestamp to match stored type.
 */
@final
export class FundCreatedEvent extends NetEvent {
    constructor(fundId: u256, creator: Address, unlockTimestamp: u256, goalAmount: u256, beneficiary: Address) {
        const data: BytesWriter = new BytesWriter(
            U256_BYTE_LENGTH + ADDRESS_BYTE_LENGTH + U256_BYTE_LENGTH * 2 + ADDRESS_BYTE_LENGTH,
        );
        data.writeU256(fundId);
        data.writeAddress(creator);
        data.writeU256(unlockTimestamp);
        data.writeU256(goalAmount);
        data.writeAddress(beneficiary);

        super('FundCreated', data);
    }
}

/**
 * Emitted when someone contributes to a fund.
 */
@final
export class ContributionEvent extends NetEvent {
    constructor(fundId: u256, contributor: Address, satoshis: u256, tokensMinted: u256) {
        const data: BytesWriter = new BytesWriter(
            U256_BYTE_LENGTH + ADDRESS_BYTE_LENGTH + U256_BYTE_LENGTH * 2,
        );
        data.writeU256(fundId);
        data.writeAddress(contributor);
        data.writeU256(satoshis);
        data.writeU256(tokensMinted);

        super('Contribution', data);
    }
}

/**
 * Emitted when the fund creator withdraws BTC.
 */
@final
export class WithdrawalEvent extends NetEvent {
    constructor(fundId: u256, creator: Address, netAmount: u256, fee: u256) {
        const data: BytesWriter = new BytesWriter(
            U256_BYTE_LENGTH + ADDRESS_BYTE_LENGTH + U256_BYTE_LENGTH * 2,
        );
        data.writeU256(fundId);
        data.writeAddress(creator);
        data.writeU256(netAmount);
        data.writeU256(fee);

        super('Withdrawal', data);
    }
}

/**
 * Emitted when a fund is deleted by its creator (no contributions).
 */
@final
export class FundDeletedEvent extends NetEvent {
    constructor(fundId: u256, creator: Address) {
        const data: BytesWriter = new BytesWriter(
            U256_BYTE_LENGTH + ADDRESS_BYTE_LENGTH,
        );
        data.writeU256(fundId);
        data.writeAddress(creator);

        super('FundDeleted', data);
    }
}

/**
 * Emitted when a fund is closed by its creator.
 */
@final
export class FundClosedEvent extends NetEvent {
    constructor(fundId: u256, creator: Address) {
        const data: BytesWriter = new BytesWriter(
            U256_BYTE_LENGTH + ADDRESS_BYTE_LENGTH,
        );
        data.writeU256(fundId);
        data.writeAddress(creator);

        super('FundClosed', data);
    }
}

/**
 * Emitted when a contributor refunds from a failed goal-based vault.
 */
@final
export class RefundEvent extends NetEvent {
    constructor(fundId: u256, contributor: Address, satoshis: u256, tokensBurned: u256) {
        const data: BytesWriter = new BytesWriter(
            U256_BYTE_LENGTH + ADDRESS_BYTE_LENGTH + U256_BYTE_LENGTH * 2,
        );
        data.writeU256(fundId);
        data.writeAddress(contributor);
        data.writeU256(satoshis);
        data.writeU256(tokensBurned);

        super('Refund', data);
    }
}
