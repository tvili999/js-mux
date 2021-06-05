const createEvents = require("../helpers/events");

const createConnections = () => {
    let _connections = [];
    const _events = createEvents();

    const api = {
        connect: (connection) => {
            const connectionObject = { connection };
            _connections = [..._connections, connectionObject];

            _events.fire('connect', connectionObject);

            connection.on('disconnect', () => {
                api.disconnect(connection);
            });
        },
        disconnect: (connection) => {
            const connectionObject = _connections.find(x => x?.connection === connection);
            if(!connectionObject)
                return;

            _events.fire('disconnect', connectionObject);
            _connections = _connections.filter(x => x !== connectionObject);
        },
        get connections() {
            return Array.from(_connections);
        },
        ..._events.exports
    };

    return api;
}

createConnections.createConnection = () => {
    let _events = createEvents();
    return {
        data: (data) => _events.fire("data", data),
        disconnect: () => _events.fire("disconnect"),
        ..._events.exports
    }
};

module.exports = createConnections;