const createChannels = require("./channels");
const createConnections = require("./connections");
const createQueries = require("./queries");
const createSessions = require("./sessions");

const createServer = () => {
    const _queries = createQueries();

    const _connections = createConnections();
    _connections.on("connect", connection => {
        connection.channels = createChannels(connection);
        connection.sessions = createSessions();
        connection.exports = {
            query: (data) => {
                const channel = connection.channels.open();
                return connection.channels.send(data);
            }
        };
        connection.channels.on("connect", channel => {
            if(channel.messageType == "PUBLISH" || channel.messageType == "QUESTION")
                _queries.connect(channel, connection.exports);
            if(channel.messageType == "ANSWER") {
                
            }
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