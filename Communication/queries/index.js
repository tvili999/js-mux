const arrayMap = require("js-utils/arrayMap");
const ownMiddlewares = require("./middlewares");

module.exports = () => {
    let _queryHandlers = arrayMap();
    let _middlewares = [];

    const dispatchMiddleware = (connection, channel, next) => {
        channel.dispatch = (handler) => {
            if(channel.hasQueryHandler) {
                const queryHandler = _queryHandlers.get(Buffer.from(handler));
                if(!queryHandler)
                    return;
                
                queryHandler(connection, channel);
            }
            else {
                channel.dispatchQuery = handler;
            }
        }
        next();
    };

    const queryHandlerMiddleware = (connection, channel) => {
        let query = channel.dispatchQuery || channel.query;
        const queryHandler = _queryHandlers.get(Buffer.from(query));
        if(!queryHandler)
            return;
    
        channel.hasQueryHandler = true;
        queryHandler(connection, channel);
    };

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
        middleware: (middleware) => {
            _middlewares.push(middleware);
        },
        connect: (channel, connection) => {
            middlewares = [
                dispatchMiddleware, 
                ...ownMiddlewares, 
                ..._middlewares, 
                queryHandlerMiddleware
            ];
            const callMiddleware = (i) => {
                middlewares[i](connection, channel, () => {
                    callMiddleware(i + 1);
                });
            }
            callMiddleware(0);
        }
    };

    return api;
}