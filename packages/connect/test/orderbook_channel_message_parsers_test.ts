import 'mocha';
import * as dirtyChai from 'dirty-chai';
import * as chai from 'chai';
import {orderbookChannelMessageParsers} from '../src/utils/orderbook_channel_message_parsers';
import {
    snapshotOrderbookChannelMessage,
    malformedSnapshotOrderbookChannelMessage,
} from './fixtures/standard_relayer_api/snapshot_orderbook_channel_message';
import {
    updateOrderbookChannelMessage,
    malformedUpdateOrderbookChannelMessage,
} from './fixtures/standard_relayer_api/update_orderbook_channel_message';
import {unknownOrderbookChannelMessage} from './fixtures/standard_relayer_api/unknown_orderbook_channel_message';
import {orderbookResponse} from './fixtures/standard_relayer_api/orderbook';
// tslint:disable-next-line:max-line-length
import {orderResponse} from './fixtures/standard_relayer_api/order/0xabc67323774bdbd24d94f977fa9ac94a50f016026fd13f42990861238897721f';

chai.config.includeStack = true;
chai.use(dirtyChai);
const expect = chai.expect;

describe('orderbookChannelMessageParsers', () => {
    describe('#parser', () => {
        it('parses snapshot messages', () => {
            const snapshotMessage = orderbookChannelMessageParsers.parser(snapshotOrderbookChannelMessage);
            expect(snapshotMessage.type).to.be.equal('snapshot');
            expect(snapshotMessage.payload).to.be.deep.equal(orderbookResponse);
        });
        it('parses update messages', () => {
            const updateMessage = orderbookChannelMessageParsers.parser(updateOrderbookChannelMessage);
            expect(updateMessage.type).to.be.equal('update');
            expect(updateMessage.payload).to.be.deep.equal(orderResponse);
        });
        it('returns unknown message for messages with unsupported types', () => {
            const unknownMessage = orderbookChannelMessageParsers.parser(unknownOrderbookChannelMessage);
            expect(unknownMessage.type).to.be.equal('unknown');
            expect(unknownMessage.payload).to.be.undefined();
        });
        it('throws when message does not include a type', () => {
            const typelessMessage = `{
                "channel": "orderbook",
                "channelId": 1,
                "payload": {}
            }`;
            const badCall = () => orderbookChannelMessageParsers.parser(typelessMessage);
            expect(badCall).throws(`Message is missing a type parameter: ${typelessMessage}`);
        });
        it('throws when snapshot message has malformed payload', () => {
            const badCall = () =>
                orderbookChannelMessageParsers.parser(malformedSnapshotOrderbookChannelMessage);
            // tslint:disable-next-line:max-line-length
            const errMsg = 'Validation errors: instance.payload requires property "bids", instance.payload requires property "asks"';
            expect(badCall).throws(errMsg);
        });
        it('throws when update message has malformed payload', () => {
            const badCall = () =>
                orderbookChannelMessageParsers.parser(malformedUpdateOrderbookChannelMessage);
            expect(badCall).throws(/^Expected message to conform to schema/);
        });
        it('throws when input message is not valid JSON', () => {
            const nonJsonString = 'h93b{sdfs9fsd f';
            const badCall = () => orderbookChannelMessageParsers.parser(nonJsonString);
            expect(badCall).throws('Unexpected token h in JSON at position 0');
        });
    });
});
