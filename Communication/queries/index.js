const arrayMap = require("js-utils/arrayMap");
const ownMiddlewares = require("./middlewares");

module.exports = () => {
    let _queryHandlers = arrayMap();
    let _middlewares = [];

    const dispatchMiddleware = async (connection, channel, next) => {
        channel.dispatch = async (handler) => {
            if(channel.hasQueryHandler) {
                const queryHandler = _queryHandlers.get(Buffer.from(handler));
                if(!queryHandler)
                    return;
                
                await queryHandler(connection, channel);
            }
            else {
                channel.dispatchQuery = handler;
            }
        }
        return next();
    };

    const queryHandlerMiddleware = async (connection, channel) => {
        let query = channel.dispatchQuery || channel.query;
        const queryHandler = _queryHandlers.get(Buffer.from(query));
        if(!queryHandler)
            return;
    
        channel.hasQueryHandler = true;
        await queryHandler(connection, channel);
    };

    const api = {
        query: (name, handler) => {
            let newObject = false;
            _queryHandlers.getOrCreate(Buffer.from(name), () => {
                newObject = true;
                return handler;
            });
            if(!newObject) {
                throw `Query '${name}' already exists`;
            }
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
            const callMiddleware = async (i) => {
                await middlewares[i](connection, channel, () => {
                    return callMiddleware(i + 1);
                });
            }
            return callMiddleware(0);
        }
    };

    return api;
}