import { u256 } from '@btc-vision/as-bignum/assembly';
import {
    Address,
    ADDRESS_BYTE_LENGTH,
    BytesWriter,
    NetEvent,
    U256_BYTE_LENGTH,
} from '@btc-vision/btc-runtime/runtime';

/**
 * Emitted when tokens are minted via contribution.
 */
@final
export class ContributionMintedEvent extends NetEvent {
    constructor(contributor: Address, satoshis: u256, tokensMinted: u256) {
        const data: BytesWriter = new BytesWriter(
            ADDRESS_BYTE_LENGTH + U256_BYTE_LENGTH * 2,
        );
        data.writeAddress(contributor);
        data.writeU256(satoshis);
        data.writeU256(tokensMinted);

        super('ContributionMinted', data);
    }
}
