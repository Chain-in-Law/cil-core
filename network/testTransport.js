const EventEmitter = require('events');
const uuid = require('node-uuid');
const net = require('net');
const path = require('path');
const debug = require('debug')('transport:');

const {sleep} = require('../utils');
const TestConnectionWrapper = require('./testConnection');

/**
 * Это тестовый транспорт
 * Может эмулировать задержку через options.delay
 */


const EventBus = new EventEmitter();

module.exports = (SerializerImplementation, Constants) => {

    const TestConnection = TestConnectionWrapper(SerializerImplementation, Constants);
    return class TestTransport extends EventEmitter {

        /**
         *
         * @param {Object} options
         * @param {Number} options.delay
         */
        constructor(options) {
            super();

            this._delay = options.delay !== undefined ? options.delay : parseInt(Math.random() * 10 * 1000);
            this._timeout = options.timeout || Constants.CONNECTION_TIMEOUT;

            // here should be some public address @see os.networkInterfaces
            this._address = options.listenAddr || uuid.v4();
            this._port = options.listenPort || Constants.port;
        }

        get myAddress() {
            if (!this._cachedAddr) {
                this._cachedAddr = this.constructor.addressToBuffer(this._address);
            }
            return this._cachedAddr;
        }

        get strAddress() {
            return this._address;
        }

        /**
         * Return at least 16 bytes (length of ipv6 address) buffer created from address
         * If needed it will be padded with 0 from start
         * Will be replaced with real ipv6 buffer
         *
         * @param {String} address
         * @return {Buffer}
         */
        static addressToBuffer(address) {
            const buffer = Buffer.from(address);
            const bytestoPadd = buffer.length > 16 ? 0 : 16 - buffer.length;
            return bytestoPadd ? Buffer.concat([Buffer.alloc(bytestoPadd), buffer]) : buffer;
        }

        static addressFromBuffer(buffer) {
            let i = 0;

            // skip leading 0
            for (; i < buffer.length && !buffer[i]; i++) {}
            return buffer.toString('utf8', i);
        }

        static isPrivateAddress(address) {
            return false;
        }

        /**
         * split name by ':'
         *
         * @param name
         * @return {Promise<*|string[]>}
         */
        static async resolveName(name) {
            return name.split(':');
        }

        /**
         * @param {String | Buffer} address - строка которую будем использовать в отдельного топика в EventEmitter
         * @return {Promise<TestConnection>} new connection
         */
        connect(address) {
            if (Buffer.isBuffer(address)) address = this.constructor.addressFromBuffer(address);

            return new Promise((resolve, reject) => {
                const socket = net.createConnection(path.join('\\\\?\\pipe', process.cwd(), address),
                    async (err) => {
                        if (err) return reject(err);
                        if (this._delay) await sleep(this._delay);
                        resolve(new TestConnection({delay: this._delay, socket, timeout: this._timeout}));
                    }
                );
                socket.on('error', err => reject(err));
            });
        }

        /**
         * Emit 'connect' with new Connection
         *
         */
        listen() {

            // TODO: use port
            net.createServer(async (socket) => {
                if (this._delay) await sleep(this._delay);
                this.emit('connect',
                    new TestConnection({delay: this._delay, socket, timeout: this._timeout})
                );
            }).listen(path.join('\\\\?\\pipe', process.cwd(), this._address));
        }

        /**
         * Emulate Sync version on listen
         * Useful on tests
         *
         * @return {Promise<TestConnection>} new connection
         */
        listenSync() {
            const prom = new Promise(resolve => {
                this.listen();
                this.once('connect', connection => resolve(connection));
            });
            return Promise.race([prom, sleep(this._timeout)]);
        }

        cleanUp() {
            EventBus.removeAllListeners(this._address);
        }
    };
};
