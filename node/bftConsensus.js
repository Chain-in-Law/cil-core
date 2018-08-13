'use strict';

module.exports = Crypto =>
    class BftConsensus {
        /**
         *
         * @param {String} options.group
         * @param {Array} options.arrPublicKeys
         * @param {Wallet} options.wallet
         */
        constructor(options) {
            const {group, arrPublicKeys, wallet} = options;
            this._group = group;
            this._wallet = wallet;

            this._arrPublicKeys = arrPublicKeys.sort();
            this._quorum = parseInt(arrPublicKeys.length / 2) + 1;
        }

        get quorum() {
            return this._quorum;
        }

        /**
         * reset state
         *
         * @private
         */
        _resetState() {
            this._views = {};
            this._arrPublicKeys.forEach(publicKey => {

                // prepare empty array for data transmitted of publicKey
                this._views[publicKey] = {};
            });
            this._round++;
        }

        /**
         * VERIFY SIGNATURE of dataI !!!
         *
         * @param {String} publicKey - who send us partial response of i neighbor
         * @param {String} pubKeyI - pubKey of i neighbor
         * @param {Object} dataI - object that send i neighbor to address node
         * @private
         */
        _addViewOfNodeWithPubKey(publicKey, pubKeyI, dataI) {
            this._views[publicKey][pubKeyI] = dataI;
        }

        /**
         *
         * @return {Object|undefined} - consensus value
         */
        runConsensus() {

            // i'm a single node (for example Initial witness)
            if (this._arrPublicKeys.length === 1 &&
                this._arrPublicKeys[0] === this._wallet.publicKey) {
                return this._views[this._wallet.publicKey][this._wallet.publicKey];
            }

            const arrWitnessValues = this._arrPublicKeys.map(pubKeyI => {

                // Let's get data of I witness
                const arrDataWitnessI = this._arrPublicKeys.map(pubKeyJ => {
                    return this._views[pubKeyJ][pubKeyI];
                });
                return this._majority(arrDataWitnessI);
            });

            return this._majority(arrWitnessValues);
        }

        /**
         *
         * @param {Array} arrDataWitnessI - array of values to find majority
         * @private
         */
        _majority(arrDataWitnessI) {
            const objHashes = {};
            for (let data of arrDataWitnessI) {
                const hash = this._calcDataHash(data);
                if (typeof objHashes[hash] !== 'object') {
                    objHashes[hash] = {
                        count: 1,
                        value: data
                    };
                } else {
                    objHashes[hash].count++;
                }
            }
            let majorityValue = undefined;
            const count = Object.keys(objHashes).reduce((maxCount, currentHash) => {
                if (objHashes[currentHash].count > maxCount) {
                    majorityValue = objHashes[currentHash].value;
                    return objHashes[currentHash].count;
                }
                return maxCount;
            }, 0);

            return count >= this._quorum ? majorityValue : undefined;
        }

        /**
         * Calculate hash of data
         *
         * @param {Object} data
         * @return {String|undefined}
         * @private
         */
        _calcDataHash(data) {
            return data === undefined ? undefined : Crypto.sha256(JSON.stringify(data));
        }

        _commit() {

            // we agreed to commit block, so we'll reset round counter
            this._round = 0;
        }
    };
