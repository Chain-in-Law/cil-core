'use strict';

const {describe, it} = require('mocha');
const {assert} = require('chai');
const debug = require('debug')('storage:test');

const factory = require('./testFactory');
const {createDummyTx, pseudoRandomBuffer} = require('./testUtil');

describe('Storage tests', () => {
    before(async function() {
        await factory.asyncLoad();
    });

    it('should create storage', async () => {
        const wrapper = () => new factory.Storage({});
        assert.doesNotThrow(wrapper);
    });

    it('should save block', async () => {
        const block = new factory.Block();
        const tx = new factory.Transaction(createDummyTx());
        block.addTx(tx);

        const storage = new factory.Storage({});
        await storage.saveBlock(block);
    });

    it('should find block in storage', async () => {
        const block = new factory.Block();
        const tx = new factory.Transaction(createDummyTx());
        block.addTx(tx);

        const storage = new factory.Storage({});
        await storage.saveBlock(block);

        assert.isOk(await storage.hasBlock(block.hash()));
    });

    it('should THROWS find block in storage (param check failed)', async () => {
        const storage = new factory.Storage({});

        try {
            await storage.hasBlock('133');
        } catch (e) {
            return;
        }
        throw ('Unexpected success');
    });

    it('should NOT find block in storage', async () => {
        const storage = new factory.Storage({});
        assert.isNotOk(await storage.hasBlock(Buffer.allocUnsafe(32)));
    });

    it('should NOT find block in storage', async () => {
        const storage = new factory.Storage({});
        assert.isNotOk(await storage.hasBlock(Buffer.allocUnsafe(32).toString('hex')));
    });

    it('should get saved block', async () => {
        const block = new factory.Block();
        const tx = new factory.Transaction(createDummyTx());
        block.addTx(tx);

        const storage = new factory.Storage({});
        await storage.saveBlock(block);

        const gotBlock = await storage.getBlock(block.hash());

        assert.isOk(gotBlock.txns);
        const rTx = new factory.Transaction(gotBlock.txns[0]);
        assert.isOk(rTx.equals(tx));
    });

    it('should apply "addCoins" patch to empty storage (like genezis)', async () => {
        const storage = new factory.Storage({});

        const patch = new factory.PatchDB();
        const txHash = pseudoRandomBuffer();
        const coins = new factory.Coins(100, pseudoRandomBuffer(17));
        patch.createCoins(txHash, 12, coins);
        patch.createCoins(txHash, 0, coins);
        patch.createCoins(txHash, 80, coins);

        const txHash2 = pseudoRandomBuffer();
        const coins2 = new factory.Coins(200, pseudoRandomBuffer(17));
        patch.createCoins(txHash2, 22, coins2);

        await storage.applyPatch(patch);

        const utxo1 = await storage.getUtxo(txHash);
        assert.isOk(utxo1);
        assert.isOk(utxo1.coinsAtIndex(12));

        const utxo2 = await storage.getUtxo(txHash2);
        assert.isOk(utxo2);
        assert.isOk(utxo2.coinsAtIndex(22));
    });

});
