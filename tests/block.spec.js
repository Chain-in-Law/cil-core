'use strict';

const {describe, it} = require('mocha');
const {assert} = require('chai');
const debug = require('debug')('block:');

const factory = require('./testFactory');

const createDummyTx = () => ({
    payload: {
        nonce: parseInt(Math.random() * 1000),
        gasLimit: parseInt(Math.random() * 1000),
        gasPrice: parseInt(Math.random() * 100),
        to: '43543543525454',
        value: parseInt(Math.random() * 1000),
        extField: 'extFieldextFieldextField'
    }
});

describe('Block tests', () => {
    before(async function() {
        await factory.asyncLoad();
    });

    it('should create block', async () => {
        const wrapper = () => new factory.Block();
        assert.doesNotThrow(wrapper);
    });

    it('should add tx', async () => {
        const block = new factory.Block();
        const tx = new factory.Transaction(createDummyTx());

        block.addTx(tx);
        assert.isOk(Array.isArray(block.txns));
        assert.equal(block.txns.length, 1);
    });

    it('should calc hash', async () => {
        const block = new factory.Block();
        const keyPair = factory.Crypto.createKeyPair();
        const tx = new factory.Transaction(createDummyTx());
        tx.sign(keyPair.privateKey);

        block.addTx(tx);
        debug(block.hash);
        assert.isOk(block.hash);
        assert.equal(block.hash, block.hash);

        const anotherBlock = new factory.Block();
        const anotherTx = new factory.Transaction(createDummyTx());
        anotherTx.sign(keyPair.privateKey);
        anotherBlock.addTx(anotherTx);
        debug(anotherBlock.hash);
        assert.notEqual(block.hash, anotherBlock.hash);
    });

    it('should encode/decode', async () => {
        const block = new factory.Block();
        const keyPair = factory.Crypto.createKeyPair();
        const tx = new factory.Transaction(createDummyTx());
        tx.sign(keyPair.privateKey);

        block.addTx(tx);
        const buffBlock = block.encode();
        assert.isOk(Buffer.isBuffer(buffBlock));

        const restoredBlock = new factory.Block(buffBlock);
        assert.equal(block.hash, restoredBlock.hash);
        assert.isOk(Array.isArray(restoredBlock.txns));
        assert.equal(restoredBlock.txns.length, 1);

        // get rid of __proto__ that makes them diffrent
        assert.deepEqual(Object.assign({}, restoredBlock.txns[0].payload), Object.assign({}, tx.rawData.payload));
        assert.isOk(restoredBlock.txns[0].signature.equals(tx.rawData.signature));
    });

});
