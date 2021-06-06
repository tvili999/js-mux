const _idGenerator = require("../helpers/idGenerator");
const _events = require("../helpers/events");

const createRequests = (connection) => {
    const _requests = {};
    const idGenerator = _idGenerator(x => x !== 0 && !_requests[x]);

    const api = {
        // SENDING
        open: ({ query }) => {
            const id = idGenerator();
            const events = _events();

            const channel = connection.channels.open({
                query,
                sessionId: id,
                messageType: 1
            });

            const request = {
                id,
                events,
                api: {
                    ...events.exports,
                    send: data => channel.send(data),
                    close: () => {
                        if(!channel.isOpen)
                            return;
                        channel.close();
                    }
                }
            };

            _requests[id] = request;

            return request.api;
        },
        response: channel => {
            const request = _requests[channel.sessionId];
            if(!request)
                return;

            channel.on("close", () => {
                delete _requests[channel.sessionId];
            })

            const response = {
                readAll: channel.readAll,
                on: channel.on,
                close: channel.close
            }

            request.events.fire('response', response);
        },
        // RECEIVING
        request: channel => {
            channel.openResponseStream = () => {
                if(channel.responseChannel)
                    throw "ResponseStream is already open";
                const responseChannel = connection.channels.open({
                    query: [],
                    sessionId: channel.sessionId,
                    messageType: 2
                });
                channel.responseChannel = responseChannel;

                return {
                    send: responseChannel.send,
                    on: responseChannel.on,
                    close: responseChannel.close
                }
            }
            channel.sendResponse = (data) => {
                const stream = channel.openResponseStream();
                stream.send(data);
                stream.close();
            }
        },
    };

    return api;
};

module.exports = createRequests;