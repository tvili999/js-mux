module.exports = (channel, data) => {
    if(channel.headerRead)
        return;

    if(!channel.sessionId) {
        if(!channel.query)
            channel.query = [];

        const zeroByte = data.indexOf(0);
        if(zeroByte === -1) {
            channel.query.push(Buffer.from(data));
        }
        else {
            channel.query.push(Buffer.from(data.slice(0, zeroByte)));
            channel.query = Buffer.concat(channel.query);

            data = data.slice(zeroByte);
            channel.sessionId = [];
        }
    }

    if(channel.sessionId) {
        let i = 0;
        while(channel.sessionId.length < 4 && i < data.length) {
            channel.sessionId.push(data[i]);
            i++;
        }
        data = data.slice(i);

        if(channel.sessionId.length == 4) {
            const buf = Buffer.from(channel.sessionId);
            channel.sessionId = buf.readUInt32LE();
            channel.headerRead = true;
        }
    }

    return data;
}