const specBytes = require("./specialBytes");
const createSet = require("./helpers/arraySet");
const eq = require("./helpers/eq");

module.exports = () => {
    let _dataHandlers = [];
    let _flushHandlers = [];
    let _openChannels = createSet();
    let _currentChannel = null;

    const sendData = (data) => _dataHandlers.forEach(handler => handler(data));
    const flush = () => _flushHandlers.forEach(handler => handler());

    return {
        on: (type, handler) => {
            if(type === "data") _dataHandlers = [..._dataHandlers, handler];
            if(type === "flush") _flushHandlers = [..._flushHandlers, handler];
        },
        send: (channel, data) => {
            channel = Buffer.from(channel);
            if(!eq(_currentChannel, channel)) {
                sendData(Buffer.from([ specBytes.ESCAPE, specBytes.START ]));
                sendData(channel);
                sendData(Buffer.from([ specBytes.ID_END ]));

                _currentChannel = channel;
                if(!_openChannels.exists(channel))
                    _openChannels.set(channel);
            }

            data = Buffer.from(data);
            let start = 0;
            let end = 0;
            while((end = data.indexOf(specBytes.ESCAPE, start)) !== -1) {
                sendData(data.slice(start, end));
                sendData(Buffer.from([ specBytes.ESCAPE, specBytes.ESCAPE ]));
                start = end + 1;
            }
            if(start !== data.length)
                sendData(data.slice(start, data.length));
            flush();
        },
        close: (channel) => {
            channel = Buffer.from(channel);
            if(!_openChannels.exists(channel))
                return;
            
            if(!eq(_currentChannel, channel)) {
                sendData(Buffer.from([ specBytes.ESCAPE, specBytes.START ]));
                sendData(channel);
                sendData(Buffer.from([ specBytes.ID_END ]));
            }

            sendData(Buffer.from([ specBytes.ESCAPE, specBytes.END ]));
            flush();

            _openChannels.delete(channel);
            _currentChannel = null;
        }
    }
}