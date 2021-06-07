const { Receiver, Transmitter } = require("../../Muxer");
const createEvents = require("js-utils/events");
const createMap = require("js-utils/arrayMap");
const createIdGenerator = require("js-utils/idGenerator");
const { uintToBufferBE } = require("../helpers/uintToBuffer");
const _middlewares = require("./middlewares");

const createChannels = (connectionObject, middlewares) => {
    middlewares = [..._middlewares, ...(middlewares || [])];

    const receiver = Receiver();
    const transmitter = Transmitter();
    transmitter.on('data', connectionObject.connection.transmit);
    connectionObject.connection.on('receive', receiver.feed);

    const _channels = createMap();
    const idGenerator = createIdGenerator(x => x !== 0 && !_channels.exists(uintToBufferBE(x)));
    const _events = createEvents();
    const channels = createMap();

    const getOrCreateChannel = (channelId) => channels.getOrCreate(channelId, () => ({
        id: channelId,
        events: createEvents()
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
            // TODO: Close all open channels
        },
        get channels() {
            return _channels;
        },
        open: ({ query, sessionId, messageType }) => {
            const id = uintToBufferBE(idGenerator(), 0);

            transmitter.send(id, Buffer.concat([
                Buffer.from(query),
                Buffer.from([0]),
                Buffer.from(uintToBufferBE(sessionId)),
                Buffer.from([messageType])
            ]));

            let _open = true;

            return _channels[id] = {
                id,
                get isOpen() {
                    return _open;
                },
                send: (data) => transmitter.send(id, Buffer.from(data)),
                close: () => {
                    if(!_open)
                        return;

                    _channels.delete(id);
                    transmitter.close(id);
                    _open = false;
                }
            }
        },
        ..._events.exports
    };

    return api;
};

module.exports = createChannels;