module.exports = (channel, data) => {
    if(channel.headerState === "DONE" || channel.exports)
        return;

    channel.exports = {
        ...channel.events.exports,
        get query() {
            return channel.query;
        },
        get sessionId() {
            return channel.sessionId;
        },
    }

    console.log("event fires")
    channel.events.fire("connect");
}