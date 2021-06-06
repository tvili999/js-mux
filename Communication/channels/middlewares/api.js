module.exports = (channel, data, next) => {
    if(channel.exports) {
        next();
        return;
    }

    let messageType;
    if(channel.messageType == 0)
        messageType = "PUBLISH";
    if(channel.messageType == 1)
        messageType = "QUESTION";
    if(channel.messageType == 2)
        messageType = "ANSWER";

    channel.exports = {
        ...channel.events.exports,
        get query() {
            return channel.query;
        },
        get sessionId() {
            return channel.sessionId;
        },
        messageType,
        readAll: async () =>  {
            let buffers = [];

            channel.events.on('data', data => buffers.push(data));
            await new Promise(resolve => channel.events.on('close', resolve) );

            return Buffer.concat(buffers);
        }
    }

    channel.events.fire("connect", channel.exports);
    next();
}