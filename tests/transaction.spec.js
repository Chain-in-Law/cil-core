const {describe, it} = require('mocha');
const {assert} = require('chai');
const debug = require('debug')('transaction:');

const txPayload = {
    nonce: 20,
    gasLimit: 102,
    gasPrice: 21,
    to: '43543543525454',
    value: 1200,
    extField: 'extFieldextFieldextField'
};

let keyPair;
let privateKey;
let publicKey;

factory = require('./testFactory');

describe('Transaction tests', () => {
    before(async function() {
        await factory.asyncLoad();
        keyPair = factory.Crypto.createKeyPair();
        privateKey = keyPair.getPrivate();
        publicKey = keyPair.getPublic();
    });
    // it('should restore the correct public key from the signature', async () => {
    //     for (let i = 1; i <= 1000; i++) {
    //         const countBytes = Math.round(Math.random() * (8192 - 1) + 1);
    //         const buff = factory.Crypto.randomBytes(countBytes);
    //         const buffHash = factory.Crypto.createHash(buff);
    //         const { signature, recoveryParam } = factory.Crypto.sign(buffHash, privateKey, undefined, undefined, true);

    //         const recoveredPublicKey = factory.Crypto.recoverPubKey(buffHash, signature, recoveryParam);
    //         assert.equal(recoveredPublicKey.encode('hex', true), publicKey);
    //     }
    // });

    // it('should be a valid signature', async () => {
    //     for (let i = 1; i <= 1000; i++) {
    //         const countBytes = Math.round(Math.random() * (8192 - 1) + 1);
    //         const buff = factory.Crypto.randomBytes(countBytes);
    //         const buffHash = factory.Crypto.createHash(buff);
    //         const { signature, recoveryParam } = factory.Crypto.sign(buffHash, privateKey, undefined, undefined, true);

    //         const recoveredPublicKey = factory.Crypto.recoverPubKey(buffHash, signature, recoveryParam);

    //         assert.equal(factory.Crypto.verify(buffHash, signature, recoveredPublicKey), true, 'Signature is not valid');
    //     }
    // });

    it('should create transaction', async () => {
        const tr = new factory.Transaction({payload: txPayload});
        assert.exists(tr);
        assert.isOk(tr);
    });
    it('should exist transactions signature', async () => {
        const tr = new factory.Transaction({payload: txPayload});
        tr.sign(privateKey);
        assert.exists(tr.signature);
        assert.isOk(tr.signature);
    });
    it('should create transactions hash', async () => {
        const tr = new factory.Transaction({payload: txPayload});
        tr.sign(privateKey);
        const transactionHash = tr.encode();
        assert.isOk(tr);
        assert.isOk(transactionHash);
    });
    it('should recover public key from signature', async () => {
        const tr = new factory.Transaction({payload: txPayload});
        tr.sign(privateKey);
        assert.isOk(tr);
        assert.isOk(tr.publicKey);
    });
    it('should be equality recovered public key generated public key', async () => {
        const tr = new factory.Transaction({payload: txPayload});
        tr.sign(privateKey);
        assert.isOk(tr);
        assert.isOk(tr.publicKey);
        assert.equal(tr.publicKey, publicKey);
    });
    it('should deserialize transaction', async () => {
        const tr = new factory.Transaction({payload: txPayload});
        tr.sign(privateKey);
        const transactionBuffer = tr.encode();
        const deserializedTr = new factory.Transaction(transactionBuffer);
        assert.isOk(deserializedTr);
    });
    it('should PASS verification', async () => {
        const tr = new factory.Transaction({payload: txPayload});
        tr.sign(privateKey);
        const deserializedTr = new factory.Transaction(tr.encode());
        assert.isOk(deserializedTr.verifySignature());
    });
    it('should FAIL verification', async () => {
        const tr = new factory.Transaction({payload: txPayload});
        tr.sign(privateKey);
        let deserializedTr = new factory.Transaction(tr.encode());
        deserializedTr.payload.nonce = 22;
        assert.isNotOk(deserializedTr.verifySignature());
    });
});
