const createQueries = require("./index");

test('passes', () => {
    expect(true).toBe(true);
})

test('write a query', () => {
    const queries = createQueries();

    const handler = jest.fn();
    queries.query("get-test", handler);

    queries.connect({ query: Buffer.from("get-test") });
    expect(handler.mock.calls.length).toBe(1);
});

test('middleware async catches error', async () => {
    const queries = createQueries();

    queries.query("get-test", async () => {
        throw "Error";
    });

    const errorHandler = jest.fn();
    queries.middleware(async (_, __, next) => {
        try {
            await next();
        }
        catch(e) {
            errorHandler();
        }
    })

    await queries.connect({ query: Buffer.from("get-test") });
    expect(errorHandler.mock.calls.length).toBe(1);
});


test('middleware runs before', () => {
    const queries = createQueries();

    const handler = jest.fn();
    queries.query("get-test", handler);

    const middleware = jest.fn(() => {
        expect(handler.mock.calls.length).toBe(0);
    })
    queries.middleware((_, __, next) => {
        middleware();
        next();
    })

    queries.connect({ query: Buffer.from("get-test") });
    expect(handler.mock.calls.length).toBe(1);
    expect(middleware.mock.calls.length).toBe(1);
});


test('middleware runs after', () => {
    const queries = createQueries();

    const handler = jest.fn();
    queries.query("get-test", handler);

    const middleware = jest.fn(() => {
        expect(handler.mock.calls.length).toBe(1);
    })
    queries.middleware((_, __, next) => {
        next();
        middleware();
    })

    queries.connect({ query: Buffer.from("get-test") });
    expect(handler.mock.calls.length).toBe(1);
    expect(middleware.mock.calls.length).toBe(1);
});

test('call gets interrupted', () => {
    const queries = createQueries();

    const handler = jest.fn();
    queries.query("get-test", handler);

    const middleware = jest.fn();
    queries.middleware(middleware);

    queries.connect({ query: Buffer.from("get-test") });
    expect(handler.mock.calls.length).toBe(0);
    expect(middleware.mock.calls.length).toBe(1);
});

test('do not let multiple queries with the same name', () => {
    const queries = createQueries();

    queries.query("get-test", () => {});
    expect(() => {
        queries.query("get-test", () => {});
    }).toThrow();
});

