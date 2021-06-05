const { Receiver } = require("../../Muxer");
const events = require("../helpers/events");
const createMap = require("../helpers/arrayMap");
const _middlewares = require("./middlewares");

const createChannels = (connectionObject, middlewares) => {
    middlewares = [..._middlewares, ...(middlewares || [])];

    const receiver = Receiver();
    connectionObject.connection.on('data', receiver.feed);

    const _events = events();
    const channels = createMap();

    const getOrCreateChannel = (channelId) => channels.getOrCreate(channelId, () => ({
        id: channelId,
        events: events()
    }));

    receiver.on('open', (channelId) => {
        const channel = getOrCreateChannel(channelId);
        channel.events.on("connect", (...args) => {
            _events.fire("connect", ...args);
        });
    });

    receiver.on('data', (channelId, data) => {
        const channel = getOrCreateChannel(channelId);

        for(const middleware of middlewares) {
            let callNext = false;
            const next = (_data) => {
                if(_data)
                    data = _data;
                callNext = true;
            }

            middleware(channel, data, next);
            if(!callNext)
                break;
        }
    });

    receiver.on('close', (channelId) => {
        const channel = channels.get(channelId);
        if(channel) {
            channel.events.fire("close");
            channels.delete(channelId);
        }
    });

    const api = {
        disconnect: () => {
        },
        ..._events.exports
    };

    return api;
};

module.exports = createChannels;