module.exports = (channel, data, next) => {
    if(channel.exports) {
        next();
        return;
    }

    channel.exports = {
        ...channel.events.exports,
        get query() {
            return channel.query;
        },
        get sessionId() {
            return channel.sessionId;
        },
        readAll: async () => {
            let buffers = [];

            channel.events.on('data', data => buffers.push(data));
            await new Promise(resolve => channel.events.on('close', resolve));

            return Buffer.concat(buffers);
        }
    }

    channel.events.fire("connect", channel.exports);
    next();
}