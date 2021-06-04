const createEvents = () => {
    const _eventHandlers = {};
    const api = {
        on: (eventName, handler) => {
            if(!_eventHandlers[eventName])
                _eventHandlers[eventName] = [];

            _eventHandlers[eventName] = [..._eventHandlers[eventName], handler];
        },
        once: (eventName, handler) => {
            const wrapperHandler = (...args) => {
                handler(...args);
                api.off(eventName, wrapperHandler);
            }
            api.on(eventName, wrapperHandler);
        },
        off: (eventName, handler) => {
            if(!_eventHandlers[eventName])
                return;

            _eventHandlers[eventName] = _eventHandlers[eventName].filter(x => x !== handler);
        },
        fire: (eventName, ...args) => {
            if(!_eventHandlers[eventName])
                return;

            for(const handler of _eventHandlers[eventName])
                handler(...args);
        }
    };

    api.exports = {
        on: api.on,
        off: api.off,
        once: api.once
    };

    return api;
};

module.exports = createEvents;