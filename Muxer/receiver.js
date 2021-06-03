const specBytes = require("./specialBytes");

const states = {
    "IDLE": 0,
    "HEADER": 1,
    "DATA": 2
}

module.exports = () => {
    let _openHandlers = [];
    let _dataHandlers = [];
    let _closeHandlers = [];

    let _currentChannel = null;
    let _state = states.IDLE;
    let _escape = false;

    const receive = (data) => _dataHandlers.forEach(handler => handler(_currentChannel, data));
    const open = () => _openHandlers.forEach(handler => handler(_currentChannel));
    const _close = () => _closeHandlers.forEach(handler => handler(_currentChannel));

    return {
        on: (type, handler) => {
            if(type == "open") _openHandlers = [..._openHandlers, handler];
            if(type == "data") _dataHandlers = [..._dataHandlers, handler];
            if(type == "close") _closeHandlers = [..._closeHandlers, handler];
        },
        feed: (data) => {
            data = Buffer.from(data);

            let i = 0;
            while(i < data.length) {
                if(_state === states.IDLE) {
                    if(data[i] == specBytes.ESCAPE)
                        _escape = true;
                    else {
                        if(data[i] == specBytes.START){
                            _state = states.HEADER;
                            _currentChannel = [];
                        }
                        _escape = false;
                    }
                    i++;
                }
                else if(_state === states.HEADER) {
                    if(data[i] === specBytes.ID_END) {
                        _currentChannel = Buffer.concat(_currentChannel);
                        _state = states.DATA;
                        open(_currentChannel);
                        i++;
                    }
                    else {
                        let eos = data.indexOf(specBytes.ESCAPE, i);
                        if(eos === -1)
                            eos = data.length;

                        if(eos - i > 0)
                            _currentChannel.push(data.slice(i, eos));

                        i = eos;
                    }
                }
                else if(_state === states.DATA) {
                    if(_escape) {
                        if(data[i] === specBytes.ESCAPE) {
                            receive(Buffer.from([specBytes.ESCAPE]));
                        }
                        if(data[i] === specBytes.END) {
                            _state = states.IDLE;
                            _close();
                            _currentChannel = null;
                        }
                        if(data[i] === specBytes.START) {
                            _state = states.HEADER;
                            _currentChannel = [];
                        }
                        i++;
                        _escape = false;
                    }
                    else {
                        if(data[i] === specBytes.ESCAPE) {
                            _escape = true;
                            i++;
                        }
                        else {
                            let eos = data.indexOf(specBytes.ESCAPE, i);
                            if(eos === -1)
                                eos = data.length;

                            if(eos - i > 0)
                                receive(data.slice(i, eos));
                            
                            i = eos;
                        }
                    }
                }
            }
        },
        close: () => {
            if(_currentChannel)
                _close();
        }
    }
}