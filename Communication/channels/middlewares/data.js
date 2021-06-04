module.exports = (channel, data) => {
    if(!channel.headerRead)
        return;
    if(data.length > 0)
        channel.events.fire("data", channel.exports, data);
}