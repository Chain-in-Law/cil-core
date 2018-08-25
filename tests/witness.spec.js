const {describe, it} = require('mocha');
const {assert} = require('chai');
const sinon = require('sinon');
const debug = require('debug')('witness:');

factory = require('./testFactory');

let wallet;

const createDummyPeer = (pubkey = 'pubkey1', address = factory.Transport.generateAddress()) =>
    new factory.Peer({
        peerInfo: {
            capabilities: [
                {service: factory.Constants.NODE, data: null},
                {service: factory.Constants.WITNESS, data: Buffer.from(pubkey)}
            ],
            address
        }
    });

const createDummyPeerInfo = (pubkey, address) => createDummyPeer(pubkey, address).peerInfo;

describe('Witness tests', () => {
    before(async function() {
        this.timeout(15000);
        await factory.asyncLoad();

        wallet = new factory.Wallet('b7760a01705490e5e153a6ef7732369a72dbf9aaafb5c482cdfd960546909ec1');
    });

    after(async function() {
        this.timeout(15000);
    });

    it('should NOT create witness', async () => {
        const wrapper = () => new factory.Witness();
        assert.throws(wrapper);
    });

    it('should create witness', function() {
        new factory.Witness({wallet});
    });

    it('should get my group from pubKey', async () => {
        const groupName = 'test';

        // this is parameter for testStorage only!
        const arrTestDefinition = [
            [groupName, [wallet.publicKey, 'pubkey1', 'pubkey2']],
            ['anotherGroup', ['pubkey3', 'pubkey4']]
        ];
        const witness = new factory.Witness({wallet, arrTestDefinition});
        const result = await witness._getMyGroups();
        assert.isOk(Array.isArray(result));
        assert.equal(result.length, 1);
        assert.equal(result[0], groupName);
    });

    it('should get peers for my group', async () => {
        const groupName = 'test';
        const arrTestDefinition = [
            [groupName, [wallet.publicKey, Buffer.from('pubkey1'), Buffer.from('pubkey2')]],
            ['anotherGroup', [Buffer.from('pubkey3'), Buffer.from('pubkey4')]]
        ];
        const witness = new factory.Witness({wallet, arrTestDefinition});

        const peer1 = createDummyPeer('pubkey1');
        const peer2 = createDummyPeer('notWitness1');
        const peer3 = createDummyPeer('1111');
        const peer4 = createDummyPeer('pubkey2');
        [peer1, peer2, peer3, peer4].forEach(peer => witness._peerManager.addPeer(peer));

        const result = await witness._getGroupPeers(groupName);
        assert.isOk(Array.isArray(result));
        assert.equal(result.length, 2);
    });

    it('should reject message with wrong signature prom peer', async () => {
        const groupName = 'test';

        // mock peer with public key from group
        const peer = createDummyPeer();

        const arrTestDefinition = [
            ['test', ['pubkey1', 'pubkey2']]
        ];

        // create witness
        const witness = new factory.Witness({wallet, arrTestDefinition});
        await witness._createConsensusForGroup(groupName);

        const wrapper = () => witness._checkPeerAndMessage(peer, undefined);
        assert.throws(wrapper);
    });

    it('should create and broadcast block', async () => {
        const groupName = 'test';
        const arrTestDefinition = [
            [groupName, [wallet.publicKey, Buffer.from('pubkey1'), Buffer.from('pubkey2')]],
            ['anotherGroup', [Buffer.from('pubkey3'), Buffer.from('pubkey4')]]
        ];
        const witness = new factory.Witness({wallet, arrTestDefinition});
        const broadcast = witness._peerManager.broadcastToConnected = sinon.fake();

        witness._createAndBroadcastBlock(groupName);

        assert.isOk(broadcast.calledOnce);
        const [group, msg] = broadcast.args[0];
        assert.equal(group, groupName);
        assert.isOk(msg.isWitnessBlock());
    });
});
