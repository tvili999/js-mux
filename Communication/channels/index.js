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
        channel.events.on("connect", () => {
            _events.fire("connect", channel.exports);
        });
    });

    receiver.on('data', (channelId, data) => {
        const channel = getOrCreateChannel(channelId);

        for(const middleware of middlewares) {
            const newData = middleware(channel, data);
            if(newData)
                data = newData;
        }
    });

    receiver.on('close', (channelId) => {
        const channel = channels.get(channelId);
        if(channel) {
            channel.events.fire("disconnect");
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