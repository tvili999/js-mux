const arrayMap = require("../helpers/arrayMap");

module.exports = () => {
    let _queryHandlers = arrayMap();

    const api = {
        query: (name, handler) => {
            let newObject = false;
            _queryHandlers.getOrCreate(Buffer.from(name), () => {
                newObject = true;
                return handler;
            });
            if(!newObject)
                throw "Query already exists";
        },
        connect: (channel, connection) => {
            const queryHandler = _queryHandlers.get(Buffer.from(channel.query));
            if(!queryHandler)
                return;

            queryHandler(connection, channel);
        }
    };

    return api;
}