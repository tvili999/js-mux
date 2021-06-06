const createChannels = require("./channels");
const createConnections = require("./connections");
const createQueries = require("./queries");
const createRequests = require("./requests");

const createServer = () => {
    const _queries = createQueries();

    const _connections = createConnections();
    _connections.on("connect", connection => {
        connection.channels = createChannels(connection);
        connection.requests = createRequests(connection);
        connection.exports = {
            openUpstream: (name) => {
                return connection.channels.open({
                    query: name,
                    sessionId: 0,
                    messageType: 0
                });
            },
            publish: (name, data) =>{
                const stream = connection.exports.openUpstream(name);
                stream.send(data);
                stream.close();
            },
            openRequest: (name) => {
                return connection.requests.open({ query: name });
            },
            request: (name, data) => {
                const request = connection.exports.openRequest(name);
                const response = new Promise(resolve => {
                    request.on('response', async responseStream => {
                        resolve(await responseStream.readAll());
                    })
                });
                request.send(data);
                request.close();
                return response;
            }
        };
        connection.channels.on("connect", channel => {
            if(channel.messageType == "REQUEST") {
                connection.requests.request(channel);
                _queries.connect(channel, connection.exports);
            }

            if(channel.messageType == "RESPONSE")
                connection.requests.response(channel);

            if(channel.messageType == "DOWNSTREAM")
                _queries.connect(channel, connection.exports);
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