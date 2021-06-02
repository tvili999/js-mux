const specBytes = require("./specialBytes");

module.exports = () => {
    let _dataHandlers = [];
    let _flushHandlers = [];
    let _openChannels = [];
    let _currentChannel = null;

    const sendData = (data) => _dataHandlers.forEach(handler => handler(data));
    const flush = () => _flushHandlers.forEach(handler => handler());

    return {
        on: (type, handler) => {
            if(type === "data") _dataHandlers = [..._dataHandlers, handler];
            if(type === "flush") _flushHandlers = [..._flushHandlers, handler];
        },
        send: (channel, data) => {
            if(_currentChannel !== channel) {
                sendData(Buffer.from([ specBytes.ESCAPE, specBytes.START ]));
                sendData(Buffer.from(channel));
                sendData(Buffer.from([ specBytes.ESCAPE ]));

                _currentChannel = channel;
                if(!_openChannels.includes(channel))
                    _openChannels = [..._openChannels, channel];
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
            if(!_openChannels.includes(channel))
                return;
            
            if(_currentChannel !== channel) {
                sendData(Buffer.from([ specBytes.ESCAPE, specBytes.START ]));
                sendData(Buffer.from(channel));
                sendData(Buffer.from([ specBytes.ESCAPE ]));
            }

            sendData(Buffer.from([ specBytes.ESCAPE, specBytes.END ]));
            flush();

            _openChannels = _openChannels.filter(x => x !== channel);
            _currentChannel = null;
        }
    }
}