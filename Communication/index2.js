const { Receiver } = require("../Muxer");
const createMap = require("./helpers/arrayMap");

const CHANNEL_STATE = {
    READ_RESOURCE: 0,
    DATA: 1
};

const createServer = () => {
    let _connections = [];
    let _queryHandlers = createMap();

    return {
        connect: (connection) => {
            const connectionObject = { };
            _connections = [..._connections, connectionObject];

            const receiver = Receiver();
            connection.on('data', receiver.feed);
            connection.on('disconnect', () => {
                _connections = _connections.filter(x => x !== connectionObject);
            });

            connectionObject.channels = createMap();
            receiver.on('data', (channelId, data) => {
                const channel = connectionObject.channels.getOrCreate(channelId, () => ({
                    state: CHANNEL_STATE.READ_RESOURCE,
                    stateData: []
                }));

                if(channel.state === CHANNEL_STATE.READ_RESOURCE) {
                    let i = 0;
                    let finished = false;
                    while(i < data.length) {
                        if(data[i] === 0) {
                            finished = true;
                            break;
                        }
                        i++;
                    }
                    channel.stateData = [...channel.stateData, data.slice(0, i)];
                    
                    if(finished) {
                        channel.state = CHANNEL_STATE.DATA;
                        channel.stateData = null;
                        // open query
                    }
                }
            });

            connectionObject.api = {

            };
        },
        get connections() {
            return Array.from(_connections);
        },
        query: (name, handler) => {
            const nameBuf = Buffer.from(name);
            if(_queryHandlers.exists(nameBuf))
                throw "Query handler already exists";
            _queryHandlers.set(nameBuf, handler);
        }
    };
};

createServer.createConnection = () => {
    let _dataHandler = [];
    let _disconnectHandler = [];
    return {
        on: (name, handler) => {
            if(name == "data")
                _dataHandler = [..._dataHandler, handler];
            if(name == "disconnect")
                _disconnectHandler = [..._disconnectHandler, handler];
        },
        off: (name, handler) => {
            if(name == "data")
                _dataHandler = _dataHandler.filter(x => x !== handler);
            if(name == "disconnect")
                _disconnectHandler = _disconnectHandler.filter(x => x !== handler);
        },
        data: (data) => {
            for(const handler of _dataHandler)
                handler(data);
        },
        disconnect: () => {
            for(const handler of _disconnectHandler)
                handler();
        }
    }
}

module.exports = createServer;