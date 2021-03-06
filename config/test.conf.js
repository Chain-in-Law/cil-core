module.exports = {

    // some of constants will be injected from prototypes in Factory!
    constants: {
        network: 0x12882304,
        protocolVersion: 0x0123,
        port: 8223,

        // How many peers we'll send in one 'addr' message
        ADDR_MAX_LENGTH: 1000,

        // maximum connected peers
        MAX_PEERS: 10,

        // milliseconds
        PEER_QUERY_TIMEOUT: 30000,
        CONNECTION_TIMEOUT: 60000,

        // 3 hours
        PEER_DEAD_TIME: 3 * 3600 * 1000,

        // 1 day
        BAN_PEER_SCORE: 100,
        BAN_PEER_TIME: 24 * 60 * 60 * 1000,

        messageTypes: {
            MSG_VERSION: 'version',
            MSG_VERACK: 'verack',
            MSG_GET_ADDR: 'getaddr',
            MSG_ADDR: 'addr',
            MSG_REJECT: 'reject',
            MSG_BLOCK: 'block',
            MSG_TX: 'tx',
            MSG_INV: 'inv',
            MSG_GET_DATA: 'getdata',

            MSG_WITNESS_HANDSHAKE: 'w_handshake',
            MSG_WITNESS_NEXT_ROUND: 'w_nextround',
            MSG_WITNESS_EXPOSE: 'w_expose',
            MSG_WITNESS_BLOCK: 'w_block',
            MSG_WITNESS_BLOCK_ACK: 'w_block_ack',
            MSG_WITNESS_BLOCK_REJECT: 'w_block_rej'
        },

        consensusStates: {
            ROUND_CHANGE: 'ROUND_CHANGE',
            BLOCK: 'BLOCK',
            VOTE_BLOCK: 'VOTE_BLOCK',
            COMMIT: 'COMMIT'
        },

        consensusTimeouts: {
            ROUND_CHANGE: 10000,
            BLOCK: 20000,
            VOTE_BLOCK: 10000,
            COMMIT: 20000
        },

        // maximum time offset for nodes we tolerate
        networkTimeDiff: 60 * 60 * 1000,

        MAX_BLOCK_SIZE: 1024,
        MIN_TX_FEE: 1000
    }
};
