module.exports = (channel, data, next) => {
    if(data.length > 0)
        channel.events.fire("data", data);
    next();
}