const _internal = require("./internal")

module.exports = () => {
    const _openHandlers = [];
    const _queryHandlers = {};
    const _closeHandlers = [];

    const _beforeMiddlewares = [];
    const _beforeAlwaysMiddlewares = [];
    const _afterMiddlewares = [];
    const _afterAlwaysMiddlewares = [];

    const _errorHandlers = [];

    const internal = _internal({
        eventHandlers: {
            open: (...args) => _openHandlers.forEach(handler => handler(...args)),
            query: (...args) => _queryHandlers.forEach(handler => handler(...args)),
            close: (...args) => _closeHandlers.forEach(handler => handler(...args)),
            error: (...args) => _errorHandlers.forEach(handler => handler(...args))
        },
        middlewares: {
            get before() {
                return _beforeMiddlewares;
            },
            get beforeAlways() {
                return beforeAlwaysMiddlewares;
            },
            get after() {
                return afterMiddlewares;
            },
            get afterAlways() {
                return afterAlwaysMiddlewares;
            }
        }
    });

    return {
        open: (handler) => _openHandlers.push(handler),
        before: (middleware) => _beforeMiddlewares.push(middleware),
        beforeAlways: (middleware) => _beforeAlwaysMiddlewares.push(middleware),
        query: (name, handler) => _queryHandlers[name] = handler,
        after: (middleware) => _afterMiddlewares.push(middleware),
        afterAlways: (middleware) => _afterAlwaysMiddlewares.push(middleware),
        error: (handler) => _errorHandlers.push(handler),
        close: (handler) => _closeHandlers.push(handler),
        connect: (connection) => internal.connection(connection)
    }
}