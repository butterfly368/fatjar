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
    constructor(fundId: u256, creator: Address, unlockTimestamp: u256) {
        const data: BytesWriter = new BytesWriter(
            U256_BYTE_LENGTH + ADDRESS_BYTE_LENGTH + U256_BYTE_LENGTH,
        );
        data.writeU256(fundId);
        data.writeAddress(creator);
        data.writeU256(unlockTimestamp);

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
    constructor(fundId: u256, creator: Address, satoshis: u256) {
        const data: BytesWriter = new BytesWriter(
            U256_BYTE_LENGTH + ADDRESS_BYTE_LENGTH + U256_BYTE_LENGTH,
        );
        data.writeU256(fundId);
        data.writeAddress(creator);
        data.writeU256(satoshis);

        super('Withdrawal', data);
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
