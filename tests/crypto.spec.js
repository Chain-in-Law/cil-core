const {describe, it} = require('mocha');
const {assert} = require('chai');

const Crypto = require('../crypto/crypto');

describe('Crypto library', () => {
    before(async function() {
        this.timeout(15000);
    });

    after(async function() {
        this.timeout(15000);
    });

    it('create KeyPair from private key (hex)', async () => {
        const strPrivKey = 'b7760a01705490e5e153a6ef7732369a72dbf9aaafb5c482cdfd960546909ec1';
        const strPublicKey = '03ee7b7818bdc27be0030c2edf44ec1cce20c1f7561fc8412e467320b77e20f716';
        const address = '100966b8535d47ef4c5cc5a02d81873c071289be';
        const keyPair = Crypto.keyPairFromPrivate(strPrivKey, 'hex');

        assert.equal(strPrivKey, keyPair.getPrivate());
        assert.equal(address, Crypto.getAddress(keyPair.getPublic()));
        assert.equal(strPublicKey, keyPair.getPublic());
    });

    it('create same signature with key as hex and BN', async () => {
        const keyPair = Crypto.createKeyPair();

        const buffSignature1 = Crypto.sign('string', keyPair.getPrivate(), 'hex');
        const buffSignature2 = Crypto.sign('string', keyPair.getPrivate(), 'hex');
        assert.isOk(buffSignature1.equals(buffSignature2));
    });

    it('sign & verify string', async () => {
        const keyPair = Crypto.createKeyPair();

        const buffSignature = Crypto.sign('string', keyPair.getPrivate(), 'hex');
        assert.isOk(Crypto.verify('string', buffSignature, keyPair.getPublic(), 'hex'));
    });

    it('encrypt/decrypt key', async () => {
        const keyPair = Crypto.createKeyPair();
        const strPrivKey = keyPair.getPrivate();
        const encryptedKey = (await Crypto.encrypt(
            '234',
            Buffer.from(strPrivKey, 'hex')
        )).toString('base64');

        const decryptedKey = await Crypto.decrypt('234', encryptedKey);
        assert.equal(strPrivKey, decryptedKey.toString('hex'));
    });
});
