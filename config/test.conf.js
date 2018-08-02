module.exports = {

    // some of constants will be injected from prototypes in Factory!
    constants: {
        network: 0x12882304,
        protocolVersion: 0x01,
        port: 8223,

        // maximum connected peers
        MAX_PEERS: 10,

        // milliseconds
        PEER_QUERY_TIMEOUT: 3000,
        CONNECTION_TIMEOUT: 1000,

        // 3 hours
        PEER_DEAD_TIME: 3 * 3600 * 1000
    }
};
