const {describe, it} = require('mocha');
const {assert} = require('chai');
const sinon = require('sinon');
const debug = require('debug')('peer:');

const {sleep} = require('../utils');

factory = require('./testFactory');

let peerInfo;
let address;
let fakeNode;
let newPeer;

describe('Peer tests', () => {
    before(async function() {
        this.timeout(15000);
        await factory.asyncLoad();
        address = factory.Transport.generateAddress();

        const keyPair = factory.Crypto.createKeyPair();

        peerInfo = new factory.Messages.PeerInfo({
            capabilities: [
                {service: factory.Constants.NODE, data: null},
                {service: factory.Constants.WITNESS, data: Buffer.from(keyPair.getPublic(false), 'hex')}
            ],
            address: factory.Transport.strToAddress(address),
            port: 12345
        });

        fakeNode = new factory.Transport({delay: 0, listenAddr: address});
        fakeNode.listen();
    });

    after(async function() {
        this.timeout(15000);
    });

    it('should NOT create peer without connection or PeerInfo', async () => {
        const wrapper = () => new factory.Peer();
        assert.throws(wrapper);
    });

    it('should create from connection', async () => {
        const newPeer = new factory.Peer({
            connection: {
                on: () => {},
                listenerCount: () => 0
            }
        });
        assert.isOk(newPeer);
        assert.isNotOk(newPeer.disconnected);
    });

    it('should create from peerInfo', async () => {
        const newPeer = new factory.Peer({peerInfo});
        assert.isOk(newPeer);
    });

    it('should connect', async () => {
        newPeer = new factory.Peer({peerInfo});
        assert.isOk(newPeer);

        await newPeer.connect();
        assert.isNotOk(newPeer.disconnected);
        assert.isOk(newPeer._connection);
    });

    it('should emit message upon incoming connection', (done) => {
        newPeer = new factory.Peer({peerInfo});
        assert.isOk(newPeer);

        newPeer.connect().then(() => {
            newPeer.on('message', (peer, msg) => msg === 'test' ? done() : done('Message corrupted'));
            newPeer._connection.emit('message', 'test');
        });
    });

    it('should queue and send messages', async function() {
        this.timeout(5000);
        let nSendMessages = 0;
        const delay = 200;
        const newPeer = new factory.Peer({
            connection: {
                remoteAddress: factory.Transport.strToAddress(factory.Transport.generateAddress()),
                listenerCount: () => 0,
                on: () => {},
                sendMessage: async () => {

                    // emulate network latency
                    await sleep(delay);
                    nSendMessages++;
                }
            }
        });
        for (let i = 0; i < 5; i++) {
            newPeer.pushMessage({message: `testMessage${i}`});
        }
        await sleep(delay * 6);
        assert.equal(nSendMessages, 5);
    });

    it('should NOT ban peer', async () => {
        const newPeer = new factory.Peer({
            connection: {
                listenerCount: () => 0,
                on: () => {}
            }
        });
        assert.isOk(newPeer);
        newPeer.misbehave(1);
        assert.isNotOk(newPeer.banned);
        newPeer.misbehave(10);
        assert.isNotOk(newPeer.banned);
    });

    it('should ban peer', async () => {
        const newPeer = new factory.Peer({
            connection: {
                listenerCount: () => 0,
                on: () => {}, close: () => {}
            }
        });
        assert.isOk(newPeer);
        newPeer.misbehave(1);
        assert.isNotOk(newPeer.banned);
        newPeer.misbehave(factory.Constants.BAN_PEER_SCORE);
        assert.isOk(newPeer.banned);
    });

    it('should get peer public key', async () => {
        const newPeer = new factory.Peer({
            peerInfo: {
                capabilities: [
                    {service: factory.Constants.WITNESS, data: Buffer.from('1111')}
                ],
                address: {addr0: 0x2001, addr1: 0xdb8, addr2: 0x1234, addr3: 0x5}
            }
        });
        assert.isOk(newPeer);
        assert.isOk(newPeer.publicKey);
        assert.equal(newPeer.publicKey, '1111');
    });

    it('should emit empty "witnessMessage" (wrong signature)', async () => {
        const keyPair = factory.Crypto.createKeyPair();

        // create message and sign it with key that doesn't belong to our group
        const msg = new factory.Messages.MsgWitnessCommon({groupName: 'test'});
        msg.handshakeMessage = true;
        msg.sign(keyPair.getPrivate());

        const witnessMessageSpy = sinon.fake();
        const messageSpy = sinon.fake();
        const newPeer = new factory.Peer({peerInfo});
        await newPeer.connect();
        newPeer.on('witnessMessage', witnessMessageSpy);
        newPeer.on('message', messageSpy);
        newPeer._connection.emit('message', msg);

        assert.isOk(witnessMessageSpy.calledOnce);
        assert.isNotOk(messageSpy.called);
    });
});
