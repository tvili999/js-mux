const createChannels = require("./channels");
const createConnections = require("./connections");
const createQueries = require("./queries");

const createServer = () => {
    const _queries = createQueries();

    const _connections = createConnections();
    _connections.on("connect", connection => {
        connection.channels = createChannels(connection);
        connection.channels.on("connect", channel => {
            const queryHandler = _queries.get(channel.query);
            if(!queryHandler)
                return;

            queryHandler(connection.exports, channel);
        })
    });
    _connections.on("disconnect", connection => connection.channels.disconnect());

    return {
        connect: _connections.connect,
        disconnect: _connections.disconnect,
        get connections() {
            return _connections.connections;
        },
        query: (name, handler) => {
            _queries.query(name, handler);
        }
    };
};

module.exports = createServer;